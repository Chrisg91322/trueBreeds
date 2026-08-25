import { requireTenantSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PolicySettingsForm } from "@/components/dashboard/policy-settings-form";

export default async function PolicySettingsPage() {
  const session = await requireTenantSession();
  const tenant = await prisma.tenant.findUniqueOrThrow({ where: { id: session.tenantId } });

  return <PolicySettingsForm tenant={tenant} />;
}
