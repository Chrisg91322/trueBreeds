import { notFound } from "next/navigation";
import { getPublicTenant } from "@/lib/site-data";
import { getThemeCssVars } from "@/lib/theme";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { PageViewTracker } from "@/components/site/page-view-tracker";

export default async function TenantSiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: slug } = await params;
  const data = await getPublicTenant(slug);
  if (!data) notFound();

  const { tenant } = data;
  const style = getThemeCssVars(tenant.themePreset, tenant.accentColor);

  return (
    <div className="site-theme flex min-h-screen flex-col" style={style}>
      <PageViewTracker tenantId={tenant.id} />
      <SiteHeader kennelName={tenant.kennelName} logoUrl={tenant.logoUrl} />
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
  );
}
