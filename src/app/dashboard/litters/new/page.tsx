import { requireTenantSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LitterForm } from "@/components/dashboard/litter-form";
import { createLitter } from "@/lib/actions/litters";

export default async function NewLitterPage() {
  const session = await requireTenantSession();
  const [tenant, animals] = await Promise.all([
    prisma.tenant.findUniqueOrThrow({ where: { id: session.tenantId } }),
    prisma.animal.findMany({
      where: { tenantId: session.tenantId },
      select: { id: true, name: true, sex: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold">New litter</h2>
        <p className="text-sm text-muted-foreground">
          Mark it &quot;Planned&quot; or &quot;Expecting&quot; for the upcoming-litters teaser, or
          &quot;Active&quot; once puppies are ready to list.
        </p>
      </div>
      <LitterForm
        action={createLitter}
        defaultSpecies={tenant.species}
        sires={animals.filter((a) => a.sex === "male")}
        dams={animals.filter((a) => a.sex === "female")}
      />
    </div>
  );
}
