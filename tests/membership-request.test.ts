import { describe, expect, it } from "vitest";
import { membershipRequestMessage, salesInquiryMessage } from "@/lib/membership-request";

describe("membershipRequestMessage", () => {
  it("includes contact details, the selected plan, and the timeline", () => {
    const message = membershipRequestMessage({
      name: "Ada <Lovelace>",
      email: "ada@example.com",
      phone: "555-0100",
      plan: "premium",
      timeline: "under-30-days",
      kennelName: "Willow Kennel",
      slug: "willow",
      accountEmail: "ada@truebreeds.test",
    });

    expect(message.subject).toBe("Membership request: Premium — Willow Kennel");
    expect(message.text).toContain("Name: Ada <Lovelace>");
    expect(message.text).toContain("Email: ada@example.com");
    expect(message.text).toContain("Phone: 555-0100");
    expect(message.text).toContain("Plan: Premium ($99.99/month plus $297 setup)");
    expect(message.text).toContain("How soon: < 30 days");
    expect(message.text).toContain("willow.truebreeds.com");
    expect(message.html).toContain("Ada &lt;Lovelace&gt;");
    expect(message.html).not.toContain("Ada <Lovelace>");
  });
});

describe("salesInquiryMessage", () => {
  it("includes the plan and what the breeder is interested in", () => {
    const message = salesInquiryMessage({
      name: "Ada <Lovelace>",
      email: "ada@example.com",
      phone: "555-0100",
      plan: "basic",
      message: "A landing page for our goats & sheep.",
    });

    expect(message.subject).toBe("New TrueBreeds inquiry — Ada <Lovelace>");
    expect(message.text).toContain("Plan: Basic ($49.99/month plus $297 setup)");
    expect(message.text).toContain("Interested in: A landing page for our goats & sheep.");
    expect(message.html).toContain("Ada &lt;Lovelace&gt;");
    expect(message.html).toContain("goats &amp; sheep");
  });

  it("allows a breeder who has not chosen a plan", () => {
    const message = salesInquiryMessage({
      name: "Grace",
      email: "grace@example.com",
      phone: "555-0101",
      plan: null,
      message: "Not sure which plan yet.",
    });

    expect(message.text).toContain("Plan: Not sure yet");
  });
});
