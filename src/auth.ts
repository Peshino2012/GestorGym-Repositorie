import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { authConfig } from "@/auth.config";

// Unlimited login attempts against a real password is a straightforward
// brute-force target, more so here since onboarding temp passwords have
// been human-guessable patterns (a gym name + a year) rather than random.
// Keyed by email, not IP: the threat is guessing one specific account's
// password, which a distributed attacker could do from many IPs anyway —
// this stops that regardless of source. Returning the same `null` as a
// wrong password (rather than a distinct error) means a lockout is
// invisible to the caller, same as NextAuth already does for "no such
// user" vs "wrong password".
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60_000;
const failuresByEmail = new Map<string, { count: number; lockedUntil: number }>();

function isLockedOut(email: string): boolean {
  const state = failuresByEmail.get(email);
  return Boolean(state && state.lockedUntil > Date.now());
}

function recordFailure(email: string) {
  const state = failuresByEmail.get(email);
  const count = (state?.count ?? 0) + 1;
  failuresByEmail.set(email, {
    count,
    lockedUntil: count >= MAX_ATTEMPTS ? Date.now() + WINDOW_MS : 0,
  });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        if (isLockedOut(email)) return null;

        const user = await db.user.findUnique({ where: { email } });
        if (!user || !user.active) {
          recordFailure(email);
          return null;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          recordFailure(email);
          return null;
        }

        failuresByEmail.delete(email);
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          mustChangePassword: user.mustChangePassword,
        };
      },
    }),
  ],
});
