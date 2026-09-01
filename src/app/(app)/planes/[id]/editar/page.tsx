import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireOwner, requirePlanesEnabled } from "@/lib/authz";
import { db } from "@/lib/db";
import { updatePlan } from "../../actions";

export default async function EditarPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOwner();
  await requirePlanesEnabled();
  const { id } = await params;

  const plan = await db.plan.findUnique({ where: { id } });
  if (!plan) notFound();

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <Link
        href="/planes"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a planes
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Editar plan</h1>
      </div>

      <form
        action={updatePlan.bind(null, plan.id)}
        className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-7"
      >
        <div>
          <label htmlFor="name" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Nombre
          </label>
          <input
            id="name"
            name="name"
            defaultValue={plan.name}
            required
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label htmlFor="price" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Precio
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            step={100}
            defaultValue={plan.price}
            required
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label htmlFor="billingCycle" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Ciclo de facturación
          </label>
          <select
            id="billingCycle"
            name="billingCycle"
            defaultValue={plan.billingCycle}
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="MONTHLY">Mensual</option>
            <option value="QUARTERLY">Trimestral</option>
            <option value="ANNUAL">Anual</option>
          </select>
        </div>
        <div>
          <label htmlFor="features" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Qué incluye (opcional)
          </label>
          <textarea
            id="features"
            name="features"
            rows={4}
            defaultValue={plan.features ?? ""}
            className="w-full resize-none rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Una línea por beneficio — así aparecen en tu sitio público.
          </p>
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
