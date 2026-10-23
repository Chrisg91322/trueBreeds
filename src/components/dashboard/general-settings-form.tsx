"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import type { Tenant } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { SpeciesSelect } from "@/components/dashboard/species-select";
import { Loader2 } from "lucide-react";
import { updateGeneralSettings } from "@/lib/actions/settings";

export function GeneralSettingsForm({ tenant }: { tenant: Tenant }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await updateGeneralSettings(formData);
        toast.success("Settings saved");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save");
      }
    });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="kennelName">Kennel name</Label>
            <Input
              id="kennelName"
              name="kennelName"
              defaultValue={tenant.kennelName}
              required
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="slug">Site URL</Label>
            <div className="mt-1.5 flex items-center gap-1 text-sm">
              <Input id="slug" name="slug" defaultValue={tenant.slug} required pattern="[a-z0-9-]+" />
              <span className="text-muted-foreground">.truebreeds.com</span>
            </div>
          </div>
          <div>
            <Label htmlFor="species">Species</Label>
            <SpeciesSelect
              id="species"
              defaultValue={tenant.species}
              plural
              className="mt-1.5 w-full"
            />
          </div>
          <div>
            <Label htmlFor="breeds">Breed(s), comma-separated</Label>
            <Input
              id="breeds"
              name="breeds"
              defaultValue={tenant.breeds.join(", ")}
              className="mt-1.5"
            />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
