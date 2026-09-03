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

// Gates "/plan" (the always-free single-plan editor, see
// src/app/(app)/plan/) — its own permission, fully independent of Planes
// (canAccessPlanes below). A gym's one base plan has nothing to do with
// the paid multi-plan module, so access to it is a separate toggle in
// Configuración, not a side effect of the Planes checkbox.
export async function requirePlanAccess() {
  const session = await auth();
  if (session?.user?.role === "OWNER") return;
  if (!session?.user?.id) redirect("/dashboard");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { canAccessPlan: true },
  });
  if (!user?.canAccessPlan) {
    redirect("/dashboard");
  }
}

// Gates "/planes" (the full multi-plan management page) — per-user
// permission only, same shape as Clases/Horarios. Independent of
// canAccessPlan above.
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

// updatePlan/createPlan are shared by both "/plan" and "/planes" (same
// underlying edit-a-plan-row logic either way), so they're reachable with
// EITHER permission — whichever page you got there from.
export async function requirePlanOrPlanesAccess() {
  const session = await auth();
  if (session?.user?.role === "OWNER") return;
  if (!session?.user?.id) redirect("/dashboard");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { canAccessPlan: true, canAccessPlanes: true },
  });
  if (!user?.canAccessPlan && !user?.canAccessPlanes) {
    redirect("/dashboard");
  }
}

// Multi-plan management is a paid upsell, not something a gym self-serves —
// gated by an env var only we set (per Vercel project), so it's out of
// reach of the gym's own Configuración.
export async function isPlanesModuleEnabled() {
  return process.env.PLANES_MODULE_ENABLED === "true";
}

// Gates "/planes" itself (the full multi-plan management page — a
// completely separate route from "/plan") and the actions that only make
// sense with more than one plan (create a 2nd+, delete, feature, toggle).
// `redirectTo` differs by caller: the page guard sends an unpaid gym to
// "/plan" (their free equivalent) to avoid redirecting back into itself;
// actions default to "/planes" since that's where their form already is.
export async function requirePlanesModulePaid(redirectTo: string = "/planes") {
  await requirePlanesEnabled();
  if (!(await isPlanesModuleEnabled())) {
    redirect(redirectTo);
  }
}

// createPlan is the one exception: a gym with zero plans can't function at
// all (socios need one to be created), so the very first plan is free even
// on an unpaid gym — this is what onboarding creates automatically, but a
// gym that somehow has none yet still needs a way to make one via "/plan".
// Only a SECOND plan (via "/planes") requires the paid module.
export async function requireCanCreatePlan() {
  await requirePlanOrPlanesAccess();
  if (await isPlanesModuleEnabled()) return;
  const planCount = await db.plan.count();
  if (planCount > 0) {
    redirect("/plan");
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
