import Link from "next/link";
import { Plus, Search, Archive, AlertTriangle } from "lucide-react";
import { subDays } from "date-fns";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { formatDate } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import Avatar from "@/components/Avatar";
import { archiveMember } from "./actions";

export default async function SociosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const session = await auth();
  const isOwner = session?.user?.role === "OWNER";
  const { q, status } = await searchParams;

  const where: Prisma.MemberWhereInput = {
    archivedAt: null,
    ...(q ? { name: { contains: q } } : {}),
    ...(status
      ? { status: status as "ACTIVE" | "OVERDUE" | "INACTIVE" }
      : {}),
  };

  const [members, archivedCount, longOverduePayments] = await Promise.all([
    db.member.findMany({
      where,
      include: { plan: true },
      orderBy: { name: "asc" },
    }),
    db.member.count({ where: { archivedAt: { not: null } } }),
    db.payment.findMany({
      where: { status: { in: ["PENDING", "OVERDUE"] }, dueDate: { lt: subDays(new Date(), 30) } },
      select: { memberId: true },
      distinct: ["memberId"],
    }),
  ]);

  const longOverdueIds = new Set(longOverduePayments.map((p) => p.memberId));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Socios</h1>
          <p className="mt-1 text-sm text-muted-foreground">{members.length} socios</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/socios/archivados"
            className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-background"
          >
            <Archive className="h-4 w-4" /> Archivados
            {archivedCount > 0 && (
              <span className="rounded-full bg-background px-1.5 text-xs">{archivedCount}</span>
            )}
          </Link>
          <Link
            href="/socios/nuevo"
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
          >
            <Plus className="h-4 w-4" /> Nuevo socio
          </Link>
        </div>
      </div>

      <form className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <div className="relative w-full sm:max-w-sm sm:flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre..."
            className="w-full rounded-lg border border-border bg-surface py-2.5 pl-9 pr-3 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-3">
          <select
            name="status"
            defaultValue={status ?? ""}
            className="flex-1 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 sm:flex-none"
          >
            <option value="">Todos los estados</option>
            <option value="ACTIVE">Activo</option>
            <option value="OVERDUE">Vencido</option>
            <option value="INACTIVE">Inactivo</option>
          </select>
          <button
            type="submit"
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-background"
          >
            Filtrar
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-background text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-semibold">Nombre</th>
                <th className="hidden px-5 py-3 font-semibold sm:table-cell">Plan</th>
                <th className="px-5 py-3 font-semibold">Estado</th>
                <th className="hidden px-5 py-3 font-semibold md:table-cell">Desde</th>
                <th className="hidden px-5 py-3 font-semibold sm:table-cell">Teléfono</th>
                {isOwner && <th className="px-5 py-3 text-right font-semibold">Acción</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {members.map((m) => (
                <tr key={m.id} className="group/row transition-colors hover:bg-background">
                  <td className="relative px-5 py-3 before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:origin-top before:scale-y-0 before:bg-primary before:transition-transform before:duration-300 before:content-[''] group-hover/row:before:scale-y-100">
                    <Link
                      href={`/socios/${m.id}`}
                      className="group flex items-center gap-3 font-medium hover:text-primary"
                    >
                      <Avatar name={m.name} photoUrl={m.photoUrl} size="sm" interactive />
                      <span className="whitespace-nowrap">{m.name}</span>
                      {longOverdueIds.has(m.id) && (
                        <span
                          title="Vencido hace más de 30 días"
                          className="flex items-center gap-1 rounded-full bg-danger-bg px-2 py-0.5 text-[10px] font-semibold text-danger"
                        >
                          <AlertTriangle className="h-3 w-3" /> 30+ días
                        </span>
                      )}
                    </Link>
                  </td>
                  <td className="hidden px-5 py-3 text-muted-foreground sm:table-cell">
                    {m.plan.name}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="hidden whitespace-nowrap px-5 py-3 text-muted-foreground md:table-cell">
                    {formatDate(m.joinedAt)}
                  </td>
                  <td className="hidden whitespace-nowrap px-5 py-3 text-muted-foreground sm:table-cell">
                    {m.phone}
                  </td>
                  {isOwner && (
                    <td className="px-5 py-3 text-right">
                      <form action={archiveMember.bind(null, m.id)}>
                        <button
                          type="submit"
                          className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-background"
                        >
                          Archivar
                        </button>
                      </form>
                    </td>
                  )}
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={isOwner ? 6 : 5} className="px-5 py-10 text-center text-muted-foreground">
                    No se encontraron socios.
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
