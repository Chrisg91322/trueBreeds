import type { LeadStatus } from "@prisma/client";

/**
 * Canonical lead CRM pipeline stages, in expected progression order.
 * Centralized so the dashboard's status select and `updateLeadStatus`
 * server action can't drift apart.
 */
export const LEAD_STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "approved",
  "deposit",
  "sold",
  "archived",
];

export function isValidLeadStatus(value: string): value is LeadStatus {
  return (LEAD_STATUSES as string[]).includes(value);
}
