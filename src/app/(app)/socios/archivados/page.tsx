import Link from "next/link";
import { ArrowLeft, RotateCcw, Trash2 } from "lucide-react";
import { requireOwner } from "@/lib/authz";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import Avatar from "@/components/Avatar";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import { unarchiveMember, deleteMemberPermanently } from "../actions";

export default async function ArchivadosPage() {
  await requireOwner();

  const members = await db.member.findMany({
    where: { archivedAt: { not: null } },
    include: { plan: true },
    orderBy: { archivedAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/socios"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a socios
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Socios archivados</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          No aparecen en la lista principal. Podés restaurarlos o eliminarlos
          definitivamente — esto último borra también sus pagos, ingresos y
          reservas, y no se puede deshacer.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-background text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-semibold">Nombre</th>
                <th className="hidden px-5 py-3 font-semibold sm:table-cell">Plan</th>
                <th className="px-5 py-3 font-semibold">Archivado</th>
                <th className="px-5 py-3 text-right font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {members.map((m) => (
                <tr key={m.id} className="group/row transition-colors hover:bg-background">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={m.name} photoUrl={m.photoUrl} size="sm" />
                      <span className="whitespace-nowrap font-medium">{m.name}</span>
                    </div>
                  </td>
                  <td className="hidden px-5 py-3 text-muted-foreground sm:table-cell">
                    {m.plan.name}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">
                    {m.archivedAt ? formatDate(m.archivedAt) : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <form action={unarchiveMember.bind(null, m.id)}>
                        <button
                          type="submit"
                          className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-background"
                        >
                          <RotateCcw className="h-3.5 w-3.5" /> Restaurar
                        </button>
                      </form>
                      <form action={deleteMemberPermanently.bind(null, m.id)}>
                        <ConfirmSubmitButton
                          confirmMessage={`¿Eliminar a ${m.name} definitivamente? Se borran también sus pagos, ingresos y reservas. No se puede deshacer.`}
                          className="flex items-center gap-1.5 rounded-lg border border-destructive/40 px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Eliminar
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">
                    No hay socios archivados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
