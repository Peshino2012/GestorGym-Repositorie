import {
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfDay,
  format,
  startOfDay,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { db } from "@/lib/db";
import { CHART_COLORS } from "@/lib/chartColors";

export async function getCheckInsLast14Days() {
  const now = new Date();
  const start = startOfDay(subDays(now, 13));
  const end = endOfDay(now);

  const checkIns = await db.checkIn.findMany({
    where: { timestamp: { gte: start, lte: end } },
    select: { timestamp: true },
  });

  return eachDayOfInterval({ start, end }).map((day) => {
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);
    const count = checkIns.filter(
      (c) => c.timestamp >= dayStart && c.timestamp <= dayEnd
    ).length;
    return { label: format(day, "dd/MM"), count };
  });
}

export async function getRevenueLast6Months() {
  const now = new Date();
  const start = startOfMonth(subMonths(now, 5));

  const payments = await db.payment.findMany({
    where: { status: "PAID", paidAt: { gte: start } },
    select: { amount: true, paidAt: true },
  });

  return eachMonthOfInterval({ start, end: now }).map((month) => {
    const monthKey = format(month, "yyyy-MM");
    const total = payments
      .filter((p) => p.paidAt && format(p.paidAt, "yyyy-MM") === monthKey)
      .reduce((sum, p) => sum + p.amount, 0);
    return { label: format(month, "MMM", { locale: es }), total };
  });
}

export async function getPaymentStatusBreakdown() {
  const [paid, pending, overdue] = await Promise.all([
    db.payment.count({ where: { status: "PAID" } }),
    db.payment.count({ where: { status: "PENDING" } }),
    db.payment.count({ where: { status: "OVERDUE" } }),
  ]);

  return [
    { name: "Pagado", value: paid, color: CHART_COLORS.success },
    { name: "Pendiente", value: pending, color: CHART_COLORS.warning },
    { name: "Vencido", value: overdue, color: CHART_COLORS.danger },
  ];
}
