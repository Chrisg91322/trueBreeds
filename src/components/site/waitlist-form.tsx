"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function WaitlistForm({
  tenantId,
  litterId,
  breed,
}: {
  tenantId: string;
  litterId?: string;
  breed?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{ rank: number } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          litterId,
          breed: breed || form.get("breed") || undefined,
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone") || undefined,
          notes: form.get("notes") || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.formErrors?.[0] || data.error || "Could not join");
      setDone({ rank: data.rank });
      toast.success("You're on the waitlist");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border site-border site-surface p-6 text-center">
        <div className="site-font-heading text-lg font-semibold">You&apos;re on the list</div>
        <p className="mt-2 text-sm site-muted">
          You&apos;re #{done.rank}. We&apos;ll email you when the next litter is ready.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border site-border site-surface p-6">
      <div>
        <div className="site-font-heading text-lg font-semibold">Join the waitlist</div>
        <p className="mt-1 text-sm site-muted">
          Get notified about upcoming litters{breed ? ` (${breed})` : ""}.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="wl-name">Full name</Label>
          <Input id="wl-name" name="name" required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="wl-email">Email</Label>
          <Input id="wl-email" name="email" type="email" required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="wl-phone">Phone (optional)</Label>
          <Input id="wl-phone" name="phone" type="tel" className="mt-1.5" />
        </div>
        {!breed && (
          <div>
            <Label htmlFor="wl-breed">Breed interest (optional)</Label>
            <Input id="wl-breed" name="breed" className="mt-1.5" />
          </div>
        )}
      </div>
      <div>
        <Label htmlFor="wl-notes">Notes (optional)</Label>
        <Textarea id="wl-notes" name="notes" rows={3} className="mt-1.5" />
      </div>
      <Button type="submit" disabled={loading} className="w-full site-accent-bg text-white">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Join waitlist
      </Button>
    </form>
  );
}
