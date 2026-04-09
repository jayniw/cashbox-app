import { z } from 'zod';

export const cashboxOperationQuerySchema = z.object({
  partnerId: z.string().uuid().optional(),
  operationName: z.string().min(1).optional(),
  isActive: z.string().min(1).optional(),
});

export const cashboxOperationCreateSchema = z.object({
  partnerId: z.string().uuid(),
  operationName: z.string().min(1),
  isActive: z.boolean().optional(),
  tranId: z.preprocess((value) => {
    if (typeof value === 'string' && value.trim() !== '') {
      return Number(value);
    }
    return value;
  }, z.number().int().positive().optional()),
  tranPeriod: z.string().optional(),
  userId: z.string().optional(),
});

export const cashboxOperationUpdateSchema =
  cashboxOperationCreateSchema.partial();

export const cashboxOperationResponseSchema = z.object({
  cashboxOperationId: z.string().uuid(),
  cashboxPartnerId: z.string().uuid(),
  operationName: z.string(),
  isActive: z.boolean(),
  tranId: z.number().nullable(),
  tranDate: z.string(),
  tranPeriod: z.string().nullable(),
  userId: z.string().nullable(),
});

export type CashboxOperationQuery = z.infer<typeof cashboxOperationQuerySchema>;
export type CashboxOperationCreate = z.infer<
  typeof cashboxOperationCreateSchema
>;
export type CashboxOperationUpdate = z.infer<
  typeof cashboxOperationUpdateSchema
>;
export type CashboxOperationResponse = z.infer<
  typeof cashboxOperationResponseSchema
>;
