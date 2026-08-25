import { requireTenantSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { WaitlistTable } from "@/components/dashboard/waitlist-table";

export default async function WaitlistPage() {
  const session = await requireTenantSession();
  const entries = await prisma.waitlistEntry.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { rank: "asc" },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Waitlist</h2>
        <p className="text-sm text-muted-foreground">
          Buyers who joined your general or litter-specific waitlist. Reorder with the arrows.
        </p>
      </div>
      <Card>
        <CardContent className="p-0">
          <WaitlistTable entries={entries} />
        </CardContent>
      </Card>
    </div>
  );
}
