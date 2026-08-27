"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export function DepositForm({
  tenantId,
  offspringId,
  amount,
  depositPolicy,
  paymentsEnabled = false,
}: {
  tenantId: string;
  offspringId: string;
  amount: number;
  depositPolicy?: string | null;
  /** True when Stripe Connect can charge cards for this kennel. */
  paymentsEnabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(!depositPolicy);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (depositPolicy && !accepted) {
      toast.error("Please accept the deposit policy to continue.");
      return;
    }
    setLoading(true);
    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/checkout/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          offspringId,
          buyerName: form.get("buyerName"),
          buyerEmail: form.get("buyerEmail"),
          buyerPhone: form.get("buyerPhone") || undefined,
          policyAccepted: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error?.formErrors?.[0] ||
            (typeof data.error === "string" ? data.error : null) ||
            "Something went wrong"
        );
      }
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border site-border site-surface p-6">
      <div>
        <div className="site-font-heading text-xl font-semibold">Reserve now</div>
        {amount > 0 ? (
          <div className="mt-1 text-2xl font-bold">${amount.toLocaleString()} deposit</div>
        ) : (
          <p className="mt-1 text-sm site-muted">Request a hold — the breeder will confirm next steps.</p>
        )}
        {!paymentsEnabled && amount > 0 && (
          <p className="mt-2 text-xs site-muted">
            Submit your info to reserve. The kennel will follow up to collect the deposit.
          </p>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="buyerName">Full name</Label>
          <Input id="buyerName" name="buyerName" required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="buyerEmail">Email</Label>
          <Input id="buyerEmail" name="buyerEmail" type="email" required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="buyerPhone">Phone (optional)</Label>
          <Input id="buyerPhone" name="buyerPhone" type="tel" className="mt-1.5" />
        </div>
      </div>

      {depositPolicy && (
        <>
          <p className="rounded-lg bg-neutral-50 p-3 text-xs site-muted">{depositPolicy}</p>
          <div className="flex items-start gap-2">
            <Checkbox
              id="accept-policy"
              checked={accepted}
              onCheckedChange={(v) => setAccepted(v === true)}
            />
            <Label htmlFor="accept-policy" className="text-xs font-normal leading-snug site-muted">
              I have read and accept the deposit policy above.
            </Label>
          </div>
        </>
      )}

      <Button type="submit" disabled={loading} className="w-full site-accent-bg text-white">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {paymentsEnabled && amount > 0 ? "Continue to payment" : "Submit reservation"}
      </Button>
    </form>
  );
}
