import { z } from 'zod';

export const cashboxPartnerPaymentMethodQuerySchema = z.object({
  cashboxPartnerId: z.string().uuid().optional(),
  cashboxPaymentMethodId: z.string().uuid().optional(),
  isActive: z.string().optional(),
});

export const cashboxPartnerPaymentMethodCreateSchema = z.object({
  cashboxPartnerId: z.string().uuid(),
  cashboxPaymentMethodId: z.string().uuid(),
  isActive: z.boolean().optional(),
  userId: z.string().optional(),
});

export const cashboxPartnerPaymentMethodUpdateSchema =
  cashboxPartnerPaymentMethodCreateSchema.partial();

export const cashboxPartnerPaymentMethodResponseSchema = z.object({
  cashboxPartnerPaymentMethodId: z.string().uuid(),
  cashboxPartnerId: z.string().uuid(),
  cashboxPaymentMethodId: z.string().uuid(),
  isActive: z.boolean(),
  tranId: z.number(),
  tranDate: z.string(),
  tranPeriod: z.string().nullable(),
  userId: z.string().nullable(),
});

export type CashboxPartnerPaymentMethodQuery = z.infer<
  typeof cashboxPartnerPaymentMethodQuerySchema
>;
export type CashboxPartnerPaymentMethodCreate = z.infer<
  typeof cashboxPartnerPaymentMethodCreateSchema
>;
export type CashboxPartnerPaymentMethodUpdate = z.infer<
  typeof cashboxPartnerPaymentMethodUpdateSchema
>;
export type CashboxPartnerPaymentMethodResponse = z.infer<
  typeof cashboxPartnerPaymentMethodResponseSchema
>;
