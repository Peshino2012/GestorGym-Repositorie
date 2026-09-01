import Link from "next/link";
import { CheckCircle2, MessageCircle, Pencil, Trash2, Undo2 } from "lucide-react";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/format";
import { getPaymentStatusBreakdown } from "@/lib/stats";
import { paymentReminderMessage } from "@/lib/messages";
import StatusBadge from "@/components/StatusBadge";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import WhatsAppButton from "@/components/WhatsAppButton";
import PaymentStatusChart from "@/components/charts/PaymentStatusChart";
import NewPaymentForm from "./NewPaymentForm";
import { markPaid, sendPaymentReminder, createPayment, deletePayment, undoMarkPaid } from "./actions";

const STATUS_OPTIONS: { value: "PENDING" | "PAID" | "OVERDUE"; label: string }[] = [
  { value: "PENDING", label: "Pendiente" },
  { value: "PAID", label: "Pagado" },
  { value: "OVERDUE", label: "Vencido" },
];

export default async function CobrosPage({
  searchParams,
}: {
  searchParams: Promise<{ memberId?: string; status?: string }>;
}) {
  const { memberId, status } = await searchParams;

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
    db.member.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    db.plan.findMany({ where: { active: true }, orderBy: { price: "asc" }, select: { id: true, name: true, price: true } }),
    db.payment.findMany({
      where: { status: { in: ["PENDING", "OVERDUE"] } },
      select: { memberId: true },
    }),
  ]);

  const membersWithActivePayment = [...new Set(activePayments.map((p) => p.memberId))];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Cobros</h1>
        <p className="mt-1 text-sm text-muted-foreground">{payments.length} pagos</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="overflow-hidden rounded-2xl border border-border bg-surface lg:col-span-2">
        <form className="flex flex-wrap items-end gap-3 border-b border-border p-4">
          <div>
            <label htmlFor="memberId" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
              Socio
            </label>
            <select
              id="memberId"
              name="memberId"
              defaultValue={memberId ?? ""}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Todos los socios</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
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
          {(memberId || status) && (
            <Link
              href="/cobros"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Limpiar filtros
            </Link>
          )}
        </form>
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
                    <StatusBadge status={p.status} />
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
                          <form action={markPaid.bind(null, p.id)}>
                            <button
                              type="submit"
                              aria-label="Marcar como pagado"
                              className="group flex items-center gap-1.5 rounded-lg bg-success px-2.5 py-1.5 text-xs font-semibold text-white transition-all duration-150 hover:opacity-90 active:scale-[0.96] sm:px-3"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                              <span className="hidden sm:inline">Marcar pagado</span>
                            </button>
                          </form>
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
              {payments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                    Todavía no hay cobros cargados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-semibold">Nuevo cobro</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Cargo manual, fuera del ciclo automático — elegí el plan para autocompletar el monto.
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
