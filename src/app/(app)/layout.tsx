import { auth, signOut } from "@/auth";
import AppShell from "@/components/AppShell";
import { db } from "@/lib/db";
import { getGymSettings } from "@/lib/gymSettings";
import { isPlanesModuleEnabled } from "@/lib/authz";

async function logoutAction() {
  "use server";
  await signOut({ redirectTo: "/login" });
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, gym, planesModuleEnabled] = await Promise.all([
    auth(),
    getGymSettings(),
    isPlanesModuleEnabled(),
  ]);
  const gymLabel = [gym.name, gym.address].filter(Boolean).join(" · ");

  let canAccessClasses = true;
  let canAccessHorarios = true;
  let canAccessPlanes = true;
  let canAccessCheckin = true;

  if (session?.user?.role === "STAFF" && session.user.id) {
    const permissions = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        canAccessClasses: true,
        canAccessHorarios: true,
        canAccessPlanes: true,
        canAccessCheckin: true,
      },
    });
    canAccessClasses = permissions?.canAccessClasses ?? true;
    canAccessHorarios = permissions?.canAccessHorarios ?? true;
    canAccessPlanes = permissions?.canAccessPlanes ?? true;
    canAccessCheckin = permissions?.canAccessCheckin ?? true;
  }

  return (
    <AppShell
      role={session?.user?.role}
      canAccessClasses={canAccessClasses}
      canAccessHorarios={canAccessHorarios}
      canAccessPlanes={canAccessPlanes}
      canAccessCheckin={canAccessCheckin}
      planesModuleEnabled={planesModuleEnabled}
      userName={session?.user?.name}
      gymLabel={gymLabel}
      logoutAction={logoutAction}
    >
      {children}
    </AppShell>
  );
}
