import bcrypt from "bcryptjs";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

const BILLING_CYCLES = ["MONTHLY", "QUARTERLY", "ANNUAL"] as const;

// One-time setup for a real, newly-created gym — unlike seed.ts (dev demo
// data, wipes and refills every table), this never deletes anything and
// creates nothing but the gym's own settings row, its first owner, and one
// base Plan. Multi-plan management (the Planes module) is a paid upsell
// gated separately by PLANES_MODULE_ENABLED (see src/lib/authz.ts) — every
// gym still needs at least this one Plan to be able to register socios at
// all, whether or not they've paid for that module.
async function main() {
  const gymName = process.env.ONBOARD_GYM_NAME;
  const gymAddress = process.env.ONBOARD_GYM_ADDRESS || null;
  const ownerName = process.env.ONBOARD_OWNER_NAME;
  const ownerEmail = process.env.ONBOARD_OWNER_EMAIL;
  const ownerPassword = process.env.ONBOARD_OWNER_PASSWORD;
  const planName = process.env.ONBOARD_PLAN_NAME || "Cuota mensual";
  const planPrice = Number(process.env.ONBOARD_PLAN_PRICE);
  const planBillingCycle = (process.env.ONBOARD_PLAN_BILLING_CYCLE || "MONTHLY") as
    (typeof BILLING_CYCLES)[number];

  const missing = [
    !gymName && "ONBOARD_GYM_NAME",
    !ownerName && "ONBOARD_OWNER_NAME",
    !ownerEmail && "ONBOARD_OWNER_EMAIL",
    !ownerPassword && "ONBOARD_OWNER_PASSWORD",
    !process.env.ONBOARD_PLAN_PRICE && "ONBOARD_PLAN_PRICE",
  ].filter(Boolean);
  if (missing.length > 0) {
    throw new Error(`Faltan variables de entorno: ${missing.join(", ")}`);
  }
  if (ownerPassword!.length < 6) {
    throw new Error("ONBOARD_OWNER_PASSWORD debe tener al menos 6 caracteres");
  }
  if (!Number.isFinite(planPrice) || planPrice <= 0) {
    throw new Error("ONBOARD_PLAN_PRICE debe ser un número mayor a 0");
  }
  if (!BILLING_CYCLES.includes(planBillingCycle)) {
    throw new Error(`ONBOARD_PLAN_BILLING_CYCLE debe ser uno de: ${BILLING_CYCLES.join(", ")}`);
  }

  const existing = await db.gymSettings.findUnique({ where: { id: "main" } });
  if (existing) {
    throw new Error(
      `Esta base ya tiene un gimnasio configurado ("${existing.name}") — este script es solo para el alta inicial.`
    );
  }

  console.log(`Creando gimnasio "${gymName}"...`);
  await db.gymSettings.create({
    data: { id: "main", name: gymName!, address: gymAddress },
  });

  console.log(`Creando usuario dueño (${ownerEmail})...`);
  const passwordHash = await bcrypt.hash(ownerPassword!, 10);
  await db.user.create({
    data: {
      name: ownerName!,
      email: ownerEmail!.toLowerCase(),
      passwordHash,
      role: "OWNER",
      mustChangePassword: true,
    },
  });

  console.log(`Creando plan base "${planName}" ($${planPrice})...`);
  await db.plan.create({
    data: {
      name: planName,
      price: Math.round(planPrice),
      billingCycle: planBillingCycle,
    },
  });

  console.log("Listo. El dueño va a tener que elegir una contraseña nueva en el primer login.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
