"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireOwner, requireClassesEnabled } from "@/lib/authz";
import { notifyPublicSite } from "@/lib/notifyPublicSite";

function parseClassCardForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const icon = String(formData.get("icon") ?? "dumbbell");
  const order = Number(formData.get("order") ?? 0);

  if (!title) throw new Error("El título es obligatorio");
  if (!description) throw new Error("La descripción es obligatoria");

  return { title, description, icon, order: Number.isFinite(order) ? order : 0 };
}

export async function createClassCard(formData: FormData) {
  await requireOwner();
  await requireClassesEnabled();
  const data = parseClassCardForm(formData);

  await db.classCard.create({ data });

  revalidatePath("/clases-web");
  await notifyPublicSite();
}

export async function updateClassCard(id: string, formData: FormData) {
  await requireOwner();
  await requireClassesEnabled();
  const data = parseClassCardForm(formData);

  await db.classCard.update({ where: { id }, data });

  revalidatePath("/clases-web");
  await notifyPublicSite();
  redirect("/clases-web");
}

export async function toggleClassCardActive(id: string, active: boolean) {
  await requireOwner();
  await requireClassesEnabled();
  await db.classCard.update({ where: { id }, data: { active } });
  revalidatePath("/clases-web");
  await notifyPublicSite();
}

export async function deleteClassCard(id: string) {
  await requireOwner();
  await requireClassesEnabled();
  await db.classCard.delete({ where: { id } });
  revalidatePath("/clases-web");
  await notifyPublicSite();
}
