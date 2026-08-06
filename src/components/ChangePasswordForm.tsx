"use client";

import { useActionState, useEffect } from "react";
import { changePassword, type ChangePasswordState } from "@/app/perfil/cambiar-password/actions";

const initialState: ChangePasswordState = {};

export default function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, initialState);

  useEffect(() => {
    if (state.success) {
      // Hard navigation on purpose: guarantees a clean reload with no
      // leftover client router cache after the session cookie was cleared.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = "/login";
    }
  }, [state.success]);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-7"
    >
      {state.error && (
        <p className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger">{state.error}</p>
      )}

      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
          Nueva contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div>
        <label htmlFor="confirm" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
          Confirmar contraseña
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          required
          minLength={8}
          className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90 active:scale-[0.97] disabled:opacity-60"
      >
        {pending ? "Guardando..." : "Guardar y continuar"}
      </button>
    </form>
  );
}
