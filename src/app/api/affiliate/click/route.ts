import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/** Logs an outbound affiliate click, then redirects to the affiliate URL. */
export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "Missing productId" }, { status: 400 });

  const product = await prisma.affiliateProduct.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.affiliateClick.create({
    data: {
      tenantId: product.tenantId,
      productId: product.id,
      referrer: req.headers.get("referer") || undefined,
    },
  });
  await prisma.analyticsEvent.create({
    data: { tenantId: product.tenantId, type: "affiliate_click", metadata: { productId } },
  });

  return NextResponse.redirect(product.affiliateUrl, { status: 302 });
}
