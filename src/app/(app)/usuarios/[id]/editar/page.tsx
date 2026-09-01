import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { requireOwner } from "@/lib/authz";
import { db } from "@/lib/db";
import { deleteUser } from "../../actions";
import EditUserForm from "./EditUserForm";

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

      <EditUserForm
        userId={user.id}
        name={user.name}
        email={user.email}
        phone={user.phone ?? ""}
        role={user.role}
        isSelf={isSelf}
      />

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
