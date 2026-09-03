import { requirePlanesEnabled } from "@/lib/authz";
import { db } from "@/lib/db";
import { createPlan, updatePlan } from "../planes/actions";
import BasePlanEditor from "../planes/BasePlanEditor";

// The always-free, always-available single-plan editor — completely
// separate from "/planes" (the paid multi-plan module). Every gym gets
// exactly one plan from onboarding and needs a way to see/edit it (or
// create it, if it somehow doesn't exist yet) with no dependency on
// whether they've paid for anything.
export default async function PlanPage() {
  await requirePlanesEnabled();

  const plan = await db.plan.findFirst({ orderBy: { price: "asc" } });

  return <BasePlanEditor plan={plan} updateAction={updatePlan} createAction={createPlan} />;
}
