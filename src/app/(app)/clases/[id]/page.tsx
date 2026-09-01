import { notFound } from "next/navigation";
import Link from "next/link";
import { X, Pencil, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { DAYS } from "@/lib/format";
import ConfirmSubmitButton from "@/components/ConfirmSubmitButton";
import MemberCombobox from "@/components/MemberCombobox";
import { bookMember, cancelBooking, cancelAllBookings, deleteClass } from "../actions";
import { requireClassesEnabled } from "@/lib/authz";

export default async function ClaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireClassesEnabled();
  const { id } = await params;

  const cls = await db.gymClass.findUnique({
    where: { id },
    include: {
      bookings: {
        where: { status: { in: ["BOOKED", "WAITLIST"] } },
        include: { member: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!cls) notFound();

  const booked = cls.bookings.filter((b) => b.status === "BOOKED");
  const waitlist = cls.bookings.filter((b) => b.status === "WAITLIST");
  const takenIds = new Set(cls.bookings.map((b) => b.memberId));

  const availableMembers = await db.member.findMany({
    where: { id: { notIn: [...takenIds] }, status: { not: "INACTIVE" } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border bg-surface p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {DAYS[cls.dayOfWeek]} · {cls.startTime} · {cls.durationMin} min
          </p>
          <h1 className="mt-1 text-xl font-bold">{cls.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{cls.instructor}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/clases/${cls.id}/editar`}
            className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-background"
          >
            <Pencil className="h-4 w-4" /> Editar
          </Link>
          {cls.bookings.length === 0 ? (
            <form action={deleteClass.bind(null, cls.id)}>
              <ConfirmSubmitButton
                confirmMessage={`¿Eliminar la clase "${cls.name}" definitivamente?`}
                className="flex items-center gap-1.5 rounded-lg border border-destructive/40 px-4 py-2.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" /> Eliminar
              </ConfirmSubmitButton>
            </form>
          ) : (
            <>
              <form action={cancelAllBookings.bind(null, cls.id)}>
                <ConfirmSubmitButton
                  confirmMessage={`¿Cancelar las ${cls.bookings.length} reserva(s) de "${cls.name}" (confirmados y lista de espera)? Esto no elimina la clase, solo vacía la lista.`}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-background"
                >
                  <X className="h-4 w-4" /> Vaciar lista
                </ConfirmSubmitButton>
              </form>
              <button
                type="button"
                disabled
                title={`No se puede eliminar: hay ${booked.length} confirmado(s) y ${waitlist.length} en lista de espera. Usá "Vaciar lista" o sacalos uno por uno.`}
                className="flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground opacity-50"
              >
                <Trash2 className="h-4 w-4" /> Eliminar
              </button>
            </>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="font-semibold">Anotar socio</h2>
        <form
          action={bookMember.bind(null, cls.id)}
          className="mt-4 flex flex-col gap-3 sm:flex-row"
        >
          <div className="flex-1">
            <MemberCombobox
              name="memberId"
              members={availableMembers}
              required
              placeholder="Buscar socio por nombre..."
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
          >
            Reservar
          </button>
        </form>
        {availableMembers.length === 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            Todos los socios activos ya están anotados en esta clase.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-semibold">
            Confirmados ({booked.length}/{cls.capacity})
          </h2>
          <div className="mt-4 flex flex-col divide-y divide-border">
            {booked.map((b) => (
              <BookingRow key={b.id} name={b.member.name} bookingId={b.id} />
            ))}
            {booked.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Sin reservas confirmadas.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="font-semibold">Lista de espera ({waitlist.length})</h2>
          <div className="mt-4 flex flex-col divide-y divide-border">
            {waitlist.map((b) => (
              <BookingRow key={b.id} name={b.member.name} bookingId={b.id} />
            ))}
            {waitlist.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Sin lista de espera.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingRow({ name, bookingId }: { name: string; bookingId: string }) {
  return (
    <div className="flex items-center justify-between py-3 text-sm">
      <span className="font-medium">{name}</span>
      <form action={cancelBooking.bind(null, bookingId)}>
        <button
          type="submit"
          aria-label={`Cancelar reserva de ${name}`}
          className="group flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-all duration-150 hover:bg-danger-bg hover:text-danger active:scale-90"
        >
          <X className="h-4 w-4 transition-transform duration-150 group-hover:rotate-90" />
        </button>
      </form>
    </div>
  );
}
