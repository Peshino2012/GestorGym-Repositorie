import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, Phone, CalendarPlus, IdCard, ShieldAlert, Pencil, Archive } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import Avatar from "@/components/Avatar";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import { registerCheckIn, archiveMember } from "../actions";
import { undoMarkPaid } from "../../cobros/actions";

export default async function SocioDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const isOwner = session?.user?.role === "OWNER";

  const member = await db.member.findUnique({
    where: { id },
    include: {
      plan: true,
      payments: { orderBy: { dueDate: "desc" } },
      checkIns: { orderBy: { timestamp: "desc" }, take: 10 },
      bookings: { include: { class: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!member) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-start gap-4">
          <Avatar name={member.name} photoUrl={member.photoUrl} size="lg" />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold">{member.name}</h1>
              <StatusBadge status={member.status} />
            </div>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> {member.phone}
              </span>
              {member.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> {member.email}
                </span>
              )}
              <span>Plan {member.plan.name} · {formatCurrency(member.plan.price)}</span>
              <span>Socio desde {formatDate(member.joinedAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Link
            href={`/socios/${member.id}/editar`}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-background"
          >
            <Pencil className="h-4 w-4" /> Editar
          </Link>
          {isOwner && (
            <form action={archiveMember.bind(null, member.id)}>
              <ConfirmSubmitButton
                confirmMessage={`¿Archivar a ${member.name}? No va a aparecer más en la lista de socios, pero podés restaurarlo desde "Archivados".`}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-background"
              >
                <Archive className="h-4 w-4" /> Archivar
              </ConfirmSubmitButton>
            </form>
          )}
          <Link
            href={`/socios/${member.id}/credencial`}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-background"
          >
            <IdCard className="h-4 w-4" /> Ver credencial
          </Link>
          <form action={registerCheckIn.bind(null, member.id)}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
            >
              <CalendarPlus className="h-4 w-4" /> Registrar ingreso
            </button>
          </form>
        </div>
      </div>

      {(member.emergencyName || member.emergencyPhone || member.emergencyNotes) && (
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="flex items-center gap-2 font-semibold">
            <ShieldAlert className="h-4 w-4 text-warning" /> Contacto de emergencia
          </h2>
          <div className="mt-3 flex flex-wrap gap-x-8 gap-y-1 text-sm text-muted-foreground">
            {member.emergencyName && <span>{member.emergencyName}</span>}
            {member.emergencyPhone && <span>{member.emergencyPhone}</span>}
            {member.emergencyNotes && <span>{member.emergencyNotes}</span>}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-semibold">Historial de pagos</h2>
          <div className="mt-4 flex flex-col divide-y divide-border">
            {member.payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium">{formatCurrency(p.amount)}</p>
                  <p className="text-xs text-muted-foreground">Vence {formatDate(p.dueDate)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={p.status} />
                  {p.status === "PAID" && (
                    <form action={undoMarkPaid.bind(null, p.id)}>
                      <button
                        type="submit"
                        className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                      >
                        Deshacer
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ))}
            {member.payments.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">Sin pagos registrados.</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-semibold">Últimos ingresos</h2>
          <div className="mt-4 flex flex-col divide-y divide-border">
            {member.checkIns.map((c) => (
              <div key={c.id} className="py-3 text-sm text-muted-foreground">
                {formatDate(c.timestamp)}
              </div>
            ))}
            {member.checkIns.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">Sin ingresos registrados.</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="font-semibold">Reservas de clases</h2>
        <div className="mt-4 flex flex-col divide-y divide-border">
          {member.bookings.map((b) => (
            <div key={b.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-medium">{b.class.name}</p>
                <p className="text-xs text-muted-foreground">{b.class.startTime}</p>
              </div>
              <StatusBadge status={b.status} />
            </div>
          ))}
          {member.bookings.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">Sin reservas.</p>
          )}
        </div>
      </div>
    </div>
  );
}
