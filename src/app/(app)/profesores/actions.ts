"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { saveUploadedFile } from "@/lib/upload";
import { requireOwner } from "@/lib/authz";

export async function createTrainer(formData: FormData) {
  await requireOwner();

  const name = String(formData.get("name") ?? "").trim();
  const specialty = String(formData.get("specialty") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const photo = formData.get("photo");

  if (!name) throw new Error("El nombre es obligatorio");

  const trainer = await db.trainer.create({
    data: { name, specialty: specialty || null, bio: bio || null },
  });

  if (photo instanceof File && photo.size > 0) {
    const photoUrl = await saveUploadedFile(photo, "trainers", trainer.id);
    if (photoUrl) {
      await db.trainer.update({ where: { id: trainer.id }, data: { photoUrl } });
    }
  }

  revalidatePath("/profesores");
  redirect("/profesores");
}

export async function updateTrainer(id: string, formData: FormData) {
  await requireOwner();

  const name = String(formData.get("name") ?? "").trim();
  const specialty = String(formData.get("specialty") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const photo = formData.get("photo");

  if (!name) throw new Error("El nombre es obligatorio");

  const photoUrl =
    photo instanceof File && photo.size > 0
      ? await saveUploadedFile(photo, "trainers", id)
      : undefined;

  await db.trainer.update({
    where: { id },
    data: {
      name,
      specialty: specialty || null,
      bio: bio || null,
      ...(photoUrl ? { photoUrl } : {}),
    },
  });

  revalidatePath("/profesores");
  redirect("/profesores");
}

export async function toggleTrainerActive(id: string, active: boolean) {
  await requireOwner();
  await db.trainer.update({ where: { id }, data: { active } });
  revalidatePath("/profesores");
}

export async function deleteTrainer(id: string) {
  await requireOwner();
  await db.trainer.delete({ where: { id } });
  revalidatePath("/profesores");
}
