"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { paymentReminderMessage } from "@/lib/messages";
import { parseDateInput } from "@/lib/format";
import { getGymSettings } from "@/lib/gymSettings";
import { applyPaymentPaid, isDuplicateActivePaymentError } from "@/lib/payments";
import { createPaymentPreference } from "@/lib/mercadopago";

export async function getMemberPaymentHistory(memberId: string) {
  if (!memberId) return [];
  return db.payment.findMany({
    where: { memberId },
    orderBy: { dueDate: "desc" },
    take: 5,
    select: { id: true, amount: true, dueDate: true, paidAt: true, status: true },
  });
}

export async function markPaid(paymentId: string) {
  const payment = await applyPaymentPaid(paymentId);
  if (!payment) return; // already paid / already renewed — nothing to do

  revalidatePath("/cobros");
  revalidatePath("/dashboard");
  revalidatePath(`/socios/${payment.memberId}`);
}

// Generates a one-off Mercado Pago payment link for this cobro and returns
// the URL to open — same "open a link, someone else does the rest" shape
// as the WhatsApp reminder button. Marking it paid happens later, on its
// own, when Mercado Pago calls our webhook (see
// app/api/webhooks/mercadopago/route.ts) — this action only asks for the
// link, it never touches the cobro's status.
export async function createMercadoPagoLink(paymentId: string): Promise<string> {
  const payment = await db.payment.findUniqueOrThrow({
    where: { id: paymentId },
    include: { member: true },
  });
  if (payment.status === "PAID") {
    throw new Error("Este cobro ya está pagado.");
  }

  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("Este gimnasio todavía no tiene Mercado Pago configurado.");
  }

  const host = (await headers()).get("host");
  const baseUrl = `https://${host}`;

  const preference = await createPaymentPreference({
    accessToken,
    externalReference: payment.id,
    title: `Cuota - ${payment.member.name}`,
    amount: payment.amount,
    notificationUrl: `${baseUrl}/api/webhooks/mercadopago`,
    backUrl: `${baseUrl}/cobros`,
  });

  await db.payment.update({
    where: { id: payment.id },
    data: { mpPreferenceId: preference.id },
  });

  return preference.initPoint;
}

// The actual WhatsApp send happens client-side (WhatsAppButton opens a
// wa.me link with this same text) — this just keeps a record of it.
export async function sendPaymentReminder(paymentId: string) {
  const payment = await db.payment.findUniqueOrThrow({
    where: { id: paymentId },
    include: { member: true },
  });

  const gym = await getGymSettings();
  const content = paymentReminderMessage(payment.member.name, payment.amount, payment.dueDate, gym.name);

  await db.messageLog.create({
    data: {
      memberId: payment.memberId,
      type: "PAYMENT_REMINDER",
      content,
    },
  });

  revalidatePath("/cobros");
}

export async function createPayment(formData: FormData) {
  const memberId = String(formData.get("memberId") ?? "");
  const planId = String(formData.get("planId") ?? "");
  const amount = Number(formData.get("amount"));
  const dueDate = String(formData.get("dueDate") ?? "");

  if (!memberId) throw new Error("Elegí un socio");
  if (!planId) throw new Error("Elegí un plan");
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("El monto no es válido");
  if (!dueDate) throw new Error("La fecha de vencimiento es obligatoria");

  const existingActive = await db.payment.findFirst({
    where: { memberId, status: { in: ["PENDING", "OVERDUE"] } },
  });
  if (existingActive) {
    throw new Error("Ese socio ya tiene un cobro pendiente o vencido registrado.");
  }

  const roundedAmount = Math.round(amount);

  try {
    // Registering a cobro here means the socio paid on the spot — nobody
    // gets logged as owing money they already handed over. So this creates
    // the paid record for today plus the next cycle's cobro (due on the
    // entered "vencimiento"), same as markPaid does for a renewal — that
    // next cobro is what later falls into Pendiente/Vencido on its own.
    const paid = await db.payment.create({
      data: {
        memberId,
        planId,
        amount: roundedAmount,
        dueDate: new Date(),
        paidAt: new Date(),
        status: "PAID",
      },
    });

    await db.payment.create({
      data: {
        memberId,
        planId,
        amount: roundedAmount,
        dueDate: parseDateInput(dueDate),
        status: "PENDING",
        renewedFromId: paid.id,
      },
    });
  } catch (err) {
    if (isDuplicateActivePaymentError(err)) {
      throw new Error("Ese socio ya tiene un cobro pendiente o vencido registrado.");
    }
    throw err;
  }

  await db.member.update({ where: { id: memberId }, data: { status: "ACTIVE" } });

  revalidatePath("/cobros");
  revalidatePath("/dashboard");
  revalidatePath(`/socios/${memberId}`);
}

export async function updatePayment(id: string, formData: FormData) {
  const payment = await db.payment.findUniqueOrThrow({ where: { id } });
  if (payment.status === "PAID") {
    throw new Error("No se puede editar un pago ya cobrado — deshacelo primero.");
  }

  const amount = Number(formData.get("amount"));
  const dueDate = String(formData.get("dueDate") ?? "");

  if (!Number.isFinite(amount) || amount <= 0) throw new Error("El monto no es válido");
  if (!dueDate) throw new Error("La fecha de vencimiento es obligatoria");

  await db.payment.update({
    where: { id },
    data: { amount: Math.round(amount), dueDate: parseDateInput(dueDate) },
  });

  revalidatePath("/cobros");
  revalidatePath(`/socios/${payment.memberId}`);
}

export async function deletePayment(id: string) {
  const payment = await db.payment.findUniqueOrThrow({ where: { id } });
  if (payment.status === "PAID") {
    throw new Error("No se puede eliminar un pago ya cobrado — deshacelo primero.");
  }

  await db.payment.delete({ where: { id } });

  revalidatePath("/cobros");
  revalidatePath(`/socios/${payment.memberId}`);
}

export async function undoMarkPaid(id: string) {
  const existing = await db.payment.findUniqueOrThrow({
    where: { id },
    include: { renewedTo: true },
  });

  // markPaid auto-creates the next cycle's cobro — undo it too, or the
  // socio ends up with two active cobros (exactly the confusion this whole
  // flow is supposed to prevent).
  if (existing.renewedTo) {
    if (existing.renewedTo.status !== "PENDING") {
      throw new Error(
        "No se puede deshacer: ya hay actividad en el cobro del próximo período."
      );
    }
    await db.payment.delete({ where: { id: existing.renewedTo.id } });
  }

  const payment = await db.payment.update({
    where: { id },
    data: { status: "PENDING", paidAt: null },
  });

  revalidatePath("/cobros");
  revalidatePath(`/socios/${payment.memberId}`);
  revalidatePath("/dashboard");
}
