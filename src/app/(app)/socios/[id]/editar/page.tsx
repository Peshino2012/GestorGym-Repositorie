import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireOwner } from "@/lib/authz";
import { db } from "@/lib/db";
import Avatar from "@/components/Avatar";
import { updateMember } from "../../actions";

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Activo",
  OVERDUE: "Vencido",
  INACTIVE: "Inactivo",
};

export default async function EditarSocioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOwner();
  const { id } = await params;

  const [member, plans] = await Promise.all([
    db.member.findUnique({ where: { id } }),
    db.plan.findMany({ orderBy: { price: "asc" } }),
  ]);

  if (!member) notFound();

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <Link
        href={`/socios/${member.id}`}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al socio
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Editar socio</h1>
      </div>

      <form
        action={updateMember.bind(null, member.id)}
        className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-7"
      >
        <Avatar name={member.name} photoUrl={member.photoUrl} size="lg" />

        <div>
          <label htmlFor="name" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Nombre
          </label>
          <input
            id="name"
            name="name"
            defaultValue={member.name}
            required
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Teléfono
          </label>
          <input
            id="phone"
            name="phone"
            defaultValue={member.phone}
            required
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={member.email ?? ""}
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="planId" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
              Plan
            </label>
            <select
              id="planId"
              name="planId"
              defaultValue={member.planId}
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
              Estado
            </label>
            <select
              id="status"
              name="status"
              defaultValue={member.status}
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {Object.entries(STATUS_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-2 border-t border-border pt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Contacto de emergencia
          </p>
          <div className="flex flex-col gap-3">
            <input
              name="emergencyName"
              defaultValue={member.emergencyName ?? ""}
              placeholder="Nombre"
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <input
              name="emergencyPhone"
              defaultValue={member.emergencyPhone ?? ""}
              placeholder="Teléfono"
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <textarea
              name="emergencyNotes"
              defaultValue={member.emergencyNotes ?? ""}
              placeholder="Notas médicas (opcional)"
              rows={2}
              className="w-full resize-none rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
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
