import { requireTenantSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revokeUnpaidPublish } from "@/lib/actions/onboarding";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { ImpersonationBanner } from "@/components/dashboard/impersonation-banner";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireTenantSession();
  await revokeUnpaidPublish(session.tenantId);
  const [tenant, progress] = await Promise.all([
    prisma.tenant.findUniqueOrThrow({ where: { id: session.tenantId } }),
    prisma.onboardingProgress.findUnique({ where: { tenantId: session.tenantId } }),
  ]);

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3002";
  const protocol = rootDomain.startsWith("localhost") ? "http" : "https";
  const liveUrl = `${protocol}://${tenant.slug}.${rootDomain}`;
  const appOrigin =
    process.env.NEXT_PUBLIC_APP_URL ||
    `${protocol}://${rootDomain.startsWith("localhost") ? rootDomain : `www.${rootDomain.replace(/^www\./, "")}`}`;
  const isLive = !!(progress?.published && progress?.billingComplete);
  const siteUrl = isLive ? liveUrl : `${appOrigin.replace(/\/$/, "")}/preview`;
  const siteLinkLabel = isLive ? "View live site" : "Preview site";

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      <DashboardSidebar siteUrl={siteUrl} siteLinkLabel={siteLinkLabel} />
      <div className="flex min-w-0 flex-1 flex-col">
        {session.impersonating && <ImpersonationBanner kennelName={tenant.kennelName} />}
        <DashboardTopbar
          title="Dashboard"
          email={session.email}
          kennelName={tenant.kennelName}
          siteUrl={siteUrl}
          siteLinkLabel={siteLinkLabel}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
