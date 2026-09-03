import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";

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

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { canAccessPlanes: true },
  });
  if (!user?.canAccessPlanes) {
    redirect("/dashboard");
  }
}

export async function requireCheckinAccess() {
  const session = await auth();
  if (session?.user?.role === "OWNER") return;
  if (!session?.user?.id) redirect("/dashboard");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { canAccessCheckin: true },
  });
  if (!user?.canAccessCheckin) {
    redirect("/dashboard");
  }
}
