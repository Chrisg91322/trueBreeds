"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import type { Tenant } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { updateContactSettings } from "@/lib/actions/settings";

export function ContactSettingsForm({ tenant }: { tenant: Tenant }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await updateContactSettings(formData);
        toast.success("Contact info saved");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save");
      }
    });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="contactEmail">Contact email</Label>
              <Input
                id="contactEmail"
                name="contactEmail"
                type="email"
                defaultValue={tenant.contactEmail ?? ""}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="contactPhone">Contact phone</Label>
              <Input
                id="contactPhone"
                name="contactPhone"
                defaultValue={tenant.contactPhone ?? ""}
                className="mt-1.5"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Address / location</Label>
            <Input id="address" name="address" defaultValue={tenant.address ?? ""} className="mt-1.5" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="instagramUrl">Instagram URL</Label>
              <Input
                id="instagramUrl"
                name="instagramUrl"
                type="url"
                defaultValue={tenant.instagramUrl ?? ""}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="facebookUrl">Facebook URL</Label>
              <Input
                id="facebookUrl"
                name="facebookUrl"
                type="url"
                defaultValue={tenant.facebookUrl ?? ""}
                className="mt-1.5"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="tagline">Tagline</Label>
            <Input id="tagline" name="tagline" defaultValue={tenant.tagline ?? ""} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="aboutHtml">Our story (About page)</Label>
            <Textarea
              id="aboutHtml"
              name="aboutHtml"
              rows={8}
              defaultValue={tenant.aboutHtml ?? ""}
              className="mt-1.5"
              placeholder="Tell buyers about your kennel, your breeding philosophy, and your dogs. Basic HTML is supported."
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
