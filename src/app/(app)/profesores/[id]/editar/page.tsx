import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireOwner } from "@/lib/authz";
import { db } from "@/lib/db";
import Avatar from "@/components/Avatar";
import { updateTrainer } from "../../actions";

export default async function EditarProfesorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOwner();
  const { id } = await params;

  const trainer = await db.trainer.findUnique({ where: { id } });
  if (!trainer) notFound();

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <Link
        href="/profesores"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a profesores
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Editar profesor</h1>
      </div>

      <form
        action={updateTrainer.bind(null, trainer.id)}
        className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-7"
      >
        <Avatar name={trainer.name} photoUrl={trainer.photoUrl} size="lg" />

        <div>
          <label htmlFor="name" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Nombre
          </label>
          <input
            id="name"
            name="name"
            defaultValue={trainer.name}
            required
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label htmlFor="specialty" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Especialidad
          </label>
          <input
            id="specialty"
            name="specialty"
            defaultValue={trainer.specialty ?? ""}
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label htmlFor="bio" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Bio corta (opcional)
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={3}
            defaultValue={trainer.bio ?? ""}
            className="w-full resize-none rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label htmlFor="photo" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Reemplazar foto (opcional)
          </label>
          <input
            id="photo"
            name="photo"
            type="file"
            accept="image/*"
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-xs file:font-semibold focus:border-primary"
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
