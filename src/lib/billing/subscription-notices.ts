import "server-only";
import { Prisma } from "@prisma/client";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe/client";
import { messenger } from "@/lib/messenger/notifications";
import { getPlan, isPlanTier, SETUP_FEE, type PlanTier } from "@/lib/plans";
import {
  receiptKindForBillingReason,
  renderCancellationScheduled,
  renderPaymentFailed,
  renderPlanChange,
  renderSubscriptionEnded,
  renderSubscriptionReceipt,
  renderSubscriptionResumed,
  subscriptionNotices,
  type MoneyLine,
  type ReceiptKind,
} from "@/lib/billing/subscription-mail";

const RECEIPT_NOTE_RECURRING = "Billed monthly";
const RECEIPT_NOTE_ONCE = "One-time";

export async function sendCheckoutSubscriptionReceipt(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
    return;
  }

  const tenantId = session.metadata?.tenantId;
  const plan = isPlanTier(session.metadata?.plan) ? session.metadata.plan : null;
  if (!tenantId || !plan) return;

  const invoiceId = stripeId(session.invoice);
  const subscriptionId = stripeId(session.subscription);
  const contact = await billingContact(
    tenantId,
    session.customer_details?.email || session.customer_email
  );
  if (!contact) return;

  const breakdown = await checkoutBreakdown(session, plan);
  const renewsOn = await renewalDateForSubscription(subscriptionId);
  const email = renderSubscriptionReceipt({
    kind: "purchase",
    kennelName: contact.kennelName,
    recipientName: contact.recipientName,
    planName: getPlan(plan).name,
    monthlyPriceLabel: formatPlanLabel(plan),
    invoiceNumber: null,
    paidAt: new Date(),
    lines: breakdown.lines,
    subtotalCents: breakdown.subtotalCents,
    discountCents: breakdown.discountCents,
    taxCents: breakdown.taxCents,
    totalCents: breakdown.totalCents,
    currency: session.currency || "usd",
    renewsOn,
    hostedInvoiceUrl: null,
    manageUrl: manageUrl(),
  });

  await deliver({
    dedupeKey: subscriptionId
      ? `purchase:${subscriptionId}`
      : invoiceId
        ? `invoice:${invoiceId}`
        : `checkout:${session.id}`,
    tenantId,
    kind: "purchase",
    to: contact.to,
    ...email,
  });
}

export async function sendInvoiceSubscriptionReceipt(invoice: Stripe.Invoice) {
  const kind = receiptKindForBillingReason(invoice.billing_reason);
  if (!kind) return;

  const tenantId = await tenantIdForInvoice(invoice);
  if (!tenantId) return;

  const contact = await billingContact(tenantId, invoice.customer_email);
  if (!contact) return;

  const plan = await planForInvoice(invoice, tenantId);
  const lines = linesFromInvoice(invoice);
  const discountCents = sumAmounts(invoice.total_discount_amounts);
  const taxCents = (invoice.total_taxes ?? [])
    .filter((tax) => tax.tax_behavior !== "inclusive")
    .reduce((sum, tax) => sum + tax.amount, 0);

  const email = renderSubscriptionReceipt({
    kind,
    kennelName: contact.kennelName,
    recipientName: contact.recipientName,
    planName: plan ? getPlan(plan).name : "Membership",
    monthlyPriceLabel: plan ? formatPlanLabel(plan) : "your plan rate",
    invoiceNumber: invoice.number,
    paidAt: invoice.status_transitions?.paid_at
      ? new Date(invoice.status_transitions.paid_at * 1000)
      : new Date(invoice.created * 1000),
    lines:
      lines.length > 0
        ? lines
        : [
            {
              description: plan ? getPlan(plan).stripeProductName : "Membership",
              amountCents: invoice.subtotal,
              note: kind === "plan_change" ? "Prorated" : RECEIPT_NOTE_RECURRING,
            },
          ],
    subtotalCents: invoice.subtotal,
    discountCents,
    taxCents,
    totalCents: invoice.amount_paid,
    currency: invoice.currency,
    renewsOn: renewalDateFromInvoice(invoice),
    hostedInvoiceUrl: invoice.hosted_invoice_url,
    manageUrl: manageUrl(),
  });

  const subscriptionId =
    kind === "purchase" ? stripeId(invoice.parent?.subscription_details?.subscription) : null;
  await deliver({
    dedupeKey: subscriptionId ? `purchase:${subscriptionId}` : `invoice:${invoice.id}`,
    tenantId,
    kind,
    to: contact.to,
    ...email,
  });
}

