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
  return {
    title: {
      default: isPreview ? `${tenant.kennelName} (Preview)` : tenant.kennelName,
      template: `%s · ${tenant.kennelName}`,
    },
    description: tenant.tagline ?? undefined,
    icons: tenantSiteIcons(tenant.faviconUrl, tenant.logoUrl),
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

  return (
    <SiteBasePathProvider basePath={basePath}>
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
