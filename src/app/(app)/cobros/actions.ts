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
