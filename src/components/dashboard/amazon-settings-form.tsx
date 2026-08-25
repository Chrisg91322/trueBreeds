"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import type { AmazonSettings } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { updateAmazonSettings } from "@/lib/actions/affiliate";

export function AmazonSettingsForm({ settings }: { settings: AmazonSettings | null }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await updateAmazonSettings(formData);
        toast.success("Amazon settings saved");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save");
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Label htmlFor="associatesTag">Amazon Associates tag</Label>
        <Input
          id="associatesTag"
          name="associatesTag"
          defaultValue={settings?.associatesTag ?? ""}
          placeholder="yourtag-20"
          className="mt-1.5"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Required to earn commissions. Get yours from{" "}
          <a
            href="https://affiliate-program.amazon.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Amazon Associates
          </a>
          .
        </p>
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save
      </Button>
    </form>
  );
}
