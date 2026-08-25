import Link from "next/link";
import { Plus } from "lucide-react";
import { requireTenantSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AnimalsPage() {
  const session = await requireTenantSession();
  const animals = await prisma.animal.findMany({
    where: { tenantId: session.tenantId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Our Dogs</h2>
          <p className="text-sm text-muted-foreground">
            Your breeding stock — shown publicly on the &quot;Our Dogs&quot; page.
          </p>
        </div>
        <Button render={<Link href="/dashboard/animals/new" />}>
          <Plus className="mr-1.5 h-4 w-4" /> Add Animal
        </Button>
      </div>

      {animals.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            No animals yet. Add your first breeding dog or cat to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {animals.map((animal) => (
            <Link key={animal.id} href={`/dashboard/animals/${animal.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold">{animal.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {[animal.breed, animal.sex === "male" ? "Male" : "Female"]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                    </div>
                    {animal.isRetired && <Badge variant="outline">Retired</Badge>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
