import { z } from 'zod';

export const cashboxRolePartnerQuerySchema = z.object({
  cashboxRoleId: z.string().uuid().optional(),
  cashboxPartnerId: z.string().uuid().optional(),
  isActive: z.string().optional(),
});

export const cashboxRolePartnerCreateSchema = z.object({
  cashboxRoleId: z.string().uuid(),
  cashboxPartnerId: z.string().uuid(),
  isActive: z.boolean().optional(),
  userId: z.string().nullable().optional(),
});

export const cashboxRolePartnerUpdateSchema =
  cashboxRolePartnerCreateSchema.partial();

export const cashboxRolePartnerResponseSchema = z.object({
  cashboxRolePartnerId: z.string().uuid(),
  cashboxRoleId: z.string().uuid(),
  cashboxPartnerId: z.string().uuid(),
  isActive: z.boolean(),
  tranId: z.number(),
  tranDate: z.string(),
  tranPeriod: z.string().nullable(),
  userId: z.string().nullable(),
});

export type CashboxRolePartnerQuery = z.infer<
  typeof cashboxRolePartnerQuerySchema
>;
export type CashboxRolePartnerCreate = z.infer<
  typeof cashboxRolePartnerCreateSchema
>;
export type CashboxRolePartnerUpdate = z.infer<
  typeof cashboxRolePartnerUpdateSchema
>;
export type CashboxRolePartnerResponse = z.infer<
  typeof cashboxRolePartnerResponseSchema
>;
