import type { LucideIcon } from "lucide-react";

const TONES = {
  default: "bg-primary/10 text-primary",
  danger: "bg-danger-bg text-danger",
  warning: "bg-warning-bg text-warning",
  success: "bg-success-bg text-success",
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: keyof typeof TONES;
}) {
  return (
    <div className="group rounded-2xl border border-border bg-surface p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${TONES[tone]}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-2xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
