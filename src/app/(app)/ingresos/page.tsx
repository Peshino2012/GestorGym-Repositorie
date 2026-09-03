import { startOfDay, endOfDay } from "date-fns";
import { requireCheckinAccess } from "@/lib/authz";
import { db } from "@/lib/db";
import { formatTime } from "@/lib/format";
import IngresoStaffForm from "./IngresoStaffForm";

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
      <div>
        <h1 className="text-2xl font-bold">Registro de ingresos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {today.length} {today.length === 1 ? "ingreso" : "ingresos"} hoy
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <IngresoStaffForm />
        </div>

        <div className="rounded-2xl border border-border bg-surface lg:col-span-2">
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
    </div>
  );
}
