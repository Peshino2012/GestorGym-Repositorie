import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { getGymSettings } from "@/lib/gymSettings";
import { formatDate } from "@/lib/format";
import Avatar from "@/components/Avatar";
import PrintButton from "@/components/PrintButton";

export default async function CredencialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [member, gym] = await Promise.all([
    db.member.findUnique({
      where: { id },
      include: {
        plan: true,
        payments: { orderBy: { dueDate: "desc" }, take: 1 },
      },
    }),
    getGymSettings(),
  ]);

  if (!member) notFound();

  const latestPayment = member.payments[0];

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      <div className="flex w-full max-w-2xl items-center justify-between print:hidden">
        <Link
          href={`/socios/${member.id}`}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </Link>
        <PrintButton />
      </div>

      <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm sm:flex-row">
        <div className="flex flex-col items-center justify-center gap-3 border-b border-border bg-background p-6 text-center sm:w-2/5 sm:border-b-0 sm:border-r">
          <Avatar name={member.name} photoUrl={member.photoUrl} size="lg" />
          <div>
            <p className="font-bold">{gym.name}</p>
            {gym.address && <p className="text-xs text-muted-foreground">{gym.address}</p>}
            {gym.phone && <p className="text-xs text-muted-foreground">{gym.phone}</p>}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3 p-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Socio</p>
            <p className="text-lg font-bold">{member.name}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Plan</p>
            <p className="text-sm font-medium">{member.plan.name}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Socio desde</p>
            <p className="text-sm font-medium">{formatDate(member.joinedAt)}</p>
          </div>
          {latestPayment && (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Vigencia</p>
              <p className="text-sm font-medium">{formatDate(latestPayment.dueDate)}</p>
            </div>
          )}
          {(member.emergencyName || member.emergencyPhone) && (
            <div className="mt-2 border-t border-border pt-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Contacto de emergencia
              </p>
              <p className="text-sm">
                {member.emergencyName}
                {member.emergencyPhone && ` · ${member.emergencyPhone}`}
              </p>
              {member.emergencyNotes && (
                <p className="text-xs text-muted-foreground">{member.emergencyNotes}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="max-w-2xl text-center text-xs text-muted-foreground print:hidden">
        Generado por Gestor Cauccen
      </p>
    </div>
  );
}
