import { notFound } from "next/navigation";
import { requireTenantSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OffspringForm } from "@/components/dashboard/offspring-form";
import { createOffspring } from "@/lib/actions/offspring";

export default async function NewOffspringPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireTenantSession();
  const litter = await prisma.litter.findFirst({ where: { id, tenantId: session.tenantId } });
  if (!litter) notFound();

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h2 className="text-xl font-semibold">Add offspring</h2>
      <OffspringForm
        action={createOffspring}
        litterId={litter.id}
        defaultPrice={litter.defaultPrice}
        defaultDeposit={litter.defaultDepositAmount}
      />
    </div>
  );
}
