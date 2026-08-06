"use server";

import bcrypt from "bcryptjs";
import { auth, signOut } from "@/auth";
import { db } from "@/lib/db";

export type ChangePasswordState = { error?: string; success?: boolean };

export async function changePassword(
  _prevState: ChangePasswordState,
  formData: FormData
): Promise<ChangePasswordState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sesión inválida, volvé a iniciar sesión." };

  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres" };
  }
  if (password !== confirm) {
    return { error: "Las contraseñas no coinciden" };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.user.update({
    where: { id: session.user.id },
    data: { passwordHash, mustChangePassword: false },
  });

  // Clear the session cookie so the next login mints a fresh token with the
  // updated mustChangePassword flag. Manually deleting cookies here doesn't
  // work in production: NextAuth's session cookie is __Secure-prefixed over
  // HTTPS, and browsers silently reject a deletion Set-Cookie for a
  // __Secure- name unless it also carries the Secure attribute — so
  // NextAuth's own signOut (which sets that correctly) has to do this
  // instead of a manual cookies().delete() loop. The client does a hard
  // navigation to /login afterwards — a soft/RSC redirect from here kept
  // re-evaluating against the still-cached session and bouncing back here.
  await signOut({ redirect: false });

  return { success: true };
}
