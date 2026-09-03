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

// The /planes page itself is always reachable by anyone with the Planes
// permission — every gym has at least one base Plan (created at onboarding)
// that they need to be able to see and edit regardless of what they've
// paid for. What's gated is having MORE than that one plan (see
// requirePlanesModulePaid below) — the page renders a simple one-plan
// editor instead of full multi-plan management when that's off.
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

// Multi-plan management is a paid upsell, not something a gym self-serves —
// gated by an env var only we set (per Vercel project), so it's out of
// reach of the gym's own Configuración. Used only by the actions that only
// make sense with more than one plan (create/delete/feature/toggle) —
// editing the existing plan(s) stays available either way.
export async function isPlanesModuleEnabled() {
  return process.env.PLANES_MODULE_ENABLED === "true";
}

export async function requirePlanesModulePaid() {
  await requirePlanesEnabled();
  if (!(await isPlanesModuleEnabled())) {
    redirect("/planes");
  }
}

// createPlan is the one exception: a gym with zero plans can't function at
// all (socios need one to be created), so the very first plan is free even
// on an unpaid gym — this is what onboarding creates automatically, but a
// gym that somehow has none yet still needs a way to make one. Only a
// SECOND plan requires the paid module.
export async function requireCanCreatePlan() {
  await requirePlanesEnabled();
  if (await isPlanesModuleEnabled()) return;
  const planCount = await db.plan.count();
  if (planCount > 0) {
    redirect("/planes");
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
