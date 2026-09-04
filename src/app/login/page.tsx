import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { Zap } from "lucide-react";
import { signIn } from "@/auth";

async function loginAction(formData: FormData) {
  "use server";

  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect("/login?error=1");
    }
    throw error;
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-1.5 text-xl font-bold tracking-tight">
            <Zap className="h-5 w-5 fill-primary text-primary" strokeWidth={0} />
            Cauccen <span className="font-normal text-muted-foreground">gestor</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Panel de administración para tu gimnasio
          </p>
        </div>

        <form
          action={loginAction}
          className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-7 shadow-sm"
        >
          {error && (
            <p className="rounded-lg bg-danger-bg px-3 py-2 text-sm text-danger">
              Email o contraseña incorrectos.
            </p>
          )}

          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="username"
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <button
            type="submit"
            className="mt-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
          >
            Ingresar
          </button>
        </form>
      </div>
    </main>
  );
}
