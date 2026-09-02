import Link from "next/link";
import { Pencil, Sunrise, Sun, Sunset, Moon, Dumbbell, CalendarDays } from "lucide-react";
import { requireHorariosEnabled } from "@/lib/authz";
import { db } from "@/lib/db";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import { createBlock, deleteBlock } from "./actions";
import { SCHEDULE_ICONS, SCHEDULE_ICON_LABEL } from "@/lib/scheduleIcons";

const ICON_MAP: Record<string, typeof Sun> = {
  sunrise: Sunrise,
  sun: Sun,
  sunset: Sunset,
  moon: Moon,
  dumbbell: Dumbbell,
  calendar: CalendarDays,
};

export default async function HorariosPage() {
  await requireHorariosEnabled();

  const blocks = await db.scheduleBlock.findMany({
    orderBy: { order: "asc" },
    include: { entries: { orderBy: { order: "asc" } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Horarios</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Los bloques que armes acá son los que se muestran en la sección de Horarios de tu sitio público.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {blocks.map((block) => {
            const Icon = ICON_MAP[block.icon] ?? Sun;
            return (
              <div key={block.id} className="rounded-2xl border border-border bg-surface p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{block.title}</p>
                      <p className="text-xs text-muted-foreground">{block.hoursLabel}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Link
                      href={`/horarios/${block.id}/editar`}
                      aria-label={`Editar ${block.title}`}
                      className="flex items-center justify-center rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-background"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                    <form action={deleteBlock.bind(null, block.id)}>
                      <ConfirmSubmitButton
                        confirmMessage={`¿Eliminar el bloque "${block.title}" y sus ${block.entries.length} horario(s)?`}
                        className="rounded-lg border border-destructive/40 px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
                      >
                        Eliminar
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </div>

                <div className="mt-4 flex flex-col divide-y divide-border border-t border-border">
                  {block.entries.map((e) => (
                    <div key={e.id} className="flex items-center justify-between py-2 text-sm">
                      <span className="text-muted-foreground">{e.name}</span>
                      <span className="font-semibold">{e.time}</span>
                    </div>
                  ))}
                  {block.entries.length === 0 && (
                    <p className="py-3 text-center text-xs text-muted-foreground">
                      Sin horarios cargados todavía.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
          {blocks.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              Todavía no creaste ningún bloque de horarios.
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-semibold">Nuevo bloque</h2>
          <form action={createBlock} className="mt-4 flex flex-col gap-3">
            <div>
              <label htmlFor="title" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Título
              </label>
              <input
                id="title"
                name="title"
                placeholder="Mañana"
                required
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label htmlFor="hoursLabel" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Franja horaria
              </label>
              <input
                id="hoursLabel"
                name="hoursLabel"
                placeholder="6:00 – 10:00"
                required
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label htmlFor="icon" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Ícono
              </label>
              <select
                id="icon"
                name="icon"
                defaultValue="sun"
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                {SCHEDULE_ICONS.map((icon) => (
                  <option key={icon} value={icon}>
                    {SCHEDULE_ICON_LABEL[icon]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="order" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Orden
              </label>
              <input
                id="order"
                name="order"
                type="number"
                defaultValue={blocks.length}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Los bloques se muestran de menor a mayor.
              </p>
            </div>
            <button
              type="submit"
              className="mt-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
            >
              Crear bloque
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
