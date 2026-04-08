import { z } from 'zod';

export const cashboxTerminalOperationQuerySchema = z.object({
  cashboxTerminalId: z.string().uuid().optional(),
  cashboxOperationId: z.string().uuid().optional(),
  isActive: z.string().optional(),
});

export const cashboxTerminalOperationCreateSchema = z.object({
  cashboxTerminalId: z.string().uuid(),
  cashboxOperationId: z.string().uuid(),
  isActive: z.boolean().optional(),
  userId: z.string().nullable().optional(),
});

export const cashboxTerminalOperationUpdateSchema =
  cashboxTerminalOperationCreateSchema.partial();

export const cashboxTerminalOperationResponseSchema = z.object({
  cashboxTerminalOperationId: z.string().uuid(),
  cashboxTerminalId: z.string().uuid(),
  cashboxOperationId: z.string().uuid(),
  isActive: z.boolean(),
  tranId: z.number(),
  tranDate: z.string(),
  tranPeriod: z.string().nullable(),
  userId: z.string().nullable(),
});

export type CashboxTerminalOperationCreate = z.infer<
  typeof cashboxTerminalOperationCreateSchema
>;
export type CashboxTerminalOperationUpdate = z.infer<
  typeof cashboxTerminalOperationUpdateSchema
>;
export type CashboxTerminalOperationResponse = z.infer<
  typeof cashboxTerminalOperationResponseSchema
>;
