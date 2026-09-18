import ChangePasswordForm from "@/components/ChangePasswordForm";

// No session check here on purpose — the middleware (proxy.ts) already
// blocks anyone not logged in from ever reaching this route. Redirecting
// here too used to conflict with the changePassword action: that action's
// own signOut() clears the session mid-request, and Server Actions
// re-render their invoking page to report the result back to the client —
// so this page briefly re-rendered with no session, hit this same
// redirect, and produced a broken response instead of the actual result.
export default async function CambiarPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-bold">Cambiá tu contraseña</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Es tu primer ingreso — elegí una contraseña nueva para continuar.
          </p>
        </div>

        <ChangePasswordForm />
      </div>
    </main>
  );
}
