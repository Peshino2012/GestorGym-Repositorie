import { subDays, differenceInCalendarDays } from "date-fns";
import { db } from "@/lib/db";

export type AtRiskMember = {
  id: string;
  name: string;
  phone: string;
  recentVisits: number;
  historicalWeeklyAvg: number;
  lastVisit: Date | null;
};

/**
 * Rule-based retention signal: members who used to check in regularly
 * (>=1x/week historically) but have gone completely quiet in the last
 * 14 days. Deliberately simple/explainable — not a predictive model.
 */
export async function computeAtRiskMembers(): Promise<AtRiskMember[]> {
  const members = await db.member.findMany({
    where: { status: { not: "INACTIVE" } },
    include: { checkIns: true },
  });

  const now = new Date();
  const recentCutoff = subDays(now, 14);

  const results: AtRiskMember[] = [];

  for (const m of members) {
    const recentVisits = m.checkIns.filter((c) => c.timestamp >= recentCutoff).length;
    const olderVisits = m.checkIns.filter((c) => c.timestamp < recentCutoff);
    if (olderVisits.length === 0) continue;

    const oldestVisit = olderVisits.reduce(
      (min, c) => (c.timestamp < min ? c.timestamp : min),
      olderVisits[0].timestamp
    );
    const historyDays = Math.max(differenceInCalendarDays(recentCutoff, oldestVisit), 7);
    const historicalWeeklyAvg = (olderVisits.length / historyDays) * 7;

    const lastVisit = m.checkIns.length
      ? m.checkIns.reduce((max, c) => (c.timestamp > max ? c.timestamp : max), m.checkIns[0].timestamp)
      : null;

    const isAtRisk = historicalWeeklyAvg >= 1 && recentVisits === 0;

    if (isAtRisk) {
      results.push({
        id: m.id,
        name: m.name,
        phone: m.phone,
        recentVisits,
        historicalWeeklyAvg: Math.round(historicalWeeklyAvg * 10) / 10,
        lastVisit,
      });
    }
  }

  return results.sort((a, b) => b.historicalWeeklyAvg - a.historicalWeeklyAvg);
}
