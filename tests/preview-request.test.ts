import { describe, expect, it } from "vitest";
import { PREVIEW_HEADER, previewRequestHeaders } from "@/lib/preview";

describe("previewRequestHeaders", () => {
  it("forwards preview context on the request the site page can read", () => {
    const incoming = new Headers({ cookie: "sb=1" });
    const headers = previewRequestHeaders(incoming, { id: "ten_1", slug: "aviator-doxies" });

    expect(headers.get(PREVIEW_HEADER)).toBe("1");
    expect(headers.get("x-truebreeds-tenant-slug")).toBe("aviator-doxies");
    expect(headers.get("x-truebreeds-tenant-id")).toBe("ten_1");
    expect(headers.get("cookie")).toBe("sb=1");
    expect(incoming.get(PREVIEW_HEADER)).toBeNull();
  });
});