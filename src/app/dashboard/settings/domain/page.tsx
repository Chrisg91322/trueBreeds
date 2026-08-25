import { requireTenantSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DomainSettingsForm } from "@/components/dashboard/domain-settings-form";

export default async function DomainSettingsPage() {
  const session = await requireTenantSession();
  const tenant = await prisma.tenant.findUniqueOrThrow({ where: { id: session.tenantId } });

  return <DomainSettingsForm tenant={tenant} />;
}
