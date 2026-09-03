import Link from "next/link";
import { startOfDay, endOfDay } from "date-fns";
import { IdCard } from "lucide-react";
import { requireCheckinAccess } from "@/lib/authz";
import { db } from "@/lib/db";
import { formatTime } from "@/lib/format";

export default async function IngresosPage() {
  await requireCheckinAccess();

  const now = new Date();
  const today = await db.checkIn.findMany({
    where: { timestamp: { gte: startOfDay(now), lte: endOfDay(now) } },
    include: { member: true },
    orderBy: { timestamp: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Registro de ingresos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {today.length} {today.length === 1 ? "ingreso" : "ingresos"} hoy
          </p>
        </div>
        <Link
          href="/ingresos/nuevo"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
        >
          <IdCard className="h-4 w-4" />
          Registrar ingreso
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-surface">
        <div className="border-b border-border px-6 py-4">
          <h2 className="font-semibold">Ingresos de hoy</h2>
        </div>
        <div className="flex flex-col divide-y divide-border">
          {today.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-6 py-3 text-sm">
              <span className="font-medium">{c.member.name}</span>
              <span className="text-muted-foreground">{formatTime(c.timestamp)}</span>
            </div>
          ))}
          {today.length === 0 && (
            <p className="px-6 py-8 text-center text-sm text-muted-foreground">
              Todavía no hay ingresos registrados hoy.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
