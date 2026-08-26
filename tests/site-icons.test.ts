import { describe, expect, it } from "vitest";
import { safePublicImageUrl, tenantSiteIcons } from "@/lib/site-icons";

describe("safePublicImageUrl", () => {
  it("accepts http(s) URLs", () => {
    expect(safePublicImageUrl("https://cdn.example.com/mark.png")).toBe(
      "https://cdn.example.com/mark.png"
    );
    expect(safePublicImageUrl("http://localhost:3002/icon.png")).toBe(
      "http://localhost:3002/icon.png"
    );
  });

  it("rejects non-http schemes and invalid values", () => {
    expect(safePublicImageUrl("javascript:alert(1)")).toBeNull();
    expect(safePublicImageUrl("not a url")).toBeNull();
    expect(safePublicImageUrl("")).toBeNull();
    expect(safePublicImageUrl(null)).toBeNull();
  });
});

describe("tenantSiteIcons", () => {
  it("prefers a dedicated favicon over the kennel logo", () => {
    expect(
      tenantSiteIcons("https://cdn.example.com/favicon.png", "https://cdn.example.com/logo.png")
    ).toEqual({
      icon: [{ url: "https://cdn.example.com/favicon.png" }],
      apple: [{ url: "https://cdn.example.com/favicon.png" }],
    });
  });

  it("falls back to the kennel logo", () => {
    expect(tenantSiteIcons(null, "https://cdn.example.com/logo.png")).toEqual({
      icon: [{ url: "https://cdn.example.com/logo.png" }],
      apple: [{ url: "https://cdn.example.com/logo.png" }],
    });
  });

  it("returns undefined so the platform favicon is inherited", () => {
    expect(tenantSiteIcons(null, null)).toBeUndefined();
  });
});
