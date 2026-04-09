import { z } from 'zod';

export const cashboxUserTerminalQuerySchema = z.object({
  cashboxUserId: z.string().uuid().optional(),
  cashboxTerminalId: z.string().uuid().optional(),
  isActive: z.string().optional(),
});

export const cashboxUserTerminalCreateSchema = z.object({
  cashboxUserId: z.string().uuid(),
  cashboxTerminalId: z.string().uuid(),
  isActive: z.boolean().optional(),
  userId: z.string().optional(),
});

export const cashboxUserTerminalUpdateSchema =
  cashboxUserTerminalCreateSchema.partial();

export const cashboxUserTerminalResponseSchema = z.object({
  cashboxUserTerminalId: z.string().uuid(),
  cashboxUserId: z.string().uuid(),
  cashboxTerminalId: z.string().uuid(),
  isActive: z.boolean(),
  tranId: z.number(),
  tranDate: z.string(),
  tranPeriod: z.string().nullable(),
  userId: z.string().nullable(),
});

export type CashboxUserTerminalQuery = z.infer<
  typeof cashboxUserTerminalQuerySchema
>;
export type CashboxUserTerminalCreate = z.infer<
  typeof cashboxUserTerminalCreateSchema
>;
export type CashboxUserTerminalUpdate = z.infer<
  typeof cashboxUserTerminalUpdateSchema
>;
export type CashboxUserTerminalResponse = z.infer<
  typeof cashboxUserTerminalResponseSchema
>;
