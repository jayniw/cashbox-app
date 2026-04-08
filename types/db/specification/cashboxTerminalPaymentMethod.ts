import { z } from 'zod';

export const cashboxTerminalPaymentMethodQuerySchema = z.object({
  cashboxTerminalId: z.string().uuid().optional(),
  cashboxPaymentMethodId: z.string().uuid().optional(),
  isActive: z.string().optional(),
});

export const cashboxTerminalPaymentMethodCreateSchema = z.object({
  cashboxTerminalId: z.string().uuid(),
  cashboxPaymentMethodId: z.string().uuid(),
  isActive: z.boolean().optional(),
  userId: z.string().nullable().optional(),
});

export const cashboxTerminalPaymentMethodUpdateSchema =
  cashboxTerminalPaymentMethodCreateSchema.partial();

export const cashboxTerminalPaymentMethodResponseSchema = z.object({
  cashboxTerminalPaymentMethodId: z.string().uuid(),
  cashboxTerminalId: z.string().uuid(),
  cashboxPaymentMethodId: z.string().uuid(),
  isActive: z.boolean(),
  tranId: z.number(),
  tranDate: z.string(),
  tranPeriod: z.string().nullable(),
  userId: z.string().nullable(),
});

export type CashboxTerminalPaymentMethodCreate = z.infer<
  typeof cashboxTerminalPaymentMethodCreateSchema
>;
export type CashboxTerminalPaymentMethodUpdate = z.infer<
  typeof cashboxTerminalPaymentMethodUpdateSchema
>;
export type CashboxTerminalPaymentMethodResponse = z.infer<
  typeof cashboxTerminalPaymentMethodResponseSchema
>;
