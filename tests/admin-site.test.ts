import { describe, expect, it } from "vitest";
import { websiteCreateBlock, websiteSlugFromName } from "@/lib/admin-site";

describe("websiteSlugFromName", () => {
  it("builds a lowercase site address from the kennel name", () => {
    expect(websiteSlugFromName("Willow Creek Farm")).toBe("willow-creek-farm");
  });

  it("drops characters that cannot be in a site address", () => {
    expect(websiteSlugFromName("  Ada's Livestock!! ")).toBe("adas-livestock");
  });
});

describe("websiteCreateBlock", () => {
  it("blocks a site address that is already taken", () => {
    expect(websiteCreateBlock({ slugTaken: true, emailTaken: false })).toBe(
      "That site address is already taken.",
    );
  });

  it("blocks an email that already has a login", () => {
    expect(websiteCreateBlock({ slugTaken: false, emailTaken: true })).toBe(
      "That email already has a login.",
    );
  });

  it("allows a new site address and email", () => {
    expect(websiteCreateBlock({ slugTaken: false, emailTaken: false })).toBeNull();
  });
});
