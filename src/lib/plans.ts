/** Matches Stripe product "One Time Setup Fee" ($297.00 one-time). */
export const SETUP_FEE = {
  amount: 297,
  unitAmount: 29700,
  envPriceKey: "STRIPE_PRICE_SETUP_FEE",
  stripeProductName: "One Time Setup Fee",
  label: "$297 one-time setup",
} as const;

export const PLAN_TIERS = ["basic", "pro", "premium"] as const;
export type PlanTier = (typeof PLAN_TIERS)[number];

export type PlanDefinition = {
  id: PlanTier;
  name: string;
  /** Exact Stripe Dashboard product name for this membership. */
  stripeProductName: string;
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
    stripeProductName: "Basic Membership",
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
    stripeProductName: "Pro Membership",
    description: "More pages, breeder agreements, leads, and your pipeline in one place.",
    monthlyPrice: 69.99,
    unitAmount: 6999,
    envPriceKey: "STRIPE_PRICE_PRO",
    highlighted: true,
    features: [
      "Everything in Basic",
      "Up to 4 pages",
      "Digital breeder agreements",
      "Lead Tracking",
    ],
  },
  premium: {
    id: "premium",
    name: "Premium",
    stripeProductName: "Premium Membership",
    description: "The full kennel toolkit, including growth tools.",
    monthlyPrice: 99.99,
    unitAmount: 9999,
    envPriceKey: "STRIPE_PRICE_PREMIUM",
    features: [
      "Everything in Pro",
      "Up to 7 Pages",
      "Amazon Affliates page",
      "Share to Social Accounts",
      "SEO & Site analytics",
      "Stripe deposits to your bank",
    ],
  },
};

export const PLAN_LIST = PLAN_TIERS.map((id) => PLANS[id]);

export const PLAN_COOKIE = "tb_plan";

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

export function formatSetupFee() {
  return `$${SETUP_FEE.amount}`;
}

/**
 * Read a Stripe price/product id from env. Tolerates common paste mistakes:
 * surrounding quotes, escaped quotes, and suffixes like " $49.99/mo".
 */
function envPriceValue(key: string): string | undefined {
  const raw = process.env[key];
  if (!raw) return undefined;
  const match = raw.match(/(?:price|prod)_[A-Za-z0-9]+/);
  return match?.[0];
}

export function stripePriceIdForSetupFee(): string | undefined {
  return envPriceValue(SETUP_FEE.envPriceKey);
}

export function stripePriceIdForPlan(plan: PlanTier): string | undefined {
  return envPriceValue(PLANS[plan].envPriceKey);
}

export function planFromPriceId(priceId: string | undefined | null): PlanTier | null {
  if (!priceId) return null;
  for (const plan of PLAN_LIST) {
    if (process.env[plan.envPriceKey] === priceId) return plan.id;
  }
  return null;
}
