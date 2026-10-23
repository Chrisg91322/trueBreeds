import { describe, expect, it } from "vitest";
import {
  canChangeMembershipPlan,
  chargeSetupFeeOnCheckout,
  monthlyPriceUpdate,
  selectMonthlyMembershipItem,
} from "@/lib/billing/plan-change";
import { SETUP_FEE } from "@/lib/plans";

const setup = {
  id: "si_setup",
  priceId: "price_setup",
  recurring: false,
  unitAmount: SETUP_FEE.unitAmount,
  productName: SETUP_FEE.stripeProductName,
};

const pro = {
  id: "si_pro",
  priceId: "price_pro",
  recurring: true,
  unitAmount: 6999,
  productName: "Pro Membership",
};

describe("plan changes after the setup fee", () => {
  it("does not charge the setup fee again once it has been paid", () => {
    expect(chargeSetupFeeOnCheckout(false)).toBe(true);
    expect(chargeSetupFeeOnCheckout(true)).toBe(false);
  });

  it("updates only the monthly membership when a one-time setup item is also present", () => {
    const update = monthlyPriceUpdate({
      items: [setup, pro],
      setupPriceId: "price_setup",
      nextPriceId: "price_premium",
    });

    expect(update).toEqual({ id: "si_pro", price: "price_premium" });
    expect(update.id).not.toBe(setup.id);
  });

  it("leaves a recurring setup-fee item alone and changes the membership price", () => {
    const recurringSetup = { ...setup, recurring: true };
    const item = selectMonthlyMembershipItem([recurringSetup, pro], "price_setup");
    expect(item.id).toBe("si_pro");
  });

  it("refuses to change a subscription that only contains the setup fee", () => {
    expect(() => selectMonthlyMembershipItem([setup], "price_setup")).toThrow(
      /no monthly membership/
    );
  });

  it("allows a plan change only while the membership can still be updated", () => {
    expect(
      canChangeMembershipPlan({ status: "active", stripeSubscriptionId: "sub_123" })
    ).toBe(true);
    expect(
      canChangeMembershipPlan({ status: "cancelled", stripeSubscriptionId: "sub_123" })
    ).toBe(false);
    expect(canChangeMembershipPlan({ status: "active", stripeSubscriptionId: null })).toBe(false);
  });
});
