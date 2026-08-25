"use server";

import { revalidatePath } from "next/cache";
import { requireTenantSession } from "@/lib/auth";
import { forTenant } from "@/lib/db";

export async function moveWaitlistEntry(entryId: string, direction: "up" | "down") {
  const session = await requireTenantSession();
  const db = forTenant(session.tenantId);

  const entries = await db.waitlistEntry.findMany({ orderBy: { rank: "asc" } });
  const index = entries.findIndex((e) => e.id === entryId);
  if (index === -1) return;

  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= entries.length) return;

  const a = entries[index];
  const b = entries[swapWith];

  await db.$transaction([
    db.waitlistEntry.update({ where: { id: a.id }, data: { rank: b.rank } }),
    db.waitlistEntry.update({ where: { id: b.id }, data: { rank: a.rank } }),
  ]);

  revalidatePath("/dashboard/waitlist");
}

export async function deleteWaitlistEntry(entryId: string) {
  const session = await requireTenantSession();
  const db = forTenant(session.tenantId);
  await db.waitlistEntry.delete({ where: { id: entryId } });
  revalidatePath("/dashboard/waitlist");
}
