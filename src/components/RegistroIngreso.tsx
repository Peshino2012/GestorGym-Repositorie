"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { checkInByDni, type CheckInResult } from "@/app/registro/actions";

const initialState: CheckInResult = null;

export default function RegistroIngreso({ gymName }: { gymName: string }) {
  const [state, formAction, pending] = useActionState(checkInByDni, initialState);
  const [dismissed, setDismissed] = useState(false);
  const [prevState, setPrevState] = useState(state);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (state !== prevState) {
    setPrevState(state);
    setDismissed(false);
  }

  const showResult = state !== null && !dismissed;

  useEffect(() => {
    if (state) formRef.current?.reset();
  }, [state]);

  useEffect(() => {
    if (!showResult) return;
    const t = setTimeout(() => setDismissed(true), 4000);
    return () => clearTimeout(t);
  }, [showResult]);

  useEffect(() => {
    if (!showResult) inputRef.current?.focus();
  }, [showResult]);

  if (showResult && state) {
    if (!state.found) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-danger-bg px-6 text-center">
          <p className="text-3xl font-bold text-danger">DNI no encontrado</p>
          <p className="text-lg text-danger">Pedí ayuda en recepción.</p>
        </div>
      );
    }

    const bg = state.isCurrent ? "bg-success-bg" : "bg-warning-bg";
    const fg = state.isCurrent ? "text-success" : "text-warning";

    return (
      <div className={`flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center ${bg}`}>
        <p className={`text-4xl font-bold ${fg}`}>Bienvenido, {state.name}</p>
        <p className={`text-xl font-medium ${fg}`}>{state.planName}</p>
        <p className={`text-lg ${fg}`}>Vencimiento: {state.dueDate}</p>
        {!state.isCurrent && (
          <p className={`text-base font-semibold ${fg}`}>Pasá por recepción para regularizar el pago.</p>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div>
        <h1 className="text-2xl font-bold">{gymName}</h1>
        <p className="mt-1 text-muted-foreground">Ingresá tu DNI para registrar tu entrada</p>
      </div>
      <form ref={formRef} action={formAction} className="flex w-full max-w-sm flex-col gap-4">
        <input
          ref={inputRef}
          name="dni"
          inputMode="numeric"
          autoFocus
          autoComplete="off"
          placeholder="DNI"
          disabled={pending}
          className="w-full rounded-xl border border-border bg-surface px-4 py-5 text-center text-3xl tracking-widest outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-primary px-4 py-4 text-lg font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90 active:scale-[0.97] disabled:opacity-60"
        >
          {pending ? "Registrando..." : "Registrar ingreso"}
        </button>
      </form>
    </div>
  );
}
