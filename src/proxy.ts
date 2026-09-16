import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  // /brand is static logo artwork — public by nature (also embedded on the
  // login page, before anyone is authenticated), so it needs the same
  // carve-out as favicon.ico.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|brand/).*)"],
};
