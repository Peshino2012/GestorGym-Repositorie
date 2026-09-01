import Link from "next/link";
import { Pencil, Dumbbell, Flame, Swords, Bike, Wind, Timer, Heart, Zap } from "lucide-react";
import { requireOwner, requireClassesEnabled } from "@/lib/authz";
import { db } from "@/lib/db";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import { createClassCard, deleteClassCard, toggleClassCardActive } from "./actions";
import { CLASS_ICONS, CLASS_ICON_LABEL } from "@/lib/classIcons";

const MAX_SHOWN = 6;

const ICON_MAP: Record<string, typeof Dumbbell> = {
  dumbbell: Dumbbell,
  flame: Flame,
  swords: Swords,
  bike: Bike,
  wind: Wind,
  timer: Timer,
  heart: Heart,
  zap: Zap,
};

export default async function ClasesWebPage() {
  await requireOwner();
  await requireClassesEnabled();

  const cards = await db.classCard.findMany({ orderBy: { order: "asc" } });

  let shownCount = 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Nuestras Clases</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Las tarjetas de la sección &quot;Nuestras clases&quot; de tu sitio público. Se muestran hasta{" "}
          {MAX_SHOWN}, las activas con menor número de orden primero.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {cards.map((card) => {
            const Icon = ICON_MAP[card.icon] ?? Dumbbell;
            const willShow = card.active && shownCount < MAX_SHOWN;
            if (willShow) shownCount++;
            const position = willShow ? shownCount : null;

            return (
              <div key={card.id} className="rounded-2xl border border-border bg-surface p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{card.title}</p>
                      <p className="text-xs text-muted-foreground">{card.description}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <div className="flex gap-2">
                      <Link
                        href={`/clases-web/${card.id}/editar`}
                        aria-label={`Editar ${card.title}`}
                        className="flex items-center justify-center rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-background"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                      <form action={toggleClassCardActive.bind(null, card.id, !card.active)}>
                        <button
                          type="submit"
                          className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-background"
                        >
                          {card.active ? "Desactivar" : "Activar"}
                        </button>
                      </form>
                      <form action={deleteClassCard.bind(null, card.id)}>
                        <ConfirmSubmitButton
                          confirmMessage={`¿Eliminar la tarjeta "${card.title}"?`}
                          className="rounded-lg border border-destructive/40 px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
                        >
                          Eliminar
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        position
                          ? "bg-success-bg text-success"
                          : "bg-background text-muted-foreground"
                      }`}
                    >
                      {position
                        ? `Se muestra — #${position}`
                        : card.active
                          ? `No se muestra (fuera de las primeras ${MAX_SHOWN})`
                          : "Inactiva"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {cards.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              Todavía no creaste ninguna tarjeta de clase.
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-semibold">Nueva tarjeta</h2>
          <form action={createClassCard} className="mt-4 flex flex-col gap-3">
            <div>
              <label htmlFor="title" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Título
              </label>
              <input
                id="title"
                name="title"
                placeholder="Musculación"
                required
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label htmlFor="description" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                required
                placeholder="Sala equipada con máquinas y peso libre..."
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
            <div>
              <label htmlFor="order" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Orden
              </label>
              <input
                id="order"
                name="order"
                type="number"
                defaultValue={cards.length}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Las activas se muestran de menor a mayor; solo las primeras {MAX_SHOWN} aparecen en el sitio.
              </p>
            </div>
            <button
              type="submit"
              className="mt-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
            >
              Crear tarjeta
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
