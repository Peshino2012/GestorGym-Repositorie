import bcrypt from "bcryptjs";
import { auth, signOut } from "@/auth";
import { db } from "@/lib/db";

const PAGE_PATH = "/perfil/cambiar-password";

// A plain form POST, not a Server Action: Server Actions are addressed by a
// content-hashed id baked into the client JS bundle, so a browser holding a
// stale bundle from before a deploy calls an id the new server no longer
// recognizes and gets a broken response — a hard refresh doesn't reliably
// fix this if anything (a service worker, an intermediate cache) is still
// serving that stale bundle. A form posting to a fixed URL path has no such
// binding: whatever code is live on the server handles it, always.
// Scoped to the forced first-login flow only (session.user.mustChangePassword
// is set at login and only ever cleared by this same handler, right before
// it signs the session out) — otherwise anyone holding a valid session
// cookie (XSS, a shared front-desk computer left logged in, a stolen
// device) could silently take over an already-onboarded account by POSTing
// here directly, with no need to know the current password.
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.redirect(new URL("/login", request.url));
  }
  if (!session.user.mustChangePassword) {
    return Response.redirect(new URL("/dashboard", request.url));
  }

  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) {
    const url = new URL(PAGE_PATH, request.url);
    url.searchParams.set("error", "short");
    return Response.redirect(url);
  }
  if (password !== confirm) {
    const url = new URL(PAGE_PATH, request.url);
    url.searchParams.set("error", "mismatch");
    return Response.redirect(url);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.user.update({
    where: { id: session.user.id },
    data: { passwordHash, mustChangePassword: false },
  });

  return signOut({ redirectTo: "/login" });
}
