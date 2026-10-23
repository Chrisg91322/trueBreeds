import Link from "next/link";
import { Building2, DollarSign, UserPlus, AlertTriangle, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/lib/plans";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

// Platform admin data is per-request and never cacheable/prerenderable.
export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const sinceWeek = new Date();
  sinceWeek.setDate(sinceWeek.getDate() - 7);

  const [totalTenants, activeTenants, suspendedTenants, activeSubs, newThisWeek, recentTenants, recentUsers] =
    await Promise.all([
      prisma.tenant.count(),
      prisma.tenant.count({ where: { status: "active" } }),
      prisma.tenant.count({ where: { status: "suspended" } }),
      prisma.platformSubscription.findMany({
        where: { status: "active" },
        select: { plan: true },
      }),
      prisma.tenant.count({ where: { createdAt: { gte: sinceWeek } } }),
      prisma.tenant.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { subscription: true },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          memberships: {
            include: { tenant: { select: { kennelName: true } } },
            take: 1,
            orderBy: { createdAt: "asc" },
          },
        },
      }),
    ]);

  const mrr = activeSubs.reduce((sum, sub) => sum + PLANS[sub.plan].monthlyPrice, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Platform overview</h1>
        <p className="text-sm text-muted-foreground">A bird&apos;s-eye view of every tenant on TrueBreeds.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total tenants" value={totalTenants} icon={Building2} />
        <StatCard label="Active sites" value={activeTenants} icon={CheckCircle2} />
        <StatCard label="MRR" value={`$${mrr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} icon={DollarSign} hint={`${activeSubs.length} active subs`} />
        <StatCard label="New this week" value={newThisWeek} icon={UserPlus} />
        <StatCard label="Suspended" value={suspendedTenants} icon={AlertTriangle} />
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        <Link href="/admin/tenants/new" className={cn(buttonVariants())}>
          New website
        </Link>
        <Link href="/admin/users" className="text-primary hover:underline">
          All signed-up users →
        </Link>
        <Link href="/admin/seo" className="text-primary hover:underline">
          SEO readiness →
        </Link>
        <Link href="/admin/analytics" className="text-primary hover:underline">
          Paid user analytics →
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Recent signups</CardTitle>
            <Link href="/admin/tenants" className="text-sm text-primary hover:underline">
              View all tenants
            </Link>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {recentTenants.map((t) => (
              <Link
                key={t.id}
                href={`/admin/tenants/${t.id}`}
                className="flex items-center justify-between px-6 py-3 hover:bg-muted/50"
              >
                <div>
                  <div className="text-sm font-medium">{t.kennelName}</div>
                  <div className="text-xs text-muted-foreground">{t.slug}.truebreeds.com</div>
                </div>
                <Badge variant="outline" className="capitalize">
                  {t.status.replace("_", " ")}
                </Badge>
              </Link>
            ))}
            {recentTenants.length === 0 && (
              <p className="px-6 py-8 text-sm text-muted-foreground">No kennels yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Signed-up users</CardTitle>
            <Link href="/admin/users" className="text-sm text-primary hover:underline">
              View all users
            </Link>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between gap-3 px-6 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{user.fullName || user.email}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {user.memberships[0]?.tenant.kennelName || user.email}
                  </div>
                </div>
                <Badge variant="outline" className="shrink-0 capitalize">
                  {user.platformRole.replace(/_/g, " ")}
                </Badge>
              </div>
            ))}
            {recentUsers.length === 0 && (
              <p className="px-6 py-8 text-sm text-muted-foreground">No users yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
