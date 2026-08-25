import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { waitlistFormSchema } from "@/lib/validations/public";
import { sendWaitlistConfirmation } from "@/lib/messenger/notifications";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = waitlistFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { tenantId, litterId, breed, name, email, phone, notes } = parsed.data;

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) return NextResponse.json({ error: "Unknown tenant" }, { status: 404 });

  const count = await prisma.waitlistEntry.count({ where: { tenantId } });

  const entry = await prisma.waitlistEntry.create({
    data: {
      tenantId,
      litterId,
      breed: breed || null,
      name,
      email,
      phone: phone || null,
      notes: notes || null,
      rank: count + 1,
    },
  });

  await prisma.lead.create({
    data: {
      tenantId,
      name,
      email,
      phone: phone || null,
      source: "waitlist",
      status: "new",
      message: notes || `Joined the waitlist${breed ? ` for ${breed}` : ""}.`,
    },
  });

  await prisma.analyticsEvent.create({
    data: { tenantId, type: "waitlist_signup", metadata: { waitlistEntryId: entry.id } },
  });

  await sendWaitlistConfirmation(entry, tenant);

  return NextResponse.json({ ok: true, rank: entry.rank });
}
