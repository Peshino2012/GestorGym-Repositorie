import Link from "next/link";
import { requireOwner } from "@/lib/authz";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { createStaffUser, toggleUserActive } from "./actions";

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string }>;
}) {
  const session = await requireOwner();
  const currentUserId = session?.user?.id;
  const { created } = await searchParams;

  const users = await db.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <p className="mt-1 text-sm text-muted-foreground">Staff con acceso al panel.</p>
      </div>

      {created && (
        <div className="animate-pop-in rounded-2xl border border-success/30 bg-success-bg p-5">
          <p className="text-sm font-semibold text-success">Usuario creado: {created}</p>
          <p className="mt-1 text-sm text-success">
            Se le va a pedir que cambie la contraseña al iniciar sesión por primera vez.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="overflow-hidden rounded-2xl border border-border bg-surface lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-background text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-semibold">Nombre</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="hidden px-5 py-3 font-semibold sm:table-cell">Rol</th>
                  <th className="px-5 py-3 font-semibold">Estado</th>
                  <th className="hidden px-5 py-3 font-semibold md:table-cell">Desde</th>
                  <th className="px-5 py-3 text-right font-semibold">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u.id} className="group/row transition-colors hover:bg-background">
                    <td className="relative whitespace-nowrap px-5 py-3 font-medium before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:origin-top before:scale-y-0 before:bg-primary before:transition-transform before:duration-300 before:content-[''] group-hover/row:before:scale-y-100">
                      <Link href={`/usuarios/${u.id}/editar`} className="hover:text-primary">
                        {u.name}
                      </Link>
                      {u.mustChangePassword && (
                        <span className="ml-2 inline-block rounded-full bg-warning-bg px-2 py-0.5 text-[10px] font-semibold text-warning">
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">{u.email}</td>
                    <td className="hidden px-5 py-3 text-muted-foreground sm:table-cell">
                      {u.role === "OWNER" ? "Dueño" : "Staff"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          u.active
                            ? "bg-success-bg text-success"
                            : "bg-background text-muted-foreground"
                        }`}
                      >
                        {u.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="hidden whitespace-nowrap px-5 py-3 text-muted-foreground md:table-cell">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {u.id === currentUserId ? (
                        <span className="text-xs text-muted-foreground">Vos</span>
                      ) : (
                        <form action={toggleUserActive.bind(null, u.id, !u.active)} className="inline">
                          <button
                            type="submit"
                            className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-background"
                          >
                            {u.active ? "Desactivar" : "Activar"}
                          </button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-semibold">Nuevo usuario</h2>
          <p className="mt-1 text-xs text-muted-foreground">Se crea como Staff.</p>
          <form action={createStaffUser} className="mt-4 flex flex-col gap-3">
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
              <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Teléfono (opcional)
              </label>
              <input
                id="phone"
                name="phone"
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Contraseña inicial
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <p className="mt-1 text-xs text-muted-foreground">Mínimo 6 caracteres.</p>
            </div>
            <button
              type="submit"
              className="mt-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
            >
              Crear usuario
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
