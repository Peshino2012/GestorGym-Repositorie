"use server";

import { db } from "@/lib/db";
import { getGymSettings } from "@/lib/gymSettings";
import { formatDate } from "@/lib/format";

export type CheckInResult =
  | {
      found: true;
      name: string;
      planName: string;
      dueDate: string;
      isCurrent: boolean;
    }
  | { found: false }
  | null;

export async function checkInByDni(
  _prevState: CheckInResult,
  formData: FormData
): Promise<CheckInResult> {
  const gym = await getGymSettings();
  if (!gym.checkinEnabled) return { found: false };

  const dni = String(formData.get("dni") ?? "").replace(/\D/g, "");
  if (!dni) return { found: false };

  const member = await db.member.findFirst({
    where: { dni, archivedAt: null },
    include: {
      plan: true,
      payments: { orderBy: { dueDate: "desc" }, take: 1 },
    },
  });

  if (!member) return { found: false };

  await db.checkIn.create({ data: { memberId: member.id } });

  const latestPayment = member.payments[0];
  const isCurrent = latestPayment ? latestPayment.status === "PAID" : false;

  return {
    found: true,
    name: member.name,
    planName: member.plan.name,
    dueDate: latestPayment ? formatDate(latestPayment.dueDate) : "—",
    isCurrent,
  };
}
