import { NextResponse } from 'next/server';
import { z } from 'zod';
import { parseJsonRequestBody } from '@/lib/api/parseJsonRequest';
import {
  deactivateCashboxPartnerPaymentMethod,
  getCashboxPartnerPaymentMethodById,
  updateCashboxPartnerPaymentMethod,
} from '@/lib/crud/specification/cashbox_partner_payment_method';
import {
  cashboxPartnerPaymentMethodResponseSchema,
  cashboxPartnerPaymentMethodUpdateSchema,
} from '@/types/db/specification/cashboxPartnerPaymentMethod';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Params) {
  const { id } = await context.params;
  const item = await getCashboxPartnerPaymentMethodById(id);

  if (!item) {
    return NextResponse.json(
      { error: 'Partner payment method record not found' },
      { status: 404 },
    );
  }

  return NextResponse.json(item);
}

export async function PATCH(request: Request, context: Params) {
  const { id } = await context.params;
  const parsed = await parseJsonRequestBody(
    request,
    cashboxPartnerPaymentMethodUpdateSchema,
  );
  if (parsed.errorResponse) return parsed.errorResponse;
  const updatePayload = { ...parsed.value } as any;
  delete updatePayload.userId;

  const updated = await updateCashboxPartnerPaymentMethod(id, updatePayload);

  if (updated === null) {
    return NextResponse.json(
      { error: 'No fields provided to update' },
      { status: 400 },
    );
  }

  if (!updated) {
    return NextResponse.json(
      { error: 'Partner payment method record not found' },
      { status: 404 },
    );
  }

  return NextResponse.json(updated);
}

export const cashboxPartnerPaymentMethodByIdOpenApi = {
  path: '/api/specification/cashbox_partner_payment_method/{id}',
  tag: 'CRUD - cashbox partner payment method',
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
      description: 'Partner payment method relationship ID',
    },
  ],
  operations: {
    get: {
      summary: 'Get a cashbox partner payment method link by ID',
      responseSchema: cashboxPartnerPaymentMethodResponseSchema,
      responseSchemaName: 'CashboxPartnerPaymentMethod',
    },
    patch: {
      summary: 'Update a cashbox partner payment method link',
      requestBodySchema: cashboxPartnerPaymentMethodUpdateSchema,
      requestBodySchemaName: 'CashboxPartnerPaymentMethodUpdate',
      responseSchema: cashboxPartnerPaymentMethodResponseSchema,
      responseSchemaName: 'CashboxPartnerPaymentMethod',
    },
    delete: {
      summary: 'Soft delete a cashbox partner payment method link',
      responses: {
        '204': { description: 'Partner payment method link deactivated' },
        '404': {
          description: 'Partner payment method record not found',
          schema: z.object({ error: z.string() }),
          schemaName: 'ErrorResponse',
        },
      },
    },
  },
};

export async function DELETE(_request: Request, context: Params) {
  const { id } = await context.params;
  const result = await deactivateCashboxPartnerPaymentMethod(id);

  if (!result) {
    return NextResponse.json(
      { error: 'Partner payment method record not found' },
      { status: 404 },
    );
  }

  return new NextResponse(null, { status: 204 });
}
