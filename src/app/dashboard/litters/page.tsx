import Link from "next/link";
import { Plus } from "lucide-react";
import { requireTenantSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusPill } from "@/components/site/status-pill";

export default async function LittersPage() {
  const session = await requireTenantSession();
  const litters = await prisma.litter.findMany({
    where: { tenantId: session.tenantId },
    include: { sire: true, dam: true, offspring: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Litters</h2>
          <p className="text-sm text-muted-foreground">
            Manage litters and the offspring status pipeline.
          </p>
        </div>
        <Button render={<Link href="/dashboard/litters/new" />}>
          <Plus className="mr-1.5 h-4 w-4" /> New Litter
        </Button>
      </div>

      {litters.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            No litters yet. Create one to start tracking availability.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {litters.map((litter) => (
            <Link key={litter.id} href={`/dashboard/litters/${litter.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <div className="font-semibold">
                      {litter.sire?.name && litter.dam?.name
                        ? `${litter.sire.name} × ${litter.dam.name}`
                        : litter.breed || "Untitled Litter"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {litter.offspring.length} {litter.offspring.length === 1 ? "puppy" : "puppies"}
                      {litter.whelpDate && ` · Whelped ${litter.whelpDate.toLocaleDateString()}`}
                    </div>
                  </div>
                  <StatusPill status={litter.status} />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
