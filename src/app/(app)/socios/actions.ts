"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { addDays } from "date-fns";
import { db } from "@/lib/db";
import { saveUploadedFile } from "@/lib/upload";
import { requireOwner } from "@/lib/authz";
import type { MemberStatus } from "@/generated/prisma/client";

export async function registerCheckIn(memberId: string) {
  await db.checkIn.create({ data: { memberId } });
  revalidatePath(`/socios/${memberId}`);
  revalidatePath("/dashboard");
  revalidatePath("/riesgo");
}

export async function createMember(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const planId = String(formData.get("planId") ?? "");
  const emergencyName = String(formData.get("emergencyName") ?? "").trim();
  const emergencyPhone = String(formData.get("emergencyPhone") ?? "").trim();
  const emergencyNotes = String(formData.get("emergencyNotes") ?? "").trim();
  const photo = formData.get("photo");

  if (!name || !phone || !planId) {
    throw new Error("Nombre, teléfono y plan son obligatorios");
  }

  const plan = await db.plan.findUniqueOrThrow({ where: { id: planId } });

  const member = await db.member.create({
    data: {
      name,
      phone,
      email: email || null,
      planId,
      status: "ACTIVE",
      emergencyName: emergencyName || null,
      emergencyPhone: emergencyPhone || null,
      emergencyNotes: emergencyNotes || null,
    },
  });

  if (photo instanceof File && photo.size > 0) {
    const photoUrl = await saveUploadedFile(photo, "members", member.id);
    if (photoUrl) {
      await db.member.update({ where: { id: member.id }, data: { photoUrl } });
    }
  }

  await db.payment.create({
    data: {
      memberId: member.id,
      amount: plan.price,
      dueDate: addDays(new Date(), 30),
      status: "PENDING",
    },
  });

  redirect(`/socios/${member.id}`);
}

export async function updateMember(id: string, formData: FormData) {
  await requireOwner();

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const planId = String(formData.get("planId") ?? "");
  const status = String(formData.get("status") ?? "ACTIVE") as MemberStatus;
  const emergencyName = String(formData.get("emergencyName") ?? "").trim();
  const emergencyPhone = String(formData.get("emergencyPhone") ?? "").trim();
  const emergencyNotes = String(formData.get("emergencyNotes") ?? "").trim();
  const photo = formData.get("photo");

  if (!name || !phone || !planId) {
    throw new Error("Nombre, teléfono y plan son obligatorios");
  }

  const photoUrl =
    photo instanceof File && photo.size > 0
      ? await saveUploadedFile(photo, "members", id)
      : undefined;

  await db.member.update({
    where: { id },
    data: {
      name,
      phone,
      email: email || null,
      planId,
      status,
      emergencyName: emergencyName || null,
      emergencyPhone: emergencyPhone || null,
      emergencyNotes: emergencyNotes || null,
      ...(photoUrl ? { photoUrl } : {}),
    },
  });

  revalidatePath(`/socios/${id}`);
  revalidatePath("/socios");
  revalidatePath("/dashboard");
  revalidatePath("/riesgo");
  redirect(`/socios/${id}`);
}
