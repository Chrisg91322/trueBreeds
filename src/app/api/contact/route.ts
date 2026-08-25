import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactFormSchema } from "@/lib/validations/public";
import { sendInquiryNotifications } from "@/lib/messenger/notifications";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = contactFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { tenantId, name, email, phone, message, offspringId } = parsed.data;

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) return NextResponse.json({ error: "Unknown tenant" }, { status: 404 });

  const lead = await prisma.lead.create({
    data: {
      tenantId,
      name,
      email: email || null,
      phone: phone || null,
      message: message || null,
      source: "inquiry",
      status: "new",
      offspringId,
    },
  });

  await prisma.analyticsEvent.create({
    data: { tenantId, type: "inquiry", metadata: { leadId: lead.id } },
  });

  await sendInquiryNotifications(lead, tenant);

  return NextResponse.json({ ok: true });
}
