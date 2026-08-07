"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/authz";

function parseBlockForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const hoursLabel = String(formData.get("hoursLabel") ?? "").trim();
  const icon = String(formData.get("icon") ?? "sun");
  const order = Number(formData.get("order") ?? 0);

  if (!title) throw new Error("El título es obligatorio");
  if (!hoursLabel) throw new Error("La franja horaria es obligatoria");

  return { title, hoursLabel, icon, order: Number.isFinite(order) ? order : 0 };
}

export async function createBlock(formData: FormData) {
  await requireOwner();
  const data = parseBlockForm(formData);

  await db.scheduleBlock.create({ data });

  revalidatePath("/horarios");
  revalidatePath("/");
}

export async function updateBlock(id: string, formData: FormData) {
  await requireOwner();
  const data = parseBlockForm(formData);

  await db.scheduleBlock.update({ where: { id }, data });

  revalidatePath("/horarios");
  revalidatePath("/");
  redirect("/horarios");
}

export async function deleteBlock(id: string) {
  await requireOwner();
  await db.scheduleBlock.delete({ where: { id } });
  revalidatePath("/horarios");
  revalidatePath("/");
}

function parseEntryForm(formData: FormData) {
  const time = String(formData.get("time") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const order = Number(formData.get("order") ?? 0);

  if (!time) throw new Error("El horario es obligatorio");
  if (!name) throw new Error("El nombre de la clase es obligatorio");

  return { time, name, order: Number.isFinite(order) ? order : 0 };
}

export async function createEntry(blockId: string, formData: FormData) {
  await requireOwner();
  const data = parseEntryForm(formData);

  await db.scheduleEntry.create({ data: { ...data, blockId } });

  revalidatePath("/horarios");
  revalidatePath(`/horarios/${blockId}/editar`);
  revalidatePath("/");
}

export async function updateEntry(id: string, blockId: string, formData: FormData) {
  await requireOwner();
  const data = parseEntryForm(formData);

  await db.scheduleEntry.update({ where: { id }, data });

  revalidatePath("/horarios");
  revalidatePath(`/horarios/${blockId}/editar`);
  revalidatePath("/");
}

export async function deleteEntry(id: string, blockId: string) {
  await requireOwner();
  await db.scheduleEntry.delete({ where: { id } });
  revalidatePath("/horarios");
  revalidatePath(`/horarios/${blockId}/editar`);
  revalidatePath("/");
}
