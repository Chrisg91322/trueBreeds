import { requireTenantSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ThemeSettingsForm } from "@/components/dashboard/theme-settings-form";

export default async function ThemeSettingsPage() {
  const session = await requireTenantSession();
  const tenant = await prisma.tenant.findUniqueOrThrow({ where: { id: session.tenantId } });

  return <ThemeSettingsForm tenant={tenant} />;
}
