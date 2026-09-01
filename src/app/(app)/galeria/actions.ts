"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { saveUploadedFile } from "@/lib/upload";
import { requireOwner } from "@/lib/authz";
import { notifyPublicSite } from "@/lib/notifyPublicSite";

export async function createGalleryPhoto(formData: FormData) {
  await requireOwner();

  const caption = String(formData.get("caption") ?? "").trim();
  const photo = formData.get("photo");

  if (!(photo instanceof File) || photo.size === 0) {
    throw new Error("Elegí una foto para subir");
  }

  const id = randomUUID();
  const url = await saveUploadedFile(photo, "gallery", id);
  if (!url) throw new Error("No se pudo guardar la foto");

  await db.galleryPhoto.create({
    data: { id, url, caption: caption || null },
  });

  revalidatePath("/galeria");
  await notifyPublicSite();
}

export async function deleteGalleryPhoto(id: string) {
  await requireOwner();
  await db.galleryPhoto.delete({ where: { id } });
  revalidatePath("/galeria");
  await notifyPublicSite();
}
