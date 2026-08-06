import Link from "next/link";
import { requireOwner } from "@/lib/authz";
import { db } from "@/lib/db";
import Avatar from "@/components/Avatar";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import { createTrainer, toggleTrainerActive, deleteTrainer } from "./actions";

export default async function ProfesoresPage() {
  await requireOwner();

  const trainers = await db.trainer.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Profesores</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Los profesores activos son los que se muestran en tu sitio público.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-3 lg:col-span-2">
          {trainers.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4"
            >
              <Avatar name={t.name} photoUrl={t.photoUrl} size="md" />
              <div className="flex-1">
                <Link href={`/profesores/${t.id}/editar`} className="font-semibold hover:text-primary">
                  {t.name}
                </Link>
                {t.specialty && (
                  <p className="text-xs text-muted-foreground">{t.specialty}</p>
                )}
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  t.active
                    ? "bg-success-bg text-success"
                    : "bg-background text-muted-foreground"
                }`}
              >
                {t.active ? "Activo" : "Inactivo"}
              </span>
              <form action={toggleTrainerActive.bind(null, t.id, !t.active)}>
                <button
                  type="submit"
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-background"
                >
                  {t.active ? "Desactivar" : "Activar"}
                </button>
              </form>
              <form action={deleteTrainer.bind(null, t.id)}>
                <ConfirmSubmitButton
                  confirmMessage={`¿Eliminar a ${t.name} definitivamente?`}
                  className="rounded-lg border border-destructive/40 px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
                >
                  Eliminar
                </ConfirmSubmitButton>
              </form>
            </div>
          ))}
          {trainers.length === 0 && (
            <div className="rounded-2xl border border-border bg-surface p-10 text-center text-sm text-muted-foreground">
              Todavía no cargaste ningún profesor.
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-semibold">Nuevo profesor</h2>
          <form action={createTrainer} className="mt-4 flex flex-col gap-3">
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
              <label htmlFor="specialty" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Especialidad
              </label>
              <input
                id="specialty"
                name="specialty"
                placeholder="Ej: Funcional & Crossfit"
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
                className="w-full resize-none rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label htmlFor="photo" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Foto (opcional)
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
              className="mt-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
            >
              Crear profesor
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
