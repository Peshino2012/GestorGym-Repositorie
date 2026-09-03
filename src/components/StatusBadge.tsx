const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-success-bg text-success",
  OVERDUE: "bg-danger-bg text-danger",
  INACTIVE: "bg-border text-muted-foreground",
  PAID: "bg-success-bg text-success",
  PENDING: "bg-warning-bg text-warning",
  SCHEDULED: "bg-border text-muted-foreground",
  BOOKED: "bg-success-bg text-success",
  WAITLIST: "bg-warning-bg text-warning",
  CANCELLED: "bg-border text-muted-foreground",
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Activo",
  OVERDUE: "Vencido",
  INACTIVE: "Inactivo",
  PAID: "Pagado",
  PENDING: "Pendiente",
  SCHEDULED: "Al día",
  BOOKED: "Confirmado",
  WAITLIST: "Lista de espera",
  CANCELLED: "Cancelado",
};

const URGENT = new Set(["OVERDUE"]);

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold transition-transform duration-200 hover:scale-105 ${
        STATUS_STYLES[status] ?? "bg-border text-muted-foreground"
      } ${URGENT.has(status) ? "animate-urgent-pulse" : ""}`}
    >
      {URGENT.has(status) && (
        <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      )}
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
