"use client";

import { useActionState } from "react";
import { createStaffUser, type UserFormState } from "./actions";

const initialState: UserFormState = {};

export default function NewUserForm() {
  const [state, formAction, pending] = useActionState(createStaffUser, initialState);

  return (
    <form action={formAction} className="mt-4 flex flex-col gap-3">
      {state.error && (
        <p className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger">{state.error}</p>
      )}
      <div>
        <label htmlFor="name" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
          Nombre
        </label>
        <input
          id="name"
          name="name"
          required
          className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div>
        <label htmlFor="phone" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
          Teléfono (opcional)
        </label>
        <input
          id="phone"
          name="phone"
          className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
          Contraseña inicial
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <p className="mt-1 text-xs text-muted-foreground">Mínimo 6 caracteres.</p>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90 active:scale-[0.97] disabled:opacity-60"
      >
        {pending ? "Creando..." : "Crear usuario"}
      </button>
    </form>
  );
}
