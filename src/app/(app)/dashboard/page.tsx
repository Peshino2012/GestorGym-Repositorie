import Link from "next/link";
import { startOfMonth } from "date-fns";
import { DollarSign, AlertCircle, TrendingDown, CalendarClock, ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/format";
import { computeAtRiskMembers } from "@/lib/retention";
import { getCheckInsLast14Days, getRevenueLast6Months } from "@/lib/stats";
import { syncOverduePayments } from "@/lib/paymentSync";
import StatCard from "@/components/StatCard";
import CheckInsChart from "@/components/charts/CheckInsChart";
import RevenueChart from "@/components/charts/RevenueChart";

export default async function DashboardPage() {
  await syncOverduePayments();
  const now = new Date();
  const monthStart = startOfMonth(now);

  const [revenueAgg, overdueCount, atRisk, todayClasses, checkInsData, revenueData] =
    await Promise.all([
      db.payment.aggregate({
        _sum: { amount: true },
        where: { status: "PAID", paidAt: { gte: monthStart } },
      }),
      db.payment.count({ where: { status: "OVERDUE" } }),
      computeAtRiskMembers(),
      db.gymClass.findMany({
        where: { dayOfWeek: now.getDay() },
        include: {
          bookings: { where: { status: { in: ["BOOKED", "WAITLIST"] } } },
        },
        orderBy: { startTime: "asc" },
      }),
      getCheckInsLast14Days(),
      getRevenueLast6Months(),
    ]);

  const revenue = revenueAgg._sum.amount ?? 0;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Resumen de hoy, {formatDate(now)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Ingresos del mes" value={formatCurrency(revenue)} icon={DollarSign} tone="success" />
        <StatCard label="Pagos vencidos" value={String(overdueCount)} icon={AlertCircle} tone="danger" />
        <StatCard label="Socios en riesgo" value={String(atRisk.length)} icon={TrendingDown} tone="warning" />
        <StatCard label="Clases hoy" value={String(todayClasses.length)} icon={CalendarClock} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-semibold">Visitas al gimnasio</h2>
          <p className="text-xs text-muted-foreground">Últimos 14 días</p>
          <div className="mt-4">
            <CheckInsChart data={checkInsData} />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-semibold">Ingresos por mes</h2>
          <p className="text-xs text-muted-foreground">Últimos 6 meses, pagos cobrados</p>
          <div className="mt-4">
            <RevenueChart data={revenueData} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Socios en riesgo de abandono</h2>
            <Link
              href="/riesgo"
              className="group flex items-center gap-1 text-xs font-semibold text-primary"
            >
              Ver todos
              <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="mt-4 flex flex-col divide-y divide-border">
            {atRisk.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Sin alertas por ahora.
              </p>
            )}
            {atRisk.slice(0, 5).map((m) => (
              <div
                key={m.id}
                className="relative flex items-center justify-between py-3 pl-0 transition-[padding] duration-200 before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:origin-top before:scale-y-0 before:bg-warning before:transition-transform before:duration-300 before:content-[''] hover:pl-3 hover:before:scale-y-100"
              >
                <div>
                  <p className="text-sm font-medium">{m.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Promedio previo: {m.historicalWeeklyAvg}x/semana
                  </p>
                </div>
                <span className="rounded-full bg-warning-bg px-2.5 py-1 text-xs font-semibold text-warning">
                  0 visitas / 14 días
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Clases de hoy</h2>
            <Link
              href="/clases"
              className="group flex items-center gap-1 text-xs font-semibold text-primary"
            >
              Ver todas
              <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="mt-4 flex flex-col divide-y divide-border">
            {todayClasses.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No hay clases programadas hoy.
              </p>
            )}
            {todayClasses.map((c) => {
              const booked = c.bookings.filter((b) => b.status === "BOOKED").length;
              return (
                <div
                  key={c.id}
                  className="relative flex items-center justify-between py-3 pl-0 transition-[padding] duration-200 before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:origin-top before:scale-y-0 before:bg-primary before:transition-transform before:duration-300 before:content-[''] hover:pl-3 hover:before:scale-y-100"
                >
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.startTime} · {c.instructor}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {booked}/{c.capacity}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
