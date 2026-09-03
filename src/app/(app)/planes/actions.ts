"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requirePlanesEnabled, requirePlanesModulePaid, requireCanCreatePlan } from "@/lib/authz";
import { notifyPublicSite } from "@/lib/notifyPublicSite";
import type { BillingCycle } from "@/generated/prisma/client";

function parsePlanForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const price = Number(formData.get("price"));
  const billingCycle = String(formData.get("billingCycle") ?? "MONTHLY") as BillingCycle;
  const features = String(formData.get("features") ?? "").trim();

  if (!name) throw new Error("El nombre es obligatorio");
  if (!Number.isFinite(price) || price < 0) throw new Error("El precio no es válido");

  return { name, price: Math.round(price), billingCycle, features: features || null };
}

export async function createPlan(formData: FormData) {
  await requireCanCreatePlan();
  const data = parsePlanForm(formData);

  await db.plan.create({ data });

  revalidatePath("/planes");
  await notifyPublicSite();
  redirect("/planes");
}

export async function updatePlan(id: string, formData: FormData) {
  await requirePlanesEnabled();
  const data = parsePlanForm(formData);

  await db.plan.update({ where: { id }, data });

  revalidatePath("/planes");
  await notifyPublicSite();
  redirect("/planes");
}

export async function togglePlanActive(id: string, active: boolean) {
  await requirePlanesModulePaid();
  await db.plan.update({ where: { id }, data: { active } });
  revalidatePath("/planes");
  await notifyPublicSite();
}

export async function setFeaturedPlan(id: string) {
  await requirePlanesModulePaid();
  await db.$transaction([
    db.plan.updateMany({ data: { featured: false }, where: { featured: true } }),
    db.plan.update({ where: { id }, data: { featured: true } }),
  ]);
  revalidatePath("/planes");
  await notifyPublicSite();
}

export async function deletePlan(id: string) {
  await requirePlanesModulePaid();

  const membersCount = await db.member.count({ where: { planId: id } });
  if (membersCount > 0) {
    throw new Error(
      "No se puede eliminar: hay socios con este plan. Desactivalo en cambio."
    );
  }

  await db.plan.delete({ where: { id } });
  revalidatePath("/planes");
  await notifyPublicSite();
}
