import { db } from "@/lib/db";

// No cron in this app — instead, any page that reads payment status calls
// this first so a PENDING payment whose due date has passed is corrected
// to OVERDUE before the query that depends on it runs.
export async function syncOverduePayments() {
  await db.payment.updateMany({
    where: { status: "PENDING", dueDate: { lt: new Date() } },
    data: { status: "OVERDUE" },
  });
}
