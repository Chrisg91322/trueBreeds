import { requireTenantSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AnimalForm } from "@/components/dashboard/animal-form";
import { createAnimal } from "@/lib/actions/animals";

export default async function NewAnimalPage() {
  const session = await requireTenantSession();
  const tenant = await prisma.tenant.findUniqueOrThrow({ where: { id: session.tenantId } });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Add an animal</h2>
        <p className="text-sm text-muted-foreground">
          This shows up on your public &quot;Our Pets&quot; page once saved.
        </p>
      </div>
      <AnimalForm action={createAnimal} defaultSpecies={tenant.species} />
    </div>
  );
}
