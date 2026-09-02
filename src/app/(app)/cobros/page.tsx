import Link from "next/link";
import type { ReactNode } from "react";
import { addDays } from "date-fns";
import { CheckCircle2, MessageCircle, Pencil, Trash2, Undo2 } from "lucide-react";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/format";
import { getPaymentStatusBreakdown } from "@/lib/stats";
import { paymentReminderMessage } from "@/lib/messages";
import { syncOverduePayments } from "@/lib/paymentSync";
import StatusBadge from "@/components/StatusBadge";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import PendingSubmitButton from "@/components/PendingSubmitButton";
import WhatsAppButton from "@/components/WhatsAppButton";
import PaymentStatusChart from "@/components/charts/PaymentStatusChart";
import MemberCombobox from "@/components/MemberCombobox";
import NewPaymentForm from "./NewPaymentForm";
import { markPaid, sendPaymentReminder, createPayment, deletePayment, undoMarkPaid } from "./actions";
import type { Payment, Member } from "@/generated/prisma/client";

const STATUS_OPTIONS: { value: "PAID" | "OVERDUE"; label: string }[] = [
  { value: "PAID", label: "Pagado" },
  { value: "OVERDUE", label: "Vencido" },
];

const MARK_PAID_WINDOW_DAYS = 3;

type PaymentWithMember = Payment & { member: Member };

