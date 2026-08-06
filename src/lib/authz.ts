import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function requireOwner() {
  const session = await auth();
  if (session?.user?.role !== "OWNER") {
    redirect("/dashboard");
  }
  return session;
}
