"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { paymentReminderMessage } from "@/lib/messages";
import { computeNextDueDate } from "@/lib/billing";

export async function markPaid(paymentId: string) {
  // Idempotency guard: a double-click (or a slow request retried) would
  // otherwise run this twice and generate two renewal cobros for the same
  // socio — re-creating the exact duplicate-cobro problem this whole flow
  // exists to prevent.
  const existing = await db.payment.findUniqueOrThrow({
    where: { id: paymentId },
    include: { renewedTo: true, plan: true },
  });
  if (existing.status === "PAID" || existing.renewedTo) {
    return;
  }

  const payment = await db.payment.update({
    where: { id: paymentId },
    data: { status: "PAID", paidAt: new Date() },
  });

  await db.member.update({
    where: { id: payment.memberId },
    data: { status: "ACTIVE" },
  });

  // Roll the subscription forward automatically — the owner shouldn't have
  // to manually create next month's cobro for a socio that's already paying.
  if (existing.plan) {
    await db.payment.create({
      data: {
        memberId: payment.memberId,
        planId: existing.plan.id,
        amount: payment.amount,
        dueDate: computeNextDueDate(payment.dueDate, existing.plan.billingCycle),
        status: "PENDING",
        renewedFromId: payment.id,
      },
    });
  }

  revalidatePath("/cobros");
  revalidatePath("/dashboard");
  revalidatePath(`/socios/${payment.memberId}`);
}

// The actual WhatsApp send happens client-side (WhatsAppButton opens a
// wa.me link with this same text) — this just keeps a record of it.
export async function sendPaymentReminder(paymentId: string) {
  const payment = await db.payment.findUniqueOrThrow({
    where: { id: paymentId },
    include: { member: true },
  });

  const content = paymentReminderMessage(payment.member.name, payment.amount, payment.dueDate);

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

  await db.payment.create({
    data: {
      memberId,
      planId,
      amount: Math.round(amount),
      dueDate: new Date(dueDate),
      status: "PENDING",
    },
  });

  revalidatePath("/cobros");
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
    data: { amount: Math.round(amount), dueDate: new Date(dueDate) },
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
