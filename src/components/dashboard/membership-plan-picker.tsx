"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLAN_LIST, formatPlanPrice, getPlan, type PlanTier } from "@/lib/plans";
import { cn } from "@/lib/utils";

export function MembershipPlanPicker({
  currentPlan,
  mode,
}: {
  currentPlan: PlanTier;
  /** change updates the monthly price in place. resubscribe starts checkout without the setup fee. */
  mode: "change" | "resubscribe";
}) {
  const router = useRouter();
  const [pending, setPending] = useState<PlanTier | null>(null);

  async function choose(plan: PlanTier) {
    if (plan === currentPlan && mode === "change") return;
    setPending(plan);
    try {
      const res = await fetch(mode === "change" ? "/api/billing/plan" : "/api/checkout/platform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, returnTo: "billing" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not change plan");
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      toast.success(
        data.unchanged
          ? `You're already on ${getPlan(plan).name}.`
          : `You're now on ${getPlan(plan).name}. A confirmation is on its way to your email.`
      );
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {PLAN_LIST.map((plan) => {
        const current = plan.id === currentPlan;
        const upgrading = plan.monthlyPrice > getPlan(currentPlan).monthlyPrice;
        const label =
          mode === "resubscribe"
            ? `Resubscribe to ${plan.name}`
            : current
              ? "Current plan"
              : upgrading
                ? `Upgrade to ${plan.name}`
                : `Downgrade to ${plan.name}`;
        return (
          <div
            key={plan.id}
            className={cn(
              "flex flex-col rounded-xl border p-4",
              current ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-background"
            )}
          >
            <div className="text-sm font-medium">{plan.name}</div>
            <div className="mt-1">
              <span className="text-2xl font-semibold">{formatPlanPrice(plan)}</span>
              <span className="text-sm text-muted-foreground">/mo</span>
            </div>
            <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-1.5">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-sage" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              className="mt-4"
              size="sm"
              variant={current ? "outline" : "default"}
              disabled={(mode === "change" && current) || pending !== null}
              onClick={() => choose(plan.id)}
            >
              {pending === plan.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {label}
            </Button>
          </div>
        );
      })}
    </div>
  );
}
