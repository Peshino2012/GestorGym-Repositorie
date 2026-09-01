import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getGymSettings } from "@/lib/gymSettings";

// Public, unauthenticated, read-only: only marketing-safe fields (no member
// data, payments, or user accounts) — meant to be consumed by the gym's
// public site (PULSO) to render live plans/trainers/gallery.
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;

  const [gym, plans, trainers, gallery, scheduleBlocks, classCards] = await Promise.all([
    getGymSettings(),
    db.plan.findMany({ where: { active: true }, orderBy: { price: "asc" } }),
    db.trainer.findMany({ where: { active: true }, orderBy: { createdAt: "asc" } }),
    db.galleryPhoto.findMany({ orderBy: { createdAt: "asc" } }),
    db.scheduleBlock.findMany({
      orderBy: { order: "asc" },
      include: { entries: { orderBy: { order: "asc" } } },
    }),
    db.classCard.findMany({ where: { active: true }, orderBy: { order: "asc" }, take: 6 }),
  ]);

  const toAbsolute = (url: string | null) => (url ? `${origin}${url}` : null);

  return NextResponse.json({
    gym: {
      name: gym.name,
      address: gym.address,
      phone: gym.phone,
      email: gym.email,
    },
    plans: plans.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      billingCycle: p.billingCycle,
      featured: p.featured,
      features: p.features
        ? p.features.split("\n").map((f) => f.trim()).filter(Boolean)
        : [],
    })),
    trainers: trainers.map((t) => ({
      id: t.id,
      name: t.name,
      specialty: t.specialty,
      photoUrl: toAbsolute(t.photoUrl),
    })),
    gallery: gallery.map((g) => ({
      id: g.id,
      url: toAbsolute(g.url),
      caption: g.caption,
    })),
    classesEnabled: gym.classesEnabled,
    horariosEnabled: gym.horariosEnabled,
    planesEnabled: gym.planesEnabled,
    scheduleBlocks: scheduleBlocks.map((b) => ({
      id: b.id,
      title: b.title,
      hoursLabel: b.hoursLabel,
      icon: b.icon,
      entries: b.entries.map((e) => ({ id: e.id, time: e.time, name: e.name })),
    })),
    classCards: classCards.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      icon: c.icon,
    })),
  });
}
