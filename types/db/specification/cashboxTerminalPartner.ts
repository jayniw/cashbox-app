import { z } from 'zod';

export const cashboxTerminalPartnerQuerySchema = z.object({
  cashboxTerminalId: z.string().uuid().optional(),
  cashboxPartnerId: z.string().uuid().optional(),
  isActive: z.string().optional(),
});

export const cashboxTerminalPartnerCreateSchema = z.object({
  cashboxTerminalId: z.string().uuid(),
  cashboxPartnerId: z.string().uuid(),
  isActive: z.boolean().optional(),
  userId: z.string().nullable().optional(),
});

export const cashboxTerminalPartnerUpdateSchema =
  cashboxTerminalPartnerCreateSchema.partial();

export const cashboxTerminalPartnerResponseSchema = z.object({
  cashboxTerminalPartnerId: z.string().uuid(),
  cashboxTerminalId: z.string().uuid(),
  cashboxPartnerId: z.string().uuid(),
  isActive: z.boolean(),
  tranId: z.number(),
  tranDate: z.string(),
  tranPeriod: z.string().nullable(),
  userId: z.string().nullable(),
});

export type CashboxTerminalPartnerCreate = z.infer<
  typeof cashboxTerminalPartnerCreateSchema
>;
export type CashboxTerminalPartnerUpdate = z.infer<
  typeof cashboxTerminalPartnerUpdateSchema
>;
export type CashboxTerminalPartnerResponse = z.infer<
  typeof cashboxTerminalPartnerResponseSchema
>;
