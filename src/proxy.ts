import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  // /brand is static logo artwork, and icon.png is Next's own generated
  // favicon route — both public by nature (icon.png is what the browser
  // tab requests, brand/ is embedded on the login page, neither ever has
  // a session to check), so they need the same carve-out as favicon.ico.
  // Without this, an unauthenticated request for either got silently
  // redirected to /login instead of the image, and the browser fell back
  // to a generic icon.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|brand/|icon.png).*)"],
};
