import { describe, expect, it } from "vitest";
import {
  scopeArgsForTenant,
  filterUniqueResultForTenant,
  TENANT_SCOPE_VIOLATION_ERROR,
  TENANT_SCOPED_MODELS,
} from "@/lib/db";

const TENANT_A = "11111111-1111-1111-1111-111111111111";
const TENANT_B = "22222222-2222-2222-2222-222222222222";

describe("scopeArgsForTenant", () => {
  it("injects tenantId into where for findMany", () => {
    const args = scopeArgsForTenant("findMany", { where: { status: "available" } }, TENANT_A);
    expect(args.where).toEqual({ status: "available", tenantId: TENANT_A });
  });

  it("injects tenantId into where even when caller passes no where clause", () => {
    const args = scopeArgsForTenant("findMany", {}, TENANT_A);
    expect(args.where).toEqual({ tenantId: TENANT_A });
  });

  it("overwrites a maliciously/incorrectly supplied tenantId in where", () => {
    const args = scopeArgsForTenant(
      "findMany",
      { where: { tenantId: TENANT_B } },
      TENANT_A
    );
    expect(args.where).toEqual({ tenantId: TENANT_A });
  });

  it("scopes update/delete/updateMany/deleteMany via where", () => {
    for (const op of ["update", "updateMany", "delete", "deleteMany"]) {
      const args = scopeArgsForTenant(op, { where: { id: "row-1" } }, TENANT_A);
      expect(args.where).toEqual({ id: "row-1", tenantId: TENANT_A });
    }
  });

  it("stamps tenantId onto create data (single object)", () => {
    const args = scopeArgsForTenant("create", { data: { name: "Willow" } }, TENANT_A);
    expect(args.data).toEqual({ name: "Willow", tenantId: TENANT_A });
  });

  it("stamps tenantId onto create data (array form)", () => {
    const args = scopeArgsForTenant(
      "create",
      { data: [{ name: "Willow" }, { name: "Bear" }] },
      TENANT_A
    );
    expect(args.data).toEqual([
      { name: "Willow", tenantId: TENANT_A },
      { name: "Bear", tenantId: TENANT_A },
    ]);
  });

  it("stamps tenantId onto every row for createMany", () => {
    const args = scopeArgsForTenant(
      "createMany",
      { data: [{ name: "Willow" }, { name: "Bear" }] },
      TENANT_A
    );
    expect(args.data).toEqual([
      { name: "Willow", tenantId: TENANT_A },
      { name: "Bear", tenantId: TENANT_A },
    ]);
  });

  it("scopes upsert's where and stamps tenantId onto create", () => {
    const args = scopeArgsForTenant(
      "upsert",
      { where: { id: "row-1" }, create: { name: "New" }, update: { name: "Updated" } },
      TENANT_A
    );
    expect(args.where).toEqual({ id: "row-1", tenantId: TENANT_A });
    expect(args.create).toEqual({ name: "New", tenantId: TENANT_A });
    // update has no tenantId column to stamp — only `where` needs scoping,
    // since Prisma won't apply `update` to a row `where` doesn't match.
    expect(args.update).toEqual({ name: "Updated" });
  });

  it("does not mutate the original args object", () => {
    const original = { where: { status: "available" } };
    scopeArgsForTenant("findMany", original, TENANT_A);
    expect(original.where).toEqual({ status: "available" });
  });
});

describe("filterUniqueResultForTenant", () => {
  it("passes through a row belonging to the current tenant", () => {
    const row = { id: "row-1", tenantId: TENANT_A, name: "Willow" };
    expect(filterUniqueResultForTenant("findUnique", row, TENANT_A)).toEqual(row);
  });

  it("hides (returns null for) a row belonging to a different tenant on findUnique", () => {
    const row = { id: "row-1", tenantId: TENANT_B, name: "Willow" };
    expect(filterUniqueResultForTenant("findUnique", row, TENANT_A)).toBeNull();
  });

  it("throws on findUniqueOrThrow when the row belongs to a different tenant", () => {
    const row = { id: "row-1", tenantId: TENANT_B, name: "Willow" };
    expect(() => filterUniqueResultForTenant("findUniqueOrThrow", row, TENANT_A)).toThrow(
      TENANT_SCOPE_VIOLATION_ERROR
    );
  });

  it("passes through null results untouched (record not found)", () => {
    expect(filterUniqueResultForTenant("findUnique", null, TENANT_A)).toBeNull();
  });

  it("passes through results without a tenantId column untouched", () => {
    const row = { id: "row-1", name: "no tenant column here" };
    expect(filterUniqueResultForTenant("findUnique", row, TENANT_A)).toEqual(row);
  });
});

describe("TENANT_SCOPED_MODELS", () => {
  it("includes every model that stores tenant-owned data", () => {
    for (const model of [
      "Animal",
      "Litter",
      "Offspring",
      "Lead",
      "WaitlistEntry",
      "Deposit",
      "AffiliateProduct",
      "SocialConnection",
      "SocialPost",
    ]) {
      expect(TENANT_SCOPED_MODELS.has(model)).toBe(true);
    }
  });

  it("does not scope the Tenant model itself (it IS the tenant, not tenant-owned)", () => {
    expect(TENANT_SCOPED_MODELS.has("Tenant")).toBe(false);
  });
});
