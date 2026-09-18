import { signOut } from "@/auth";

// Clearing the session here (a plain route, not a Server Action) after
// changePassword succeeds — see cambiar-password/actions.ts for why this
// can't happen inside that action itself: signOut() there corrupts the
// action's own response, because React re-renders the invoking page to
// report the action's result back, and that page's session is gone by
// then. A normal request/response has no such conflict.
export async function GET() {
  return signOut({ redirectTo: "/login" });
}
