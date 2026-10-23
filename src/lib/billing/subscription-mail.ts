import { formatPlanPrice, getPlan, PLANS, SETUP_FEE, type PlanTier } from "@/lib/plans";

export const BILLING_SUPPORT_EMAIL = "support@truebreeds.com";

export type ReceiptKind = "purchase" | "renewal" | "plan_change";

export type MoneyLine = {
  description: string;
  amountCents: number;
  note?: string;
};

export type SubscriptionReceiptContent = {
  kind: ReceiptKind;
  kennelName: string;
  recipientName?: string | null;
  planName: string;
  monthlyPriceLabel: string;
  invoiceNumber?: string | null;
  paidAt: Date;
  lines: MoneyLine[];
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
  currency?: string;
  renewsOn?: Date | null;
  hostedInvoiceUrl?: string | null;
  manageUrl: string;
};

export type PlanChangeContent = {
  direction: "upgrade" | "downgrade";
  kennelName: string;
  recipientName?: string | null;
  from: PlanTier;
  to: PlanTier;
  renewsOn?: Date | null;
  manageUrl: string;
};

export type CancelScheduledContent = {
  kennelName: string;
  recipientName?: string | null;
  plan: PlanTier;
  accessUntil?: Date | null;
  manageUrl: string;
};

export type SubscriptionEndedContent = {
  kennelName: string;
  recipientName?: string | null;
  plan: PlanTier;
  manageUrl: string;
};

export type PaymentFailedContent = {
  kennelName: string;
  recipientName?: string | null;
  plan: PlanTier;
  amountDueCents?: number | null;
  currency?: string;
  gracePeriodEndsAt?: Date | null;
  manageUrl: string;
};

export type ResumedContent = {
  kennelName: string;
  recipientName?: string | null;
  plan: PlanTier;
  renewsOn?: Date | null;
  manageUrl: string;
};

export type RenderedEmail = {
  subject: string;
  html: string;
  text: string;
};

export type SubscriptionNotice =
  | { type: "upgrade" | "downgrade"; from: PlanTier; to: PlanTier }
  | { type: "cancel_scheduled" }
  | { type: "resumed" }
  | { type: "ended" };

export function subscriptionNotices(input: {
  eventType: "customer.subscription.updated" | "customer.subscription.deleted";
  previousPlan: PlanTier;
  nextPlan: PlanTier | null;
  previousCancelAtPeriodEnd: boolean;
  cancelAtPeriodEnd: boolean;
  status: string;
}): SubscriptionNotice[] {
  const ended =
    input.eventType === "customer.subscription.deleted" || input.status === "canceled";
  if (ended) return [{ type: "ended" }];

  const notices: SubscriptionNotice[] = [];
  if (!input.previousCancelAtPeriodEnd && input.cancelAtPeriodEnd) {
    notices.push({ type: "cancel_scheduled" });
  } else if (input.previousCancelAtPeriodEnd && !input.cancelAtPeriodEnd) {
    notices.push({ type: "resumed" });
  }

  if (input.nextPlan && input.nextPlan !== input.previousPlan) {
    const fromPrice = PLANS[input.previousPlan].monthlyPrice;
    const toPrice = PLANS[input.nextPlan].monthlyPrice;
    notices.push({
      type: toPrice > fromPrice ? "upgrade" : "downgrade",
      from: input.previousPlan,
      to: input.nextPlan,
    });
  }

  return notices;
}

export function receiptKindForBillingReason(reason: string | null | undefined): ReceiptKind | null {
  if (reason === "subscription_create" || reason === "subscription") return "purchase";
  if (reason === "subscription_cycle") return "renewal";
  if (reason === "subscription_update") return "plan_change";
  return null;
}

