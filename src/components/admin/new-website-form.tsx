"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SpeciesSelect } from "@/components/dashboard/species-select";
import { createWebsite, type CreateWebsiteState } from "@/lib/actions/admin";
import { websiteSlugFromName } from "@/lib/admin-site";
import { PLAN_LIST, formatPlanPrice } from "@/lib/plans";

export function NewWebsiteForm() {
  const [state, action, pending] = useActionState(createWebsite, null as CreateWebsiteState);
  const [kennelName, setKennelName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);

  return (
    <form action={action} className="max-w-xl space-y-4 rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
      <div>
        <Label htmlFor="kennelName">Kennel name</Label>
        <Input
          id="kennelName"
          name="kennelName"
          required
          value={kennelName}
          className="mt-1.5"
          onChange={(event) => {
            const next = event.target.value;
            setKennelName(next);
            if (!slugEdited) setSlug(websiteSlugFromName(next));
          }}
        />
      </div>
      <div>
        <Label htmlFor="slug">Site address</Label>
        <div className="mt-1.5 flex items-center gap-1 text-sm">
          <Input
            id="slug"
            name="slug"
            required
            value={slug}
            pattern="[a-z0-9-]+"
            onChange={(event) => {
              setSlugEdited(true);
              setSlug(websiteSlugFromName(event.target.value));
            }}
          />
          <span className="shrink-0 text-muted-foreground">.truebreeds.com</span>
        </div>
      </div>
      <div>
        <Label htmlFor="ownerName">Owner name</Label>
        <Input id="ownerName" name="ownerName" required className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="email">Owner email</Label>
        <Input id="email" name="email" type="email" required className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" type="tel" required className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="plan">Plan</Label>
        <select
          id="plan"
          name="plan"
          defaultValue="pro"
          className="mt-1.5 h-9 w-full rounded-md border bg-background px-3 text-sm"
        >
          {PLAN_LIST.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.name} · {formatPlanPrice(plan)}/mo
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="species">Species</Label>
        <SpeciesSelect id="species" defaultValue="dog" plural className="mt-1.5 w-full" />
      </div>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="sendLogin" className="mt-1" />
        <span>Email the owner a login link now. Leave this off until the site is ready to show.</span>
      </label>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create website
      </Button>
    </form>
  );
}
