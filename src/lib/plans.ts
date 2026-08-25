export const PLAN_TIERS = ["basic", "pro", "premium"] as const;
export type PlanTier = (typeof PLAN_TIERS)[number];

export type PlanDefinition = {
  id: PlanTier;
  name: string;
  description: string;
  monthlyPrice: number;
  unitAmount: number;
  envPriceKey: "STRIPE_PRICE_BASIC" | "STRIPE_PRICE_PRO" | "STRIPE_PRICE_PREMIUM";
  highlighted?: boolean;
  features: string[];
};

export const PLANS: Record<PlanTier, PlanDefinition> = {
  basic: {
    id: "basic",
    name: "Basic",
    description: "A polished kennel site with the essentials.",
    monthlyPrice: 49.99,
    unitAmount: 4999,
    envPriceKey: "STRIPE_PRICE_BASIC",
    features: [
      "Custom breeder website",
      "Unlimited litters, animals & offspring",
      "Waitlist & contact form",
      "Email notifications",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    description: "Run deposits, leads, and your pipeline in one place.",
    monthlyPrice: 69.99,
    unitAmount: 6999,
    envPriceKey: "STRIPE_PRICE_PRO",
    highlighted: true,
    features: [
      "Everything in Basic",
      "Stripe deposits to your bank",
      "Lead CRM & inquiry timeline",
      "Site analytics",
    ],
  },
  premium: {
    id: "premium",
    name: "Premium",
    description: "The full kennel toolkit, including growth tools.",
    monthlyPrice: 99.99,
    unitAmount: 9999,
    envPriceKey: "STRIPE_PRICE_PREMIUM",
    features: [
      "Everything in Pro",
      "Amazon recommendations page",
      "Social auto-posting",
      "Team accounts",
    ],
  },
};

export const PLAN_LIST = PLAN_TIERS.map((id) => PLANS[id]);

export function isPlanTier(value: unknown): value is PlanTier {
  return typeof value === "string" && (PLAN_TIERS as readonly string[]).includes(value);
}

export function getPlan(id: PlanTier): PlanDefinition {
  return PLANS[id];
}

export function formatPlanPrice(plan: PlanDefinition | PlanTier) {
  const amount = typeof plan === "string" ? PLANS[plan].monthlyPrice : plan.monthlyPrice;
  return `$${amount.toFixed(2)}`;
}

export function stripePriceIdForPlan(plan: PlanTier): string | undefined {
  const value = process.env[PLANS[plan].envPriceKey];
  return value || undefined;
}

export function planFromPriceId(priceId: string | undefined | null): PlanTier | null {
  if (!priceId) return null;
  for (const plan of PLAN_LIST) {
    if (process.env[plan.envPriceKey] === priceId) return plan.id;
  }
  return null;
}
