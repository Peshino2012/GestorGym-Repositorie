import Link from "next/link";
import { Pencil, Star } from "lucide-react";
import { requirePlanesModulePaid } from "@/lib/authz";
import { db } from "@/lib/db";
import { formatCurrency } from "@/lib/format";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import { createPlan, togglePlanActive, deletePlan, setFeaturedPlan } from "./actions";

const CYCLE_LABEL: Record<string, string> = {
  MONTHLY: "Mensual",
  QUARTERLY: "Trimestral",
  ANNUAL: "Anual",
};

export default async function PlanesPage() {
  // Separate from "/plan" (the always-free single-plan editor) — this page
  // is the paid multi-plan module, gated for everyone including the owner.
  await requirePlanesModulePaid("/plan");

  const plans = await db.plan.findMany({
    orderBy: { price: "asc" },
    include: { _count: { select: { members: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Planes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Los planes activos son los que se muestran en tu sitio público.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="overflow-hidden rounded-2xl border border-border bg-surface lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-background text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-semibold">Nombre</th>
                  <th className="px-5 py-3 font-semibold">Precio</th>
                  <th className="hidden px-5 py-3 font-semibold sm:table-cell">Ciclo</th>
                  <th className="px-5 py-3 font-semibold">Estado</th>
                  <th className="px-5 py-3 font-semibold">Destacado</th>
                  <th className="px-5 py-3 text-right font-semibold">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {plans.map((p) => (
                  <tr key={p.id} className="group/row transition-colors hover:bg-background">
                    <td className="relative whitespace-nowrap px-5 py-3 font-medium before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:origin-top before:scale-y-0 before:bg-primary before:transition-transform before:duration-300 before:content-[''] group-hover/row:before:scale-y-100">
                      {p.name}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">
                      {formatCurrency(p.price)}
                    </td>
                    <td className="hidden whitespace-nowrap px-5 py-3 text-muted-foreground sm:table-cell">
                      {CYCLE_LABEL[p.billingCycle]}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          p.active
                            ? "bg-success-bg text-success"
                            : "bg-background text-muted-foreground"
                        }`}
                      >
                        {p.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">
                      {p.featured ? (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                          <Star className="h-3.5 w-3.5" fill="currentColor" /> Destacado
                        </span>
                      ) : (
                        <form action={setFeaturedPlan.bind(null, p.id)}>
                          <button
                            type="submit"
                            className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-background"
                          >
                            <Star className="h-3.5 w-3.5" /> Destacar
                          </button>
                        </form>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/planes/${p.id}/editar`}
                          aria-label={`Editar ${p.name}`}
                          className="flex items-center justify-center rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-background"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                        <form action={togglePlanActive.bind(null, p.id, !p.active)}>
                          <button
                            type="submit"
                            className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-background"
                          >
                            {p.active ? "Desactivar" : "Activar"}
                          </button>
                        </form>
                        {p._count.members === 0 ? (
                          <form action={deletePlan.bind(null, p.id)}>
                            <ConfirmSubmitButton
                              confirmMessage={`¿Eliminar el plan "${p.name}" definitivamente?`}
                              className="rounded-lg border border-destructive/40 px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
                            >
                              Eliminar
                            </ConfirmSubmitButton>
                          </form>
                        ) : (
                          <button
                            type="button"
                            disabled
                            title={`No se puede eliminar: ${p._count.members} socio(s) tienen este plan. Desactivalo en cambio.`}
                            className="cursor-not-allowed rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground opacity-50"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {plans.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">
                      Todavía no creaste ningún plan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-semibold">Nuevo plan</h2>
          <form action={createPlan} className="mt-4 flex flex-col gap-3">
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
              <label htmlFor="price" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Precio
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min={0}
                step={100}
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
                defaultValue="MONTHLY"
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
                placeholder={"Acceso a sala de musculación\n2 clases grupales por semana\nEvaluación física inicial"}
                className="w-full resize-none rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Una línea por beneficio — así aparecen en tu sitio público.
              </p>
            </div>
            <button
              type="submit"
              className="mt-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
            >
              Crear plan
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
