import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { requireOwner, requireClassesEnabled } from "@/lib/authz";
import { db } from "@/lib/db";
import { updateBlock, createEntry, updateEntry, deleteEntry } from "../../actions";
import { SCHEDULE_ICONS, SCHEDULE_ICON_LABEL } from "@/lib/scheduleIcons";

export default async function EditarBloquePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOwner();
  await requireClassesEnabled();
  const { id } = await params;

  const block = await db.scheduleBlock.findUnique({
    where: { id },
    include: { entries: { orderBy: { order: "asc" } } },
  });
  if (!block) notFound();

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <Link
        href="/horarios"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a horarios
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Editar bloque</h1>
      </div>

      <form
        action={updateBlock.bind(null, block.id)}
        className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-7"
      >
        <div>
          <label htmlFor="title" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Título
          </label>
          <input
            id="title"
            name="title"
            defaultValue={block.title}
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
            defaultValue={block.hoursLabel}
            required
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="icon" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
              Ícono
            </label>
            <select
              id="icon"
              name="icon"
              defaultValue={block.icon}
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
              defaultValue={block.order}
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
        >
          Guardar cambios
        </button>
      </form>

      <div className="rounded-2xl border border-border bg-surface p-7">
        <h2 className="font-semibold">Horarios de este bloque</h2>

        <div className="mt-4 flex flex-col gap-3">
          {block.entries.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-wrap items-end gap-2 rounded-lg border border-border bg-background p-3"
            >
              <form
                action={updateEntry.bind(null, entry.id, block.id)}
                className="flex flex-1 flex-wrap items-end gap-2"
              >
                <div className="flex-1 basis-40">
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                    Nombre
                  </label>
                  <input
                    name="name"
                    defaultValue={entry.name}
                    required
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="w-28">
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                    Horario
                  </label>
                  <input
                    name="time"
                    defaultValue={entry.time}
                    required
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="w-20">
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">
                    Orden
                  </label>
                  <input
                    name="order"
                    type="number"
                    defaultValue={entry.order}
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-lg border border-border px-3 py-2 text-xs font-semibold transition-colors hover:bg-surface"
                >
                  Guardar
                </button>
              </form>
              <form action={deleteEntry.bind(null, entry.id, block.id)}>
                <button
                  type="submit"
                  aria-label={`Eliminar ${entry.name}`}
                  className="flex items-center justify-center rounded-lg border border-destructive/40 px-3 py-2 text-destructive transition-colors hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </form>
            </div>
          ))}
          {block.entries.length === 0 && (
            <p className="py-2 text-center text-xs text-muted-foreground">
              Sin horarios cargados todavía.
            </p>
          )}
        </div>

        <form
          action={createEntry.bind(null, block.id)}
          className="mt-4 flex flex-wrap items-end gap-2 border-t border-border pt-4"
        >
          <div className="flex-1 basis-40">
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              Nombre
            </label>
            <input
              name="name"
              placeholder="Spinning"
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="w-28">
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              Horario
            </label>
            <input
              name="time"
              placeholder="8:30"
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="w-20">
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">
              Orden
            </label>
            <input
              name="order"
              type="number"
              defaultValue={block.entries.length}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
          >
            Agregar horario
          </button>
        </form>
      </div>
    </div>
  );
}
