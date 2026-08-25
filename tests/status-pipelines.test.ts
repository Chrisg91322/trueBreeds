import { describe, expect, it } from "vitest";
import { OFFSPRING_STATUSES, isValidOffspringStatus } from "@/lib/offspring-status";
import { LEAD_STATUSES, isValidLeadStatus } from "@/lib/lead-status";

describe("offspring status pipeline", () => {
  it("accepts every canonical status", () => {
    for (const status of OFFSPRING_STATUSES) {
      expect(isValidOffspringStatus(status)).toBe(true);
    }
  });

  it("rejects unknown or empty statuses", () => {
    expect(isValidOffspringStatus("adopted")).toBe(false);
    expect(isValidOffspringStatus("")).toBe(false);
    expect(isValidOffspringStatus("Sold")).toBe(false); // case-sensitive
  });

  it("progresses in the expected sale order", () => {
    expect(OFFSPRING_STATUSES).toEqual([
      "upcoming",
      "available",
      "deposit_received",
      "reserved",
      "sold",
      "kept",
    ]);
  });
});

describe("lead CRM status pipeline", () => {
  it("accepts every canonical status", () => {
    for (const status of LEAD_STATUSES) {
      expect(isValidLeadStatus(status)).toBe(true);
    }
  });

  it("rejects unknown or empty statuses", () => {
    expect(isValidLeadStatus("won")).toBe(false);
    expect(isValidLeadStatus("")).toBe(false);
  });

  it("progresses in the expected CRM order", () => {
    expect(LEAD_STATUSES).toEqual([
      "new",
      "contacted",
      "approved",
      "deposit",
      "sold",
      "archived",
    ]);
  });
});
