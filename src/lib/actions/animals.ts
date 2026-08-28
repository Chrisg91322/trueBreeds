"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireTenantSession } from "@/lib/auth";
import { forTenant } from "@/lib/db";
import { animalSchema } from "@/lib/validations/kennel";

function parseAnimalForm(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = animalSchema.parse(raw);
  return {
    name: parsed.name,
    species: parsed.species,
    breed: parsed.breed || null,
    sex: parsed.sex,
    dateOfBirth: parsed.dateOfBirth ? new Date(parsed.dateOfBirth) : null,
    color: parsed.color || null,
    weightLbs: Number.isNaN(parsed.weightLbs) ? null : parsed.weightLbs,
    bio: parsed.bio || null,
    registryNumber: parsed.registryNumber || null,
    titles: parsed.titlesCsv
      ? parsed.titlesCsv.split(",").map((t) => t.trim()).filter(Boolean)
      : [],
    pedigreeUrl: parsed.pedigreeUrl || null,
    embarkUrl: parsed.embarkUrl || null,
    coverPhotoUrl: parsed.coverPhotoUrl || null,
    isBreedingStock: parsed.isBreedingStock ?? true,
    isRetired: parsed.isRetired ?? false,
  };
}

function revalidateAnimalPages(tenantSlug: string) {
  revalidatePath("/dashboard/animals");
  revalidatePath(`/${tenantSlug}`);
  revalidatePath(`/${tenantSlug}/our-dogs`);
  revalidatePath("/preview");
  revalidatePath("/preview/our-dogs");
  revalidateTag("tenant");
}

export async function createAnimal(formData: FormData) {
  const session = await requireTenantSession();
  const db = forTenant(session.tenantId);
  const data = parseAnimalForm(formData);

  await db.animal.create({ data: { ...data, tenantId: session.tenantId } });

  revalidateAnimalPages(session.tenantSlug);
  redirect("/dashboard/animals");
}

export async function updateAnimal(animalId: string, formData: FormData) {
  const session = await requireTenantSession();
  const db = forTenant(session.tenantId);
  const data = parseAnimalForm(formData);

  await db.animal.update({ where: { id: animalId }, data });

  revalidateAnimalPages(session.tenantSlug);
  redirect("/dashboard/animals");
}

export async function deleteAnimal(animalId: string) {
  const session = await requireTenantSession();
  const db = forTenant(session.tenantId);
  await db.animal.delete({ where: { id: animalId } });
  revalidateAnimalPages(session.tenantSlug);
}
