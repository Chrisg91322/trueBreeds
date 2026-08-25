import { z } from "zod";

export const animalSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  species: z.enum(["dog", "cat"]),
  breed: z.string().max(200).optional().or(z.literal("")),
  sex: z.enum(["male", "female"]),
  dateOfBirth: z.string().optional().or(z.literal("")),
  color: z.string().max(120).optional().or(z.literal("")),
  weightLbs: z.coerce.number().positive().optional().or(z.nan()),
  bio: z.string().max(4000).optional().or(z.literal("")),
  registryNumber: z.string().max(120).optional().or(z.literal("")),
  titlesCsv: z.string().max(500).optional().or(z.literal("")),
  pedigreeUrl: z.string().url().optional().or(z.literal("")),
  embarkUrl: z.string().url().optional().or(z.literal("")),
  coverPhotoUrl: z.string().url().optional().or(z.literal("")),
  isBreedingStock: z.coerce.boolean().optional(),
  isRetired: z.coerce.boolean().optional(),
});
export type AnimalFormValues = z.infer<typeof animalSchema>;

export const litterSchema = z.object({
  species: z.enum(["dog", "cat"]),
  breed: z.string().max(200).optional().or(z.literal("")),
  sireId: z.string().uuid().optional().or(z.literal("")),
  damId: z.string().uuid().optional().or(z.literal("")),
  status: z.enum(["planned", "expecting", "born", "active", "complete"]),
  whelpDate: z.string().optional().or(z.literal("")),
  expectedWhelpDate: z.string().optional().or(z.literal("")),
  goHomeDate: z.string().optional().or(z.literal("")),
  description: z.string().max(4000).optional().or(z.literal("")),
  defaultPrice: z.coerce.number().nonnegative().optional().or(z.nan()),
  defaultDepositAmount: z.coerce.number().nonnegative().optional().or(z.nan()),
  coverPhotoUrl: z.string().url().optional().or(z.literal("")),
});
export type LitterFormValues = z.infer<typeof litterSchema>;

export const offspringSchema = z.object({
  litterId: z.string().uuid(),
  name: z.string().max(200).optional().or(z.literal("")),
  sex: z.enum(["male", "female"]),
  color: z.string().max(120).optional().or(z.literal("")),
  price: z.coerce.number().nonnegative().optional().or(z.nan()),
  depositAmount: z.coerce.number().nonnegative().optional().or(z.nan()),
  status: z.enum(["upcoming", "available", "deposit_received", "reserved", "sold", "kept"]),
  microchip: z.string().max(120).optional().or(z.literal("")),
  notes: z.string().max(4000).optional().or(z.literal("")),
  coverPhotoUrl: z.string().url().optional().or(z.literal("")),
});
export type OffspringFormValues = z.infer<typeof offspringSchema>;
