import { NextResponse } from 'next/server';
import { z } from 'zod';
import { parseJsonRequestBody } from '@/lib/api/parseJsonRequest';
import {
  deactivateCashboxPaymentMethod,
  getCashboxPaymentMethodById,
  updateCashboxPaymentMethod,
} from '@/lib/crud/specification/cashbox_payment_method';
import {
  cashboxPaymentMethodResponseSchema,
  cashboxPaymentMethodUpdateSchema,
} from '@/types/db/specification/cashboxPaymentMethod';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Params) {
  const { id } = await context.params;
  const method = await getCashboxPaymentMethodById(id);

  if (!method) {
    return NextResponse.json(
      { error: 'Payment method not found' },
      { status: 404 },
    );
  }

  return NextResponse.json(method);
}

export async function PATCH(request: Request, context: Params) {
  const { id } = await context.params;
  const parsed = await parseJsonRequestBody(
    request,
    cashboxPaymentMethodUpdateSchema,
  );
  if (parsed.errorResponse) return parsed.errorResponse;
  const updatePayload = { ...parsed.value } as any;
  delete updatePayload.userId;

  const updated = await updateCashboxPaymentMethod(id, updatePayload);

  if (updated === null) {
    return NextResponse.json(
      { error: 'No fields provided to update' },
      { status: 400 },
    );
  }

  if (!updated) {
    return NextResponse.json(
      { error: 'Payment method not found' },
      { status: 404 },
    );
  }

  return NextResponse.json(updated);
}

export const cashboxPaymentMethodByIdOpenApi = {
  path: '/api/specification/cashbox_payment_method/{id}',
  tag: 'CRUD - cashbox payment method',
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
      description: 'Cashbox payment method ID',
    },
  ],
  operations: {
    get: {
      summary: 'Get a cashbox payment method by ID',
      responseSchema: cashboxPaymentMethodResponseSchema,
      responseSchemaName: 'CashboxPaymentMethod',
    },
    patch: {
      summary: 'Update a cashbox payment method',
      requestBodySchema: cashboxPaymentMethodUpdateSchema,
      requestBodySchemaName: 'CashboxPaymentMethodUpdate',
      responseSchema: cashboxPaymentMethodResponseSchema,
      responseSchemaName: 'CashboxPaymentMethod',
    },
    delete: {
      summary: 'Soft delete a cashbox payment method',
      responses: {
        '204': { description: 'Cashbox payment method deactivated' },
        '404': {
          description: 'Cashbox payment method not found',
          schema: z.object({ error: z.string() }),
          schemaName: 'ErrorResponse',
        },
      },
    },
  },
};

export async function DELETE(_request: Request, context: Params) {
  const { id } = await context.params;

  const result = await deactivateCashboxPaymentMethod(id);

  if (!result) {
    return NextResponse.json(
      { error: 'Payment method not found' },
      { status: 404 },
    );
  }

  return new NextResponse(null, { status: 204 });
}
