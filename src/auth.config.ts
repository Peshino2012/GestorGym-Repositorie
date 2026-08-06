import type { NextAuthConfig } from "next-auth";

const CHANGE_PASSWORD_PATH = "/perfil/cambiar-password";

export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const pathname = request.nextUrl.pathname;
      const isLoginPage = pathname === "/login";
      const isChangePasswordPage = pathname === CHANGE_PASSWORD_PATH;

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
