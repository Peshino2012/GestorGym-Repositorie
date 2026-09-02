"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { addDays } from "date-fns";
import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { saveUploadedFile } from "@/lib/upload";
import { requireOwner } from "@/lib/authz";
import type { MemberStatus } from "@/generated/prisma/client";

export type MemberFormState = { error?: string };

// `dni` is Member's only @unique field besides id, so any P2002 from a
// member create/update is this constraint — no need to inspect which field.
// (err.meta.target isn't reliable here: the driver-adapter Prisma client
// reports P2002 without a `target` at all, just {modelName, driverAdapterError}.)
function isUniqueDniError(err: unknown) {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

export async function registerCheckIn(memberId: string) {
  await db.checkIn.create({ data: { memberId } });
  revalidatePath(`/socios/${memberId}`);
  revalidatePath("/dashboard");
  revalidatePath("/riesgo");
}

export async function createMember(
  _prevState: MemberFormState,
  formData: FormData
): Promise<MemberFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const dni = String(formData.get("dni") ?? "").trim();
  const planId = String(formData.get("planId") ?? "");
  const emergencyName = String(formData.get("emergencyName") ?? "").trim();
  const emergencyPhone = String(formData.get("emergencyPhone") ?? "").trim();
  const emergencyNotes = String(formData.get("emergencyNotes") ?? "").trim();
  const photo = formData.get("photo");

  if (!name || !phone || !planId) {
    return { error: "Nombre, teléfono y plan son obligatorios" };
  }

  const plan = await db.plan.findUniqueOrThrow({ where: { id: planId } });

  let member;
  try {
    member = await db.member.create({
      data: {
        name,
        phone,
        email: email || null,
        dni: dni || null,
        planId,
        status: "ACTIVE",
        emergencyName: emergencyName || null,
        emergencyPhone: emergencyPhone || null,
        emergencyNotes: emergencyNotes || null,
      },
    });
  } catch (err) {
    if (isUniqueDniError(err)) {
      return { error: "Ya existe un socio con ese DNI." };
    }
    throw err;
  }

  if (photo instanceof File && photo.size > 0) {
    const photoUrl = await saveUploadedFile(photo, "members", member.id);
    if (photoUrl) {
      await db.member.update({ where: { id: member.id }, data: { photoUrl } });
    }
  }

  await db.payment.create({
    data: {
      memberId: member.id,
      planId: plan.id,
      amount: plan.price,
      dueDate: addDays(new Date(), 30),
      status: "PENDING",
    },
  });

  redirect(`/socios/${member.id}`);
}

export async function updateMember(
  id: string,
  _prevState: MemberFormState,
  formData: FormData
): Promise<MemberFormState> {
  await requireOwner();

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const dni = String(formData.get("dni") ?? "").trim();
  const planId = String(formData.get("planId") ?? "");
  const status = String(formData.get("status") ?? "ACTIVE") as MemberStatus;
  const emergencyName = String(formData.get("emergencyName") ?? "").trim();
  const emergencyPhone = String(formData.get("emergencyPhone") ?? "").trim();
  const emergencyNotes = String(formData.get("emergencyNotes") ?? "").trim();
  const photo = formData.get("photo");

  if (!name || !phone || !planId) {
    return { error: "Nombre, teléfono y plan son obligatorios" };
  }

  const photoUrl =
    photo instanceof File && photo.size > 0
      ? await saveUploadedFile(photo, "members", id)
      : undefined;

  try {
    await db.member.update({
      where: { id },
      data: {
        name,
        phone,
        email: email || null,
        dni: dni || null,
        planId,
        status,
        emergencyName: emergencyName || null,
        emergencyPhone: emergencyPhone || null,
        emergencyNotes: emergencyNotes || null,
        ...(photoUrl ? { photoUrl } : {}),
      },
    });
  } catch (err) {
    if (isUniqueDniError(err)) {
      return { error: "Ya existe otro socio con ese DNI." };
    }
    throw err;
  }

  revalidatePath(`/socios/${id}`);
  revalidatePath("/socios");
  revalidatePath("/dashboard");
  revalidatePath("/riesgo");
  redirect(`/socios/${id}`);
}

export async function archiveMember(id: string) {
  await requireOwner();
  await db.member.update({ where: { id }, data: { archivedAt: new Date() } });
  revalidatePath("/socios");
  revalidatePath("/socios/archivados");
}

export async function unarchiveMember(id: string) {
  await requireOwner();
  await db.member.update({ where: { id }, data: { archivedAt: null } });
  revalidatePath("/socios");
  revalidatePath("/socios/archivados");
}

export async function deleteMemberPermanently(id: string) {
  await requireOwner();

  const member = await db.member.findUniqueOrThrow({ where: { id } });
  if (!member.archivedAt) {
    throw new Error("Archivá al socio primero antes de eliminarlo definitivamente.");
  }

  await db.member.delete({ where: { id } });
  revalidatePath("/socios/archivados");
  redirect("/socios/archivados");
}
