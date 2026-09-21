import PasswordInput from "@/components/PasswordInput";

const ERROR_MESSAGES: Record<string, string> = {
  short: "La contraseña debe tener al menos 8 caracteres",
  mismatch: "Las contraseñas no coinciden",
};

// No session check here on purpose — the middleware (proxy.ts) already
// blocks anyone not logged in from ever reaching this route.
export default async function CambiarPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const errorMessage = error ? ERROR_MESSAGES[error] : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-bold">Cambiá tu contraseña</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Es tu primer ingreso — elegí una contraseña nueva para continuar.
          </p>
        </div>

        {/* Plain form POST to a route handler, not a Server Action — see
            /api/auth/change-password/route.ts for why. */}
        <form
          action="/api/auth/change-password"
          method="POST"
          className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-7"
        >
          {errorMessage && (
            <p className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger">{errorMessage}</p>
          )}

          <PasswordInput id="password" name="password" label="Nueva contraseña" required minLength={8} />
          <PasswordInput id="confirm" name="confirm" label="Confirmar contraseña" required minLength={8} />
          <button
            type="submit"
            className="mt-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
          >
            Guardar y continuar
          </button>
        </form>
      </div>
    </main>
  );
}
