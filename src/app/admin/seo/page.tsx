import type { ReactNode } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, Search, ShieldCheck, BarChart3 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { hasPremiumGrowthTools } from "@/lib/entitlements";
import { appOrigin, tenantSiteOrigin } from "@/lib/seo";
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

export const dynamic = "force-dynamic";

export default async function AdminSeoPage() {
  const platformGa = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || null;
  const origin = appOrigin();

  const premiumSubs = await prisma.platformSubscription.findMany({
    where: {
      plan: "premium",
      status: { in: ["active", "trialing", "grace_period"] },
    },
    include: {
      tenant: {
        select: {
          id: true,
          slug: true,
          kennelName: true,
          status: true,
          customDomain: true,
          seoTitle: true,
          seoDescription: true,
          gaMeasurementId: true,
          googleSiteVerification: true,
          seoProvisionedAt: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const rows = premiumSubs
    .filter((s) => hasPremiumGrowthTools(s))
    .map((s) => {
      const t = s.tenant;
      const hasTitle = !!t.seoTitle?.trim();
      const hasDescription = !!t.seoDescription?.trim();
      const hasGa = !!t.gaMeasurementId?.trim();
      const hasVerification = !!t.googleSiteVerification?.trim();
      const score = [hasTitle, hasDescription, hasGa, hasVerification].filter(Boolean).length;
      return {
        ...t,
        planStatus: s.status,
        hasTitle,
        hasDescription,
        hasGa,
        hasVerification,
        score,
        siteUrl: tenantSiteOrigin(t.slug, t.customDomain),
      };
    })
    .sort((a, b) => a.score - b.score);

  const withGa = rows.filter((r) => r.hasGa).length;
  const withVerification = rows.filter((r) => r.hasVerification).length;
  const fullyConfigured = rows.filter((r) => r.score === 4).length;
  const provisioned = rows.filter((r) => r.seoProvisionedAt).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">SEO</h1>
        <p className="text-sm text-muted-foreground">
          Platform search setup and Premium kennel SEO readiness.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Premium kennels" value={rows.length} icon={Search} />
        <StatCard
          label="SEO auto-provisioned"
          value={provisioned}
          icon={ShieldCheck}
          hint="Seeded on Premium purchase"
        />
        <StatCard
          label="GA4 connected"
          value={withGa}
          icon={BarChart3}
          hint={`${rows.length ? Math.round((withGa / rows.length) * 100) : 0}% of Premium`}
        />
        <StatCard
          label="Fully configured"
          value={fullyConfigured}
          icon={CheckCircle2}
          hint={`${withVerification} with Search Console`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Platform (truebreeds.com)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ChecklistRow
              ok={!!platformGa}
              label="Google Analytics 4"
              detail={platformGa ? platformGa : "Set NEXT_PUBLIC_GA_MEASUREMENT_ID in Vercel"}
            />
            <ChecklistRow
              ok
              label="Sitemap"
              detail={
                <a href={`${origin}/sitemap.xml`} className="text-primary hover:underline" target="_blank" rel="noreferrer">
                  {origin}/sitemap.xml
                </a>
              }
            />
            <ChecklistRow
              ok
              label="Robots"
              detail={
                <a href={`${origin}/robots.txt`} className="text-primary hover:underline" target="_blank" rel="noreferrer">
                  {origin}/robots.txt
                </a>
              }
            />
            <p className="pt-1 text-xs text-muted-foreground">
              Submit the sitemap in{" "}
              <a
                href="https://search.google.com/search-console"
                className="text-primary hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                Google Search Console
              </a>{" "}
              for www.truebreeds.com.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">How Premium SEO unlocks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              On Premium checkout, Stripe webhook seeds each kennel&apos;s SEO title and description
              from their name, breeds, and tagline.
            </p>
            <p>
              Breeders then add their own GA4 Measurement ID and Search Console verification under
              Dashboard → Settings → SEO &amp; Analytics. Only Premium sites inject GA4.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Premium kennel SEO checklist</CardTitle>
          <span className="text-xs text-muted-foreground">Sorted by gaps first</span>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kennel</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>GA4</TableHead>
                <TableHead>Search Console</TableHead>
                <TableHead>Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <Link href={`/admin/tenants/${r.id}`} className="hover:underline">
                      <div className="font-medium">{r.kennelName}</div>
                      <div className="text-xs text-muted-foreground">{r.slug}.truebreeds.com</div>
                    </Link>
                    <a
                      href={r.siteUrl}
                      className="mt-0.5 block text-[11px] text-primary hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open site
                    </a>
                  </TableCell>
                  <TableCell>
                    <BoolMark ok={r.hasTitle} />
                  </TableCell>
                  <TableCell>
                    <BoolMark ok={r.hasDescription} />
                  </TableCell>
                  <TableCell>
                    {r.hasGa ? (
                      <span className="font-mono text-xs">{r.gaMeasurementId}</span>
                    ) : (
                      <BoolMark ok={false} />
                    )}
                  </TableCell>
                  <TableCell>
                    <BoolMark ok={r.hasVerification} />
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{r.score}/4</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                    No active Premium kennels yet.
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

function BoolMark({ ok }: { ok: boolean }) {
  return ok ? (
    <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-label="Configured" />
  ) : (
    <Circle className="h-4 w-4 text-muted-foreground/50" aria-label="Missing" />
  );
}

function ChecklistRow({
  ok,
  label,
  detail,
}: {
  ok: boolean;
  label: string;
  detail: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <BoolMark ok={ok} />
      <div>
        <div className="font-medium text-foreground">{label}</div>
        <div className="text-muted-foreground">{detail}</div>
      </div>
    </div>
  );
}
