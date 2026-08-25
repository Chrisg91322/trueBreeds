"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireTenantSession } from "@/lib/auth";
import { forTenant } from "@/lib/db";
import { litterSchema } from "@/lib/validations/kennel";

function parseLitterForm(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = litterSchema.parse(raw);
  return {
    species: parsed.species,
    breed: parsed.breed || null,
    sireId: parsed.sireId || null,
    damId: parsed.damId || null,
    status: parsed.status,
    whelpDate: parsed.whelpDate ? new Date(parsed.whelpDate) : null,
    expectedWhelpDate: parsed.expectedWhelpDate ? new Date(parsed.expectedWhelpDate) : null,
    goHomeDate: parsed.goHomeDate ? new Date(parsed.goHomeDate) : null,
    description: parsed.description || null,
    defaultPrice: Number.isNaN(parsed.defaultPrice) ? null : parsed.defaultPrice,
    defaultDepositAmount: Number.isNaN(parsed.defaultDepositAmount)
      ? null
      : parsed.defaultDepositAmount,
    coverPhotoUrl: parsed.coverPhotoUrl || null,
  };
}

export async function createLitter(formData: FormData) {
  const session = await requireTenantSession();
  const db = forTenant(session.tenantId);
  const data = parseLitterForm(formData);

  const litter = await db.litter.create({ data: { ...data, tenantId: session.tenantId } });

  revalidatePath("/dashboard/litters");
  revalidatePath(`/${session.tenantSlug}`);
  redirect(`/dashboard/litters/${litter.id}`);
}

export async function updateLitter(litterId: string, formData: FormData) {
  const session = await requireTenantSession();
  const db = forTenant(session.tenantId);
  const data = parseLitterForm(formData);

  await db.litter.update({ where: { id: litterId }, data });

  revalidatePath("/dashboard/litters");
  revalidatePath(`/dashboard/litters/${litterId}`);
  revalidatePath(`/${session.tenantSlug}`);
  redirect(`/dashboard/litters/${litterId}`);
}

export async function deleteLitter(litterId: string) {
  const session = await requireTenantSession();
  const db = forTenant(session.tenantId);
  await db.litter.delete({ where: { id: litterId } });
  revalidatePath("/dashboard/litters");
  redirect("/dashboard/litters");
}