export default async function CobrosPage({
  searchParams,
}: {
  searchParams: Promise<{ memberId?: string; status?: string }>;
}) {
  await syncOverduePayments();
  const { memberId, status } = await searchParams;
  const markPaidCutoff = addDays(new Date(), MARK_PAID_WINDOW_DAYS);
  const isFiltered = Boolean(memberId || status);

  const [payments, recentMessages, statusBreakdown, members, plans, activePayments] = await Promise.all([
    db.payment.findMany({
      where: {
        ...(memberId ? { memberId } : {}),
        ...(status ? { status: status as "PENDING" | "PAID" | "OVERDUE" } : {}),
      },
      include: { member: true },
      orderBy: { dueDate: "desc" },
    }),
    db.messageLog.findMany({
      where: { type: "PAYMENT_REMINDER" },
      include: { member: true },
      orderBy: { sentAt: "desc" },
      take: 8,
    }),
    getPaymentStatusBreakdown(),
    db.member.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, dni: true } }),
    db.plan.findMany({ where: { active: true }, orderBy: { price: "asc" }, select: { id: true, name: true, price: true } }),
    db.payment.findMany({
      where: { status: { in: ["PENDING", "OVERDUE"] } },
      select: { memberId: true },
    }),
  ]);

  const membersWithActivePayment = [...new Set(activePayments.map((p) => p.memberId))];

  const RECENT_LIMIT = 5;
  const vencidosAll = payments.filter((p) => p.status === "OVERDUE");
  const porVencer = payments.filter((p) => p.status === "PENDING" && p.dueDate <= markPaidCutoff);
  const alDia = payments.filter((p) => p.status === "PENDING" && p.dueDate > markPaidCutoff);
  const historialAll = payments.filter((p) => p.status === "PAID");

  // Unfiltered view: show only the most recent few per section, with a link
  // to the full filtered list — a gym running for a while can have hundreds
  // of paid/vencido rows, and dumping all of them here defeats the point of
  // splitting into sections in the first place.
  const vencidos = isFiltered ? vencidosAll : vencidosAll.slice(0, RECENT_LIMIT);
  const historial = isFiltered ? historialAll : historialAll.slice(0, RECENT_LIMIT);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Cobros</h1>
        <p className="mt-1 text-sm text-muted-foreground">{payments.length} pagos</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <form className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-surface p-4">
            <div className="w-56">
              <label htmlFor="memberId" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Socio
              </label>
              <MemberCombobox
                id="memberId"
                name="memberId"
                members={members}
                defaultValue={memberId ?? ""}
                placeholder="Todos los socios"
              />
            </div>
            <div>
              <label htmlFor="status" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                Estado
              </label>
              <select
                id="status"
                name="status"
                defaultValue={status ?? ""}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Todos los estados</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-background"
            >
              Filtrar
            </button>
            {isFiltered && (
              <Link
                href="/cobros"
                className="text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Limpiar filtros
              </Link>
            )}
          </form>

          {payments.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-10 text-center text-sm text-muted-foreground">
              {isFiltered ? "Ningún cobro coincide con el filtro." : "Todavía no hay cobros cargados."}
            </div>
          ) : (
            <>
              {vencidos.length > 0 && (
                <CobrosSection
                  title="Vencidos"
                  count={vencidosAll.length}
                  shown={vencidos.length}
                  viewAllHref={!isFiltered && vencidosAll.length > vencidos.length ? "/cobros?status=OVERDUE" : undefined}
                  tone="danger"
                  defaultOpen
                >
                  <CobrosTable payments={vencidos} markPaidCutoff={markPaidCutoff} />
                </CobrosSection>
              )}
              {porVencer.length > 0 && (
                <CobrosSection title="Por vencer pronto" count={porVencer.length} tone="warning" defaultOpen>
                  <CobrosTable payments={porVencer} markPaidCutoff={markPaidCutoff} />
                </CobrosSection>
              )}
              {alDia.length > 0 && (
                <CobrosSection title="Al día" count={alDia.length} tone="muted">
                  <CobrosTable payments={alDia} markPaidCutoff={markPaidCutoff} />
                </CobrosSection>
              )}
              {historial.length > 0 && (
                <CobrosSection
                  title="Historial (pagados)"
                  count={historialAll.length}
                  shown={historial.length}
                  viewAllHref={!isFiltered && historialAll.length > historial.length ? "/cobros?status=PAID" : undefined}
                  tone="muted"
                >
                  <CobrosTable payments={historial} markPaidCutoff={markPaidCutoff} />
                </CobrosSection>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-semibold">Nuevo cobro</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Cargo manual, fuera del ciclo automático — elegí el plan para autocompletar el monto.
              Los cobros normales se generan solos al marcar el anterior como pagado.
            </p>
            <NewPaymentForm
              members={members}
              plans={plans}
              membersWithActivePayment={membersWithActivePayment}
              action={createPayment}
            />
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-semibold">Estado de pagos</h2>
            <p className="text-xs text-muted-foreground">Todos los períodos</p>
            <div className="mt-2">
              <PaymentStatusChart data={statusBreakdown} />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">Recordatorios enviados</h2>
          <span className="rounded-full bg-success-bg px-2.5 py-1 text-xs font-semibold text-success">
            Abre WhatsApp con el mensaje listo para enviar
          </span>
        </div>
        <div className="mt-4 flex flex-col divide-y divide-border">
          {recentMessages.map((m) => (
            <div key={m.id} className="py-3 text-sm">
              <p className="text-xs text-muted-foreground">
                {m.member.name} · {formatDate(m.sentAt)}
              </p>
              <p className="mt-1">{m.content}</p>
            </div>
          ))}
          {recentMessages.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Todavía no enviaste recordatorios.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const SECTION_TONE = {
  danger: "text-danger",
  warning: "text-warning",
  muted: "text-muted-foreground",
};

function CobrosSection({
  title,
  count,
  shown,
  viewAllHref,
  tone,
  defaultOpen = false,
  children,
}: {
  title: string;
  count: number;
  shown?: number;
  viewAllHref?: string;
  tone: keyof typeof SECTION_TONE;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="group overflow-hidden rounded-2xl border border-border bg-surface [&_summary::-webkit-details-marker]:hidden"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-5 py-3.5 select-none">
        <span className={`text-sm font-semibold ${SECTION_TONE[tone]}`}>
          {title}{" "}
          <span className="text-muted-foreground">
            ({shown !== undefined && shown < count ? `${shown} de ${count}` : count})
          </span>
        </span>
        <span className="text-xs text-muted-foreground transition-transform duration-200 group-open:rotate-180">
          ▾
        </span>
      </summary>
      <div className="border-t border-border">{children}</div>
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="block border-t border-border px-5 py-2.5 text-center text-xs font-semibold text-primary hover:underline"
        >
          Ver los {count} completos →
        </Link>
      )}
    </details>
  );
}

function CobrosTable({
  payments,
  markPaidCutoff,
}: {
  payments: PaymentWithMember[];
  markPaidCutoff: Date;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-border bg-background text-left text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-5 py-3 font-semibold">Socio</th>
            <th className="px-5 py-3 font-semibold">Monto</th>
            <th className="hidden px-5 py-3 font-semibold md:table-cell">Vencimiento</th>
            <th className="px-5 py-3 font-semibold">Estado</th>
            <th className="px-5 py-3 text-right font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {payments.map((p) => (
            <tr key={p.id} className="group/row transition-colors hover:bg-background">
              <td className="relative whitespace-nowrap px-5 py-3 font-medium before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:origin-top before:scale-y-0 before:bg-primary before:transition-transform before:duration-300 before:content-[''] group-hover/row:before:scale-y-100">
                {p.member.name}
              </td>
              <td className="whitespace-nowrap px-5 py-3">{formatCurrency(p.amount)}</td>
              <td className="hidden whitespace-nowrap px-5 py-3 text-muted-foreground md:table-cell">
                {formatDate(p.dueDate)}
              </td>
              <td className="px-5 py-3">
                {p.status === "PENDING" ? (
                  <span className="text-xs text-muted-foreground">
                    Próximo pago: {formatDate(p.dueDate)}
                  </span>
                ) : (
                  <StatusBadge status={p.status} />
                )}
              </td>
              <td className="px-5 py-3">
                <div className="flex justify-end gap-2">
                  {p.status === "PAID" ? (
                    <form action={undoMarkPaid.bind(null, p.id)}>
                      <button
                        type="submit"
                        aria-label="Deshacer pago"
                        className="group flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold transition-all duration-150 hover:bg-background active:scale-[0.96] sm:px-3"
                      >
                        <Undo2 className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:-rotate-12" />
                        <span className="hidden sm:inline">Deshacer</span>
                      </button>
                    </form>
                  ) : (
                    <>
                      <form action={sendPaymentReminder.bind(null, p.id)}>
                        <WhatsAppButton
                          phone={p.member.phone}
                          message={paymentReminderMessage(p.member.name, p.amount, p.dueDate)}
                          className="group flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold transition-all duration-150 hover:bg-background active:scale-[0.96] sm:px-3"
                        >
                          <MessageCircle className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-110" />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </WhatsAppButton>
                      </form>
                      {(p.status === "OVERDUE" || p.dueDate <= markPaidCutoff) && (
                        <form action={markPaid.bind(null, p.id)}>
                          <PendingSubmitButton
                            aria-label="Marcar como pagado"
                            className="group flex items-center gap-1.5 rounded-lg bg-success px-2.5 py-1.5 text-xs font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-[0.96] disabled:opacity-60 sm:px-3"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                            <span className="hidden sm:inline">Marcar pagado</span>
                          </PendingSubmitButton>
                        </form>
                      )}
                      <Link
                        href={`/cobros/${p.id}/editar`}
                        aria-label="Editar pago"
                        className="flex items-center justify-center rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold transition-colors hover:bg-background"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                      <form action={deletePayment.bind(null, p.id)}>
                        <ConfirmSubmitButton
                          confirmMessage={`¿Eliminar el cobro de ${formatCurrency(p.amount)} de ${p.member.name}?`}
                          className="flex items-center justify-center rounded-lg border border-destructive/40 px-2.5 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </ConfirmSubmitButton>
                      </form>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
