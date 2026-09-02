import { subDays } from "date-fns";
import { db } from "@/lib/db";

// A socio gets a couple days of slack after the due date before the system
// calls it OVERDUE — still shows as "Pendiente" so the gestor can wave them
// through ("pagá mañana, no pasa nada") without the UI screaming vencido.
const GRACE_PERIOD_DAYS = 2;

// No cron in this app — instead, any page that reads payment status calls
// this first so a PENDING payment whose grace period has expired is
// corrected to OVERDUE before the query that depends on it runs.
export async function syncOverduePayments() {
  await db.payment.updateMany({
    where: { status: "PENDING", dueDate: { lt: subDays(new Date(), GRACE_PERIOD_DAYS) } },
    data: { status: "OVERDUE" },
  });
}
