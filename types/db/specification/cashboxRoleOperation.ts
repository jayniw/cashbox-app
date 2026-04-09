import { z } from 'zod';

export const cashboxRoleOperationQuerySchema = z.object({
  cashboxRoleId: z.string().uuid().optional(),
  cashboxOperationId: z.string().uuid().optional(),
  isActive: z.string().optional(),
});

export const cashboxRoleOperationCreateSchema = z.object({
  cashboxRoleId: z.string().uuid(),
  cashboxOperationId: z.string().uuid(),
  isActive: z.boolean().optional(),
  userId: z.string().nullable().optional(),
});

export const cashboxRoleOperationUpdateSchema =
  cashboxRoleOperationCreateSchema.partial();

export const cashboxRoleOperationResponseSchema = z.object({
  cashboxRoleOperationId: z.string().uuid(),
  cashboxRoleId: z.string().uuid(),
  cashboxOperationId: z.string().uuid(),
  isActive: z.boolean(),
  tranId: z.number(),
  tranDate: z.string(),
  tranPeriod: z.string().nullable(),
  userId: z.string().nullable(),
});

export type CashboxRoleOperationQuery = z.infer<
  typeof cashboxRoleOperationQuerySchema
>;
export type CashboxRoleOperationCreate = z.infer<
  typeof cashboxRoleOperationCreateSchema
>;
export type CashboxRoleOperationUpdate = z.infer<
  typeof cashboxRoleOperationUpdateSchema
>;
export type CashboxRoleOperationResponse = z.infer<
  typeof cashboxRoleOperationResponseSchema
>;
