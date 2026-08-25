import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const tenantId = body?.tenantId;
  const path = typeof body?.path === "string" ? body.path : undefined;
  if (!tenantId) return NextResponse.json({ error: "Missing tenantId" }, { status: 400 });

  await prisma.analyticsEvent.create({
    data: { tenantId, type: "page_view", path },
  });

  return NextResponse.json({ ok: true });
}
