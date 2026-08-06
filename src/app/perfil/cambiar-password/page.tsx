import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ChangePasswordForm from "@/components/ChangePasswordForm";

export default async function CambiarPasswordPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

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
