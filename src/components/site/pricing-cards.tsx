"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { PLAN_LIST, SETUP_FEE, formatPlanPrice, type PlanTier } from "@/lib/plans";
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
              <div className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-brand-coral">
                Most popular
              </div>
            )}
            <h3 className="font-heading text-lg font-semibold">{plan.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
            <div className="mt-4">
              <span className="text-3xl font-bold">{formatPlanPrice(plan)}</span>
              <span className="text-sm font-medium text-muted-foreground">/mo</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">plus {SETUP_FEE.label}</p>
            <ul className="mt-5 space-y-2 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-sage" />
                  <span className="min-w-0">{feature}</span>
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
                "rounded-2xl border bg-background p-5 text-left shadow-sm transition-colors sm:p-6",
                selected
                  ? "border-primary ring-1 ring-primary bg-primary/5"
                  : "hover:border-foreground/20"
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
              "flex flex-col rounded-2xl border bg-background p-5 text-left shadow-sm sm:p-6",
              plan.highlighted && "border-primary ring-1 ring-primary"
            )}
          >
            {content}
            <Link href={href} className={cn(buttonVariants({ size: "lg" }), "mt-6 w-full")}>
              Get started
            </Link>
          </div>
        );
      })}
    </div>
  );
}
