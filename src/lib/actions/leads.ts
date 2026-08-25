"use server";

import { revalidatePath } from "next/cache";
import { requireTenantSession } from "@/lib/auth";
import { forTenant } from "@/lib/db";
import { isValidLeadStatus } from "@/lib/lead-status";

export async function updateLeadStatus(leadId: string, status: string) {
  const session = await requireTenantSession();
  const db = forTenant(session.tenantId);
  if (!isValidLeadStatus(status)) throw new Error("Invalid status");

  await db.lead.update({ where: { id: leadId }, data: { status } });
  revalidatePath("/dashboard/leads");
  revalidatePath(`/dashboard/leads/${leadId}`);
}

export async function addLeadTag(leadId: string, tag: string) {
  const session = await requireTenantSession();
  const db = forTenant(session.tenantId);
  const lead = await db.lead.findUniqueOrThrow({ where: { id: leadId } });
  if (!lead.tags.includes(tag)) {
    await db.lead.update({ where: { id: leadId }, data: { tags: [...lead.tags, tag] } });
  }
  revalidatePath(`/dashboard/leads/${leadId}`);
}

export async function addLeadNote(leadId: string, formData: FormData) {
  const session = await requireTenantSession();
  const db = forTenant(session.tenantId);
  const body = String(formData.get("body") || "").trim();
  if (!body) return;

  // Verify the lead belongs to this tenant before attaching a note (LeadNote
  // itself has no tenantId column — see prisma/rls.sql for the join-based policy).
  await db.lead.findUniqueOrThrow({ where: { id: leadId } });

  await db.leadNote.create({
    data: { leadId, authorId: session.userId, body },
  });
  revalidatePath(`/dashboard/leads/${leadId}`);
}
