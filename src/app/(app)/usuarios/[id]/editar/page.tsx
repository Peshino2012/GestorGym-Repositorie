import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { requireOwner } from "@/lib/authz";
import { db } from "@/lib/db";
import { updateUser, deleteUser } from "../../actions";

export default async function EditarUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireOwner();
  const { id } = await params;

  const user = await db.user.findUnique({ where: { id } });
  if (!user) notFound();

  const isSelf = session.user?.id === user.id;

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <Link
        href="/usuarios"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a usuarios
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Editar usuario</h1>
      </div>

      <form
        action={updateUser.bind(null, user.id)}
        className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-7"
      >
        <div>
          <label htmlFor="name" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Nombre
          </label>
          <input
            id="name"
            name="name"
            defaultValue={user.name}
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
            defaultValue={user.email}
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
            defaultValue={user.phone ?? ""}
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label htmlFor="role" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Rol
          </label>
          <select
            id="role"
            name="role"
            defaultValue={user.role}
            disabled={isSelf}
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
          >
            <option value="STAFF">Staff</option>
            <option value="OWNER">Dueño</option>
          </select>
          {isSelf && (
            <p className="mt-1 text-xs text-muted-foreground">
              No podés cambiar tu propio rol.
            </p>
          )}
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Nueva contraseña (opcional)
          </label>
          <input
            id="password"
            name="password"
            type="password"
            minLength={6}
            placeholder="Dejar en blanco para no cambiarla"
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Si la completás, se le va a pedir que la cambie al iniciar sesión.
          </p>
        </div>
        <button
          type="submit"
          className="mt-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
        >
          Guardar cambios
        </button>
      </form>

      {!isSelf && (
        <form
          action={deleteUser.bind(null, user.id)}
          className="rounded-2xl border border-destructive/30 bg-surface p-6"
        >
          <h2 className="font-semibold text-destructive">Eliminar usuario</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Borra el acceso de {user.name} de forma permanente. No se puede deshacer.
          </p>
          <button
            type="submit"
            className="mt-3 flex items-center gap-1.5 rounded-lg border border-destructive/40 px-4 py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" /> Eliminar definitivamente
          </button>
        </form>
      )}
    </div>
  );
}