export async function sendSubscriptionLifecycleNotices(input: {
  tenantId: string;
  previousPlan: PlanTier;
  nextPlan: PlanTier | null;
  previousCancelAtPeriodEnd: boolean;
  cancelAtPeriodEnd: boolean;
  status: string;
  eventType: "customer.subscription.updated" | "customer.subscription.deleted";
  periodEnd: Date | null;
  stripeSubscriptionId: string;
}) {
  const notices = subscriptionNotices(input);
  if (notices.length === 0) return;

  const contact = await billingContact(input.tenantId, null);
  if (!contact) return;

  for (const notice of notices) {
    const rendered =
      notice.type === "upgrade" || notice.type === "downgrade"
        ? renderPlanChange({
            direction: notice.type,
            kennelName: contact.kennelName,
            recipientName: contact.recipientName,
            from: notice.from,
            to: notice.to,
            renewsOn: input.periodEnd,
            manageUrl: manageUrl(),
          })
        : notice.type === "cancel_scheduled"
          ? renderCancellationScheduled({
              kennelName: contact.kennelName,
              recipientName: contact.recipientName,
              plan: input.nextPlan ?? input.previousPlan,
              accessUntil: input.periodEnd,
              manageUrl: manageUrl(),
            })
          : notice.type === "resumed"
            ? renderSubscriptionResumed({
                kennelName: contact.kennelName,
                recipientName: contact.recipientName,
                plan: input.nextPlan ?? input.previousPlan,
                renewsOn: input.periodEnd,
                manageUrl: manageUrl(),
              })
            : renderSubscriptionEnded({
                kennelName: contact.kennelName,
                recipientName: contact.recipientName,
                plan: input.previousPlan,
                manageUrl: manageUrl(),
              });

    const dedupeKey =
      notice.type === "upgrade" || notice.type === "downgrade"
        ? `plan:${input.stripeSubscriptionId}:${notice.from}->${notice.to}:${input.periodEnd?.toISOString() ?? "now"}`
        : notice.type === "cancel_scheduled"
          ? `cancel:${input.stripeSubscriptionId}:${input.periodEnd?.toISOString() ?? "open"}`
          : notice.type === "resumed"
            ? `resume:${input.stripeSubscriptionId}:${input.periodEnd?.toISOString() ?? "open"}`
            : `ended:${input.stripeSubscriptionId}`;

    await deliver({
      dedupeKey,
      tenantId: input.tenantId,
      kind: notice.type,
      to: contact.to,
      ...rendered,
    });
  }
}

export async function sendPaymentFailedNotice(input: {
  tenantId: string;
  invoice: Stripe.Invoice;
  plan: PlanTier;
  gracePeriodEndsAt: Date;
}) {
  const contact = await billingContact(input.tenantId, input.invoice.customer_email);
  if (!contact) return;

  const email = renderPaymentFailed({
    kennelName: contact.kennelName,
    recipientName: contact.recipientName,
    plan: input.plan,
    amountDueCents: input.invoice.amount_due,
    currency: input.invoice.currency,
    gracePeriodEndsAt: input.gracePeriodEndsAt,
    manageUrl: manageUrl(),
  });

  await deliver({
    dedupeKey: `payment_failed:${input.invoice.id}`,
    tenantId: input.tenantId,
    kind: "payment_failed",
    to: contact.to,
    ...email,
  });
}

async function checkoutBreakdown(session: Stripe.Checkout.Session, plan: PlanTier) {
  try {
    const listed = await stripe.checkout.sessions.listLineItems(session.id, { limit: 20 });
    if (listed.data.length > 0) {
      const lines: MoneyLine[] = listed.data.map((item) => ({
        description: item.description || "Membership",
        amountCents: item.amount_subtotal,
        note: item.price?.recurring ? RECEIPT_NOTE_RECURRING : RECEIPT_NOTE_ONCE,
      }));
      return {
        lines,
        subtotalCents: session.amount_subtotal ?? lines.reduce((sum, line) => sum + line.amountCents, 0),
        discountCents: session.total_details?.amount_discount ?? 0,
        taxCents: session.total_details?.amount_tax ?? 0,
        totalCents:
          session.amount_total ??
          (session.amount_subtotal ?? 0) -
            (session.total_details?.amount_discount ?? 0) +
            (session.total_details?.amount_tax ?? 0),
      };
    }
  } catch (err) {
    console.error("[billing-email] could not load checkout line items", err);
  }

  const planDef = getPlan(plan);
  const lines: MoneyLine[] = [
    { description: SETUP_FEE.stripeProductName, amountCents: SETUP_FEE.unitAmount, note: RECEIPT_NOTE_ONCE },
    {
      description: planDef.stripeProductName,
      amountCents: planDef.unitAmount,
      note: RECEIPT_NOTE_RECURRING,
    },
  ];
  const subtotalCents = lines.reduce((sum, line) => sum + line.amountCents, 0);
  const discountCents = session.total_details?.amount_discount ?? 0;
  const taxCents = session.total_details?.amount_tax ?? 0;
  return {
    lines,
    subtotalCents,
    discountCents,
    taxCents,
    totalCents: session.amount_total ?? subtotalCents - discountCents + taxCents,
  };
}

