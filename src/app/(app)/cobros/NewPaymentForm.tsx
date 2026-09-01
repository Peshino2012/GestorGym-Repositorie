"use client";

import { useRef } from "react";
import { formatCurrency } from "@/lib/format";

type Member = { id: string; name: string };
type Plan = { id: string; name: string; price: number };

export default function NewPaymentForm({
  members,
  plans,
  action,
}: {
  members: Member[];
  plans: Plan[];
  action: (formData: FormData) => void;
}) {
  const amountRef = useRef<HTMLInputElement>(null);

  function handlePlanChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const plan = plans.find((p) => p.id === e.target.value);
    if (plan && amountRef.current) {
      amountRef.current.value = String(plan.price);
    }
  }

  return (
    <form action={action} className="mt-4 flex flex-col gap-3">
      <div>
        <label htmlFor="memberId" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
          Socio
        </label>
        <select
          id="memberId"
          name="memberId"
          required
          defaultValue=""
          className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="" disabled>
            Elegí un socio
          </option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="planId" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
          Plan
        </label>
        <select
          id="planId"
          name="planId"
          required
          defaultValue=""
          onChange={handlePlanChange}
          className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="" disabled>
            Elegí un plan
          </option>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} - {formatCurrency(p.price)}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-muted-foreground">
          Completa el monto solo; podés editarlo después si hace falta.
        </p>
      </div>
      <div>
        <label htmlFor="amount" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
          Monto
        </label>
        <input
          ref={amountRef}
          id="amount"
          name="amount"
          type="number"
          min={0}
          step={100}
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
          required
          className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <button
        type="submit"
        className="mt-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
      >
        Crear cobro
      </button>
    </form>
  );
}
