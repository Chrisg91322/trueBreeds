"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireTenantSession } from "@/lib/auth";
import { forTenant, type TenantScopedClient } from "@/lib/db";
import { animalSchema } from "@/lib/validations/kennel";
import { linkedPuppies, parentLinkUpdates, puppyParentLink, type PuppyInput } from "@/lib/animal-family";
import type { SpeciesId } from "@/lib/species";

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
    coatType: parsed.coatType || null,
    weightLbs: parsed.weightLbs ?? null,
    bio: parsed.bio || null,
    registryNumber: parsed.registryNumber || null,
    titles: parsed.titlesCsv
      ? parsed.titlesCsv.split(",").map((t) => t.trim()).filter(Boolean)
      : [],
    sireName: parsed.sireName || null,
    damName: parsed.damName || null,
    healthCertificates:
      parsed.healthCertificatesJson.length > 0
        ? parsed.healthCertificatesJson
        : Prisma.DbNull,
    coverPhotoUrl: parsed.coverPhotoUrl || null,
    isBreedingStock: parsed.isBreedingStock ?? true,
    isRetired: parsed.isRetired ?? false,
    puppies: parsed.puppiesJson.map((puppy) => ({
      id: puppy.id || undefined,
      name: puppy.name,
      dateOfBirth: puppy.dateOfBirth || undefined,
      color: puppy.color || undefined,
      coatType: puppy.coatType || undefined,
      sex: puppy.sex,
    })),
  };
}

async function refreshParentLinks(db: TenantScopedClient) {
  const animals = await db.animal.findMany({
    select: {
      id: true,
      name: true,
      sireName: true,
      damName: true,
      sireId: true,
      damId: true,
    },
  });
  const updates = parentLinkUpdates(animals);
  for (const update of updates) {
    await db.animal.update({
      where: { id: update.id },
      data: { sireId: update.sireId, damId: update.damId },
    });
  }
}

async function syncPuppies(
  db: TenantScopedClient,
  tenantId: string,
  parent: {
    id: string;
    name: string;
    sex: "male" | "female";
    species: SpeciesId;
    breed: string | null;
  },
  puppies: PuppyInput[]
) {
  const roster = await db.animal.findMany({
    select: {
      id: true,
      name: true,
      sireName: true,
      damName: true,
      sireId: true,
      damId: true,
    },
  });
  const existing = linkedPuppies(parent.id, roster);
  const existingById = new Map(existing.map((animal) => [animal.id, animal]));
  const kept = new Set<string>();

  for (const puppy of puppies) {
    const current = puppy.id ? existingById.get(puppy.id) : undefined;
    const link = puppyParentLink(parent, current);
    const details = {
      name: puppy.name,
      sex: puppy.sex,
      dateOfBirth: puppy.dateOfBirth ? new Date(puppy.dateOfBirth) : null,
      color: puppy.color || null,
      coatType: puppy.coatType || null,
      ...link,
    };

    if (current) {
      kept.add(current.id);
      await db.animal.update({ where: { id: current.id }, data: details });
      continue;
    }

    await db.animal.create({
      data: {
        ...details,
        tenantId,
        species: parent.species,
        breed: parent.breed,
        isBreedingStock: false,
      },
    });
  }

  for (const animal of existing) {
    if (!kept.has(animal.id)) {
      await db.animal.delete({ where: { id: animal.id } });
    }
  }
}

async function saveAnimalFamily(
  db: TenantScopedClient,
  tenantId: string,
  animalId: string | null,
  data: ReturnType<typeof parseAnimalForm>
) {
  const { puppies, ...animalData } = data;
  const saved = animalId
    ? await db.animal.update({ where: { id: animalId }, data: animalData })
    : await db.animal.create({ data: { ...animalData, tenantId } });

  await syncPuppies(
    db,
    tenantId,
    {
      id: saved.id,
      name: saved.name,
      sex: saved.sex,
      species: saved.species,
      breed: saved.breed,
    },
    puppies
  );
  await db.animal.updateMany({
    where: { sireId: saved.id },
    data: { sireName: saved.name },
  });
  await db.animal.updateMany({
    where: { damId: saved.id },
    data: { damName: saved.name },
  });
  await refreshParentLinks(db);
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

  await saveAnimalFamily(db, session.tenantId, null, data);

  revalidateAnimalPages(session.tenantSlug);
  redirect("/dashboard/animals");
}

export async function updateAnimal(animalId: string, formData: FormData) {
  const session = await requireTenantSession();
  const db = forTenant(session.tenantId);
  const data = parseAnimalForm(formData);

  await saveAnimalFamily(db, session.tenantId, animalId, data);

  revalidateAnimalPages(session.tenantSlug);
  redirect("/dashboard/animals");
}

export async function deleteAnimal(animalId: string) {
  const session = await requireTenantSession();
  const db = forTenant(session.tenantId);
  await db.animal.delete({ where: { id: animalId } });
  revalidateAnimalPages(session.tenantSlug);
}
