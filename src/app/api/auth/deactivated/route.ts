import { signOut } from "@/auth";

// A plain redirect("/login") is not enough here: the edge middleware
// (proxy.ts) only ever reads the JWT, never the DB, so a session that's
// merely redirected away — cookie still valid — gets bounced straight
// back into the app by authConfig's `authorized` callback (it still sees
// isLoggedIn === true), producing an infinite /dashboard <-> /login loop.
// This route actually clears the session cookie via signOut() before
// landing on /login, so the next request is genuinely logged out.
export async function GET() {
  return signOut({ redirectTo: "/login" });
}
