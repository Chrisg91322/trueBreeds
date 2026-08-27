import Link from "next/link";
import { Building2, DollarSign, UserPlus, AlertTriangle, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/lib/plans";

// Platform admin data is per-request and never cacheable/prerenderable.
export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const sinceWeek = new Date();
  sinceWeek.setDate(sinceWeek.getDate() - 7);

  const [totalTenants, activeTenants, suspendedTenants, activeSubs, newThisWeek, recentTenants] =
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

      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/admin/seo" className="text-primary hover:underline">
          SEO readiness →
        </Link>
        <Link href="/admin/analytics" className="text-primary hover:underline">
          Paid user analytics →
        </Link>
      </div>

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
        </CardContent>
      </Card>
    </div>
  );
}
