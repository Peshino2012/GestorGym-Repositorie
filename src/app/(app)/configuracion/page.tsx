import Image from "next/image";
import { requireOwner } from "@/lib/authz";
import { getGymSettings } from "@/lib/gymSettings";
import { db } from "@/lib/db";
import { updateGymSettings } from "./actions";
import { updateUserModuleAccess } from "../usuarios/actions";

export default async function ConfiguracionPage() {
  await requireOwner();
  const gym = await getGymSettings();
  const staffUsers = await db.user.findMany({
    where: { role: "STAFF" },
    orderBy: { name: "asc" },
  });

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
            Teléfono / WhatsApp
          </label>
          <input
            id="phone"
            name="phone"
            defaultValue={gym.phone ?? ""}
            placeholder="+54 9 11 1234-5678"
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Con código de país y de área, así funciona el botón de WhatsApp del sitio público.
          </p>
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Email de contacto
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={gym.email ?? ""}
            placeholder="hola@tugimnasio.com"
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Ahí llegan las consultas del formulario de contacto de tu sitio público.
          </p>
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

        <label className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background px-3.5 py-3">
          <span>
            <span className="block text-sm font-medium">Registro de ingreso por DNI</span>
            <span className="block text-xs text-muted-foreground">
              Habilita la pantalla de <code>/registro</code> para una tablet en la entrada.
            </span>
          </span>
          <input
            type="checkbox"
            name="checkinEnabled"
            defaultChecked={gym.checkinEnabled}
            className="h-5 w-9 shrink-0 accent-primary"
          />
        </label>

        <button
          type="submit"
          className="mt-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
        >
          Guardar cambios
        </button>
      </form>

      <div>
        <h2 className="text-xl font-bold">Permisos por usuario</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Elegí a qué módulos puede acceder cada usuario Staff — el dueño siempre tiene acceso a todo.
        </p>
      </div>

      {staffUsers.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-7">
          <p className="text-sm text-muted-foreground">
            Todavía no creaste ningún usuario Staff — se van a poder configurar acá apenas crees uno.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {staffUsers.map((user) => (
            <form
              key={user.id}
              action={updateUserModuleAccess.bind(null, user.id)}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-7"
            >
              <div>
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>

              <label className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background px-3.5 py-3">
                <span className="text-sm font-medium">Clases</span>
                <input
                  type="checkbox"
                  name="canAccessClasses"
                  defaultChecked={user.canAccessClasses}
                  className="h-5 w-9 shrink-0 accent-primary"
                />
              </label>

              <label className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background px-3.5 py-3">
                <span className="text-sm font-medium">Horarios</span>
                <input
                  type="checkbox"
                  name="canAccessHorarios"
                  defaultChecked={user.canAccessHorarios}
                  className="h-5 w-9 shrink-0 accent-primary"
                />
              </label>

              <label className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background px-3.5 py-3">
                <span className="text-sm font-medium">Plan (cuota del gimnasio)</span>
                <input
                  type="checkbox"
                  name="canAccessPlan"
                  defaultChecked={user.canAccessPlan}
                  className="h-5 w-9 shrink-0 accent-primary"
                />
              </label>

              <label className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background px-3.5 py-3">
                <span className="text-sm font-medium">Planes (varios planes, función paga)</span>
                <input
                  type="checkbox"
                  name="canAccessPlanes"
                  defaultChecked={user.canAccessPlanes}
                  className="h-5 w-9 shrink-0 accent-primary"
                />
              </label>

              <label className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background px-3.5 py-3">
                <span className="text-sm font-medium">Registro (check-in por DNI)</span>
                <input
                  type="checkbox"
                  name="canAccessCheckin"
                  defaultChecked={user.canAccessCheckin}
                  className="h-5 w-9 shrink-0 accent-primary"
                />
              </label>

              <button
                type="submit"
                className="mt-2 self-start rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
              >
                Guardar
              </button>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}
