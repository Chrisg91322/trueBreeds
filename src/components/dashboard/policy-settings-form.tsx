"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import type { Tenant } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { updatePolicySettings } from "@/lib/actions/settings";

export function PolicySettingsForm({ tenant }: { tenant: Tenant }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await updatePolicySettings(formData);
        toast.success("Policies saved");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save");
      }
    });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="depositPolicy">Deposit policy</Label>
            <Textarea
              id="depositPolicy"
              name="depositPolicy"
              rows={3}
              defaultValue={tenant.depositPolicy ?? ""}
              className="mt-1.5"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Shown to buyers at checkout and included in their confirmation email.
            </p>
          </div>
          <div>
            <Label htmlFor="healthGuaranteeHtml">Health guarantee</Label>
            <Textarea
              id="healthGuaranteeHtml"
              name="healthGuaranteeHtml"
              rows={5}
              defaultValue={tenant.healthGuaranteeHtml ?? ""}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="contractHtml">Purchase contract</Label>
            <Textarea
              id="contractHtml"
              name="contractHtml"
              rows={5}
              defaultValue={tenant.contractHtml ?? ""}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="spayNeuterHtml">Spay/neuter agreement</Label>
            <Textarea
              id="spayNeuterHtml"
              name="spayNeuterHtml"
              rows={5}
              defaultValue={tenant.spayNeuterHtml ?? ""}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="faqHtml">Additional FAQ content</Label>
            <Textarea
              id="faqHtml"
              name="faqHtml"
              rows={5}
              defaultValue={tenant.faqHtml ?? ""}
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
