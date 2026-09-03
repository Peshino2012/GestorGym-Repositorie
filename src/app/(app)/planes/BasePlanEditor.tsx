import { formatCurrency } from "@/lib/format";
import type { Plan } from "@/generated/prisma/client";

// Shown instead of the full multi-plan management UI when the Planes
// module isn't paid for — every gym still needs exactly one base Plan to
// function at all (socios need one to be created). Onboarding creates it
// automatically, but this also handles the case where a gym somehow has
// none yet (create form) as well as the normal case (edit form). No
// delete/featured controls here — those only make sense with more than
// one plan.
export default function BasePlanEditor({
  plan,
  updateAction,
  createAction,
}: {
  plan: Plan | null;
  updateAction: (id: string, formData: FormData) => void;
  createAction: (formData: FormData) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Tu plan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tu gimnasio usa un único plan de cuota. Si querés manejar varios planes distintos
          (básico, full, anual, etc.), es una función paga aparte — consultá para activarla.
        </p>
      </div>

      <div className="max-w-lg rounded-2xl border border-border bg-surface p-7">
        {plan ? (
          <p className="mb-4 text-xs font-semibold text-muted-foreground">
            Precio actual: {formatCurrency(plan.price)}
          </p>
        ) : (
          <p className="mb-4 text-xs font-semibold text-muted-foreground">
            Todavía no hay un plan configurado — creá el tuyo para poder empezar a dar de alta
            socios.
          </p>
        )}
        <form
          action={plan ? updateAction.bind(null, plan.id) : createAction}
          className="flex flex-col gap-4"
        >
          <div>
            <label htmlFor="name" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
              Nombre
            </label>
            <input
              id="name"
              name="name"
              defaultValue={plan?.name ?? "Cuota mensual"}
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
              defaultValue={plan?.price}
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
              defaultValue={plan?.billingCycle ?? "MONTHLY"}
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
              defaultValue={plan?.features ?? ""}
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
            {plan ? "Guardar cambios" : "Crear plan"}
          </button>
        </form>
      </div>
    </div>
  );
}
