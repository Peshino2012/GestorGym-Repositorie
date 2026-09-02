import { auth, signOut } from "@/auth";
import AppShell from "@/components/AppShell";
import { db } from "@/lib/db";
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

  let canAccessClasses = true;
  let canAccessHorarios = true;
  let canAccessPlanes = true;

  if (session?.user?.role === "STAFF" && session.user.id) {
    const permissions = await db.user.findUnique({
      where: { id: session.user.id },
      select: { canAccessClasses: true, canAccessHorarios: true, canAccessPlanes: true },
    });
    canAccessClasses = permissions?.canAccessClasses ?? true;
    canAccessHorarios = permissions?.canAccessHorarios ?? true;
    canAccessPlanes = permissions?.canAccessPlanes ?? true;
  }

  return (
    <AppShell
      role={session?.user?.role}
      classesEnabled={gym.classesEnabled}
      horariosEnabled={gym.horariosEnabled}
      planesEnabled={gym.planesEnabled}
      canAccessClasses={canAccessClasses}
      canAccessHorarios={canAccessHorarios}
      canAccessPlanes={canAccessPlanes}
      userName={session?.user?.name}
      gymLabel={gymLabel}
      logoutAction={logoutAction}
    >
      {children}
    </AppShell>
  );
}
