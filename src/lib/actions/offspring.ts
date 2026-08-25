"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireTenantSession } from "@/lib/auth";
import { forTenant } from "@/lib/db";
import { offspringSchema } from "@/lib/validations/kennel";
import { prisma } from "@/lib/prisma";
import { isValidOffspringStatus } from "@/lib/offspring-status";

function parseOffspringForm(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = offspringSchema.parse(raw);
  return {
    litterId: parsed.litterId,
    name: parsed.name || null,
    sex: parsed.sex,
    color: parsed.color || null,
    price: Number.isNaN(parsed.price) ? null : parsed.price,
    depositAmount: Number.isNaN(parsed.depositAmount) ? null : parsed.depositAmount,
    status: parsed.status,
    microchip: parsed.microchip || null,
    notes: parsed.notes || null,
    coverPhotoUrl: parsed.coverPhotoUrl || null,
  };
}

export async function createOffspring(formData: FormData) {
  const session = await requireTenantSession();
  const db = forTenant(session.tenantId);
  const data = parseOffspringForm(formData);

  await db.offspring.create({ data: { ...data, tenantId: session.tenantId } });

  revalidatePath(`/dashboard/litters/${data.litterId}`);
  revalidatePath(`/${session.tenantSlug}`);
  redirect(`/dashboard/litters/${data.litterId}`);
}

export async function updateOffspring(offspringId: string, formData: FormData) {
  const session = await requireTenantSession();
  const db = forTenant(session.tenantId);
  const data = parseOffspringForm(formData);

  await db.offspring.update({ where: { id: offspringId }, data });

  revalidatePath(`/dashboard/litters/${data.litterId}`);
  revalidatePath(`/${session.tenantSlug}`);
  redirect(`/dashboard/litters/${data.litterId}`);
}

/** Quick status change from the kanban-style pipeline view. */
export async function setOffspringStatus(offspringId: string, status: string) {
  const session = await requireTenantSession();
  const db = forTenant(session.tenantId);

  if (!isValidOffspringStatus(status)) throw new Error("Invalid status");

  const offspring = await db.offspring.update({
    where: { id: offspringId },
    data: { status },
  });

  revalidatePath(`/dashboard/litters/${offspring.litterId}`);
  revalidatePath(`/${session.tenantSlug}`);
}

export async function deleteOffspring(offspringId: string, litterId: string) {
  const session = await requireTenantSession();
  const db = forTenant(session.tenantId);
  await db.offspring.delete({ where: { id: offspringId } });
  revalidatePath(`/dashboard/litters/${litterId}`);
}

export async function getAnimalsForSelect(tenantId: string) {
  return prisma.animal.findMany({
    where: { tenantId },
    select: { id: true, name: true, sex: true },
    orderBy: { name: "asc" },
  });
}
