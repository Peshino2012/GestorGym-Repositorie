"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordInput({
  id,
  name,
  label,
  required,
  minLength,
  autoComplete,
  placeholder,
  hint,
  disabled,
}: {
  id?: string;
  name: string;
  label: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  placeholder?: string;
  hint?: string;
  disabled?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-xs font-semibold text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={visible ? "text" : "password"}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 pr-10 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          tabIndex={-1}
          disabled={disabled}
          className="absolute right-0 top-0 flex h-full w-10 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
