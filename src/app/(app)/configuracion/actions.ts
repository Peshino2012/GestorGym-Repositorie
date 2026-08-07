"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { saveUploadedFile } from "@/lib/upload";
import { requireOwner } from "@/lib/authz";

export async function updateGymSettings(formData: FormData) {
  await requireOwner();

  const name = String(formData.get("name") ?? "").trim() || "Mi Gimnasio";
  const address = String(formData.get("address") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const logo = formData.get("logo");
  const checkinEnabled = formData.get("checkinEnabled") === "on";
  const classesEnabled = formData.get("classesEnabled") === "on";

  let logoUrl: string | undefined;
  if (logo instanceof File && logo.size > 0) {
    const saved = await saveUploadedFile(logo, "gym", "logo");
    if (saved) logoUrl = saved;
  }

  await db.gymSettings.upsert({
    where: { id: "main" },
    create: { id: "main", name, address, phone, email, logoUrl, checkinEnabled, classesEnabled },
    update: {
      name,
      address,
      phone,
      email,
      checkinEnabled,
      classesEnabled,
      ...(logoUrl ? { logoUrl } : {}),
    },
  });

  revalidatePath("/configuracion");
}
