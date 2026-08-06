"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

// Simulated WhatsApp send, same caveat as the payment reminder flow.
export async function sendRetentionAlert(memberId: string) {
  const member = await db.member.findUniqueOrThrow({ where: { id: memberId } });
  const firstName = member.name.split(" ")[0];
  const content = `Hola ${firstName} 💪 Te extrañamos en PULSO. ¿Todo bien? Si necesitás cambiar de horario o tenés alguna traba para volver, contanos y te ayudamos.`;

  await db.messageLog.create({
    data: { memberId, type: "RETENTION_ALERT", content },
  });

  revalidatePath("/riesgo");
}
