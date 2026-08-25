import { requireTenantSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ContactSettingsForm } from "@/components/dashboard/contact-settings-form";

export default async function ContactSettingsPage() {
  const session = await requireTenantSession();
  const tenant = await prisma.tenant.findUniqueOrThrow({ where: { id: session.tenantId } });

  return <ContactSettingsForm tenant={tenant} />;
}
