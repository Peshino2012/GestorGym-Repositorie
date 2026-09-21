"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { saveUploadedFile } from "@/lib/upload";
import { requireOwner } from "@/lib/authz";
import { notifyPublicSite } from "@/lib/notifyPublicSite";

export async function updateGymSettings(formData: FormData) {
  await requireOwner();

  const name = String(formData.get("name") ?? "").trim() || "Mi Gimnasio";
  const address = String(formData.get("address") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const publicSiteUrl = String(formData.get("publicSiteUrl") ?? "").trim();
  const logo = formData.get("logo");
  const checkinEnabled = formData.get("checkinEnabled") === "on";

  let logoUrl: string | undefined;
  if (logo instanceof File && logo.size > 0) {
    const saved = await saveUploadedFile(logo, "gym", "logo");
    if (saved) logoUrl = saved;
  }

  await db.gymSettings.upsert({
    where: { id: "main" },
    create: {
      id: "main",
      name,
      address,
      phone,
      email,
      publicSiteUrl: publicSiteUrl || null,
      logoUrl,
      checkinEnabled,
    },
    update: {
      name,
      address,
      phone,
      email,
      publicSiteUrl: publicSiteUrl || null,
      checkinEnabled,
      ...(logoUrl ? { logoUrl } : {}),
    },
  });

  revalidatePath("/configuracion");
  await notifyPublicSite();
}

// Fields start blank in the form (see page.tsx) rather than pre-filled with
// the saved value — a settings page re-serving a plaintext secret to the
// browser on every visit is its own small leak. So blank on submit means
// "didn't touch it", not "clear it"; disconnectMercadoPago below is the
// explicit way to actually remove a credential.
export async function updateMercadoPagoSettings(formData: FormData) {
  await requireOwner();

  const accessToken = String(formData.get("mercadoPagoAccessToken") ?? "").trim();
  const webhookSecret = String(formData.get("mercadoPagoWebhookSecret") ?? "").trim();

  if (!accessToken && !webhookSecret) {
    return;
  }

  await db.gymSettings.upsert({
    where: { id: "main" },
    create: {
      id: "main",
      mercadoPagoAccessToken: accessToken || null,
      mercadoPagoWebhookSecret: webhookSecret || null,
    },
    update: {
      ...(accessToken ? { mercadoPagoAccessToken: accessToken } : {}),
      ...(webhookSecret ? { mercadoPagoWebhookSecret: webhookSecret } : {}),
    },
  });

  revalidatePath("/configuracion");
}

export async function disconnectMercadoPago() {
  await requireOwner();

  await db.gymSettings.update({
    where: { id: "main" },
    data: { mercadoPagoAccessToken: null, mercadoPagoWebhookSecret: null },
  });

  revalidatePath("/configuracion");
}
