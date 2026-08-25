import { z } from "zod";

export const contactFormSchema = z.object({
  tenantId: z.string().uuid(),
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
  message: z.string().max(4000).optional().or(z.literal("")),
  offspringId: z.string().uuid().optional(),
});

export const waitlistFormSchema = z.object({
  tenantId: z.string().uuid(),
  litterId: z.string().uuid().optional(),
  breed: z.string().max(120).optional(),
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().max(40).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export const depositCheckoutSchema = z.object({
  tenantId: z.string().uuid(),
  offspringId: z.string().uuid(),
  buyerName: z.string().min(1).max(200),
  buyerEmail: z.string().email(),
  buyerPhone: z.string().max(40).optional().or(z.literal("")),
  policyAccepted: z.literal(true),
});
