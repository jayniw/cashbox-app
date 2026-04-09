import { NextResponse } from 'next/server';
import { z } from 'zod';
import { parseJsonRequestBody } from '@/lib/api/parseJsonRequest';
import {
  getCashboxPaymentGatewayById,
  updateCashboxPaymentGateway,
} from '@/lib/crud/specification/cashbox_payment_gateway';
import {
  cashboxPaymentGatewayResponseSchema,
  cashboxPaymentGatewayUpdateSchema,
} from '@/types/db/specification/cashboxPaymentGateway';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Params) {
  const { id } = await context.params;
  const gateway = await getCashboxPaymentGatewayById(id);

  if (!gateway) {
    return NextResponse.json(
      { error: 'Payment gateway not found' },
      { status: 404 },
    );
  }

  return NextResponse.json(gateway);
}

export async function PATCH(request: Request, context: Params) {
  const { id } = await context.params;
  const parsed = await parseJsonRequestBody(
    request,
    cashboxPaymentGatewayUpdateSchema,
  );
  if (parsed.errorResponse) return parsed.errorResponse;
  const updatePayload = { ...parsed.value } as any;
  delete updatePayload.userId;

  const updated = await updateCashboxPaymentGateway(id, updatePayload);

  if (updated === null) {
    return NextResponse.json(
      { error: 'No fields provided to update' },
      { status: 400 },
    );
  }

  if (!updated) {
    return NextResponse.json(
      { error: 'Payment gateway not found' },
      { status: 404 },
    );
  }

  return NextResponse.json(updated);
}

export const cashboxPaymentGatewayByIdOpenApi = {
  path: '/api/specification/cashbox_payment_gateway/{id}',
  tag: 'CRUD - cashbox payment gateway',
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
      description: 'Cashbox payment gateway ID',
    },
  ],
  operations: {
    get: {
      summary: 'Get a cashbox payment gateway by ID',
      responseSchema: cashboxPaymentGatewayResponseSchema,
      responseSchemaName: 'CashboxPaymentGateway',
    },
    patch: {
      summary: 'Update a cashbox payment gateway',
      requestBodySchema: cashboxPaymentGatewayUpdateSchema,
      requestBodySchemaName: 'CashboxPaymentGatewayUpdate',
      responseSchema: cashboxPaymentGatewayResponseSchema,
      responseSchemaName: 'CashboxPaymentGateway',
    },
  },
};
