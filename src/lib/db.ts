import { Prisma, type PrismaClient } from "@prisma/client";
import { prisma } from "./prisma";

/**
 * Defense-in-depth tenant isolation.
 *
 * This is layer 1 of 2:
 *  1. Application layer (this file) — every query issued through the client
 *     returned by `forTenant(tenantId)` is automatically scoped to that
 *     tenant, regardless of what `where`/`data` the caller passes in.
 *  2. Database layer (prisma/rls.sql) — Postgres Row-Level Security policies
 *     that reject cross-tenant reads/writes even if application code has a
 *     bug, *provided* the DB role used by `DATABASE_URL` does not have
 *     BYPASSRLS (see prisma/rls.sql for setup notes).
 *
 * `tests/tenant-isolation.test.ts` asserts tenant A can never see tenant B's
 * rows through this client.
 */

export const TENANT_SCOPED_MODELS = new Set([
  "TenantMember",
  "TenantInvite",
  "Animal",
  "Litter",
  "Offspring",
  "Media",
  "Lead",
  "WaitlistEntry",
  "Testimonial",
  "FaqItem",
  "PlatformSubscription",
  "StripeConnectAccount",
  "Deposit",
  "BalanceInvoice",
  "AmazonSettings",
  "AffiliateProduct",
  "AffiliateClick",
  "SocialConnection",
  "SocialPost",
  "AnalyticsEvent",
  "OnboardingProgress",
]);

export const TENANT_SCOPE_VIOLATION_ERROR = "TENANT_SCOPE_VIOLATION";

/** Operations handled by rewriting `args` before the query runs. */
const ARGS_SCOPED_OPERATIONS = new Set([
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "count",
  "aggregate",
  "groupBy",
  "update",
  "updateMany",
  "delete",
  "deleteMany",
  "upsert",
  "create",
  "createMany",
]);

/**
 * Pure function: given a Prisma operation + its args, returns args rewritten
 * so the query can only touch rows belonging to `tenantId`. Exported
 * separately from `forTenant()` so it can be unit tested without a real
 * database connection (see `tests/tenant-isolation.test.ts`).
 */
export function scopeArgsForTenant(
  operation: string,
  args: unknown,
  tenantId: string
): Record<string, unknown> {
  const a = { ...((args as Record<string, unknown>) ?? {}) };

  const withTenant = (where: unknown) => ({
    ...((where as Record<string, unknown>) ?? {}),
    tenantId,
  });

  switch (operation) {
    case "findFirst":
    case "findFirstOrThrow":
    case "findMany":
    case "count":
    case "aggregate":
    case "groupBy":
    case "update":
    case "updateMany":
    case "delete":
    case "deleteMany": {
      a.where = withTenant(a.where);
      return a;
    }
    case "upsert": {
      a.where = withTenant(a.where);
      a.create = { ...((a.create as Record<string, unknown>) ?? {}), tenantId };
      return a;
    }
    case "create": {
      a.data = Array.isArray(a.data)
        ? a.data.map((d) => ({ ...d, tenantId }))
        : { ...((a.data as Record<string, unknown>) ?? {}), tenantId };
      return a;
    }
    case "createMany": {
      const data = a.data as unknown;
      a.data = Array.isArray(data)
        ? data.map((d) => ({ ...(d as Record<string, unknown>), tenantId }))
        : data;
      return a;
    }
    default:
      return a;
  }
}

/**
 * Pure function: given the result of a findUnique(OrThrow), returns it
 * unchanged if it belongs to `tenantId`, or hides it (null / throw)
 * otherwise. findUnique can't be scoped via `where` without breaking its
 * unique-constraint lookup, so we filter the result instead.
 */
export function filterUniqueResultForTenant<T>(
  operation: "findUnique" | "findUniqueOrThrow",
  result: T,
  tenantId: string
): T | null {
  const belongsToOtherTenant =
    !!result &&
    typeof result === "object" &&
    "tenantId" in (result as object) &&
    (result as { tenantId?: string }).tenantId !== tenantId;

  if (!belongsToOtherTenant) return result;

  if (operation === "findUniqueOrThrow") {
    throw new Error(TENANT_SCOPE_VIOLATION_ERROR);
  }
  return null;
}

export function forTenant(tenantId: string) {
  if (!tenantId) {
    throw new Error("forTenant() requires a non-empty tenantId");
  }

  return prisma.$extends({
    name: `tenant-scope`,
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (!model || !TENANT_SCOPED_MODELS.has(model)) {
            return query(args);
          }

          if (operation === "findUnique" || operation === "findUniqueOrThrow") {
            const result = await query(args);
            return filterUniqueResultForTenant(operation, result, tenantId);
          }

          if (!ARGS_SCOPED_OPERATIONS.has(operation)) {
            return query(args);
          }

          return query(scopeArgsForTenant(operation, args, tenantId));
        },
      },
    },
  });
}

export type TenantScopedClient = ReturnType<typeof forTenant>;

/**
 * Runs `callback` inside a transaction with the Postgres session variable
 * `app.tenant_id` set for the duration of the transaction, so that the RLS
 * policies in prisma/rls.sql can enforce isolation at the database layer.
 * Combine with `forTenant()` for both layers of defense.
 */
export async function withTenantRls<T>(
  tenantId: string,
  callback: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.tenant_id', ${tenantId}, true)`;
    return callback(tx);
  });
}

export type { PrismaClient };
