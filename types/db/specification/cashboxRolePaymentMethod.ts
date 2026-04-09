import { z } from 'zod';

export const cashboxRolePaymentMethodQuerySchema = z.object({
  cashboxRoleId: z.string().uuid().optional(),
  cashboxPaymentMethodId: z.string().uuid().optional(),
  isActive: z.string().optional(),
});

export const cashboxRolePaymentMethodCreateSchema = z.object({
  cashboxRoleId: z.string().uuid(),
  cashboxPaymentMethodId: z.string().uuid(),
  isActive: z.boolean().optional(),
  userId: z.string().nullable().optional(),
});

export const cashboxRolePaymentMethodUpdateSchema =
  cashboxRolePaymentMethodCreateSchema.partial();

export const cashboxRolePaymentMethodResponseSchema = z.object({
  cashboxRolePaymentMethodId: z.string().uuid(),
  cashboxRoleId: z.string().uuid(),
  cashboxPaymentMethodId: z.string().uuid(),
  isActive: z.boolean(),
  tranId: z.number(),
  tranDate: z.string(),
  tranPeriod: z.string().nullable(),
  userId: z.string().nullable(),
});

export type CashboxRolePaymentMethodQuery = z.infer<
  typeof cashboxRolePaymentMethodQuerySchema
>;
export type CashboxRolePaymentMethodCreate = z.infer<
  typeof cashboxRolePaymentMethodCreateSchema
>;
export type CashboxRolePaymentMethodUpdate = z.infer<
  typeof cashboxRolePaymentMethodUpdateSchema
>;
export type CashboxRolePaymentMethodResponse = z.infer<
  typeof cashboxRolePaymentMethodResponseSchema
>;
