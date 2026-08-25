import { requireTenantSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AmazonSettingsForm } from "@/components/dashboard/amazon-settings-form";
import { AffiliateProductDialog } from "@/components/dashboard/affiliate-product-dialog";
import { AffiliateProductTable } from "@/components/dashboard/affiliate-product-table";

export default async function AffiliateDashboardPage() {
  const session = await requireTenantSession();
  const [settings, products] = await Promise.all([
    prisma.amazonSettings.findUnique({ where: { tenantId: session.tenantId } }),
    prisma.affiliateProduct.findMany({
      where: { tenantId: session.tenantId },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Amazon Recommendations</h2>
        <p className="text-sm text-muted-foreground">
          Curate a &quot;What We Recommend&quot; page for buyers, and earn a commission on
          qualifying Amazon purchases.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Amazon Associates</CardTitle>
        </CardHeader>
        <CardContent>
          <AmazonSettingsForm settings={settings} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Products</CardTitle>
          <AffiliateProductDialog />
        </CardHeader>
        <CardContent className="p-0">
          <AffiliateProductTable products={products} />
        </CardContent>
      </Card>
    </div>
  );
}
