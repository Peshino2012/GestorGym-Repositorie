"use client";

import { useActionState } from "react";
import { updateUser, type UserFormState } from "../../actions";

const initialState: UserFormState = {};

export default function EditUserForm({
  userId,
  name,
  email,
  phone,
  role,
  isSelf,
}: {
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: "OWNER" | "STAFF";
  isSelf: boolean;
}) {
  const updateUserWithId = updateUser.bind(null, userId);
  const [state, formAction, pending] = useActionState(updateUserWithId, initialState);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-7"
    >
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
          defaultValue={name}
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
          defaultValue={email}
          required
          className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div>
        <label htmlFor="phone" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
          Teléfono
        </label>
        <input
          id="phone"
          name="phone"
          defaultValue={phone}
          className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div>
        <label htmlFor="role" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
          Rol
        </label>
        <select
          id="role"
          name="role"
          defaultValue={role}
          disabled={isSelf}
          className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
        >
          <option value="STAFF">Staff</option>
          <option value="OWNER">Dueño</option>
        </select>
        {isSelf && (
          <p className="mt-1 text-xs text-muted-foreground">No podés cambiar tu propio rol.</p>
        )}
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
          Nueva contraseña (opcional)
        </label>
        <input
          id="password"
          name="password"
          type="password"
          minLength={6}
          placeholder="Dejar en blanco para no cambiarla"
          className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Si la completás, se le va a pedir que la cambie al iniciar sesión.
        </p>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90 active:scale-[0.97] disabled:opacity-60"
      >
        {pending ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
