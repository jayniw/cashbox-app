import { z } from 'zod';

export const cashboxPaymentGatewayQuerySchema = z.object({
  paymentGatewayName: z.string().min(1).optional(),
  paymentGatewayType: z.string().min(1).optional(),
});

export const cashboxPaymentGatewayCreateSchema = z.object({
  paymentGatewayName: z.string().min(1),
  paymentGatewayDescription: z.string().nullable().optional(),
  gatewayConfiguration: z.unknown().optional(),
  paymentGatewayType: z.string().default('REST').optional(),
  tranId: z.preprocess((value) => {
    if (typeof value === 'string' && value.trim() !== '') {
      return Number(value);
    }
    return value;
  }, z.number().int().positive().optional()),
  tranPeriod: z.string().optional(),
  userId: z.string().optional(),
});

export const cashboxPaymentGatewayUpdateSchema =
  cashboxPaymentGatewayCreateSchema.partial();

export const cashboxPaymentGatewayResponseSchema = z.object({
  cashboxPaymentGatewayId: z.string().uuid(),
  paymentGatewayName: z.string(),
  paymentGatewayDescription: z.string().nullable(),
  gatewayConfiguration: z.unknown().nullable(),
  paymentGatewayType: z.string(),
  tranId: z.number().nullable(),
  tranDate: z.string(),
  tranPeriod: z.string().nullable(),
  userId: z.string().nullable(),
});

export type CashboxPaymentGatewayQuery = z.infer<
  typeof cashboxPaymentGatewayQuerySchema
>;
export type CashboxPaymentGatewayCreate = z.infer<
  typeof cashboxPaymentGatewayCreateSchema
>;
export type CashboxPaymentGatewayUpdate = z.infer<
  typeof cashboxPaymentGatewayUpdateSchema
>;
export type CashboxPaymentGatewayResponse = z.infer<
  typeof cashboxPaymentGatewayResponseSchema
>;
