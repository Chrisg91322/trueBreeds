import Link from "next/link";
import { Users, DollarSign, PawPrint, Heart } from "lucide-react";
import { requireTenantSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SetupChecklist } from "@/components/dashboard/setup-checklist";
import { WelcomeTour } from "@/components/dashboard/welcome-tour";
import { ReplayTourButton } from "@/components/dashboard/replay-tour-button";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DashboardOverviewPage() {
  const session = await requireTenantSession();
  const tenantId = session.tenantId;

  const [onboarding, newLeadsCount, availableCount, activeLittersCount, depositAgg, recentLeads] =
    await Promise.all([
      prisma.onboardingProgress.upsert({
        where: { tenantId },
        update: {},
        create: { tenantId },
      }),
      prisma.lead.count({ where: { tenantId, status: "new" } }),
      prisma.offspring.count({ where: { tenantId, status: "available" } }),
      prisma.litter.count({ where: { tenantId, status: { in: ["active", "born"] } } }),
      prisma.deposit.aggregate({
        where: { tenantId, status: "paid" },
        _sum: { amount: true },
      }),
      prisma.lead.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <WelcomeTour openInitially={!onboarding.dashboardTourSeen} />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Overview</h1>
          <p className="text-sm text-muted-foreground">
            Your kennel at a glance — and a short tour when you need a refresher.
          </p>
        </div>
        {onboarding.dashboardTourSeen ? <ReplayTourButton /> : null}
      </div>

      <SetupChecklist progress={onboarding} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="New leads" value={newLeadsCount} icon={Users} />
        <StatCard label="Available now" value={availableCount} icon={PawPrint} />
        <StatCard label="Active litters" value={activeLittersCount} icon={Heart} />
        <StatCard
          label="Deposit revenue"
          value={`$${(depositAgg._sum.amount ?? 0).toLocaleString()}`}
          icon={DollarSign}
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent leads</CardTitle>
          <Link href="/dashboard/leads" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {recentLeads.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No leads yet. Once your site is live, inquiries and waitlist signups will show up
              here.
            </p>
          ) : (
            <div className="divide-y">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between py-3">
                  <div>
                    <div className="text-sm font-medium">{lead.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {lead.email || lead.phone || "No contact info"}
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {lead.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
