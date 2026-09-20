"use server";

import { headers } from "next/headers";
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
  | { rateLimited: true }
  | null;

// This is the one unauthenticated route in the app by design (a physical
// kiosk, no login) — which also makes it the one place a stranger on the
// internet can probe DNIs and read back a member's name and whether
// they're overdue. Real per-IP lockout would break a legitimate crowded
// kiosk sharing one IP, so this throttles hard rather than blocking: a lone
// kiosk doing normal check-ins never gets close to this, but scripted
// enumeration does.
const MAX_ATTEMPTS = 20;
const WINDOW_MS = 5 * 60_000;
const attemptsByIp = new Map<string, { count: number; windowStart: number }>();

async function isRateLimited(): Promise<boolean> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const now = Date.now();
  const state = attemptsByIp.get(ip);

  if (!state || now - state.windowStart > WINDOW_MS) {
    attemptsByIp.set(ip, { count: 1, windowStart: now });
    return false;
  }

  state.count += 1;
  return state.count > MAX_ATTEMPTS;
}

export async function checkInByDni(
  _prevState: CheckInResult,
  formData: FormData
): Promise<CheckInResult> {
  const gym = await getGymSettings();
  if (!gym.checkinEnabled) return { found: false };

  if (await isRateLimited()) return { rateLimited: true };

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
