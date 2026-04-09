import { NextResponse } from 'next/server';
import { z } from 'zod';
import { parseJsonRequestBody } from '@/lib/api/parseJsonRequest';
import {
  getCashboxPaymentMethodProviderById,
  updateCashboxPaymentMethodProvider,
} from '@/lib/crud/specification/cashbox_payment_method_provider';
import {
  cashboxPaymentMethodProviderResponseSchema,
  cashboxPaymentMethodProviderUpdateSchema,
} from '@/types/db/specification/cashboxPaymentMethodProvider';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Params) {
  const { id } = await context.params;
  const provider = await getCashboxPaymentMethodProviderById(id);

  if (!provider) {
    return NextResponse.json(
      { error: 'Payment method provider not found' },
      { status: 404 },
    );
  }

  return NextResponse.json(provider);
}

export async function PATCH(request: Request, context: Params) {
  const { id } = await context.params;
  const parsed = await parseJsonRequestBody(
    request,
    cashboxPaymentMethodProviderUpdateSchema,
  );
  if (parsed.errorResponse) return parsed.errorResponse;
  const updatePayload = { ...parsed.value } as any;
  delete updatePayload.userId;

  const updated = await updateCashboxPaymentMethodProvider(id, updatePayload);

  if (updated === null) {
    return NextResponse.json(
      { error: 'No fields provided to update' },
      { status: 400 },
    );
  }

  if (!updated) {
    return NextResponse.json(
      { error: 'Payment method provider not found' },
      { status: 404 },
    );
  }

  return NextResponse.json(updated);
}

export const cashboxPaymentMethodProviderByIdOpenApi = {
  path: '/api/specification/cashbox_payment_method_provider/{id}',
  tag: 'CRUD - cashbox payment method provider',
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
      description: 'Payment method provider ID',
    },
  ],
  operations: {
    get: {
      summary: 'Get a cashbox payment method provider by ID',
      responseSchema: cashboxPaymentMethodProviderResponseSchema,
      responseSchemaName: 'CashboxPaymentMethodProvider',
    },
    patch: {
      summary: 'Update a cashbox payment method provider',
      requestBodySchema: cashboxPaymentMethodProviderUpdateSchema,
      requestBodySchemaName: 'CashboxPaymentMethodProviderUpdate',
      responseSchema: cashboxPaymentMethodProviderResponseSchema,
      responseSchemaName: 'CashboxPaymentMethodProvider',
    },
  },
};
