import type { NextAuthConfig } from "next-auth";

const CHANGE_PASSWORD_PATH = "/perfil/cambiar-password";

// Physical, unattended screen (no login) — a member types their DNI to
// register attendance. Meant to run on a tablet fixed at the gym entrance.
const PUBLIC_PATH_PREFIX = "/registro";

const SESSION_TIMEOUT_SECONDS = 10 * 60;

export const authConfig = {
  pages: { signIn: "/login" },
  session: {
    strategy: "jwt",
    // Inactivity timeout, not a fixed session length: updateAge: 0 makes
    // every authenticated request (any page load, any Server Action —
    // middleware sees both) re-stamp the session's expiry to now + maxAge.
    // A session only actually expires once 10 minutes pass with zero
    // requests; someone actively using the app never hits it.
    maxAge: SESSION_TIMEOUT_SECONDS,
    updateAge: 0,
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const pathname = request.nextUrl.pathname;
      const isLoginPage = pathname === "/login";
      const isChangePasswordPage = pathname === CHANGE_PASSWORD_PATH;
      const isPublicPage = pathname === PUBLIC_PATH_PREFIX || pathname.startsWith(`${PUBLIC_PATH_PREFIX}/`);

      if (isPublicPage) return true;

      if (isLoginPage) {
        if (isLoggedIn) {
          const target = auth.user.mustChangePassword ? CHANGE_PASSWORD_PATH : "/dashboard";
          return Response.redirect(new URL(target, request.nextUrl));
        }
        return true;
      }

      if (!isLoggedIn) return false;

      if (auth.user.mustChangePassword && !isChangePasswordPage) {
        return Response.redirect(new URL(CHANGE_PASSWORD_PATH, request.nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.mustChangePassword = user.mustChangePassword;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role;
        session.user.mustChangePassword = token.mustChangePassword;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
