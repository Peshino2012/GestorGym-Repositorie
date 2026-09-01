import { addMonths, addYears } from "date-fns";
import type { BillingCycle } from "@/generated/prisma/client";

export function computeNextDueDate(currentDueDate: Date, billingCycle: BillingCycle): Date {
  switch (billingCycle) {
    case "MONTHLY":
      return addMonths(currentDueDate, 1);
    case "QUARTERLY":
      return addMonths(currentDueDate, 3);
    case "ANNUAL":
      return addYears(currentDueDate, 1);
  }
}
