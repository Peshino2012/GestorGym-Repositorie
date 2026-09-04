import { MessageCircle, Phone, EyeOff } from "lucide-react";
import { computeAtRiskMembers } from "@/lib/retention";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { retentionAlertMessage } from "@/lib/messages";
import { getGymSettings } from "@/lib/gymSettings";
import WhatsAppButton from "@/components/WhatsAppButton";
import { sendRetentionAlert, dismissRisk } from "./actions";

export default async function RiesgoPage() {
  const [atRisk, recentMessages, gym] = await Promise.all([
    computeAtRiskMembers(),
    db.messageLog.findMany({
      where: { type: "RETENTION_ALERT" },
      include: { member: true },
      orderBy: { sentAt: "desc" },
      take: 8,
    }),
    getGymSettings(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Riesgo de abandono</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Socios que veían el gimnasio con regularidad y no pisaron el gimnasio
          en los últimos 14 días. Es una regla simple basada en la frecuencia
          histórica de check-ins — no un modelo de IA — pensada para que puedas
          intervenir antes de que cancelen.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-background text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-semibold">Socio</th>
                <th className="hidden px-5 py-3 font-semibold md:table-cell">Promedio previo</th>
                <th className="px-5 py-3 font-semibold">Última visita</th>
                <th className="hidden px-5 py-3 font-semibold sm:table-cell">Teléfono</th>
                <th className="px-5 py-3 text-right font-semibold">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {atRisk.map((m) => (
                <tr key={m.id} className="group/row transition-colors hover:bg-background">
                  <td className="relative whitespace-nowrap px-5 py-3 font-medium before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:origin-top before:scale-y-0 before:bg-warning before:transition-transform before:duration-300 before:content-[''] group-hover/row:before:scale-y-100">
                    {m.name}
                  </td>
                  <td className="hidden whitespace-nowrap px-5 py-3 text-muted-foreground md:table-cell">
                    {m.historicalWeeklyAvg}x/semana
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-muted-foreground">
                    {m.lastVisit ? formatDate(m.lastVisit) : "—"}
                  </td>
                  <td className="hidden whitespace-nowrap px-5 py-3 text-muted-foreground sm:table-cell">
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" /> {m.phone}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-2">
                      <form action={sendRetentionAlert.bind(null, m.id)}>
                        <WhatsAppButton
                          phone={m.phone}
                          message={retentionAlertMessage(m.name, gym.name)}
                          className="group flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90 active:scale-[0.96] sm:px-3"
                        >
                          <MessageCircle className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-110" />
                          <span className="hidden sm:inline">Contactar</span>
                        </WhatsAppButton>
                      </form>
                      <form action={dismissRisk.bind(null, m.id)}>
                        <button
                          type="submit"
                          aria-label={`Descartar a ${m.name} de la lista de riesgo`}
                          title="Ya lo contacté por otro medio — no mostrar por 14 días"
                          className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold transition-colors hover:bg-background sm:px-3"
                        >
                          <EyeOff className="h-3.5 w-3.5 shrink-0" />
                          <span className="hidden sm:inline">Descartar</span>
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {atRisk.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">
                    Sin alertas por ahora. Todos tus socios activos vienen con regularidad.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">Contactos enviados</h2>
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
              Todavía no contactaste a ningún socio en riesgo.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
