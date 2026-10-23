import { SETUP_FEE } from "@/lib/plans";

export const CHANGEABLE_SUBSCRIPTION_STATUSES = [
  "active",
  "trialing",
  "past_due",
  "grace_period",
] as const;

export type MembershipItem = {
  id: string;
  priceId: string | null;
  /** True when the Stripe price bills on a schedule. One-time prices are not membership items. */
  recurring: boolean;
  unitAmount?: number | null;
  productName?: string | null;
};

export function canChangeMembershipPlan(
  subscription: { status: string; stripeSubscriptionId: string | null } | null | undefined
) {
  return (
    !!subscription?.stripeSubscriptionId &&
    (CHANGEABLE_SUBSCRIPTION_STATUSES as readonly string[]).includes(subscription.status)
  );
}

/** First checkout charges the setup fee. Later checkouts and plan changes do not. */
export function chargeSetupFeeOnCheckout(setupFeePaid: boolean) {
  return !setupFeePaid;
}

function isSetupFeeItem(item: MembershipItem, setupPriceId: string | null) {
  if (setupPriceId && item.priceId === setupPriceId) return true;
  if (item.productName === SETUP_FEE.stripeProductName) return true;
  return !item.recurring && item.unitAmount === SETUP_FEE.unitAmount;
}

/**
 * The subscription item whose price should change on upgrade/downgrade.
 * The one-time setup fee is never selected, even if it was stored as its own item.
 */
export function selectMonthlyMembershipItem<T extends MembershipItem>(
  items: T[],
  setupPriceId: string | null
): T {
  const monthly = items.filter((item) => item.recurring && !isSetupFeeItem(item, setupPriceId));
  if (monthly.length === 1) return monthly[0];
  if (monthly.length === 0) {
    throw new Error("This subscription has no monthly membership to change.");
  }
  throw new Error("This subscription has more than one monthly price, so it wasn't changed.");
}

/** Stripe update payload: replace only the monthly price. No setup fee line is added. */
export function monthlyPriceUpdate(args: {
  items: MembershipItem[];
  setupPriceId: string | null;
  nextPriceId: string;
}): { id: string; price: string } {
  const item = selectMonthlyMembershipItem(args.items, args.setupPriceId);
  return { id: item.id, price: args.nextPriceId };
}
