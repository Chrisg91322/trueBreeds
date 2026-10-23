import { describe, expect, it } from "vitest";
import {
  renderCancellationScheduled,
  renderPaymentFailed,
  renderPlanChange,
  renderSubscriptionEnded,
  renderSubscriptionReceipt,
  renderSubscriptionResumed,
  subscriptionNotices,
} from "@/lib/billing/subscription-mail";

const manageUrl = "https://www.truebreeds.com/dashboard/settings/billing";
const paidAt = new Date("2026-09-28T15:00:00.000Z");
const renewsOn = new Date("2026-10-28T15:00:00.000Z");

describe("subscription receipt emails", () => {
  it("itemizes the setup fee, membership, tax, and total on the purchase receipt", () => {
    const email = renderSubscriptionReceipt({
      kind: "purchase",
      kennelName: "Blue Moon",
      recipientName: "Chris Green",
      planName: "Pro",
      monthlyPriceLabel: "$69.99",
      invoiceNumber: "INV-1001",
      paidAt,
      lines: [
        { description: "One Time Setup Fee", amountCents: 29700, note: "One-time" },
        { description: "Pro Membership", amountCents: 6999, note: "Billed monthly" },
      ],
      subtotalCents: 36699,
      discountCents: 0,
      taxCents: 0,
      totalCents: 36699,
      renewsOn,
      manageUrl,
    });

    expect(email.subject).toBe("Your TrueBreeds receipt — Pro membership");
    expect(email.html).toContain("Hi Chris,");
    expect(email.html).toContain("One Time Setup Fee");
    expect(email.html).toContain("$297.00");
    expect(email.html).toContain("Pro Membership");
    expect(email.html).toContain("$69.99");
    expect(email.html).toContain("$366.99");
    expect(email.html).toContain("Receipt INV-1001");
    expect(email.html).toContain("October 28, 2026");
    expect(email.html).toContain("Upgrade or downgrade");
    expect(email.html).toContain("Cancel");
    expect(email.html).toContain(manageUrl);
    expect(email.text).toContain("Total paid: $366.99");
    expect(email.text).toContain("Upgrade or downgrade any time");
  });

  it("shows a discount and tax on a renewal receipt", () => {
    const email = renderSubscriptionReceipt({
      kind: "renewal",
      kennelName: "Blue Moon",
      planName: "Basic",
      monthlyPriceLabel: "$49.99",
      paidAt,
      lines: [{ description: "Basic Membership", amountCents: 4999, note: "Billed monthly" }],
      subtotalCents: 4999,
      discountCents: 500,
      taxCents: 360,
      totalCents: 4859,
      manageUrl,
    });

    expect(email.subject).toContain("Basic renewal");
    expect(email.html).toContain("Discount");
    expect(email.html).toContain("-$5.00");
    expect(email.html).toContain("Tax");
    expect(email.html).toContain("$3.60");
    expect(email.html).toContain("$48.59");
  });
});

describe("subscription lifecycle emails", () => {
  it("classifies upgrades, downgrades, cancellation, resume, and the end of a subscription", () => {
    expect(
      subscriptionNotices({
        eventType: "customer.subscription.updated",
        previousPlan: "pro",
        nextPlan: "premium",
        previousCancelAtPeriodEnd: false,
        cancelAtPeriodEnd: false,
        status: "active",
      })
    ).toEqual([{ type: "upgrade", from: "pro", to: "premium" }]);

    expect(
      subscriptionNotices({
        eventType: "customer.subscription.updated",
        previousPlan: "premium",
        nextPlan: "basic",
        previousCancelAtPeriodEnd: false,
        cancelAtPeriodEnd: false,
        status: "active",
      })
    ).toEqual([{ type: "downgrade", from: "premium", to: "basic" }]);

    expect(
      subscriptionNotices({
        eventType: "customer.subscription.updated",
        previousPlan: "pro",
        nextPlan: "pro",
        previousCancelAtPeriodEnd: false,
        cancelAtPeriodEnd: true,
        status: "active",
      })
    ).toEqual([{ type: "cancel_scheduled" }]);

    expect(
      subscriptionNotices({
        eventType: "customer.subscription.updated",
        previousPlan: "pro",
        nextPlan: "pro",
        previousCancelAtPeriodEnd: true,
        cancelAtPeriodEnd: false,
        status: "active",
      })
    ).toEqual([{ type: "resumed" }]);

    expect(
      subscriptionNotices({
        eventType: "customer.subscription.deleted",
        previousPlan: "pro",
        nextPlan: "basic",
        previousCancelAtPeriodEnd: true,
        cancelAtPeriodEnd: true,
        status: "canceled",
      })
    ).toEqual([{ type: "ended" }]);
  });

  it("explains the new monthly price when the plan changes", () => {
    const email = renderPlanChange({
      direction: "upgrade",
      kennelName: "Blue Moon",
      recipientName: "Chris",
      from: "pro",
      to: "premium",
      renewsOn,
      manageUrl,
    });

    expect(email.subject).toBe("You upgraded to Premium on TrueBreeds");
    expect(email.html).toContain("$69.99/month");
    expect(email.html).toContain("$99.99/month");
    expect(email.html).toContain("$30.00 more per month");
    expect(email.text).toContain("prorated");
  });

  it("confirms a scheduled cancellation, a resume, a failed payment, and the end of the membership", () => {
    const canceled = renderCancellationScheduled({
      kennelName: "Blue Moon",
      plan: "pro",
      accessUntil: renewsOn,
      manageUrl,
    });
    expect(canceled.subject).toContain("October 28, 2026");
    expect(canceled.html).toContain("$69.99/month");
    expect(canceled.html).toContain("Resume");
    expect(canceled.html).toContain("$297");

    const resumed = renderSubscriptionResumed({
      kennelName: "Blue Moon",
      plan: "pro",
      renewsOn,
      manageUrl,
    });
    expect(resumed.html).toContain("keep renewing");
    expect(resumed.html).toContain("October 28, 2026");

    const failed = renderPaymentFailed({
      kennelName: "Blue Moon",
      plan: "pro",
      amountDueCents: 6999,
      gracePeriodEndsAt: renewsOn,
      manageUrl,
    });
    expect(failed.subject).toContain("payment didn't go through");
    expect(failed.html).toContain("$69.99");
    expect(failed.html).toContain("October 28, 2026");

    const ended = renderSubscriptionEnded({
      kennelName: "Blue Moon",
      plan: "pro",
      manageUrl,
    });
    expect(ended.subject).toBe("Your TrueBreeds membership has ended");
    expect(ended.html).toContain("will not renew");
    expect(ended.html).toContain("Subscribe again");
  });
});
