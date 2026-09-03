import { requireCheckinAccess } from "@/lib/authz";
import IngresoKiosk from "./IngresoKiosk";

export default async function NuevoIngresoPage() {
  await requireCheckinAccess();

  return <IngresoKiosk />;
}
