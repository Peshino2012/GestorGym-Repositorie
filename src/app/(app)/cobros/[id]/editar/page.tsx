import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { toDateInputValue } from "@/lib/format";
import { updatePayment } from "../../actions";

export default async function EditarCobroPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const payment = await db.payment.findUnique({
    where: { id },
    include: { member: true },
  });

  if (!payment) notFound();
  if (payment.status === "PAID") redirect(`/socios/${payment.memberId}`);

  const dueDateValue = toDateInputValue(payment.dueDate);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <Link
        href="/cobros"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a cobros
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Editar cobro</h1>
        <p className="mt-1 text-sm text-muted-foreground">{payment.member.name}</p>
      </div>

      <form
        action={updatePayment.bind(null, payment.id)}
        className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-7"
      >
        <div>
          <label htmlFor="amount" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Monto
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            min={0}
            step={100}
            defaultValue={payment.amount}
            required
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label htmlFor="dueDate" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Vencimiento
          </label>
          <input
            id="dueDate"
            name="dueDate"
            type="date"
            defaultValue={dueDateValue}
            required
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button
          type="submit"
          className="mt-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
        >
          Guardar cambios
        </button>
      </form>
    </div>
  );
}
