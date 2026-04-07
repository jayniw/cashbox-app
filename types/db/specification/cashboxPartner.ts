import { z } from 'zod';

export const cashboxPartnerQuerySchema = z.object({
  partnerName: z.string().min(1).optional(),
  partnerStatus: z.string().min(1).optional(),
});

export const cashboxPartnerCreateSchema = z.object({
  partnerName: z.string().min(1).optional(),
  partnerStatus: z.string().optional(),
  logo: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  tranId: z.preprocess((value) => {
    if (typeof value === 'string' && value.trim() !== '') {
      return Number(value);
    }
    return value;
  }, z.number().int().positive().optional()),
  tranPeriod: z.string().optional(),
  userId: z.string().optional(),
});

export const cashboxPartnerUpdateSchema = cashboxPartnerCreateSchema.partial();

export const cashboxPartnerResponseSchema = z.object({
  cashboxPartnerId: z.string().uuid(),
  partnerName: z.string().nullable(),
  partnerStatus: z.string(),
  logo: z.string().nullable(),
  url: z.string().nullable(),
  tranId: z.number().nullable(),
  tranDate: z.string(),
  tranPeriod: z.string().nullable(),
  userId: z.string().nullable(),
});

export type CashboxPartnerQuery = z.infer<typeof cashboxPartnerQuerySchema>;
export type CashboxPartnerCreate = z.infer<typeof cashboxPartnerCreateSchema>;
export type CashboxPartnerUpdate = z.infer<typeof cashboxPartnerUpdateSchema>;
export type CashboxPartnerResponse = z.infer<
  typeof cashboxPartnerResponseSchema
>;
