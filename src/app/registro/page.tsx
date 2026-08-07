import { getGymSettings } from "@/lib/gymSettings";
import RegistroIngreso from "@/components/RegistroIngreso";

// Must reflect the live checkinEnabled toggle and gym name — never prerender.
export const dynamic = "force-dynamic";

export default async function RegistroPage() {
  const gym = await getGymSettings();

  if (!gym.checkinEnabled) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-background px-6 text-center">
        <p className="text-xl font-semibold text-muted-foreground">Registro de ingreso no disponible</p>
      </div>
    );
  }

  return <RegistroIngreso gymName={gym.name} />;
}
