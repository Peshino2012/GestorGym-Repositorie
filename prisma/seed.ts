import bcrypt from "bcryptjs";
import { subDays, subWeeks, addDays } from "date-fns";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: (process.env.DATABASE_URL ?? "file:./dev.db").replace(/^file:/, ""),
});
const db = new PrismaClient({ adapter });

const FIRST_NAMES = [
  "Fernanda", "Diego", "Rocío", "Nico", "Vale", "Tomi", "Cami", "Lucas",
  "Sofía", "Martín", "Agustina", "Facundo", "Julieta", "Ezequiel", "Milagros",
  "Franco", "Camila", "Ignacio", "Valentina", "Bruno",
];
const LAST_NAMES = [
  "Ferreyra", "Suárez", "Aguirre", "Rojas", "Gómez", "Pereyra", "Torres",
  "Domínguez", "Ibarra", "Molina", "Acosta", "Vega", "Cabrera", "Núñez",
  "Ríos", "Godoy", "Paz", "Ledesma", "Quiroga", "Benítez",
];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log("Limpiando datos previos...");
  await db.messageLog.deleteMany();
  await db.booking.deleteMany();
  await db.checkIn.deleteMany();
  await db.payment.deleteMany();
  await db.gymClass.deleteMany();
  await db.member.deleteMany();
  await db.plan.deleteMany();
  await db.user.deleteMany();
  await db.gymSettings.deleteMany();
  await db.trainer.deleteMany();
  await db.galleryPhoto.deleteMany();

  console.log("Creando usuario demo...");
  const passwordHash = await bcrypt.hash("demo2024", 10);
  await db.user.create({
    data: {
      name: "Admin Demo",
      email: "admin@migimnasio.com",
      passwordHash,
      role: "OWNER",
    },
  });

  console.log("Creando datos del gimnasio...");
  await db.gymSettings.create({
    data: {
      id: "main",
      name: "Mi Gimnasio",
      address: "Av. Nazca 1234, Villa Devoto, CABA",
      phone: "+54 11 0000-0000",
    },
  });

  console.log("Creando profesores...");
  await Promise.all([
    db.trainer.create({
      data: { name: "Nico Ferreyra", specialty: "Musculación & Fuerza" },
    }),
    db.trainer.create({
      data: { name: "Vale Suárez", specialty: "Funcional & Crossfit" },
    }),
    db.trainer.create({ data: { name: "Tomi Aguirre", specialty: "Boxeo" } }),
    db.trainer.create({
      data: { name: "Cami Rojas", specialty: "Yoga & Movilidad" },
    }),
  ]);

  console.log("Creando planes...");
  const [basico, full, anual] = await Promise.all([
    db.plan.create({ data: { name: "Básico", price: 12000, billingCycle: "MONTHLY" } }),
    db.plan.create({ data: { name: "Full", price: 18000, billingCycle: "MONTHLY", featured: true } }),
    db.plan.create({ data: { name: "Anual", price: 15000, billingCycle: "ANNUAL" } }),
  ]);
  const plans = [basico, full, anual];

  console.log("Creando clases...");
  const classDefs = [
    {
      name: "Funcional",
      instructor: "Vale Suárez",
      dayOfWeek: 1,
      startTime: "18:00",
      durationMin: 50,
      capacity: 12,
      description: "Movimientos multiarticulares de alta intensidad. Fuerza, resistencia y quema real.",
      icon: "flame",
      showOnSite: true,
    },
    {
      name: "Spinning",
      instructor: "Cami Rojas",
      dayOfWeek: 2,
      startTime: "19:00",
      durationMin: 45,
      capacity: 15,
      description: "Cardio en bici a full ritmo, con instructor en vivo y playlist que te empuja.",
      icon: "bike",
      showOnSite: true,
    },
    {
      name: "Boxeo",
      instructor: "Tomi Aguirre",
      dayOfWeek: 1,
      startTime: "20:00",
      durationMin: 60,
      capacity: 10,
      description: "Técnica, sacos y combos al ritmo de la música. Descargá tensión, ganá potencia.",
      icon: "swords",
      showOnSite: true,
    },
    {
      name: "Yoga",
      instructor: "Cami Rojas",
      dayOfWeek: 2,
      startTime: "08:00",
      durationMin: 60,
      capacity: 12,
      description: "Movilidad, respiración y recuperación activa. El equilibrio que el cuerpo pide.",
      icon: "wind",
      showOnSite: true,
    },
    {
      name: "Crossfit",
      instructor: "Nico Ferreyra",
      dayOfWeek: 6,
      startTime: "10:00",
      durationMin: 50,
      capacity: 10,
      description: "WODs cronometrados, comunidad que te empuja y récords que se rompen cada semana.",
      icon: "timer",
      showOnSite: true,
    },
  ];
  const classes = await Promise.all(
    classDefs.map((c) => db.gymClass.create({ data: c }))
  );

  console.log("Creando socios, pagos y check-ins...");
  const now = new Date();

  type Profile = "loyal" | "at_risk" | "new" | "overdue";
  const profiles: Profile[] = [
    ...Array(8).fill("loyal"),
    ...Array(5).fill("at_risk"),
    ...Array(4).fill("new"),
    ...Array(3).fill("overdue"),
  ];

  const members = [];
  for (let i = 0; i < profiles.length; i++) {
    const profile = profiles[i];
    const name = `${rand(FIRST_NAMES)} ${rand(LAST_NAMES)}`;
    const plan = rand(plans);

    const joinedAt =
      profile === "new"
        ? subDays(now, Math.floor(Math.random() * 20) + 3)
        : subWeeks(now, Math.floor(Math.random() * 20) + 10);

    const status =
      profile === "overdue" ? "OVERDUE" : profile === "new" ? "ACTIVE" : "ACTIVE";

    const hasEmergencyContact = i < 3;

    const member = await db.member.create({
      data: {
        name,
        email: `${name.toLowerCase().replace(/\s+/g, ".")}@mail.com`,
        phone: `11-${Math.floor(4000 + Math.random() * 5000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        joinedAt,
        status,
        planId: plan.id,
        ...(hasEmergencyContact
          ? {
              emergencyName: `${rand(FIRST_NAMES)} ${rand(LAST_NAMES)}`,
              emergencyPhone: `11-${Math.floor(4000 + Math.random() * 5000)}-${Math.floor(1000 + Math.random() * 9000)}`,
              emergencyNotes: rand([
                "Sin condiciones médicas relevantes.",
                "Asmática — lleva inhalador.",
                "Alergia a la penicilina.",
              ]),
            }
          : {}),
      },
    });
    members.push({ member, profile, plan });

    // payment history: a few past cycles, mostly paid
    const cycles = profile === "new" ? 1 : 4;
    for (let c = cycles; c >= 1; c--) {
      const dueDate = subDays(now, c * 30 - (profile === "overdue" ? 0 : 30));
      const isCurrentCycle = c === 1;
      const overdue = profile === "overdue" && isCurrentCycle;
      await db.payment.create({
        data: {
          memberId: member.id,
          planId: plan.id,
          amount: plan.price,
          dueDate,
          paidAt: overdue ? null : subDays(dueDate, -Math.floor(Math.random() * 3)),
          status: overdue ? "OVERDUE" : "PAID",
        },
      });
    }
    // upcoming/pending payment for active non-overdue members
    if (profile !== "overdue") {
      await db.payment.create({
        data: {
          memberId: member.id,
          planId: plan.id,
          amount: plan.price,
          dueDate: addDays(now, Math.floor(Math.random() * 10) - 2),
          status: "PENDING",
        },
      });
    }

    // check-in history
    const historyWeeks = profile === "new" ? 3 : 10;
    for (let w = historyWeeks; w >= 1; w--) {
      const isRecent = w <= 2;
      let visitsThisWeek: number;

      if (profile === "loyal") visitsThisWeek = 2 + Math.floor(Math.random() * 2);
      else if (profile === "at_risk") visitsThisWeek = isRecent ? 0 : 2 + Math.floor(Math.random() * 2);
      else if (profile === "new") visitsThisWeek = 2 + Math.floor(Math.random() * 2);
      else visitsThisWeek = 1 + Math.floor(Math.random() * 2);

      for (let v = 0; v < visitsThisWeek; v++) {
        await db.checkIn.create({
          data: {
            memberId: member.id,
            timestamp: subDays(subWeeks(now, w), Math.floor(Math.random() * 6)),
          },
        });
      }
    }
  }

  console.log("Reservando clases (con lista de espera)...");
  const funcional = classes[0];
  const activeMembers = members.filter((m) => m.profile !== "overdue");
  for (let i = 0; i < Math.min(activeMembers.length, funcional.capacity + 2); i++) {
    const isWaitlist = i >= funcional.capacity;
    await db.booking.create({
      data: {
        classId: funcional.id,
        memberId: activeMembers[i].member.id,
        status: isWaitlist ? "WAITLIST" : "BOOKED",
      },
    });
  }

  // a couple of other classes with light bookings
  for (const cls of classes.slice(1, 3)) {
    const pool = members.filter((m) => m.profile === "loyal").slice(0, 5);
    for (const m of pool) {
      await db.booking.create({
        data: { classId: cls.id, memberId: m.member.id, status: "BOOKED" },
      }).catch(() => {});
    }
  }

  console.log("Sembrando historial de mensajes...");
  const atRiskSample = members.filter((m) => m.profile === "at_risk").slice(0, 2);
  for (const m of atRiskSample) {
    await db.messageLog.create({
      data: {
        memberId: m.member.id,
        type: "RETENTION_ALERT",
        content: `Hola ${m.member.name.split(" ")[0]}, te extrañamos en Mi Gimnasio 💪 ¿Todo bien? Contanos si podemos ayudarte a volver a la rutina.`,
        sentAt: subDays(now, 12),
      },
    });
  }

  console.log(`Listo. ${members.length} socios, ${classes.length} clases sembradas.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
