import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getPublicTenant } from "@/lib/site-data";
import { tenantSiteIcons } from "@/lib/site-icons";
import { getThemeCssVars } from "@/lib/theme";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { PageViewTracker } from "@/components/site/page-view-tracker";
import { SiteBasePathProvider } from "@/components/site/site-base-path";
import { SitePreviewBanner } from "@/components/site/site-preview-banner";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { hasPremiumGrowthTools } from "@/lib/entitlements";
import { tenantSiteOrigin } from "@/lib/seo";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenant: string }>;
}): Promise<Metadata> {
  const { tenant: slug } = await params;
  const headerStore = await headers();
  const isPreview = headerStore.get("x-truebreeds-preview") === "1";
  const data = await getPublicTenant(slug);
  if (!data) return {};
  const { tenant } = data;
  const origin = tenantSiteOrigin(tenant.slug, tenant.customDomain);
  const titleDefault =
    tenant.seoTitle?.trim() ||
    `${tenant.kennelName}${tenant.tagline ? ` — ${tenant.tagline}` : ""}`;
  const description =
    tenant.seoDescription?.trim() ||
    tenant.tagline ||
    `${tenant.kennelName} — ethical, health-tested ${tenant.species === "cat" ? "cats" : "dogs"}.`;

  const verification = tenant.googleSiteVerification?.trim();

  return {
    metadataBase: new URL(origin),
    title: {
      default: isPreview ? `${tenant.kennelName} (Preview)` : titleDefault,
      template: `%s · ${tenant.kennelName}`,
    },
    description,
    icons: tenantSiteIcons(tenant.faviconUrl, tenant.logoUrl),
    alternates: isPreview ? undefined : { canonical: origin },
    openGraph: {
      type: "website",
      url: origin,
      siteName: tenant.kennelName,
      title: titleDefault,
      description,
      images: tenant.heroImageUrl
        ? [{ url: tenant.heroImageUrl, alt: tenant.kennelName }]
        : tenant.logoUrl
          ? [{ url: tenant.logoUrl, alt: tenant.kennelName }]
          : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: titleDefault,
      description,
      images: tenant.heroImageUrl ? [tenant.heroImageUrl] : undefined,
    },
    ...(verification ? { verification: { google: verification } } : {}),
    ...(isPreview ? { robots: { index: false, follow: false } } : {}),
  };
}

export default async function TenantSiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: slug } = await params;
  const headerStore = await headers();
  const isPreview = headerStore.get("x-truebreeds-preview") === "1";
  const data = await getPublicTenant(slug);
  if (!data) notFound();

  const { tenant } = data;
  const style = getThemeCssVars(tenant.themePreset, tenant.accentColor);
  const basePath = isPreview ? "/preview" : "";
  const subscription = await prisma.platformSubscription.findUnique({
    where: { tenantId: tenant.id },
  });
  const premium = hasPremiumGrowthTools(subscription);
  const gaId = premium ? tenant.gaMeasurementId : null;

  return (
    <SiteBasePathProvider basePath={basePath}>
      {!isPreview && premium && <GoogleAnalytics measurementId={gaId} />}
      <div className="site-theme flex min-h-screen flex-col" style={style}>
        {isPreview && <SitePreviewBanner />}
        {!isPreview && <PageViewTracker tenantId={tenant.id} />}
        <div className={cn(isPreview && "[&_header]:top-[2.75rem]")}>
          <SiteHeader
            kennelName={tenant.kennelName}
            logoUrl={tenant.logoUrl}
            hasAffiliateProducts={data.affiliateProducts.length > 0}
          />
        </div>
        <main className="flex-1">{children}</main>
        <SiteFooter
          kennelName={tenant.kennelName}
          tagline={tenant.tagline}
          contactEmail={tenant.contactEmail}
          contactPhone={tenant.contactPhone}
          address={tenant.address}
          instagramUrl={tenant.instagramUrl}
          facebookUrl={tenant.facebookUrl}
          hasAffiliateProducts={data.affiliateProducts.length > 0}
        />
      </div>
    </SiteBasePathProvider>
  );
}
