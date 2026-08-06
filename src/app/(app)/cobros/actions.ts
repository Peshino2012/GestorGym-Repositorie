"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/format";

export async function markPaid(paymentId: string) {
  const payment = await db.payment.update({
    where: { id: paymentId },
    data: { status: "PAID", paidAt: new Date() },
  });

  await db.member.update({
    where: { id: payment.memberId },
    data: { status: "ACTIVE" },
  });

  revalidatePath("/cobros");
  revalidatePath("/dashboard");
  revalidatePath(`/socios/${payment.memberId}`);
}

// Simulated WhatsApp send — no real WhatsApp Business API is connected.
// Swap this out for a real integration (Meta Cloud API / Twilio) later;
// this generates the message and logs it so the flow is demonstrable end-to-end.
export async function sendPaymentReminder(paymentId: string) {
  const payment = await db.payment.findUniqueOrThrow({
    where: { id: paymentId },
    include: { member: true },
  });

  const firstName = payment.member.name.split(" ")[0];
  const content = `Hola ${firstName} 👋 Te recordamos que tu cuota de ${formatCurrency(
    payment.amount
  )} vence el ${formatDate(payment.dueDate)}. Cualquier duda, respondé este mensaje. — PULSO Gym`;

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
  const amount = Number(formData.get("amount"));
  const dueDate = String(formData.get("dueDate") ?? "");

  if (!memberId) throw new Error("Elegí un socio");
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("El monto no es válido");
  if (!dueDate) throw new Error("La fecha de vencimiento es obligatoria");

  await db.payment.create({
    data: {
      memberId,
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
  const payment = await db.payment.update({
    where: { id },
    data: { status: "PENDING", paidAt: null },
  });

  revalidatePath("/cobros");
  revalidatePath(`/socios/${payment.memberId}`);
  revalidatePath("/dashboard");
}
