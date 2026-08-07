import { auth, signOut } from "@/auth";
import AppShell from "@/components/AppShell";
import { getGymSettings } from "@/lib/gymSettings";

async function logoutAction() {
  "use server";
  await signOut({ redirectTo: "/login" });
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, gym] = await Promise.all([auth(), getGymSettings()]);
  const gymLabel = [gym.name, gym.address].filter(Boolean).join(" · ");

  return (
    <AppShell
      role={session?.user?.role}
      classesEnabled={gym.classesEnabled}
      horariosEnabled={gym.horariosEnabled}
      userName={session?.user?.name}
      gymLabel={gymLabel}
      logoutAction={logoutAction}
    >
      {children}
    </AppShell>
  );
}
