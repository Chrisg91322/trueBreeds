import { requireTenantSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TeamSettings } from "@/components/dashboard/team-settings";

export default async function TeamSettingsPage() {
  const session = await requireTenantSession();
  const [members, invites] = await Promise.all([
    prisma.tenantMember.findMany({
      where: { tenantId: session.tenantId },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.tenantInvite.findMany({
      where: { tenantId: session.tenantId },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return <TeamSettings members={members} invites={invites} currentUserId={session.userId} />;
}
