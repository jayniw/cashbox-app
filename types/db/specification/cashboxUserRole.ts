import { z } from 'zod';

export const cashboxUserRoleQuerySchema = z.object({
  cashboxUserId: z.string().uuid().optional(),
  cashboxRoleId: z.string().uuid().optional(),
});

export const cashboxUserRoleCreateSchema = z.object({
  cashboxUserId: z.string().uuid(),
  cashboxRoleId: z.string().uuid(),
  isDefault: z.boolean().optional(),
  userId: z.string().optional(),
});

export const cashboxUserRoleUpdateSchema =
  cashboxUserRoleCreateSchema.partial();

export const cashboxUserRoleResponseSchema = z.object({
  cashboxUserRoleId: z.string().uuid(),
  cashboxUserId: z.string().uuid(),
  cashboxRoleId: z.string().uuid(),
  isDefault: z.boolean(),
  tranId: z.number(),
  tranDate: z.string(),
  tranPeriod: z.string().nullable(),
  userId: z.string().nullable(),
});

export type CashboxUserRoleQuery = z.infer<typeof cashboxUserRoleQuerySchema>;
export type CashboxUserRoleCreate = z.infer<typeof cashboxUserRoleCreateSchema>;
export type CashboxUserRoleUpdate = z.infer<typeof cashboxUserRoleUpdateSchema>;
export type CashboxUserRoleResponse = z.infer<
  typeof cashboxUserRoleResponseSchema
>;
