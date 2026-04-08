import { z } from 'zod';

export const cashboxRoleQuerySchema = z.object({
  roleName: z.string().min(1).optional(),
});

export const cashboxRoleCreateSchema = z.object({
  roleName: z.string().min(1),
  userId: z.string().optional(),
});

export const cashboxRoleUpdateSchema = cashboxRoleCreateSchema.partial();

export const cashboxRoleResponseSchema = z.object({
  cashboxRoleId: z.string().uuid(),
  roleName: z.string().nullable(),
  tranId: z.number().nullable(),
  tranDate: z.string(),
  tranPeriod: z.string().nullable(),
  userId: z.string().nullable(),
});

export type CashboxRoleQuery = z.infer<typeof cashboxRoleQuerySchema>;
export type CashboxRoleCreate = z.infer<typeof cashboxRoleCreateSchema>;
export type CashboxRoleUpdate = z.infer<typeof cashboxRoleUpdateSchema>;
export type CashboxRoleResponse = z.infer<typeof cashboxRoleResponseSchema>;
