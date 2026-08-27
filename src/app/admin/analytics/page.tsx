import Link from "next/link";
import {
  Eye,
  MessageSquare,
  ListTree,
  DollarSign,
  ShoppingBag,
  Crown,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/plans";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AnalyticsEventType, PlanTier } from "@prisma/client";

export const dynamic = "force-dynamic";

const WINDOW_DAYS = 30;
const PAID_STATUSES = ["active", "trialing", "grace_period"] as const;

export default async function AdminPaidAnalyticsPage() {
  const since = new Date();
  since.setDate(since.getDate() - WINDOW_DAYS);

  const paidSubs = await prisma.platformSubscription.findMany({
    where: { status: { in: [...PAID_STATUSES] } },
    include: {
      tenant: {
        select: {
          id: true,
          slug: true,
          kennelName: true,
          status: true,
          gaMeasurementId: true,
        },
      },
    },
  });

  const paidTenantIds = paidSubs.map((s) => s.tenantId);
  const byPlan: Record<PlanTier, number> = { basic: 0, pro: 0, premium: 0 };
  for (const s of paidSubs) byPlan[s.plan] += 1;

  const mrr = paidSubs.reduce((sum, s) => sum + PLANS[s.plan].monthlyPrice, 0);
  const premiumCount = byPlan.premium;

  const events =
    paidTenantIds.length > 0
      ? await prisma.analyticsEvent.findMany({
          where: { tenantId: { in: paidTenantIds }, createdAt: { gte: since } },
          select: { tenantId: true, type: true, createdAt: true },
        })
      : [];

  const totals: Record<AnalyticsEventType, number> = {
    page_view: 0,
    inquiry: 0,
    waitlist_signup: 0,
    deposit_started: 0,
    deposit_completed: 0,
    affiliate_click: 0,
  };
  const perTenant = new Map<
    string,
    { views: number; inquiries: number; waitlist: number; deposits: number; affiliate: number }
  >();

  for (const e of events) {
    totals[e.type] += 1;
    const row = perTenant.get(e.tenantId) ?? {
      views: 0,
      inquiries: 0,
      waitlist: 0,
      deposits: 0,
      affiliate: 0,
    };
    if (e.type === "page_view") row.views += 1;
    if (e.type === "inquiry") row.inquiries += 1;
    if (e.type === "waitlist_signup") row.waitlist += 1;
    if (e.type === "deposit_completed") row.deposits += 1;
    if (e.type === "affiliate_click") row.affiliate += 1;
    perTenant.set(e.tenantId, row);
  }

  const conversionRate =
    totals.deposit_started > 0
      ? Math.round((totals.deposit_completed / totals.deposit_started) * 100)
      : 0;

  const dailyViews = buildDailySeries(
    events.filter((e) => e.type === "page_view").map((e) => e.createdAt),
    14
  );
  const maxViews = Math.max(1, ...dailyViews.map((d) => d.count));

  const leaderboard = paidSubs
    .map((s) => {
      const stats = perTenant.get(s.tenantId) ?? {
        views: 0,
        inquiries: 0,
        waitlist: 0,
        deposits: 0,
        affiliate: 0,
      };
      return {
        id: s.tenant.id,
        kennelName: s.tenant.kennelName,
        slug: s.tenant.slug,
        plan: s.plan,
        status: s.status,
        gaConnected: !!s.tenant.gaMeasurementId?.trim(),
        ...stats,
      };
    })
    .sort((a, b) => b.views - a.views || b.inquiries - a.inquiries);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Paid user analytics</h1>
        <p className="text-sm text-muted-foreground">
          Activity across paying kennels for the last {WINDOW_DAYS} days.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Paying kennels"
          value={paidSubs.length}
          icon={Users}
          hint={`Basic ${byPlan.basic} · Pro ${byPlan.pro} · Premium ${byPlan.premium}`}
        />
        <StatCard
          label="MRR"
          value={`$${mrr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={DollarSign}
        />
        <StatCard label="Premium seats" value={premiumCount} icon={Crown} />
        <StatCard
          label="Deposit conversion"
          value={`${conversionRate}%`}
          icon={DollarSign}
          hint={`${totals.deposit_completed} of ${totals.deposit_started} started`}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Page views" value={totals.page_view} icon={Eye} />
        <StatCard label="Inquiries" value={totals.inquiry} icon={MessageSquare} />
        <StatCard label="Waitlist" value={totals.waitlist_signup} icon={ListTree} />
        <StatCard label="Deposits paid" value={totals.deposit_completed} icon={DollarSign} />
        <StatCard label="Affiliate clicks" value={totals.affiliate_click} icon={ShoppingBag} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Page views across paid sites (last 14 days)</CardTitle>
        </CardHeader>
        <CardContent>
          {dailyViews.every((d) => d.count === 0) ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No page views recorded for paid kennels yet.
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kennel leaderboard</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kennel</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Inquiries</TableHead>
                <TableHead className="text-right">Waitlist</TableHead>
                <TableHead className="text-right">Deposits</TableHead>
                <TableHead className="text-right">Affiliate</TableHead>
                <TableHead>GA4</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboard.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <Link href={`/admin/tenants/${r.id}`} className="hover:underline">
                      <div className="font-medium">{r.kennelName}</div>
                      <div className="text-xs text-muted-foreground">{r.slug}.truebreeds.com</div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {r.plan}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{r.views}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.inquiries}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.waitlist}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.deposits}</TableCell>
                  <TableCell className="text-right tabular-nums">{r.affiliate}</TableCell>
                  <TableCell>
                    {r.plan === "premium" ? (
                      r.gaConnected ? (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                          Missing
                        </Badge>
                      )
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {leaderboard.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                    No paying kennels yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
