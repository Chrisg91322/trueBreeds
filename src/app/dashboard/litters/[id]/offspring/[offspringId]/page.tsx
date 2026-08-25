import { notFound } from "next/navigation";
import { requireTenantSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OffspringForm } from "@/components/dashboard/offspring-form";
import { updateOffspring } from "@/lib/actions/offspring";

export default async function EditOffspringPage({
  params,
}: {
  params: Promise<{ id: string; offspringId: string }>;
}) {
  const { id, offspringId } = await params;
  const session = await requireTenantSession();
  const offspring = await prisma.offspring.findFirst({
    where: { id: offspringId, litterId: id, tenantId: session.tenantId },
  });
  if (!offspring) notFound();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h2 className="text-xl font-semibold">Edit offspring</h2>
      <OffspringForm
        action={updateOffspring.bind(null, offspring.id)}
        offspring={offspring}
        litterId={offspring.litterId}
      />
    </div>
  );
}
