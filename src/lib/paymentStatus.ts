// A payment stays DB-status PENDING from the moment it's created (usually a
// month out, per computeNextDueDate) all the way until its grace period
// expires and paymentSync flips it to OVERDUE. But a socio isn't actually
// "pendiente" (owing, needs a nudge) until the due date has arrived — before
// that it's just the next scheduled cobro, same "Al día" concept already
// used on the Cobros page. This is what every status badge for a payment
// should show instead of the raw DB status.
//
// "Al día" only makes sense once someone has actually paid at least once —
// otherwise a brand-new socio's very first payment (created PENDING, due 30
// days out) reads as already settled the moment they're signed up, when in
// fact nobody has collected anything from them yet. `hasPriorPaidPayment`
// keeps that first payment showing as "Pendiente" until it's genuinely paid.
export type PaymentDisplayStatus = "PAID" | "PENDING" | "OVERDUE" | "SCHEDULED";

export function displayPaymentStatus(
  payment: {
    status: "PENDING" | "PAID" | "OVERDUE";
    dueDate: Date;
  },
  hasPriorPaidPayment: boolean
): PaymentDisplayStatus {
  if (payment.status !== "PENDING") return payment.status;
  if (!hasPriorPaidPayment) return "PENDING";
  return payment.dueDate > new Date() ? "SCHEDULED" : "PENDING";
}
