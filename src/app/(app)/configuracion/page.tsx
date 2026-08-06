import Image from "next/image";
import { requireOwner } from "@/lib/authz";
import { getGymSettings } from "@/lib/gymSettings";
import { updateGymSettings } from "./actions";

export default async function ConfiguracionPage() {
  await requireOwner();
  const gym = await getGymSettings();

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración del gimnasio</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Estos datos aparecen en la credencial imprimible de los socios.
        </p>
      </div>

      <form
        action={updateGymSettings}
        className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-7"
      >
        {gym.logoUrl && (
          <Image
            src={gym.logoUrl}
            alt="Logo actual"
            width={64}
            height={64}
            className="rounded-lg border border-border object-contain"
          />
        )}

        <div>
          <label htmlFor="name" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Nombre del gimnasio
          </label>
          <input
            id="name"
            name="name"
            defaultValue={gym.name}
            required
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label htmlFor="address" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Dirección
          </label>
          <input
            id="address"
            name="address"
            defaultValue={gym.address ?? ""}
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
            defaultValue={gym.phone ?? ""}
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label htmlFor="logo" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Logo (opcional)
          </label>
          <input
            id="logo"
            name="logo"
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
