import { z } from 'zod';

export const cashboxPaymentMethodProviderQuerySchema = z.object({
  paymentGatewayId: z.string().uuid().optional(),
  paymentMethodId: z.string().uuid().optional(),
  providerName: z.string().min(1).optional(),
});

export const cashboxPaymentMethodProviderCreateSchema = z.object({
  paymentMethodId: z.string().uuid(),
  paymentGatewayId: z.string().uuid(),
  providerName: z.string().min(1),
  providerDescription: z.string().nullable().optional(),
  tranId: z.preprocess((value) => {
    if (typeof value === 'string' && value.trim() !== '') {
      return Number(value);
    }
    return value;
  }, z.number().int().positive().optional()),
  tranPeriod: z.string().optional(),
  userId: z.string().optional(),
});

export const cashboxPaymentMethodProviderUpdateSchema =
  cashboxPaymentMethodProviderCreateSchema.partial();

export const cashboxPaymentMethodProviderResponseSchema = z.object({
  cashboxPaymentMethodProviderId: z.string().uuid(),
  paymentMethodId: z.string().uuid(),
  paymentGatewayId: z.string().uuid(),
  providerName: z.string(),
  providerDescription: z.string().nullable(),
  tranId: z.number().nullable(),
  tranDate: z.string(),
  tranPeriod: z.string().nullable(),
  userId: z.string().nullable(),
});

export type CashboxPaymentMethodProviderQuery = z.infer<
  typeof cashboxPaymentMethodProviderQuerySchema
>;
export type CashboxPaymentMethodProviderCreate = z.infer<
  typeof cashboxPaymentMethodProviderCreateSchema
>;
export type CashboxPaymentMethodProviderUpdate = z.infer<
  typeof cashboxPaymentMethodProviderUpdateSchema
>;
export type CashboxPaymentMethodProviderResponse = z.infer<
  typeof cashboxPaymentMethodProviderResponseSchema
>;
