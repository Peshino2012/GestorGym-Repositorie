import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import EditSocioForm from "./EditSocioForm";

export default async function EditarSocioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [member, plans] = await Promise.all([
    db.member.findUnique({ where: { id } }),
    db.plan.findMany({ orderBy: { price: "asc" } }),
  ]);

  if (!member) notFound();

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <Link
        href={`/socios/${member.id}`}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al socio
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Editar socio</h1>
      </div>

      <EditSocioForm member={member} plans={plans} />
    </div>
  );
}
