import { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { computeNextDueDate } from "@/lib/billing";

// Belt-and-suspenders for the application-level checks in the callers
// below: the database itself has a unique index rejecting a second
// PENDING/OVERDUE payment for the same socio (see the
// payment_one_active_per_member migration), so this can never silently
// create a duplicate — it either gets caught earlier by an explicit check,
// or by this constraint, and either way ends up here as a clean message
// instead of a raw Prisma error. Payment has no other unique constraint a
// plain create() can hit, so any P2002 here is this one.
export function isDuplicateActivePaymentError(err: unknown) {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

// Core of "a cobro just got paid" — shared by the manual "Marcar como
// pagado" button and the Mercado Pago webhook, so a socio's subscription
// rolls forward the same way no matter which path paid it. Idempotent: a
// payment that's already PAID or already renewed is left untouched, so a
// double-click, a retried request, or a duplicate MP notification can
// never generate two renewal cobros for the same socio.
export async function applyPaymentPaid(paymentId: string, opts?: { mpPaymentId?: string }) {
  const existing = await db.payment.findUniqueOrThrow({
    where: { id: paymentId },
    include: { renewedTo: true, plan: true },
  });
  if (existing.status === "PAID" || existing.renewedTo) {
    return null;
  }

  const payment = await db.payment.update({
    where: { id: paymentId },
    data: {
      status: "PAID",
      paidAt: new Date(),
      ...(opts?.mpPaymentId ? { mpPaymentId: opts.mpPaymentId } : {}),
    },
  });

  await db.member.update({
    where: { id: payment.memberId },
    data: { status: "ACTIVE" },
  });

  // Roll the subscription forward automatically — nobody should have to
  // manually create next month's cobro for a socio that's already paying.
  if (existing.plan) {
    try {
      await db.payment.create({
        data: {
          memberId: payment.memberId,
          planId: existing.plan.id,
          amount: payment.amount,
          dueDate: computeNextDueDate(payment.dueDate, existing.plan.billingCycle),
          status: "PENDING",
          renewedFromId: payment.id,
        },
      });
    } catch (err) {
      // Shouldn't be reachable (the idempotency guard above already stops a
      // second renewal), but the DB constraint is the real backstop — if it
      // ever fires, the payment stays correctly marked PAID either way.
      if (!isDuplicateActivePaymentError(err)) throw err;
    }
  }

  return payment;
}
