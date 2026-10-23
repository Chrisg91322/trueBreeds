export const SPECIES_IDS = ["dog", "cat", "livestock"] as const;

export const SPECIES = [
  { id: "dog", label: "Dog", plural: "Dogs" },
  { id: "cat", label: "Cat", plural: "Cats" },
  { id: "livestock", label: "Livestock", plural: "Livestock" },
] as const satisfies readonly { id: SpeciesId; label: string; plural: string }[];

export type SpeciesId = (typeof SPECIES_IDS)[number];

export function isSpecies(value: unknown): value is SpeciesId {
  return SPECIES.some((item) => item.id === value);
}

/** Buyer-facing name for a young animal. Livestock stays "offspring" for one or many. */
export function youngAnimalLabel(species: string | null | undefined, count = 1) {
  const one = count === 1;
  if (species === "cat") return one ? "kitten" : "kittens";
  if (species === "livestock") return "offspring";
  return one ? "puppy" : "puppies";
}
