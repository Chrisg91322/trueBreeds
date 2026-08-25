"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLAN_LIST, formatPlanPrice, type PlanTier } from "@/lib/plans";
import { cn } from "@/lib/utils";

export function PricingCards({
  selectedPlan,
  onSelect,
  ctaHref,
}: {
  selectedPlan?: PlanTier;
  onSelect?: (plan: PlanTier) => void;
  ctaHref?: (plan: PlanTier) => string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {PLAN_LIST.map((plan) => {
        const selected = selectedPlan === plan.id;
        const content = (
          <>
            {plan.highlighted && (
              <div className="mb-3 text-xs font-medium uppercase tracking-wide text-primary">
                Most popular
              </div>
            )}
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
            <div className="mt-4">
              <span className="text-3xl font-bold">{formatPlanPrice(plan)}</span>
              <span className="text-sm font-medium text-muted-foreground">/mo</span>
            </div>
            <ul className="mt-5 space-y-2 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  {feature}
                </li>
              ))}
            </ul>
          </>
        );

        if (onSelect) {
          return (
            <button
              type="button"
              key={plan.id}
              onClick={() => onSelect(plan.id)}
              className={cn(
                "rounded-2xl border bg-background p-6 text-left shadow-sm transition-colors",
                selected || plan.highlighted ? "border-primary ring-1 ring-primary" : "hover:border-foreground/20",
                selected && "bg-primary/5"
              )}
            >
              {content}
            </button>
          );
        }

        const href = ctaHref?.(plan.id) ?? `/signup?plan=${plan.id}`;
        return (
          <div
            key={plan.id}
            className={cn(
              "flex flex-col rounded-2xl border bg-background p-6 text-left shadow-sm",
              plan.highlighted && "border-primary ring-1 ring-primary"
            )}
          >
            {content}
            <Button render={<Link href={href} />} className="mt-6 w-full" size="lg">
              Get started
            </Button>
          </div>
        );
      })}
    </div>
  );
}
