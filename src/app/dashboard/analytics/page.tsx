import Link from "next/link";
import { Eye, MessageSquare, ListTree, DollarSign, ShoppingBag } from "lucide-react";
import { requireTenantSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPremiumGrowthTools } from "@/lib/entitlements";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import type { AnalyticsEventType } from "@prisma/client";

const WINDOW_DAYS = 30;

export default async function AnalyticsDashboardPage() {
  const session = await requireTenantSession();
  const subscription = await prisma.platformSubscription.findUnique({
    where: { tenantId: session.tenantId },
  });
  const premium = hasPremiumGrowthTools(subscription);

  if (!premium) {
    return (
      <Card>
        <CardContent className="space-y-4 pt-6">
          <h2 className="text-lg font-semibold">Analytics is included with Premium</h2>
          <p className="text-sm text-muted-foreground">
            See page views, inquiries, waitlist signups, reservation conversion, and Amazon clicks.
            Premium also unlocks Google Analytics 4 on your kennel site and SEO controls under
            Settings.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/onboarding?step=billing" className={cn(buttonVariants())}>
              Upgrade to Premium
            </Link>
            <Link
              href="/dashboard/settings/billing"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Billing
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const since = new Date();
  since.setDate(since.getDate() - WINDOW_DAYS);

  const [events, tenant] = await Promise.all([
    prisma.analyticsEvent.findMany({
      where: { tenantId: session.tenantId, createdAt: { gte: since } },
      select: { type: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.tenant.findUniqueOrThrow({
      where: { id: session.tenantId },
      select: { gaMeasurementId: true },
    }),
  ]);

  const counts: Record<AnalyticsEventType, number> = {
    page_view: 0,
    inquiry: 0,
    waitlist_signup: 0,
    deposit_started: 0,
    deposit_completed: 0,
    affiliate_click: 0,
  };
  for (const e of events) counts[e.type] += 1;

  const conversionRate =
    counts.deposit_started > 0
      ? Math.round((counts.deposit_completed / counts.deposit_started) * 100)
      : 0;

  const dailyViews = buildDailySeries(
    events.filter((e) => e.type === "page_view").map((e) => e.createdAt),
    14
  );
  const maxViews = Math.max(1, ...dailyViews.map((d) => d.count));

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Site activity for the last {WINDOW_DAYS} days. Connect GA4 under Settings → SEO &amp;
            Analytics for Google&apos;s full reports.
          </p>
        </div>
        <Link href="/dashboard/settings/seo" className={cn(buttonVariants({ variant: "outline" }))}>
          {tenant.gaMeasurementId ? "Manage GA4 / SEO" : "Connect Google Analytics"}
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Page views" value={counts.page_view} icon={Eye} />
        <StatCard label="Inquiries" value={counts.inquiry} icon={MessageSquare} />
        <StatCard label="Waitlist signups" value={counts.waitlist_signup} icon={ListTree} />
        <StatCard
          label="Deposit conversion"
          value={`${conversionRate}%`}
          icon={DollarSign}
          hint={`${counts.deposit_completed} of ${counts.deposit_started} started`}
        />
        <StatCard label="Affiliate clicks" value={counts.affiliate_click} icon={ShoppingBag} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Page views (last 14 days)</CardTitle>
        </CardHeader>
        <CardContent>
          {dailyViews.every((d) => d.count === 0) ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No page views recorded yet.
            </p>
          ) : (
            <div className="flex h-32 items-end gap-1.5">
              {dailyViews.map((d) => (
                <div key={d.label} className="flex flex-1 flex-col items-center gap-1.5">
                  <div
                    className="w-full rounded-t-sm bg-primary/80"
                    style={{ height: `${Math.max(4, (d.count / maxViews) * 100)}%` }}
                    title={`${d.label}: ${d.count}`}
                  />
                  <span className="text-[10px] text-muted-foreground">{d.label}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function buildDailySeries(dates: Date[], days: number) {
  const buckets = new Map<string, number>();
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }

  for (const date of dates) {
    const key = date.toISOString().slice(0, 10);
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  return Array.from(buckets.entries()).map(([key, count]) => ({
    label: key.slice(5).replace("-", "/"),
    count,
  }));
}
