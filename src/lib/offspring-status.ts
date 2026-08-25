import type { OffspringStatus } from "@prisma/client";

/**
 * Canonical offspring status pipeline, in the order they're expected to
 * progress through a sale. Centralized here so the dashboard's status
 * selects and the `setOffspringStatus` server action can't drift apart.
 */
export const OFFSPRING_STATUSES: OffspringStatus[] = [
  "upcoming",
  "available",
  "deposit_received",
  "reserved",
  "sold",
  "kept",
];

export function isValidOffspringStatus(value: string): value is OffspringStatus {
  return (OFFSPRING_STATUSES as string[]).includes(value);
}
