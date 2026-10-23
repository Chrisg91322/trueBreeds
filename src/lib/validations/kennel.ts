import { z } from "zod";
import { safeHttpUrl } from "@/lib/health-certificates";
import { SPECIES_IDS } from "@/lib/species";

/** Empty form fields → undefined; avoids coerce turning "" into 0. */
const optionalPositiveNumber = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce.number().positive().optional()
);

const optionalNonNegNumber = z.preprocess(
  (v) => (v === "" || v === null || v === undefined ? undefined : v),
  z.coerce.number().nonnegative().optional()
);

/** Checkbox + hidden "false" — do not use z.coerce.boolean (Boolean("false") === true). */
const formBoolean = z
  .union([z.literal("true"), z.literal("false"), z.boolean()])
  .optional()
  .transform((v) => v === true || v === "true");

const healthCertificateSchema = z.object({
  label: z.string().trim().min(1).max(120),
  url: z.string().refine((value) => safeHttpUrl(value) !== null, "Use an http(s) link"),
});

const puppySchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  name: z.string().trim().min(1).max(200),
  dateOfBirth: z.string().optional().or(z.literal("")),
  color: z.string().trim().max(120).optional().or(z.literal("")),
  coatType: z.string().trim().max(120).optional().or(z.literal("")),
  sex: z.enum(["male", "female"]),
});

function parseJsonList(value: unknown) {
  if (value === "" || value === undefined || value === null) return [];
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

export const animalSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  species: z.enum(SPECIES_IDS),
  breed: z.string().max(200).optional().or(z.literal("")),
  sex: z.enum(["male", "female"]),
  dateOfBirth: z.string().optional().or(z.literal("")),
  color: z.string().max(120).optional().or(z.literal("")),
  coatType: z.string().trim().max(120).optional().or(z.literal("")),
  weightLbs: optionalPositiveNumber,
  bio: z.string().max(4000).optional().or(z.literal("")),
  registryNumber: z.string().max(120).optional().or(z.literal("")),
  titlesCsv: z.string().max(500).optional().or(z.literal("")),
  sireName: z.string().trim().max(200).optional().or(z.literal("")),
  damName: z.string().trim().max(200).optional().or(z.literal("")),
  healthCertificatesJson: z.preprocess(
    parseJsonList,
    z.array(healthCertificateSchema).max(12)
  ),
  puppiesJson: z.preprocess((value) => {
    const parsed = parseJsonList(value);
    if (!Array.isArray(parsed)) return parsed;
    return parsed.filter((row) => {
      if (!row || typeof row !== "object") return false;
      const name = "name" in row && typeof row.name === "string" ? row.name.trim() : "";
      return name.length > 0;
    });
  }, z.array(puppySchema).max(40)),
  coverPhotoUrl: z.string().url().optional().or(z.literal("")),
  isBreedingStock: formBoolean,
  isRetired: formBoolean,
});
export type AnimalFormValues = z.infer<typeof animalSchema>;

export const litterSchema = z.object({
  species: z.enum(SPECIES_IDS),
  breed: z.string().max(200).optional().or(z.literal("")),
  sireId: z.string().uuid().optional().or(z.literal("")),
  damId: z.string().uuid().optional().or(z.literal("")),
  status: z.enum(["planned", "expecting", "born", "active", "complete"]),
  whelpDate: z.string().optional().or(z.literal("")),
  expectedWhelpDate: z.string().optional().or(z.literal("")),
  goHomeDate: z.string().optional().or(z.literal("")),
  description: z.string().max(4000).optional().or(z.literal("")),
  defaultPrice: optionalNonNegNumber,
  defaultDepositAmount: optionalNonNegNumber,
  coverPhotoUrl: z.string().url().optional().or(z.literal("")),
});
export type LitterFormValues = z.infer<typeof litterSchema>;

export const offspringSchema = z.object({
  litterId: z.string().uuid(),
  name: z.string().max(200).optional().or(z.literal("")),
  sex: z.enum(["male", "female"]),
  color: z.string().max(120).optional().or(z.literal("")),
  price: optionalNonNegNumber,
  depositAmount: optionalNonNegNumber,
  status: z.enum(["upcoming", "available", "deposit_received", "reserved", "sold", "kept"]),
  microchip: z.string().max(120).optional().or(z.literal("")),
  notes: z.string().max(4000).optional().or(z.literal("")),
  coverPhotoUrl: z.string().url().optional().or(z.literal("")),
});
export type OffspringFormValues = z.infer<typeof offspringSchema>;
