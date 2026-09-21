import Image from "next/image";
import { CheckCircle2, XCircle } from "lucide-react";
import { requireOwner, isClasesModuleEnabled, isHorariosModuleEnabled, isPlanesModuleEnabled } from "@/lib/authz";
import { getGymSettings } from "@/lib/gymSettings";
import { db } from "@/lib/db";
import { updateGymSettings, updateMercadoPagoSettings, disconnectMercadoPago } from "./actions";
import { updateUserModuleAccess } from "../usuarios/actions";
import PasswordInput from "@/components/PasswordInput";

export default async function ConfiguracionPage() {
  await requireOwner();
  const [gym, staffUsers, classesModuleEnabled, horariosModuleEnabled, planesModuleEnabled] = await Promise.all([
    getGymSettings(),
    db.user.findMany({ where: { role: "STAFF" }, orderBy: { name: "asc" } }),
    isClasesModuleEnabled(),
    isHorariosModuleEnabled(),
    isPlanesModuleEnabled(),
  ]);

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
          <label htmlFor="publicSiteUrl" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Sitio web público (opcional)
          </label>
          <input
            id="publicSiteUrl"
            name="publicSiteUrl"
            type="url"
            defaultValue={gym.publicSiteUrl ?? ""}
            placeholder="https://tugimnasio.com.ar"
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Agrega un acceso directo arriba de todo el panel para abrirlo con un clic.
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
        <h2 className="text-xl font-bold">Mercado Pago</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tu propia cuenta de Mercado Pago — los cobros que generes con &quot;Cobrar con Mercado Pago&quot;
          se acreditan ahí, no en la nuestra. Sacá estas credenciales desde tu panel de Mercado Pago,
          en Tu negocio → Configuración → Credenciales de producción.
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-7">
        <div
          className={`flex items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-medium ${
            gym.mercadoPagoAccessToken
              ? "bg-success-bg text-success"
              : "bg-background text-muted-foreground"
          }`}
        >
          {gym.mercadoPagoAccessToken ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0" />
          )}
          {gym.mercadoPagoAccessToken ? "Conectado" : "No conectado"}
        </div>

        <form action={updateMercadoPagoSettings} className="flex flex-col gap-4">
          <PasswordInput
            name="mercadoPagoAccessToken"
            label="Access Token"
            placeholder={gym.mercadoPagoAccessToken ? "Dejar en blanco para no cambiarlo" : "APP_USR-..."}
          />
          <PasswordInput
            name="mercadoPagoWebhookSecret"
            label="Clave secreta del webhook (opcional)"
            placeholder={
              gym.mercadoPagoWebhookSecret ? "Dejar en blanco para no cambiarla" : "Tu negocio → Webhooks"
            }
            hint="Confirma que las notificaciones de pago realmente vienen de Mercado Pago. Recomendado, no obligatorio."
          />
          <button
            type="submit"
            className="mt-1 self-start rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
          >
            Guardar
          </button>
        </form>

        {gym.mercadoPagoAccessToken && (
          <form action={disconnectMercadoPago} className="border-t border-border pt-4">
            <button
              type="submit"
              className="text-sm font-semibold text-destructive transition-colors hover:opacity-80"
            >
              Desconectar Mercado Pago
            </button>
          </form>
        )}
      </div>

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

              {classesModuleEnabled && (
                <label className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background px-3.5 py-3">
                  <span className="text-sm font-medium">Clases</span>
                  <input type="hidden" name="classesEditable" value="1" />
                  <input
                    type="checkbox"
                    name="canAccessClasses"
                    defaultChecked={user.canAccessClasses}
                    className="h-5 w-9 shrink-0 accent-primary"
                  />
                </label>
              )}

              {horariosModuleEnabled && (
                <label className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background px-3.5 py-3">
                  <span className="text-sm font-medium">Horarios</span>
                  <input type="hidden" name="horariosEditable" value="1" />
                  <input
                    type="checkbox"
                    name="canAccessHorarios"
                    defaultChecked={user.canAccessHorarios}
                    className="h-5 w-9 shrink-0 accent-primary"
                  />
                </label>
              )}

              {planesModuleEnabled && (
                <label className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background px-3.5 py-3">
                  <span className="text-sm font-medium">Planes (varios planes, función paga)</span>
                  <input type="hidden" name="planesEditable" value="1" />
                  <input
                    type="checkbox"
                    name="canAccessPlanes"
                    defaultChecked={user.canAccessPlanes}
                    className="h-5 w-9 shrink-0 accent-primary"
                  />
                </label>
              )}

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
