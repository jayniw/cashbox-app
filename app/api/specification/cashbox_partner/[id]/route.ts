import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getCashboxPartnerById,
  deactivateCashboxPartner,
  updateCashboxPartner,
} from '@/lib/crud/specification/cashbox_partner';
import {
  cashboxPartnerResponseSchema,
  cashboxPartnerUpdateSchema,
} from '@/types/db/specification/cashboxPartner';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Params) {
  const { id } = await context.params;
  const partner = await getCashboxPartnerById(id);

  if (!partner) {
    return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
  }

  return NextResponse.json(partner);
}

export async function PATCH(request: Request, context: Params) {
  const { id } = await context.params;
  const body = cashboxPartnerUpdateSchema.parse(await request.json());

  const updated = await updateCashboxPartner(id, body);

  if (updated === null) {
    return NextResponse.json(
      { error: 'No fields provided to update' },
      { status: 400 },
    );
  }

  if (!updated) {
    return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export const cashboxPartnerByIdOpenApi = {
  path: '/api/specification/cashbox_partner/{id}',
  tag: 'CRUD - cashbox partner',
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
      description: 'Cashbox partner ID',
    },
  ],
  operations: {
    get: {
      summary: 'Get a cashbox partner by ID',
      responseSchema: cashboxPartnerResponseSchema,
      responseSchemaName: 'CashboxPartner',
    },
    patch: {
      summary: 'Update a cashbox partner',
      requestBodySchema: cashboxPartnerUpdateSchema,
      requestBodySchemaName: 'CashboxPartnerUpdate',
      responseSchema: cashboxPartnerResponseSchema,
      responseSchemaName: 'CashboxPartner',
    },
    delete: {
      summary: 'Soft delete a cashbox partner',
      responses: {
        '204': { description: 'Cashbox partner deactivated' },
        '404': {
          description: 'Cashbox partner not found',
          schema: z.object({ error: z.string() }),
          schemaName: 'ErrorResponse',
        },
      },
    },
  },
};

export async function DELETE(_request: Request, context: Params) {
  const { id } = await context.params;

  const result = await deactivateCashboxPartner(id);

  if (!result) {
    return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
