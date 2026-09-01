import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireOwner, requireClassesEnabled } from "@/lib/authz";
import { db } from "@/lib/db";
import { updateClassCard } from "../../actions";
import { CLASS_ICONS, CLASS_ICON_LABEL } from "@/lib/classIcons";

export default async function EditarClassCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOwner();
  await requireClassesEnabled();
  const { id } = await params;

  const card = await db.classCard.findUnique({ where: { id } });
  if (!card) notFound();

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <Link
        href="/clases-web"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a Nuestras Clases
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Editar tarjeta</h1>
      </div>

      <form
        action={updateClassCard.bind(null, card.id)}
        className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-7"
      >
        <div>
          <label htmlFor="title" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Título
          </label>
          <input
            id="title"
            name="title"
            defaultValue={card.title}
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
            defaultValue={card.description}
            required
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
            defaultValue={card.icon}
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
            defaultValue={card.order}
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button
          type="submit"
          className="mt-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
        >
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
