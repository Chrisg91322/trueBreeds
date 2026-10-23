"use server";

import { z } from "zod";
import { getSessionContext } from "@/lib/auth";
import { messenger } from "@/lib/messenger/notifications";
import { prisma } from "@/lib/prisma";
import { isPlanTier } from "@/lib/plans";
import {
  isMembershipTimeline,
  membershipRequestMessage,
  salesInquiryMessage,
  SUPPORT_EMAIL,
} from "@/lib/membership-request";

const requestSchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(200),
  email: z.string().trim().email("Enter a valid email.").max(200),
  phone: z.string().trim().min(1, "Enter a phone number.").max(40),
  plan: z.string(),
  timeline: z.string(),
});

export async function submitMembershipRequest(input: {
  name: string;
  email: string;
  phone: string;
  plan: string;
  timeline: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await getSessionContext();
  if (!session?.tenantId) {
    return { ok: false, error: "Sign in again, then send the request." };
  }

  const parsed = requestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }
  if (!isPlanTier(parsed.data.plan) || !isMembershipTimeline(parsed.data.timeline)) {
    return { ok: false, error: "Choose a plan and how soon you want the site." };
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.tenantId },
    select: { kennelName: true, slug: true },
  });
  if (!tenant) return { ok: false, error: "Sign in again, then send the request." };

  const message = membershipRequestMessage({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    plan: parsed.data.plan,
    timeline: parsed.data.timeline,
    kennelName: tenant.kennelName,
    slug: tenant.slug,
    accountEmail: session.email,
  });

  try {
    const sent = await messenger.send({
      to: SUPPORT_EMAIL,
      replyTo: parsed.data.email,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });
    if ("skipped" in sent) {
      return { ok: false, error: "Couldn’t send that request. Try again in a minute." };
    }
  } catch (err) {
    console.error("membership request email failed", err instanceof Error ? err.message : "send failed");
    return { ok: false, error: "Couldn’t send that request. Try again in a minute." };
  }

  return { ok: true };
}

const inquirySchema = z.object({
  name: z.string().trim().min(1, "Enter your name.").max(200),
  email: z.string().trim().email("Enter a valid email.").max(200),
  phone: z.string().trim().min(1, "Enter a phone number.").max(40),
  plan: z.string(),
  message: z.string().trim().min(1, "Tell us what you’re interested in.").max(4000),
});

export async function submitSalesInquiry(input: {
  name: string;
  email: string;
  phone: string;
  plan: string;
  message: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = inquirySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }
  const plan = parsed.data.plan === "" || parsed.data.plan === "unsure" ? null : parsed.data.plan;
  if (plan !== null && !isPlanTier(plan)) {
    return { ok: false, error: "Choose a plan, or tell us you’re not sure yet." };
  }

  const message = salesInquiryMessage({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    plan,
    message: parsed.data.message,
  });

  try {
    const sent = await messenger.send({
      to: SUPPORT_EMAIL,
      replyTo: parsed.data.email,
      subject: message.subject,
      html: message.html,
      text: message.text,
    });
    if ("skipped" in sent) {
      return { ok: false, error: "Couldn’t send that message. Try again in a minute." };
    }
  } catch (err) {
    console.error("sales inquiry email failed", err instanceof Error ? err.message : "send failed");
    return { ok: false, error: "Couldn’t send that message. Try again in a minute." };
  }

  return { ok: true };
}
