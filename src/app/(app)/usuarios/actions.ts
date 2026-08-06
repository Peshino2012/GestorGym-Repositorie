"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/authz";
import { DEFAULT_STAFF_PASSWORD } from "@/lib/constants";

export async function createStaffUser(formData: FormData) {
  await requireOwner();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!name || !email) {
    throw new Error("Nombre y email son obligatorios");
  }

  const passwordHash = await bcrypt.hash(DEFAULT_STAFF_PASSWORD, 10);

  await db.user.create({
    data: { name, email, passwordHash, role: "STAFF", mustChangePassword: true },
  });

  revalidatePath("/usuarios");
  redirect(`/usuarios?created=${encodeURIComponent(email)}`);
}
