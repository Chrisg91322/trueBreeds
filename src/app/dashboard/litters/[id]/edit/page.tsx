import { notFound } from "next/navigation";
import { requireTenantSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LitterForm } from "@/components/dashboard/litter-form";
import { updateLitter } from "@/lib/actions/litters";

export default async function EditLitterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireTenantSession();

  const [litter, animals] = await Promise.all([
    prisma.litter.findFirst({ where: { id, tenantId: session.tenantId } }),
    prisma.animal.findMany({
      where: { tenantId: session.tenantId },
      select: { id: true, name: true, sex: true },
      orderBy: { name: "asc" },
    }),
  ]);
  if (!litter) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h2 className="text-xl font-semibold">Edit litter</h2>
      <LitterForm
        action={updateLitter.bind(null, litter.id)}
        litter={litter}
        defaultSpecies={litter.species}
        sires={animals.filter((a) => a.sex === "male")}
        dams={animals.filter((a) => a.sex === "female")}
      />
    </div>
  );
}