async function renewalDateForSubscription(subscriptionId: string | null) {
  if (!subscriptionId) return null;
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const end = subscription.items.data[0]?.current_period_end;
    return end ? new Date(end * 1000) : null;
  } catch (err) {
    console.error("[billing-email] could not load subscription period", err);
    return null;
  }
}

function linesFromInvoice(invoice: Stripe.Invoice): MoneyLine[] {
  return (invoice.lines?.data ?? []).map((line) => ({
    description: line.description || "Membership",
    amountCents: line.amount,
  }));
}

function renewalDateFromInvoice(invoice: Stripe.Invoice) {
  const ends = (invoice.lines?.data ?? [])
    .map((line) => line.period?.end)
    .filter((end): end is number => typeof end === "number" && end > 0);
  const stamp = ends.sort((a, b) => b - a)[0] || invoice.period_end;
  return stamp ? new Date(stamp * 1000) : null;
}

async function planForInvoice(invoice: Stripe.Invoice, tenantId: string): Promise<PlanTier | null> {
  const fromMetadata = invoice.parent?.subscription_details?.metadata?.plan;
  if (isPlanTier(fromMetadata)) return fromMetadata;
  const subscription = await prisma.platformSubscription.findUnique({ where: { tenantId } });
  return subscription?.plan ?? null;
}

async function tenantIdForInvoice(invoice: Stripe.Invoice) {
  const fromMetadata = invoice.parent?.subscription_details?.metadata?.tenantId;
  if (fromMetadata) return fromMetadata;
  const customerId = stripeId(invoice.customer);
  if (!customerId) return null;
  const subscription = await prisma.platformSubscription.findUnique({
    where: { stripeCustomerId: customerId },
  });
  return subscription?.tenantId ?? null;
}

async function billingContact(tenantId: string, stripeEmail: string | null | undefined) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      members: {
        include: { user: true },
        orderBy: { createdAt: "asc" },
        take: 1,
      },
    },
  });
  if (!tenant) {
    console.error(`[billing-email] no tenant ${tenantId}`);
    return null;
  }

  const owner = tenant.members[0]?.user;
  const to = stripeEmail || owner?.email || tenant.contactEmail;
  if (!to) {
    console.error(`[billing-email] no recipient for tenant ${tenantId}`);
    return null;
  }

  return { to, kennelName: tenant.kennelName, recipientName: owner?.fullName ?? null };
}

async function deliver(message: {
  dedupeKey: string;
  tenantId: string;
  kind: ReceiptKind | "upgrade" | "downgrade" | "cancel_scheduled" | "resumed" | "ended" | "payment_failed";
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const claimed = await claim(message.dedupeKey, message.tenantId, message.kind);
  if (!claimed) return;

  try {
    const result = await messenger.send({
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });
    if ("skipped" in result) {
      console.warn(`[billing-email] ${message.kind} to ${message.to} skipped: ${result.reason}`);
      await prisma.billingEmailLog.delete({ where: { dedupeKey: message.dedupeKey } }).catch(() => {});
    }
  } catch (err) {
    await prisma.billingEmailLog.delete({ where: { dedupeKey: message.dedupeKey } }).catch(() => {});
    throw err;
  }
}

async function claim(dedupeKey: string, tenantId: string, kind: string) {
  try {
    await prisma.billingEmailLog.create({ data: { dedupeKey, tenantId, kind } });
    return true;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return false;
    }
    console.error("[billing-email] could not record send; sending anyway", err);
    return true;
  }
}

function manageUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";
  return `${appUrl}/dashboard/settings/billing`;
}

function formatPlanLabel(plan: PlanTier) {
  const amount = getPlan(plan).monthlyPrice;
  return `$${amount.toFixed(2)}`;
}

function sumAmounts(entries: Array<{ amount: number }> | null | undefined) {
  return (entries ?? []).reduce((sum, entry) => sum + entry.amount, 0);
}

function stripeId(value: string | { id: string } | null | undefined) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}
