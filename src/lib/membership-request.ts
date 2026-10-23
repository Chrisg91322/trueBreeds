import { formatPlanPrice, getPlan, type PlanTier } from "@/lib/plans";

export const SUPPORT_EMAIL = "support@truebreeds.com";

export const MEMBERSHIP_TIMELINES = [
  { id: "under-30-days", label: "< 30 days" },
  { id: "1-3-months", label: "1–3 months" },
  { id: "over-3-months", label: "> 3 months" },
] as const;

export type MembershipTimeline = (typeof MEMBERSHIP_TIMELINES)[number]["id"];

export function isMembershipTimeline(value: unknown): value is MembershipTimeline {
  return MEMBERSHIP_TIMELINES.some((item) => item.id === value);
}

export function membershipTimelineLabel(id: MembershipTimeline) {
  return MEMBERSHIP_TIMELINES.find((item) => item.id === id)?.label ?? id;
}

export function membershipRequestMessage(input: {
  name: string;
  email: string;
  phone: string;
  plan: PlanTier;
  timeline: MembershipTimeline;
  kennelName: string;
  slug: string;
  accountEmail: string;
}) {
  const plan = getPlan(input.plan);
  const lines = [
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone}`,
    `Plan: ${plan.name} (${formatPlanPrice(plan)}/month plus $297 setup)`,
    `How soon: ${membershipTimelineLabel(input.timeline)}`,
    `Kennel: ${input.kennelName} (${input.slug}.truebreeds.com)`,
    `Account: ${input.accountEmail}`,
  ];
  return {
    subject: `Membership request: ${plan.name} — ${input.kennelName}`,
    text: lines.join("\n"),
    html: `<p>New membership request from onboarding.</p><ul>${lines
      .map((line) => `<li>${escapeHtml(line)}</li>`)
      .join("")}</ul>`,
  };
}

export function salesInquiryMessage(input: {
  name: string;
  email: string;
  phone: string;
  plan: PlanTier | null;
  message: string;
}) {
  const planLine = input.plan
    ? `${getPlan(input.plan).name} (${formatPlanPrice(getPlan(input.plan))}/month plus $297 setup)`
    : "Not sure yet";
  const lines = [
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone}`,
    `Plan: ${planLine}`,
    `Interested in: ${input.message}`,
  ];
  return {
    subject: `New TrueBreeds inquiry — ${input.name}`,
    text: lines.join("\n"),
    html: `<p>New inquiry from the public contact form.</p><ul>${lines
      .map((line) => `<li>${escapeHtml(line)}</li>`)
      .join("")}</ul>`,
  };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
