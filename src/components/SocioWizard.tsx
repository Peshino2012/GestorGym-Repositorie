"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { formatCurrency } from "@/lib/format";

type Plan = { id: string; name: string; price: number };

const STEPS = ["Datos personales", "Contacto de emergencia", "Foto"];

export default function SocioWizard({
  plans,
  action,
}: {
  plans: Plan[];
  action: (formData: FormData) => void;
}) {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const planRef = useRef<HTMLSelectElement>(null);

  function goNext() {
    if (step === 1) {
      if (
        !nameRef.current?.value.trim() ||
        !phoneRef.current?.value.trim() ||
        !planRef.current?.value
      ) {
        setError("Completá nombre, teléfono y plan para continuar.");
        return;
      }
    }
    setError("");
    setStep((s) => Math.min(s + 1, 3));
  }

  function goBack() {
    setError("");
    setStep((s) => Math.max(s - 1, 1));
  }

  return (
    <form
      action={action}
      className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-7"
    >
      <ol className="flex items-center">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const active = n === step;
          const done = n < step;
          return (
            <li key={label} className="flex flex-1 items-center gap-2 last:flex-none">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : done
                      ? "bg-success text-white"
                      : "border border-border bg-background text-muted-foreground"
                }`}
              >
                {n}
              </span>
              <span
                className={`hidden text-xs font-medium sm:inline ${
                  active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
              {n < STEPS.length && <span className="mx-2 h-px flex-1 bg-border" />}
            </li>
          );
        })}
      </ol>

      <fieldset className={step === 1 ? "flex flex-col gap-4" : "hidden"}>
        <div>
          <label htmlFor="name" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Nombre completo
          </label>
          <input
            ref={nameRef}
            id="name"
            name="name"
            required
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label htmlFor="phone" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Teléfono
          </label>
          <input
            ref={phoneRef}
            id="phone"
            name="phone"
            required
            placeholder="11-1234-5678"
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Email (opcional)
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label htmlFor="planId" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Plan
          </label>
          <select
            ref={planRef}
            id="planId"
            name="planId"
            required
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Elegir plan...</option>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {formatCurrency(p.price)}
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      <fieldset className={step === 2 ? "flex flex-col gap-4" : "hidden"}>
        <p className="text-sm text-muted-foreground">
          Opcional, pero útil ante cualquier accidente durante el entrenamiento.
        </p>
        <div>
          <label htmlFor="emergencyName" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Nombre del contacto
          </label>
          <input
            id="emergencyName"
            name="emergencyName"
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label htmlFor="emergencyPhone" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Teléfono del contacto
          </label>
          <input
            id="emergencyPhone"
            name="emergencyPhone"
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div>
          <label htmlFor="emergencyNotes" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Notas (alergias, condiciones médicas)
          </label>
          <textarea
            id="emergencyNotes"
            name="emergencyNotes"
            rows={3}
            className="w-full resize-none rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </fieldset>

      <fieldset className={step === 3 ? "flex flex-col gap-4" : "hidden"}>
        <p className="text-sm text-muted-foreground">
          Opcional. Se muestra en la ficha del socio y en la credencial imprimible.
        </p>
        <label
          htmlFor="photo"
          className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border bg-background px-4 py-8 text-center transition-colors hover:border-primary"
        >
          <Upload className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {fileName || "Elegir una foto..."}
          </span>
          <input
            id="photo"
            name="photo"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
          />
        </label>
      </fieldset>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex justify-between">
        {step > 1 ? (
          <button
            type="button"
            onClick={goBack}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-background"
          >
            Atrás
          </button>
        ) : (
          <span />
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={goNext}
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
          >
            Siguiente
          </button>
        ) : (
          <button
            type="submit"
            className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
          >
            Crear socio
          </button>
        )}
      </div>
    </form>
  );
}
