import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import AppShell from "@/components/AppShell";
import { db } from "@/lib/db";
import { getGymSettings } from "@/lib/gymSettings";
import { isPlanesModuleEnabled, isClasesModuleEnabled, isHorariosModuleEnabled } from "@/lib/authz";

async function logoutAction() {
  "use server";
  await signOut({ redirectTo: "/login" });
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, gym, planesModuleEnabled, classesModuleEnabled, horariosModuleEnabled] = await Promise.all([
    auth(),
    getGymSettings(),
    isPlanesModuleEnabled(),
    isClasesModuleEnabled(),
    isHorariosModuleEnabled(),
  ]);
  const gymLabel = [gym.name, gym.address].filter(Boolean).join(" · ");

  let canAccessClasses = true;
  let canAccessHorarios = true;
  let canAccessPlanes = true;
  let canAccessCheckin = true;

  // Re-checks `active` against the DB on every page view instead of
  // trusting the JWT's copy — the token is only refreshed at login, so
  // without this, deactivating a user had no effect on an already-open
  // session until it expired from 10 minutes of inactivity.
  if (session?.user?.id) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        active: true,
        canAccessClasses: true,
        canAccessHorarios: true,
        canAccessPlanes: true,
        canAccessCheckin: true,
      },
    });
    if (!user?.active) {
      redirect("/api/auth/deactivated");
    }
    if (session.user.role === "STAFF") {
      canAccessClasses = user.canAccessClasses;
      canAccessHorarios = user.canAccessHorarios;
      canAccessPlanes = user.canAccessPlanes;
      canAccessCheckin = user.canAccessCheckin;
    }
  }

  return (
    <AppShell
      role={session?.user?.role}
      canAccessClasses={canAccessClasses}
      canAccessHorarios={canAccessHorarios}
      canAccessPlanes={canAccessPlanes}
      canAccessCheckin={canAccessCheckin}
      planesModuleEnabled={planesModuleEnabled}
      classesModuleEnabled={classesModuleEnabled}
      horariosModuleEnabled={horariosModuleEnabled}
      userName={session?.user?.name}
      gymLabel={gymLabel}
      gymName={gym.name}
      gymLogoUrl={gym.logoUrl}
      publicSiteUrl={gym.publicSiteUrl}
      logoutAction={logoutAction}
    >
      {children}
    </AppShell>
  );
}