export function formatMoney(cents: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export function formatBillingDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function renderSubscriptionReceipt(content: SubscriptionReceiptContent): RenderedEmail {
  const currency = content.currency || "usd";
  const money = (cents: number) => formatMoney(cents, currency);
  const greeting = greetingLine(content.recipientName, content.kennelName);
  const renews = content.renewsOn ? formatBillingDate(content.renewsOn) : null;
  const total = money(content.totalCents);
  const subject =
    content.kind === "renewal"
      ? `Your TrueBreeds receipt — ${content.planName} renewal`
      : content.kind === "plan_change"
        ? `Your TrueBreeds receipt — ${content.planName} plan change`
        : `Your TrueBreeds receipt — ${content.planName} membership`;

  const lead =
    content.kind === "purchase"
      ? `Thanks for subscribing. This receipt confirms ${escapeHtml(content.kennelName)}'s ${escapeHtml(content.planName)} membership.`
      : content.kind === "renewal"
        ? `Your ${escapeHtml(content.planName)} membership renewed. Here's what was charged.`
        : `Your membership changed to ${escapeHtml(content.planName)}. This receipt shows the prorated charge or credit for the rest of this billing period.`;

  const nextCharge = renews
    ? `${escapeHtml(content.planName)} renews on ${renews} at ${escapeHtml(content.monthlyPriceLabel)}/month until you change or cancel it.`
    : `${escapeHtml(content.planName)} renews monthly at ${escapeHtml(content.monthlyPriceLabel)}/month until you change or cancel it.`;

  const rows = content.lines
    .map(
      (line) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #eee;vertical-align:top">
            ${escapeHtml(line.description)}
            ${line.note ? `<div style="color:#777;font-size:12px;margin-top:2px">${escapeHtml(line.note)}</div>` : ""}
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;vertical-align:top;white-space:nowrap">${money(line.amountCents)}</td>
        </tr>`
    )
    .join("");

  const summary = [
    summaryRow("Subtotal", money(content.subtotalCents)),
    content.discountCents > 0 ? summaryRow("Discount", `-${money(content.discountCents)}`) : "",
    content.taxCents > 0 ? summaryRow("Tax", money(content.taxCents)) : "",
    summaryRow("Total paid", total, true),
  ].join("");

  const invoiceMeta = [
    content.invoiceNumber ? `Receipt ${escapeHtml(content.invoiceNumber)}` : null,
    formatBillingDate(content.paidAt),
  ]
    .filter(Boolean)
    .join(" · ");

  const html = platformShell({
    preheader: `${content.planName} membership · ${total} paid`,
    bodyHtml: `
      <h2 style="margin:0 0 8px">${content.kind === "purchase" ? "You're subscribed" : "Payment receipt"}</h2>
      <p style="margin:0 0 4px">${escapeHtml(greeting)}</p>
      <p style="margin:0 0 16px">${lead}</p>
      <p style="margin:0 0 8px;font-size:13px;color:#777">${invoiceMeta}</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px">
        ${rows}
        ${summary}
      </table>
      <p style="margin:16px 0 0">${nextCharge}</p>
      ${content.hostedInvoiceUrl ? `<p style="margin:12px 0 0"><a href="${escapeAttr(content.hostedInvoiceUrl)}" style="color:#7C5C42">View or download the Stripe invoice</a></p>` : ""}
      ${manageBlockHtml("active", content.manageUrl, renews)}
    `,
  });

  const textLines = [
    greeting.replace(/<[^>]+>/g, ""),
    strip(lead),
    invoiceMeta,
    "",
    ...content.lines.map((line) => `${line.description}${line.note ? ` (${line.note})` : ""}: ${money(line.amountCents)}`),
    `Subtotal: ${money(content.subtotalCents)}`,
    content.discountCents > 0 ? `Discount: -${money(content.discountCents)}` : "",
    content.taxCents > 0 ? `Tax: ${money(content.taxCents)}` : "",
    `Total paid: ${total}`,
    "",
    strip(nextCharge),
    content.hostedInvoiceUrl ? `Invoice: ${content.hostedInvoiceUrl}` : "",
    "",
    manageBlockText("active", content.manageUrl, renews),
  ].filter((line) => line !== "");

  return { subject, html, text: textLines.join("\n") };
}

export function renderPlanChange(content: PlanChangeContent): RenderedEmail {
  const from = getPlan(content.from);
  const to = getPlan(content.to);
  const delta = to.monthlyPrice - from.monthlyPrice;
  const deltaLabel =
    delta > 0
      ? `${formatMoney(Math.round(delta * 100))} more per month`
      : `${formatMoney(Math.round(Math.abs(delta) * 100))} less per month`;
  const verb = content.direction === "upgrade" ? "upgraded to" : "switched to";
  const subject =
    content.direction === "upgrade"
      ? `You upgraded to ${to.name} on TrueBreeds`
      : `You switched to ${to.name} on TrueBreeds`;
  const renews = content.renewsOn ? formatBillingDate(content.renewsOn) : null;
  const greeting = greetingLine(content.recipientName, content.kennelName);

  const html = platformShell({
    preheader: `${from.name} ${formatPlanPrice(from)}/month → ${to.name} ${formatPlanPrice(to)}/month`,
    bodyHtml: `
      <h2 style="margin:0 0 8px">You ${verb} ${escapeHtml(to.name)}</h2>
      <p style="margin:0 0 16px">${escapeHtml(greeting)} ${escapeHtml(content.kennelName)}'s membership is now ${escapeHtml(to.name)}. This change is in effect now.</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px">
        ${summaryRow(`Previous · ${escapeHtml(from.name)}`, `${formatPlanPrice(from)}/month`)}
        ${summaryRow(`New · ${escapeHtml(to.name)}`, `${formatPlanPrice(to)}/month`)}
        ${summaryRow("Difference", escapeHtml(deltaLabel), true)}
      </table>
      <p style="margin:16px 0 0">Any prorated charge or credit for the rest of this period is emailed as its own receipt. ${renews ? `The new price is billed on ${renews}.` : "The new price is billed on your next renewal."}</p>
      ${manageBlockHtml("active", content.manageUrl, renews)}
    `,
  });

  const text = [
    `You ${verb} ${to.name}`,
    strip(greeting),
    `${content.kennelName}'s membership is now ${to.name}. This change is in effect now.`,
    `Previous: ${from.name} at ${formatPlanPrice(from)}/month`,
    `New: ${to.name} at ${formatPlanPrice(to)}/month`,
    `Difference: ${deltaLabel}`,
    renews ? `Next billing date: ${renews}` : "The new price is billed on your next renewal.",
    "Any prorated charge or credit arrives on a separate receipt.",
    "",
    manageBlockText("active", content.manageUrl, renews),
  ].join("\n");

  return { subject, html, text };
}

export function renderCancellationScheduled(content: CancelScheduledContent): RenderedEmail {
  const plan = getPlan(content.plan);
  const until = content.accessUntil ? formatBillingDate(content.accessUntil) : null;
  const subject = until
    ? `Your TrueBreeds ${plan.name} membership will cancel on ${until}`
    : `Your TrueBreeds ${plan.name} membership is set to cancel`;
  const greeting = greetingLine(content.recipientName, content.kennelName);
  const access = until
    ? `You'll keep ${escapeHtml(plan.name)} access through ${until}. You won't be charged ${formatPlanPrice(plan)}/month after that.`
    : `You'll keep ${escapeHtml(plan.name)} access through the end of the period you've already paid. You won't be charged ${formatPlanPrice(plan)}/month after that.`;

  const html = platformShell({
    preheader: until ? `Access continues through ${until}` : "Your membership is set to cancel",
    bodyHtml: `
      <h2 style="margin:0 0 8px">Cancellation scheduled</h2>
      <p style="margin:0 0 12px">${escapeHtml(greeting)} you asked to cancel ${escapeHtml(content.kennelName)}'s ${escapeHtml(plan.name)} membership (${formatPlanPrice(plan)}/month).</p>
      <p style="margin:0 0 12px">${access}</p>
      <p style="margin:0">The $${SETUP_FEE.amount} setup fee from your original checkout is not refunded, except where the law requires it. You can resume this plan before it ends and keep the same billing date.</p>
      ${manageBlockHtml("canceling", content.manageUrl, until)}
    `,
  });

  return {
    subject,
    html,
    text: [
      "Cancellation scheduled",
      strip(greeting),
      `You asked to cancel ${content.kennelName}'s ${plan.name} membership (${formatPlanPrice(plan)}/month).`,
      strip(access),
      `The $${SETUP_FEE.amount} setup fee is not refunded, except where the law requires it.`,
      "You can resume this plan before it ends and keep the same billing date.",
      "",
      manageBlockText("canceling", content.manageUrl, until),
    ].join("\n"),
  };
}

export function renderSubscriptionEnded(content: SubscriptionEndedContent): RenderedEmail {
  const plan = getPlan(content.plan);
  const greeting = greetingLine(content.recipientName, content.kennelName);
  const html = platformShell({
    preheader: `Your ${plan.name} membership has ended`,
    bodyHtml: `
      <h2 style="margin:0 0 8px">Your membership has ended</h2>
      <p style="margin:0 0 12px">${escapeHtml(greeting)} ${escapeHtml(content.kennelName)}'s ${escapeHtml(plan.name)} membership (${formatPlanPrice(plan)}/month) is canceled and will not renew.</p>
      <p style="margin:0">The $${SETUP_FEE.amount} setup fee from your original checkout is not refunded, except where the law requires it. You can subscribe again whenever you're ready.</p>
      ${manageBlockHtml("ended", content.manageUrl, null)}
    `,
  });

  return {
    subject: "Your TrueBreeds membership has ended",
    html,
    text: [
      "Your membership has ended",
      `${content.kennelName}'s ${plan.name} membership (${formatPlanPrice(plan)}/month) is canceled and will not renew.`,
      `The $${SETUP_FEE.amount} setup fee is not refunded, except where the law requires it.`,
      "You can subscribe again whenever you're ready.",
      "",
      manageBlockText("ended", content.manageUrl, null),
    ].join("\n"),
  };
}

export function renderPaymentFailed(content: PaymentFailedContent): RenderedEmail {
  const plan = getPlan(content.plan);
  const greeting = greetingLine(content.recipientName, content.kennelName);
  const amount =
    typeof content.amountDueCents === "number"
      ? formatMoney(content.amountDueCents, content.currency || "usd")
      : formatPlanPrice(plan);
  const deadline = content.gracePeriodEndsAt ? formatBillingDate(content.gracePeriodEndsAt) : null;
  const html = platformShell({
    preheader: deadline ? `Update your card by ${deadline}` : "Update your card to keep your site online",
    bodyHtml: `
      <h2 style="margin:0 0 8px">We couldn't process your payment</h2>
      <p style="margin:0 0 12px">${escapeHtml(greeting)} the payment of <strong>${amount}</strong> for ${escapeHtml(content.kennelName)}'s ${escapeHtml(plan.name)} membership didn't go through.</p>
      <p style="margin:0">${deadline ? `Update your card by ${deadline} and your site stays online.` : "Update your card and your site stays online."} Your kennel data is kept either way. After the grace period, the site is suspended until the payment succeeds.</p>
      ${manageBlockHtml("past_due", content.manageUrl, deadline)}
    `,
  });

  return {
    subject: "Action needed: your TrueBreeds payment didn't go through",
    html,
    text: [
      "We couldn't process your payment",
      `The payment of ${amount} for ${content.kennelName}'s ${plan.name} membership didn't go through.`,
      deadline
        ? `Update your card by ${deadline} and your site stays online.`
        : "Update your card and your site stays online.",
      "Your kennel data is kept either way.",
      "",
      manageBlockText("past_due", content.manageUrl, deadline),
    ].join("\n"),
  };
}

export function renderSubscriptionResumed(content: ResumedContent): RenderedEmail {
  const plan = getPlan(content.plan);
  const renews = content.renewsOn ? formatBillingDate(content.renewsOn) : null;
  const greeting = greetingLine(content.recipientName, content.kennelName);
  const html = platformShell({
    preheader: `${plan.name} will keep renewing at ${formatPlanPrice(plan)}/month`,
    bodyHtml: `
      <h2 style="margin:0 0 8px">Your membership will keep renewing</h2>
      <p style="margin:0 0 12px">${escapeHtml(greeting)} you resumed ${escapeHtml(content.kennelName)}'s ${escapeHtml(plan.name)} membership.</p>
      <p style="margin:0">${renews ? `It renews on ${renews} at ${formatPlanPrice(plan)}/month.` : `It renews at ${formatPlanPrice(plan)}/month.`} You can still upgrade, downgrade, or cancel from Billing.</p>
      ${manageBlockHtml("active", content.manageUrl, renews)}
    `,
  });

  return {
    subject: `Your TrueBreeds ${plan.name} membership will keep renewing`,
    html,
    text: [
      "Your membership will keep renewing",
      `You resumed ${content.kennelName}'s ${plan.name} membership.`,
      renews
        ? `It renews on ${renews} at ${formatPlanPrice(plan)}/month.`
        : `It renews at ${formatPlanPrice(plan)}/month.`,
      "",
      manageBlockText("active", content.manageUrl, renews),
    ].join("\n"),
  };
}

function greetingLine(recipientName: string | null | undefined, kennelName: string) {
  const name = recipientName?.trim().split(/\s+/)[0];
  if (name) return `Hi ${name},`;
  return `Hi ${kennelName},`;
}

function summaryRow(label: string, value: string, strong = false) {
  const weight = strong ? "font-weight:700" : "color:#555";
  return `
    <tr>
      <td style="padding:8px 0;${weight}">${label}</td>
      <td style="padding:8px 0;text-align:right;${weight};white-space:nowrap">${value}</td>
    </tr>`;
}

function manageBlockHtml(
  mode: "active" | "canceling" | "ended" | "past_due",
  manageUrl: string,
  dateLabel: string | null
) {
  const items =
    mode === "canceling"
      ? `<li style="margin:0 0 8px"><strong>Resume</strong> before ${dateLabel ? dateLabel : "the membership ends"} from Billing. You'll stay on the same plan and billing date.</li>
         <li style="margin:0 0 8px"><strong>Upgrade or downgrade</strong> only after you resume. Plan changes are prorated, and the difference is emailed as a receipt.</li>`
      : mode === "ended"
        ? `<li style="margin:0 0 8px"><strong>Subscribe again</strong> from Billing. You'll choose Basic, Pro, or Premium and get a new receipt by email.</li>`
        : mode === "past_due"
          ? `<li style="margin:0 0 8px"><strong>Update your card</strong> from Billing. A successful payment emails you a receipt and restores the membership.</li>
             <li style="margin:0 0 8px"><strong>Upgrade, downgrade, or cancel</strong> from the same page once the payment succeeds.</li>`
          : `<li style="margin:0 0 8px"><strong>Upgrade or downgrade</strong> any time from Billing. The new monthly price starts immediately, we email a confirmation, and any prorated charge or credit arrives as its own receipt.</li>
             <li style="margin:0 0 8px"><strong>Cancel</strong> any time from Billing. You keep access through ${dateLabel ? dateLabel : "the end of the period you've already paid"}, and you aren't charged again after that.</li>
             <li style="margin:0"><strong>Failed renewals</strong> give you 14 days to update your card. Your site stays online during that time, and your kennel data is never deleted.</li>`;

  const setupNote =
    mode === "active"
      ? `<p style="margin:12px 0 0;font-size:13px;color:#666">The $${SETUP_FEE.amount} setup fee is a one-time charge and is non-refundable once checkout is complete, except where the law requires a refund.</p>`
      : "";

  return `
    <div style="margin-top:24px;padding:16px;background:#f6f4f1;border-radius:12px">
      <p style="margin:0 0 8px;font-weight:700">Your subscription</p>
      <ul style="margin:0 0 12px;padding-left:18px">${items}</ul>
      <a href="${escapeAttr(manageUrl)}" style="display:inline-block;background:#7C5C42;color:white;padding:10px 18px;border-radius:999px;text-decoration:none">Manage subscription</a>
      ${setupNote}
      <p style="margin:12px 0 0;font-size:13px;color:#666">Questions? Email <a href="mailto:${BILLING_SUPPORT_EMAIL}" style="color:#7C5C42">${BILLING_SUPPORT_EMAIL}</a>.</p>
    </div>`;
}

function manageBlockText(
  mode: "active" | "canceling" | "ended" | "past_due",
  manageUrl: string,
  dateLabel: string | null
) {
  const lines =
    mode === "canceling"
      ? [
          `Resume before ${dateLabel ?? "the membership ends"} from Billing to keep the same plan and billing date.`,
          "Upgrade or downgrade after you resume. Plan changes are prorated.",
        ]
      : mode === "ended"
        ? ["Subscribe again from Billing. You'll get a new receipt by email."]
        : mode === "past_due"
          ? [
              "Update your card from Billing. A successful payment emails you a receipt.",
              "You can upgrade, downgrade, or cancel once the payment succeeds.",
            ]
          : [
              "Upgrade or downgrade any time from Billing. The new price starts immediately, and any prorated charge or credit is emailed as a receipt.",
              `Cancel any time. You keep access through ${dateLabel ?? "the end of the period you've already paid"}, and you aren't charged again after that.`,
              "If a renewal payment fails, you have 14 days to update your card. Your data is never deleted.",
              `The $${SETUP_FEE.amount} setup fee is non-refundable once checkout is complete, except where the law requires a refund.`,
            ];

  return ["Your subscription", ...lines, `Manage subscription: ${manageUrl}`, `Questions: ${BILLING_SUPPORT_EMAIL}`].join(
    "\n"
  );
}

function platformShell({ preheader, bodyHtml }: { preheader: string; bodyHtml: string }) {
  return `
  <div style="display:none;max-height:0;overflow:hidden">${escapeHtml(preheader)}</div>
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1f1f1f">
    <p style="margin:0 0 24px;font-size:18px;font-weight:700;color:#7C5C42">TrueBreeds</p>
    ${bodyHtml}
    <p style="margin-top:32px;font-size:12px;color:#999">Sent by TrueBreeds. This is a billing notice for your kennel membership.</p>
  </div>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value: string) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}

function strip(value: string) {
  return value.replace(/<[^>]+>/g, "");
}
