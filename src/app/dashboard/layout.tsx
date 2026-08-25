import { requireTenantSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardTopbar } from "@/components/dashboard/topbar";
import { ImpersonationBanner } from "@/components/dashboard/impersonation-banner";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireTenantSession();
  const tenant = await prisma.tenant.findUniqueOrThrow({ where: { id: session.tenantId } });

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
  const protocol = rootDomain.startsWith("localhost") ? "http" : "https";
  const siteUrl = `${protocol}://${tenant.slug}.${rootDomain}`;

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      <DashboardSidebar siteUrl={siteUrl} />
      <div className="flex min-w-0 flex-1 flex-col">
        {session.impersonating && <ImpersonationBanner kennelName={tenant.kennelName} />}
        <DashboardTopbar title="Dashboard" email={session.email} kennelName={tenant.kennelName} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
