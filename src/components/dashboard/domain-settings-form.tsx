"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import type { Tenant } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { updateDomainSettings } from "@/lib/actions/settings";

const STATUS_STYLES: Record<string, string> = {
  none: "bg-slate-200 text-slate-700",
  pending: "bg-amber-100 text-amber-800",
  verified: "bg-emerald-100 text-emerald-800",
  error: "bg-red-100 text-red-800",
};

export function DomainSettingsForm({ tenant }: { tenant: Tenant }) {
  const [isPending, startTransition] = useTransition();
  const status = tenant.customDomainStatus ?? "none";

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await updateDomainSettings(formData);
        toast.success("Domain settings saved");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save");
      }
    });
  }

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div>
          <h3 className="font-medium">Custom domain</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Point your own domain (e.g. www.yourkennel.com) at your TrueBreeds site. Your default
            address <strong>{tenant.slug}.truebreeds.com</strong> always keeps working.
          </p>
        </div>

        <form action={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label htmlFor="customDomain">Domain</Label>
            <Input
              id="customDomain"
              name="customDomain"
              defaultValue={tenant.customDomain ?? ""}
              placeholder="www.yourkennel.com"
              className="mt-1.5"
            />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </form>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status</span>
          <Badge variant="secondary" className={STATUS_STYLES[status]}>
            {status}
          </Badge>
        </div>

        {tenant.customDomain && status !== "verified" && (
          <div className="rounded-lg border bg-muted/40 p-4 text-sm">
            <p className="font-medium">Add this DNS record at your domain registrar:</p>
            <div className="mt-2 overflow-x-auto rounded-md bg-background p-3 font-mono text-xs">
              CNAME&nbsp;&nbsp;{tenant.customDomain}&nbsp;&nbsp;→&nbsp;&nbsp;cname.truebreeds.com
            </div>
            <p className="mt-2 text-muted-foreground">
              DNS changes can take up to 48 hours to propagate. We&apos;ll automatically verify
              and issue an SSL certificate once it resolves.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
