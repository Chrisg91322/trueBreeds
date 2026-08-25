import { requireTenantSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GeneralSettingsForm } from "@/components/dashboard/general-settings-form";

export default async function GeneralSettingsPage() {
  const session = await requireTenantSession();
  const tenant = await prisma.tenant.findUniqueOrThrow({ where: { id: session.tenantId } });

  return <GeneralSettingsForm tenant={tenant} />;
}
