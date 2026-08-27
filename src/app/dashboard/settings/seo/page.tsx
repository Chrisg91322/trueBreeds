import Link from "next/link";
import { requireTenantSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPremiumGrowthTools } from "@/lib/entitlements";
import { SeoSettingsForm } from "@/components/dashboard/seo-settings-form";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default async function SeoSettingsPage() {
  const session = await requireTenantSession();
  const [tenant, subscription] = await Promise.all([
    prisma.tenant.findUniqueOrThrow({ where: { id: session.tenantId } }),
    prisma.platformSubscription.findUnique({ where: { tenantId: session.tenantId } }),
  ]);

  const premium = hasPremiumGrowthTools(subscription);

  if (!premium) {
    return (
      <Card>
        <CardContent className="space-y-4 pt-6">
          <h2 className="text-lg font-semibold">SEO &amp; Analytics is a Premium feature</h2>
          <p className="text-sm text-muted-foreground">
            Premium includes SEO titles/descriptions, Google Search Console verification, Google
            Analytics 4 on your kennel site, plus the analytics dashboard. Upgrade to unlock — we
            auto-seed SEO defaults the moment Premium is active.
          </p>
          <Link href="/onboarding?step=billing" className={cn(buttonVariants())}>
            Upgrade to Premium
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h2 className="text-xl font-semibold">SEO &amp; Analytics</h2>
        <p className="text-sm text-muted-foreground">
          Rank in Google and measure traffic. Defaults were applied when you activated Premium —
          refine them anytime.
        </p>
      </div>
      <SeoSettingsForm tenant={tenant} />
    </div>
  );
}
