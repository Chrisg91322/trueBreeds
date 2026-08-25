import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { requireTenantSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AnimalForm } from "@/components/dashboard/animal-form";
import { updateAnimal, deleteAnimal } from "@/lib/actions/animals";
import { Button } from "@/components/ui/button";

export default async function EditAnimalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireTenantSession();
  const animal = await prisma.animal.findFirst({
    where: { id, tenantId: session.tenantId },
  });
  if (!animal) notFound();

  const boundUpdate = updateAnimal.bind(null, animal.id);
  const boundDelete = deleteAnimal.bind(null, animal.id);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{animal.name}</h2>
          <p className="text-sm text-muted-foreground">Edit this animal&apos;s public profile.</p>
        </div>
        <form action={boundDelete}>
          <Button type="submit" variant="outline" className="text-destructive">
            <Trash2 className="mr-1.5 h-4 w-4" /> Delete
          </Button>
        </form>
      </div>
      <AnimalForm action={boundUpdate} animal={animal} defaultSpecies={animal.species} />
    </div>
  );
}
