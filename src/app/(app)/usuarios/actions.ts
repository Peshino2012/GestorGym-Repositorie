"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { requireOwner } from "@/lib/authz";

export type UserFormState = { error?: string };

function isUniqueEmailError(err: unknown) {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError &&
    err.code === "P2002" &&
    (err.meta?.target as string[] | undefined)?.includes("email")
  );
}

export async function createStaffUser(
  _prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  await requireOwner();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !email) {
    return { error: "Nombre y email son obligatorios" };
  }
  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres" };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    await db.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash,
        role: "STAFF",
        mustChangePassword: true,
      },
    });
  } catch (err) {
    if (isUniqueEmailError(err)) {
      return { error: "Ya existe un usuario con ese email." };
    }
    throw err;
  }

  revalidatePath("/usuarios");
  redirect(`/usuarios?created=${encodeURIComponent(email)}`);
}

export async function updateUser(
  id: string,
  _prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  const session = await requireOwner();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name || !email) {
    return { error: "Nombre y email son obligatorios" };
  }
  if (password && password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres" };
  }

  // Role can't be changed on your own account — a disabled <select> doesn't
  // submit a value at all, so trust the DB's current role for self-edits
  // rather than the form (which would otherwise silently default to STAFF).
  const isSelf = session.user?.id === id;
  const role = isSelf
    ? (await db.user.findUniqueOrThrow({ where: { id }, select: { role: true } })).role
    : (String(formData.get("role") ?? "STAFF") as "OWNER" | "STAFF");

  const passwordUpdate = password
    ? { passwordHash: await bcrypt.hash(password, 10), mustChangePassword: true }
    : {};

  try {
    await db.user.update({
      where: { id },
      data: { name, email, phone: phone || null, role, ...passwordUpdate },
    });
  } catch (err) {
    if (isUniqueEmailError(err)) {
      return { error: "Ya existe otro usuario con ese email." };
    }
    throw err;
  }

  revalidatePath("/usuarios");
  redirect("/usuarios");
}

export async function toggleUserActive(id: string, active: boolean) {
  const session = await requireOwner();
  if (session.user?.id === id) {
    throw new Error("No podés desactivar tu propia cuenta");
  }

  await db.user.update({ where: { id }, data: { active } });
  revalidatePath("/usuarios");
}

export async function deleteUser(id: string) {
  const session = await requireOwner();
  if (session.user?.id === id) {
    throw new Error("No podés eliminar tu propia cuenta");
  }

  await db.user.delete({ where: { id } });
  revalidatePath("/usuarios");
  redirect("/usuarios");
}
