import { describe, expect, it } from "vitest";
import { PLAN_LIST, SETUP_FEE, formatPlanPrice, formatSetupFee, isPlanTier } from "@/lib/plans";

describe("membership plans", () => {
  it("defines a $297 one-time setup fee", () => {
    expect(SETUP_FEE.unitAmount).toBe(29700);
    expect(formatSetupFee()).toBe("$297");
  });
  it("defines Basic, Pro, and Premium at the published prices", () => {
    expect(PLAN_LIST.map((p) => [p.id, p.unitAmount, formatPlanPrice(p)])).toEqual([
      ["basic", 4999, "$49.99"],
      ["pro", 6999, "$69.99"],
      ["premium", 9999, "$99.99"],
    ]);
  });

  it("accepts only known plan ids", () => {
    expect(isPlanTier("pro")).toBe(true);
    expect(isPlanTier("enterprise")).toBe(false);
    expect(isPlanTier(undefined)).toBe(false);
  });
});
