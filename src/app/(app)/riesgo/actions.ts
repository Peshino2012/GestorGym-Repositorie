"use server";

import { revalidatePath } from "next/cache";
import { addDays } from "date-fns";
import { db } from "@/lib/db";
import { retentionAlertMessage } from "@/lib/messages";

// The actual WhatsApp send happens client-side (WhatsAppButton opens a
// wa.me link with this same text) — this just keeps a record of it.
export async function sendRetentionAlert(memberId: string) {
  const member = await db.member.findUniqueOrThrow({ where: { id: memberId } });
  const content = retentionAlertMessage(member.name);

  await db.messageLog.create({
    data: { memberId, type: "RETENTION_ALERT", content },
  });

  revalidatePath("/riesgo");
}

export async function dismissRisk(memberId: string) {
  await db.member.update({
    where: { id: memberId },
    data: { riskDismissedUntil: addDays(new Date(), 14) },
  });

  revalidatePath("/riesgo");
}
