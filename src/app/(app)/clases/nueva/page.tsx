import { DAYS } from "@/lib/format";
import { createClass } from "../actions";
import { requireClassesEnabled } from "@/lib/authz";
import { CLASS_ICONS, CLASS_ICON_LABEL } from "@/lib/classIcons";

export default async function NuevaClasePage() {
  await requireClassesEnabled();

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Nueva clase</h1>
        <p className="mt-1 text-sm text-muted-foreground">Definí horario y cupo.</p>
      </div>

      <form action={createClass} className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-7">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Nombre
          </label>
          <input
            id="name"
            name="name"
            required
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label htmlFor="instructor" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Instructor/a
          </label>
          <input
            id="instructor"
            name="instructor"
            required
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="dayOfWeek" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
              Día
            </label>
            <select
              id="dayOfWeek"
              name="dayOfWeek"
              required
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {DAYS.map((d, i) => (
                <option key={d} value={i}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="startTime" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
              Horario
            </label>
            <input
              id="startTime"
              name="startTime"
              type="time"
              required
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="durationMin" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
              Duración (min)
            </label>
            <input
              id="durationMin"
              name="durationMin"
              type="number"
              min={15}
              step={5}
              defaultValue={50}
              required
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label htmlFor="capacity" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
              Cupo
            </label>
            <input
              id="capacity"
              name="capacity"
              type="number"
              min={1}
              defaultValue={12}
              required
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-border pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Vitrina pública
          </p>
          <div>
            <label htmlFor="description" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
              Descripción (opcional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Se muestra en la tarjeta de esta clase en tu sitio público"
              className="w-full resize-none rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label htmlFor="icon" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
              Ícono
            </label>
            <select
              id="icon"
              name="icon"
              defaultValue="dumbbell"
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {CLASS_ICONS.map((icon) => (
                <option key={icon} value={icon}>
                  {CLASS_ICON_LABEL[icon]}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background px-3.5 py-3">
            <span>
              <span className="block text-sm font-medium">Mostrar en la web</span>
              <span className="block text-xs text-muted-foreground">
                Aparece como tarjeta en la sección &quot;Nuestras clases&quot; de tu sitio público (máximo 6).
              </span>
            </span>
            <input type="checkbox" name="showOnSite" className="h-5 w-9 shrink-0 accent-primary" />
          </label>
        </div>

        <button
          type="submit"
          className="mt-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
        >
          Crear clase
        </button>
      </form>
    </div>
  );
}
