import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getGymSettings } from "@/lib/gymSettings";

export async function requireOwner() {
  const session = await auth();
  if (session?.user?.role !== "OWNER") {
    redirect("/dashboard");
  }
  return session;
}

export async function requireClassesEnabled() {
  const gym = await getGymSettings();
  if (!gym.classesEnabled) {
    redirect("/dashboard");
  }
}

export async function requireHorariosEnabled() {
  const gym = await getGymSettings();
  if (!gym.horariosEnabled) {
    redirect("/dashboard");
  }
}

export async function requirePlanesEnabled() {
  const gym = await getGymSettings();
  if (!gym.planesEnabled) {
    redirect("/dashboard");
  }
}
