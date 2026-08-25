import "server-only";
import { prisma } from "@/lib/prisma";
import { ResendMessenger } from "./email-messenger";
import type { Messenger } from "./messenger";
import {
  inquiryReceivedTemplate,
  inquiryAcknowledgmentTemplate,
  depositConfirmationBuyerTemplate,
  depositConfirmationBreederTemplate,
  waitlistConfirmationTemplate,
  teamInviteTemplate,
} from "./templates";
import type { Deposit, Offspring, Litter, Tenant, Lead } from "@prisma/client";

/** Swap this for a different Messenger implementation (or a composite of several) without touching call sites. */
export const messenger: Messenger = new ResendMessenger();

async function getBreederRecipientEmail(tenantId: string) {
  const member = await prisma.tenantMember.findFirst({
    where: { tenantId },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });
  return member?.user.email;
}

export async function sendInquiryNotifications(lead: Lead, tenant: Tenant) {
  const breederEmail = tenant.contactEmail || (await getBreederRecipientEmail(tenant.id));

  if (breederEmail) {
    await messenger.send({
      to: breederEmail,
      subject: `New inquiry from ${lead.name}`,
      html: inquiryReceivedTemplate({
        kennelName: tenant.kennelName,
        logoUrl: tenant.logoUrl,
        accentColor: tenant.accentColor,
        leadName: lead.name,
        leadEmail: lead.email,
        leadPhone: lead.phone,
        message: lead.message,
      }),
      replyTo: lead.email ?? undefined,
    });
  }

  if (lead.email) {
    await messenger.send({
      to: lead.email,
      subject: `Thanks for reaching out to ${tenant.kennelName}`,
      html: inquiryAcknowledgmentTemplate({
        kennelName: tenant.kennelName,
        logoUrl: tenant.logoUrl,
        accentColor: tenant.accentColor,
        leadName: lead.name,
      }),
      replyTo: tenant.contactEmail ?? breederEmail ?? undefined,
      fromName: tenant.kennelName,
      unsubscribeCategory: "buyer_notifications",
    });
  }
}

export async function sendWaitlistConfirmation(
  entry: { name: string; email: string; breed?: string | null },
  tenant: Tenant
) {
  await messenger.send({
    to: entry.email,
    subject: `You're on the waitlist at ${tenant.kennelName}`,
    html: waitlistConfirmationTemplate({
      kennelName: tenant.kennelName,
      logoUrl: tenant.logoUrl,
      accentColor: tenant.accentColor,
      name: entry.name,
      breed: entry.breed,
    }),
    replyTo: tenant.contactEmail ?? undefined,
    fromName: tenant.kennelName,
    unsubscribeCategory: "buyer_notifications",
  });
}

export async function sendTeamInvite(args: {
  toEmail: string;
  tenant: Tenant;
  invitedByName: string;
  role: string;
  token: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  await messenger.send({
    to: args.toEmail,
    subject: `You're invited to join ${args.tenant.kennelName} on TrueBreeds`,
    html: teamInviteTemplate({
      kennelName: args.tenant.kennelName,
      logoUrl: args.tenant.logoUrl,
      accentColor: args.tenant.accentColor,
      invitedByName: args.invitedByName,
      role: args.role,
      acceptUrl: `${appUrl}/invite/${args.token}`,
    }),
  });
}

export async function sendDepositConfirmation(
  deposit: Deposit & { offspring: Offspring & { litter: Litter }; tenant: Tenant }
) {
  const { tenant, offspring } = deposit;
  const offspringName = offspring.name ?? `${offspring.litter.breed ?? "Puppy"}`;
  const breederEmail = tenant.contactEmail || (await getBreederRecipientEmail(tenant.id));

  await messenger.send({
    to: deposit.buyerEmail,
    subject: `Deposit confirmed for ${offspringName}`,
    html: depositConfirmationBuyerTemplate({
      kennelName: tenant.kennelName,
      logoUrl: tenant.logoUrl,
      accentColor: tenant.accentColor,
      buyerName: deposit.buyerName,
      offspringName,
      amount: deposit.amount,
      depositPolicy: deposit.policySnapshot,
    }),
    replyTo: tenant.contactEmail ?? breederEmail ?? undefined,
    fromName: tenant.kennelName,
    unsubscribeCategory: "buyer_notifications",
  });

  if (breederEmail) {
    await messenger.send({
      to: breederEmail,
      subject: `New deposit: ${offspringName}`,
      html: depositConfirmationBreederTemplate({
        kennelName: tenant.kennelName,
        logoUrl: tenant.logoUrl,
        accentColor: tenant.accentColor,
        buyerName: deposit.buyerName,
        buyerEmail: deposit.buyerEmail,
        offspringName,
        amount: deposit.amount,
      }),
    });
  }
}
