import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const constructEvent = vi.fn();
vi.mock("@/lib/stripe/client", () => ({
  stripe: { webhooks: { constructEvent } },
}));

const depositUpdate = vi.fn();
const depositUpdateMany = vi.fn();
const offspringUpdate = vi.fn();
const leadCreate = vi.fn();
const analyticsEventCreate = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    deposit: { update: depositUpdate, updateMany: depositUpdateMany },
    offspring: { update: offspringUpdate },
    lead: { create: leadCreate },
    analyticsEvent: { create: analyticsEventCreate },
  },
}));

const syncConnectAccountStatus = vi.fn();
vi.mock("@/lib/stripe/connect", () => ({ syncConnectAccountStatus }));

const sendDepositConfirmation = vi.fn();
vi.mock("@/lib/messenger/notifications", () => ({ sendDepositConfirmation }));

function makeRequest(body: string) {
  return new NextRequest("http://localhost/api/webhooks/stripe-connect", {
    method: "POST",
    headers: { "stripe-signature": "test-sig" },
    body,
  });
}

describe("POST /api/webhooks/stripe-connect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects requests with an invalid Stripe signature and touches no data", async () => {
    constructEvent.mockImplementation(() => {
      throw new Error("bad signature");
    });
    const { POST } = await import("@/app/api/webhooks/stripe-connect/route");

    const res = await POST(makeRequest("{}"));

    expect(res.status).toBe(400);
    expect(depositUpdate).not.toHaveBeenCalled();
  });

  it("marks the deposit paid, moves the offspring to deposit_received, and creates a lead when checkout completes", async () => {
    const deposit = {
      id: "dep-1",
      tenantId: "tenant-1",
      offspringId: "off-1",
      buyerName: "Jane Buyer",
      buyerEmail: "jane@example.com",
      buyerPhone: "555-1234",
      amount: 500,
      offspring: { name: "Willow", litter: {} },
    };
    depositUpdate.mockResolvedValue(deposit);
    constructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          metadata: { depositId: "dep-1" },
          payment_status: "paid",
          payment_intent: "pi_123",
        },
      },
    });

    const { POST } = await import("@/app/api/webhooks/stripe-connect/route");
    const res = await POST(makeRequest("{}"));

    expect(res.status).toBe(200);
    expect(depositUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "dep-1" },
        data: expect.objectContaining({ status: "paid", stripePaymentIntentId: "pi_123" }),
      })
    );
    expect(offspringUpdate).toHaveBeenCalledWith({
      where: { id: "off-1" },
      data: { status: "deposit_received" },
    });
    expect(leadCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: "tenant-1",
          name: "Jane Buyer",
          source: "deposit",
          status: "deposit",
          offspringId: "off-1",
        }),
      })
    );
    expect(analyticsEventCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tenantId: "tenant-1", type: "deposit_completed" }),
      })
    );
    expect(sendDepositConfirmation).toHaveBeenCalledWith(deposit);
  });

  it("does nothing for an unpaid checkout session (prevents crediting deposits that never actually paid)", async () => {
    constructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: { metadata: { depositId: "dep-1" }, payment_status: "unpaid" },
      },
    });

    const { POST } = await import("@/app/api/webhooks/stripe-connect/route");
    const res = await POST(makeRequest("{}"));

    expect(res.status).toBe(200);
    expect(depositUpdate).not.toHaveBeenCalled();
    expect(leadCreate).not.toHaveBeenCalled();
  });

  it("syncs Connect account status on account.updated", async () => {
    constructEvent.mockReturnValue({
      type: "account.updated",
      data: { object: { id: "acct_123" } },
    });

    const { POST } = await import("@/app/api/webhooks/stripe-connect/route");
    await POST(makeRequest("{}"));

    expect(syncConnectAccountStatus).toHaveBeenCalledWith("acct_123");
  });

  it("marks matching deposits refunded on charge.refunded", async () => {
    constructEvent.mockReturnValue({
      type: "charge.refunded",
      data: { object: { payment_intent: "pi_123" } },
    });

    const { POST } = await import("@/app/api/webhooks/stripe-connect/route");
    await POST(makeRequest("{}"));

    expect(depositUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { stripePaymentIntentId: "pi_123" },
        data: expect.objectContaining({ status: "refunded" }),
      })
    );
  });
});
