import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getGymSettings } from "@/lib/gymSettings";

export async function requireOwner() {
  const session = await auth();
  if (session?.user?.role !== "OWNER") {
    redirect("/dashboard");
  }
  return session;
}

export async function requireClassesEnabled() {
  const session = await auth();
  if (session?.user?.role === "OWNER") return;
  if (!session?.user?.id) redirect("/dashboard");

  const gym = await getGymSettings();
  if (!gym.classesEnabled) {
    redirect("/dashboard");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { canAccessClasses: true },
  });
  if (!user?.canAccessClasses) {
    redirect("/dashboard");
  }
}

export async function requireHorariosEnabled() {
  const session = await auth();
  if (session?.user?.role === "OWNER") return;
  if (!session?.user?.id) redirect("/dashboard");

  const gym = await getGymSettings();
  if (!gym.horariosEnabled) {
    redirect("/dashboard");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { canAccessHorarios: true },
  });
  if (!user?.canAccessHorarios) {
    redirect("/dashboard");
  }
}

export async function requirePlanesEnabled() {
  const session = await auth();
  if (session?.user?.role === "OWNER") return;
  if (!session?.user?.id) redirect("/dashboard");

  const gym = await getGymSettings();
  if (!gym.planesEnabled) {
    redirect("/dashboard");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { canAccessPlanes: true },
  });
  if (!user?.canAccessPlanes) {
    redirect("/dashboard");
  }
}
