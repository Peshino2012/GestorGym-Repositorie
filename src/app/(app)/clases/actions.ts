"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function createClass(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const instructor = String(formData.get("instructor") ?? "").trim();
  const dayOfWeek = Number(formData.get("dayOfWeek"));
  const startTime = String(formData.get("startTime") ?? "");
  const durationMin = Number(formData.get("durationMin"));
  const capacity = Number(formData.get("capacity"));

  if (!name || !instructor || !startTime || !capacity) {
    throw new Error("Completá todos los campos");
  }

  await db.gymClass.create({
    data: { name, instructor, dayOfWeek, startTime, durationMin, capacity },
  });

  revalidatePath("/clases");
  redirect("/clases");
}

export async function bookMember(classId: string, formData: FormData) {
  const memberId = String(formData.get("memberId") ?? "");
  if (!memberId) throw new Error("Elegí un socio");

  const cls = await db.gymClass.findUniqueOrThrow({
    where: { id: classId },
    include: { bookings: { where: { status: "BOOKED" } } },
  });

  const existing = await db.booking.findUnique({
    where: { classId_memberId: { classId, memberId } },
  });
  if (existing && existing.status !== "CANCELLED") {
    throw new Error("Ese socio ya está anotado en esta clase");
  }

  const status = cls.bookings.length < cls.capacity ? "BOOKED" : "WAITLIST";

  if (existing) {
    await db.booking.update({ where: { id: existing.id }, data: { status } });
  } else {
    await db.booking.create({ data: { classId, memberId, status } });
  }

  revalidatePath(`/clases/${classId}`);
  revalidatePath("/clases");
  revalidatePath("/dashboard");
}

export async function cancelBooking(bookingId: string) {
  const booking = await db.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });

  const nextWaitlisted = await db.booking.findFirst({
    where: { classId: booking.classId, status: "WAITLIST" },
    orderBy: { createdAt: "asc" },
  });

  if (nextWaitlisted) {
    await db.booking.update({
      where: { id: nextWaitlisted.id },
      data: { status: "BOOKED" },
    });
  }

  revalidatePath(`/clases/${booking.classId}`);
  revalidatePath("/clases");
  revalidatePath("/dashboard");
}
