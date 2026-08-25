import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { requireTenantSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusPill } from "@/components/site/status-pill";
import { OffspringTable } from "@/components/dashboard/offspring-table";
import { deleteLitter } from "@/lib/actions/litters";

export default async function LitterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireTenantSession();
  const litter = await prisma.litter.findFirst({
    where: { id, tenantId: session.tenantId },
    include: { sire: true, dam: true, offspring: { orderBy: { createdAt: "asc" } } },
  });
  if (!litter) notFound();

  const boundDelete = deleteLitter.bind(null, litter.id);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">
              {litter.sire?.name && litter.dam?.name
                ? `${litter.sire.name} × ${litter.dam.name}`
                : litter.breed || "Untitled Litter"}
            </h2>
            <StatusPill status={litter.status} />
          </div>
          {litter.description && (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{litter.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" render={<Link href={`/dashboard/litters/${litter.id}/edit`} />}>
            <Pencil className="mr-1.5 h-4 w-4" /> Edit
          </Button>
          <form action={boundDelete}>
            <Button type="submit" variant="outline" className="text-destructive">
              <Trash2 className="mr-1.5 h-4 w-4" /> Delete
            </Button>
          </form>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Offspring</CardTitle>
          <Button size="sm" render={<Link href={`/dashboard/litters/${litter.id}/offspring/new`} />}>
            <Plus className="mr-1.5 h-4 w-4" /> Add Offspring
          </Button>
        </CardHeader>
        <CardContent>
          <OffspringTable offspring={litter.offspring} />
        </CardContent>
      </Card>
    </div>
  );
}
