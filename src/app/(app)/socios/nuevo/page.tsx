import { db } from "@/lib/db";
import SocioWizard from "@/components/SocioWizard";
import { createMember } from "../actions";

export default async function NuevoSocioPage() {
  const plans = await db.plan.findMany({ orderBy: { price: "asc" } });

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Nuevo socio</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Se crea con el primer pago pendiente a 30 días.
        </p>
      </div>

      <SocioWizard plans={plans} action={createMember} />
    </div>
  );
}
