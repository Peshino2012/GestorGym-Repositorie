"use client";

import { useActionState, useEffect, useRef } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { checkInByDniStaff, type CheckInResult } from "./actions";

const initialState: CheckInResult = null;

export default function IngresoStaffForm() {
  const [state, formAction, pending] = useActionState(checkInByDniStaff, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state) {
      formRef.current?.reset();
      inputRef.current?.focus();
    }
  }, [state]);

  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <h2 className="font-semibold">Registrar ingreso</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Ingresá el DNI del socio para marcar su entrada.
      </p>
      <form ref={formRef} action={formAction} className="mt-4 flex gap-3">
        <input
          ref={inputRef}
          name="dni"
          inputMode="numeric"
          autoFocus
          autoComplete="off"
          placeholder="DNI"
          disabled={pending}
          className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90 active:scale-[0.97] disabled:opacity-60"
        >
          {pending ? "..." : "Registrar"}
        </button>
      </form>

      {state && (
        <div
          className={`mt-4 flex items-start gap-2 rounded-lg px-3.5 py-3 text-sm ${
            state.found ? "bg-success-bg text-success" : "bg-danger-bg text-danger"
          }`}
        >
          {state.found ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <div>
            {state.found ? (
              <>
                <p className="font-semibold">{state.name}</p>
                <p className="text-xs opacity-90">
                  {state.planName} · Vencimiento: {state.dueDate}
                  {!state.isCurrent && " · Pago pendiente"}
                </p>
              </>
            ) : (
              <p className="font-semibold">DNI no encontrado.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
