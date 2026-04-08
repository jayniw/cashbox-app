import { z } from 'zod';

export const cashboxTerminalQuerySchema = z.object({
  terminalName: z.string().min(1).optional(),
  ipAddress: z.string().min(1).optional(),
  isActive: z.string().optional(),
});

const geoPointParser = z.preprocess(
  (value) => {
    if (typeof value === 'string') {
      return value.trim();
    }

    if (Array.isArray(value) && value.length === 2) {
      return `${value[0]},${value[1]}`;
    }

    if (typeof value === 'object' && value !== null) {
      const record = value as {
        x?: number;
        y?: number;
        lon?: number;
        lat?: number;
      };
      const x = record.x ?? record.lon;
      const y = record.y ?? record.lat;
      if (typeof x === 'number' && typeof y === 'number') {
        return `${x},${y}`;
      }
    }

    return value;
  },
  z
    .string()
    .regex(/^\(?\s*[-+]?\d+(?:\.\d+)?\s*,\s*[-+]?\d+(?:\.\d+)?\s*\)?$/)
    .nullable()
    .optional(),
);

export const cashboxTerminalCreateSchema = z.object({
  terminalName: z.string().optional(),
  ipAddress: z.string().nullable().optional(),
  geoPoint: geoPointParser,
  geoUrl: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  userId: z.string().optional(),
});

export const cashboxTerminalUpdateSchema =
  cashboxTerminalCreateSchema.partial();

export const cashboxTerminalResponseSchema = z.object({
  cashboxTerminalId: z.string().uuid(),
  terminalName: z.string().nullable(),
  ipAddress: z.string().nullable(),
  geoPoint: z.string().nullable(),
  geoUrl: z.string().nullable(),
  isActive: z.boolean(),
  tranId: z.number().nullable(),
  tranDate: z.string(),
  tranPeriod: z.string().nullable(),
  userId: z.string().nullable(),
});

export type CashboxTerminalQuery = z.infer<typeof cashboxTerminalQuerySchema>;
export type CashboxTerminalCreate = z.infer<typeof cashboxTerminalCreateSchema>;
export type CashboxTerminalUpdate = z.infer<typeof cashboxTerminalUpdateSchema>;
export type CashboxTerminalResponse = z.infer<
  typeof cashboxTerminalResponseSchema
>;
