import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { db } from "@/lib/db";
import { DAYS } from "@/lib/format";
import { requireClassesEnabled } from "@/lib/authz";

export default async function ClasesPage() {
  await requireClassesEnabled();

  const classes = await db.gymClass.findMany({
    include: { bookings: { where: { status: { in: ["BOOKED", "WAITLIST"] } } } },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clases</h1>
          <p className="mt-1 text-sm text-muted-foreground">{classes.length} clases programadas</p>
        </div>
        <Link
          href="/clases/nueva"
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
        >
          <Plus className="h-4 w-4" /> Nueva clase
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((c) => {
          const booked = c.bookings.filter((b) => b.status === "BOOKED").length;
          const waitlist = c.bookings.filter((b) => b.status === "WAITLIST").length;
          const full = booked >= c.capacity;

          return (
            <Link
              key={c.id}
              href={`/clases/${c.id}`}
              className="flex flex-col rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-primary"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {DAYS[c.dayOfWeek]} · {c.startTime}
              </p>
              <h2 className="mt-1 text-lg font-bold">{c.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{c.instructor} · {c.durationMin} min</p>

              <div className="mt-4 flex items-center justify-between">
                <span className={`flex items-center gap-1.5 text-sm font-semibold ${full ? "text-danger" : "text-success"}`}>
                  <Users className="h-4 w-4" /> {booked}/{c.capacity}
                </span>
                {waitlist > 0 && (
                  <span className="rounded-full bg-warning-bg px-2.5 py-1 text-xs font-semibold text-warning">
                    +{waitlist} en espera
                  </span>
                )}
              </div>
            </Link>
          );
        })}
        {classes.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
            Todavía no creaste ninguna clase.
          </p>
        )}
      </div>
    </div>
  );
}
