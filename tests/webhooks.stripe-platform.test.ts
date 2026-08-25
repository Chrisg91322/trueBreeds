import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const constructEvent = vi.fn();
vi.mock("@/lib/stripe/client", () => ({
  stripe: { webhooks: { constructEvent } },
}));

const platformSubscriptionUpdate = vi.fn();
const platformSubscriptionFindUnique = vi.fn();
const tenantUpdate = vi.fn();
const onboardingProgressUpsert = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    platformSubscription: {
      update: platformSubscriptionUpdate,
      findUnique: platformSubscriptionFindUnique,
    },
    tenant: { update: tenantUpdate },
    onboardingProgress: { upsert: onboardingProgressUpsert },
  },
}));

const startGracePeriod = vi.fn();
const reactivateTenant = vi.fn();
vi.mock("@/lib/stripe/platform-billing", () => ({ startGracePeriod, reactivateTenant }));

function makeRequest(body: string) {
  return new NextRequest("http://localhost/api/webhooks/stripe", {
    method: "POST",
    headers: { "stripe-signature": "test-sig" },
    body,
  });
}

describe("POST /api/webhooks/stripe (platform billing)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects requests with an invalid Stripe signature", async () => {
    constructEvent.mockImplementation(() => {
      throw new Error("bad signature");
    });
    const { POST } = await import("@/app/api/webhooks/stripe/route");

    const res = await POST(makeRequest("{}"));

    expect(res.status).toBe(400);
    expect(platformSubscriptionUpdate).not.toHaveBeenCalled();
  });

  it("activates the tenant and marks billing complete on setup+subscription checkout completion", async () => {
    constructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          metadata: { kind: "platform_setup_and_subscription", tenantId: "tenant-1" },
          subscription: "sub_123",
        },
      },
    });

    const { POST } = await import("@/app/api/webhooks/stripe/route");
    await POST(makeRequest("{}"));

    expect(platformSubscriptionUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: "tenant-1" },
        data: expect.objectContaining({
          setupFeePaid: true,
          stripeSubscriptionId: "sub_123",
          status: "active",
        }),
      })
    );
    expect(tenantUpdate).toHaveBeenCalledWith({
      where: { id: "tenant-1" },
      data: { status: "active" },
    });
    expect(onboardingProgressUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: "tenant-1" } })
    );
  });

  it("ignores checkout.session.completed events for unrelated products", async () => {
    constructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: { object: { metadata: { kind: "deposit" } } },
    });

    const { POST } = await import("@/app/api/webhooks/stripe/route");
    await POST(makeRequest("{}"));

    expect(platformSubscriptionUpdate).not.toHaveBeenCalled();
  });

  it("starts the grace period when a subscription invoice payment fails", async () => {
    platformSubscriptionFindUnique.mockResolvedValue({ tenantId: "tenant-1" });
    constructEvent.mockReturnValue({
      type: "invoice.payment_failed",
      data: { object: { customer: "cus_123" } },
    });

    const { POST } = await import("@/app/api/webhooks/stripe/route");
    await POST(makeRequest("{}"));

    expect(startGracePeriod).toHaveBeenCalledWith("tenant-1");
  });

  it("reactivates a tenant recovering from grace_period after a successful payment", async () => {
    platformSubscriptionFindUnique.mockResolvedValue({
      tenantId: "tenant-1",
      status: "grace_period",
    });
    constructEvent.mockReturnValue({
      type: "invoice.payment_succeeded",
      data: { object: { customer: "cus_123" } },
    });

    const { POST } = await import("@/app/api/webhooks/stripe/route");
    await POST(makeRequest("{}"));

    expect(reactivateTenant).toHaveBeenCalledWith("tenant-1");
  });

  it("does not re-run reactivation for a subscription that is already active", async () => {
    platformSubscriptionFindUnique.mockResolvedValue({ tenantId: "tenant-1", status: "active" });
    constructEvent.mockReturnValue({
      type: "invoice.payment_succeeded",
      data: { object: { customer: "cus_123" } },
    });

    const { POST } = await import("@/app/api/webhooks/stripe/route");
    await POST(makeRequest("{}"));

    expect(reactivateTenant).not.toHaveBeenCalled();
  });
});
