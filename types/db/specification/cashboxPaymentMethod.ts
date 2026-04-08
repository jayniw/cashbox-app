import { z } from 'zod';

export const cashboxPaymentMethodQuerySchema = z.object({
  paymentMethodName: z.string().optional(),
  isActive: z.string().optional(),
});

export const cashboxPaymentMethodCreateSchema = z.object({
  paymentMethodName: z.string().min(1),
  isActive: z.boolean().optional(),
  userId: z.string().nullable().optional(),
});

export const cashboxPaymentMethodUpdateSchema = z.object({
  paymentMethodName: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  userId: z.string().nullable().optional(),
});

export const cashboxPaymentMethodResponseSchema = z.object({
  cashboxPaymentMethodId: z.string(),
  paymentMethodName: z.string(),
  isActive: z.boolean(),
  tranId: z.number(),
  tranDate: z.string(),
  tranPeriod: z.string().nullable(),
  userId: z.string().nullable(),
});

export type CashboxPaymentMethodCreate = z.infer<
  typeof cashboxPaymentMethodCreateSchema
>;
export type CashboxPaymentMethodUpdate = z.infer<
  typeof cashboxPaymentMethodUpdateSchema
>;
export type CashboxPaymentMethodResponse = z.infer<
  typeof cashboxPaymentMethodResponseSchema
>;
