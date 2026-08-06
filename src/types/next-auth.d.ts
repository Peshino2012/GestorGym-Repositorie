import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role?: "OWNER" | "STAFF";
      mustChangePassword?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role?: "OWNER" | "STAFF";
    mustChangePassword?: boolean;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: "OWNER" | "STAFF";
    mustChangePassword?: boolean;
  }
}
