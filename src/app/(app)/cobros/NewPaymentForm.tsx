"use client";

import { useRef, useState } from "react";
import { TriangleAlert } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import MemberCombobox from "@/components/MemberCombobox";

type Member = { id: string; name: string };
type Plan = { id: string; name: string; price: number };

export default function NewPaymentForm({
  members,
  plans,
  membersWithActivePayment,
  action,
}: {
  members: Member[];
  plans: Plan[];
  membersWithActivePayment: string[];
  action: (formData: FormData) => void;
}) {
  const amountRef = useRef<HTMLInputElement>(null);
  const [selectedMemberId, setSelectedMemberId] = useState("");

  function handlePlanChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const plan = plans.find((p) => p.id === e.target.value);
    if (plan && amountRef.current) {
      amountRef.current.value = String(plan.price);
    }
  }

  const selectedMember = members.find((m) => m.id === selectedMemberId);
  const hasActivePayment = membersWithActivePayment.includes(selectedMemberId);
  const blocked = Boolean(selectedMemberId) && hasActivePayment;

  return (
    <form action={action} className="mt-4 flex flex-col gap-3">
      <div>
        <label htmlFor="memberId" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
          Socio
        </label>
        <MemberCombobox
          id="memberId"
          name="memberId"
          members={members}
          required
          placeholder="Buscar socio por nombre..."
          onSelect={setSelectedMemberId}
          suffixFor={(id) => (membersWithActivePayment.includes(id) ? " (ya tiene un cobro pendiente)" : "")}
        />
        {blocked && selectedMember && (
          <p className="mt-1.5 flex items-start gap-1.5 rounded-lg bg-danger-bg px-3 py-2 text-xs font-medium text-danger">
            <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {selectedMember.name} ya tiene un cobro pendiente o vencido registrado. Resolvé ese primero
            (marcalo pagado o editalo) antes de crear uno nuevo.
          </p>
        )}
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
        disabled={blocked}
        className="mt-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Crear cobro
      </button>
    </form>
  );
}
