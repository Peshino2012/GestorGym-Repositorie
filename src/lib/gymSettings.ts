import { db } from "@/lib/db";

export async function getGymSettings() {
  const settings = await db.gymSettings.findUnique({ where: { id: "main" } });
  return (
    settings ?? {
      id: "main",
      name: "Mi Gimnasio",
      address: null,
      phone: null,
      email: null,
      logoUrl: null,
      checkinEnabled: false,
      classesEnabled: false,
      horariosEnabled: false,
    }
  );
}
