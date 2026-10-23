export type FamilyAnimal = {
  id: string;
  name: string;
  sireName?: string | null;
  damName?: string | null;
  sireId?: string | null;
  damId?: string | null;
  dateOfBirth?: Date | string | null;
};

export type PuppyInput = {
  id?: string;
  name: string;
  dateOfBirth?: string;
  color?: string;
  coatType?: string;
  sex: "male" | "female";
};

function normalizeName(name: string | null | undefined) {
  const trimmed = name?.trim().toLowerCase();
  return trimmed || null;
}

/** Unique name match within the kennel. Duplicate names are left unlinked. */
export function findParentByName<T extends { id: string; name: string }>(
  name: string | null | undefined,
  animals: T[],
  selfId?: string
): T | null {
  const normalized = normalizeName(name);
  if (!normalized) return null;
  const matches = animals.filter(
    (animal) => animal.id !== selfId && normalizeName(animal.name) === normalized
  );
  return matches.length === 1 ? matches[0] : null;
}

export function resolveParentIds(
  animal: { id?: string; sireName?: string | null; damName?: string | null },
  animals: { id: string; name: string }[]
) {
  const sire = findParentByName(animal.sireName, animals, animal.id);
  const dam = findParentByName(animal.damName, animals, animal.id);
  if (sire && dam && sire.id === dam.id) {
    return { sireId: null, damId: null };
  }
  return { sireId: sire?.id ?? null, damId: dam?.id ?? null };
}

/** Name is the source of truth. Returns rows whose stored parent ids should change. */
export function parentLinkUpdates<T extends FamilyAnimal>(animals: T[]) {
  const updates: { id: string; sireId: string | null; damId: string | null }[] = [];
  for (const animal of animals) {
    const next = resolveParentIds(animal, animals);
    const sireId = animal.sireId ?? null;
    const damId = animal.damId ?? null;
    if (next.sireId !== sireId || next.damId !== damId) {
      updates.push({ id: animal.id, ...next });
    }
  }
  return updates;
}

export function parentBioLink(
  animalId: string,
  name: string | null | undefined,
  parentId: string | null | undefined,
  animals: { id: string; name: string }[]
): { name: string; href: string | null } | null {
  const linked = parentId ? animals.find((animal) => animal.id === parentId) : null;
  if (linked && linked.id !== animalId) {
    return { name: linked.name, href: `/our-dogs/${linked.id}` };
  }
  const matched = findParentByName(name, animals, animalId);
  if (matched) return { name: matched.name, href: `/our-dogs/${matched.id}` };
  const stored = name?.trim();
  if (!stored) return null;
  return { name: stored, href: null };
}

export function linkedPuppies<T extends FamilyAnimal>(parentId: string, animals: T[]) {
  const parent = animals.find((animal) => animal.id === parentId);
  return animals
    .filter((animal) => {
      if (animal.id === parentId) return false;
      if (animal.sireId === parentId || animal.damId === parentId) return true;
      if (!parent) return false;
      const sire = findParentByName(animal.sireName, animals, animal.id);
      const dam = findParentByName(animal.damName, animals, animal.id);
      return sire?.id === parentId || dam?.id === parentId;
    })
    .sort((a, b) => {
      const aTime = a.dateOfBirth ? new Date(a.dateOfBirth).getTime() : Number.POSITIVE_INFINITY;
      const bTime = b.dateOfBirth ? new Date(b.dateOfBirth).getTime() : Number.POSITIVE_INFINITY;
      if (aTime !== bTime) return aTime - bTime;
      return a.name.localeCompare(b.name);
    });
}

/** The animal on the form is this puppy's sire or dam. The other parent is left as-is. */
export function puppyParentLink(
  parent: { id: string; name: string; sex: "male" | "female" },
  existing?: {
    sireId?: string | null;
    damId?: string | null;
    sireName?: string | null;
    damName?: string | null;
  }
) {
  const sireId = existing?.sireId ?? null;
  const damId = existing?.damId ?? null;
  const sireName = existing?.sireName ?? null;
  const damName = existing?.damName ?? null;

  if (parent.sex === "male") {
    return {
      sireId: parent.id,
      sireName: parent.name,
      damId: damId === parent.id ? null : damId,
      damName: damId === parent.id ? null : damName,
    };
  }

  return {
    damId: parent.id,
    damName: parent.name,
    sireId: sireId === parent.id ? null : sireId,
    sireName: sireId === parent.id ? null : sireName,
  };
}

export function formatAnimalDate(value: Date | string | null | undefined) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
