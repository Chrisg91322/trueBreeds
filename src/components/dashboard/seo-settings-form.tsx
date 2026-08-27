"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import type { Tenant } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { updateSeoSettings } from "@/lib/actions/settings";

export function SeoSettingsForm({ tenant }: { tenant: Tenant }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updateSeoSettings({
          seoTitle: String(form.get("seoTitle") || "").trim() || null,
          seoDescription: String(form.get("seoDescription") || "").trim() || null,
          googleSiteVerification: String(form.get("googleSiteVerification") || "").trim() || null,
          gaMeasurementId: String(form.get("gaMeasurementId") || "").trim() || null,
        });
        toast.success("SEO & Analytics settings saved");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search listings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="seoTitle">SEO title</Label>
            <Input
              id="seoTitle"
              name="seoTitle"
              maxLength={70}
              defaultValue={tenant.seoTitle ?? ""}
              placeholder={`${tenant.kennelName} | Breeder`}
              className="mt-1.5"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">~60 characters. Shown in Google results.</p>
          </div>
          <div>
            <Label htmlFor="seoDescription">Meta description</Label>
            <Textarea
              id="seoDescription"
              name="seoDescription"
              maxLength={160}
              rows={3}
              defaultValue={tenant.seoDescription ?? ""}
              placeholder={tenant.tagline ?? "Health-tested puppies from our family kennel."}
              className="mt-1.5"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">~155 characters. Your search snippet.</p>
          </div>
          <div>
            <Label htmlFor="googleSiteVerification">Google Search Console verification</Label>
            <Input
              id="googleSiteVerification"
              name="googleSiteVerification"
              defaultValue={tenant.googleSiteVerification ?? ""}
              placeholder="google-site-verification content value"
              className="mt-1.5"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              From Search Console → HTML tag — paste only the <code>content</code> value, not the full
              tag.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Google Analytics 4</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="gaMeasurementId">Measurement ID</Label>
            <Input
              id="gaMeasurementId"
              name="gaMeasurementId"
              defaultValue={tenant.gaMeasurementId ?? ""}
              placeholder="G-XXXXXXXXXX"
              className="mt-1.5"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              Create a GA4 property at{" "}
              <a
                href="https://analytics.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                analytics.google.com
              </a>
              , then paste the Measurement ID. We inject it on your live kennel site automatically.
            </p>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save SEO & Analytics
      </Button>
    </form>
  );
}
