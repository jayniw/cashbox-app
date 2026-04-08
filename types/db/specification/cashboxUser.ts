import { z } from 'zod';

export const cashboxUserQuerySchema = z.object({
  userName: z.string().min(1).optional(),
  authenticationType: z.string().min(1).optional(),
  userStatus: z.string().min(1).optional(),
});

export const cashboxUserCreateSchema = z.object({
  userName: z.string().min(1),
  authenticationType: z.string().optional(),
  userStatus: z.string().optional(),
  userEmail: z.string().email().nullable().optional(),
  userPhone: z.string().nullable().optional(),
  userId: z.string().optional(),
});

export const cashboxUserUpdateSchema = cashboxUserCreateSchema.partial();

export const cashboxUserResponseSchema = z.object({
  cashboxUserId: z.string().uuid(),
  userName: z.string(),
  authenticationType: z.string(),
  userStatus: z.string(),
  userEmail: z.string().nullable(),
  userPhone: z.string().nullable(),
  tranId: z.number().nullable(),
  tranDate: z.string(),
  tranPeriod: z.string().nullable(),
  userId: z.string().nullable(),
});

export type CashboxUserQuery = z.infer<typeof cashboxUserQuerySchema>;
export type CashboxUserCreate = z.infer<typeof cashboxUserCreateSchema>;
export type CashboxUserUpdate = z.infer<typeof cashboxUserUpdateSchema>;
export type CashboxUserResponse = z.infer<typeof cashboxUserResponseSchema>;
