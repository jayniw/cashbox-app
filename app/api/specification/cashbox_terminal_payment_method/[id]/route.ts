import { NextResponse } from 'next/server';
import { z } from 'zod';
import { parseJsonRequestBody } from '@/lib/api/parseJsonRequest';
import {
  deactivateCashboxTerminalPaymentMethod,
  getCashboxTerminalPaymentMethodById,
  updateCashboxTerminalPaymentMethod,
} from '@/lib/crud/specification/cashbox_terminal_payment_method';
import {
  cashboxTerminalPaymentMethodResponseSchema,
  cashboxTerminalPaymentMethodUpdateSchema,
} from '@/types/db/specification/cashboxTerminalPaymentMethod';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Params) {
  const { id } = await context.params;
  const item = await getCashboxTerminalPaymentMethodById(id);

  if (!item) {
    return NextResponse.json(
      { error: 'Terminal payment method record not found' },
      { status: 404 },
    );
  }

  return NextResponse.json(item);
}

export async function PATCH(request: Request, context: Params) {
  const { id } = await context.params;
  const parsed = await parseJsonRequestBody(
    request,
    cashboxTerminalPaymentMethodUpdateSchema,
  );
  if (parsed.errorResponse) return parsed.errorResponse;

  const updated = await updateCashboxTerminalPaymentMethod(id, parsed.value);

  if (updated === null) {
    return NextResponse.json(
      { error: 'No fields provided to update' },
      { status: 400 },
    );
  }

  if (!updated) {
    return NextResponse.json(
      { error: 'Terminal payment method record not found' },
      { status: 404 },
    );
  }

  return NextResponse.json(updated);
}

export const cashboxTerminalPaymentMethodByIdOpenApi = {
  path: '/api/specification/cashbox_terminal_payment_method/{id}',
  tag: 'CRUD - cashbox terminal payment method',
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
      description: 'Cashbox terminal payment method association ID',
    },
  ],
  operations: {
    get: {
      summary: 'Get a cashbox terminal payment method link by ID',
      responseSchema: cashboxTerminalPaymentMethodResponseSchema,
      responseSchemaName: 'CashboxTerminalPaymentMethod',
    },
    patch: {
      summary: 'Update a cashbox terminal payment method association',
      requestBodySchema: cashboxTerminalPaymentMethodUpdateSchema,
      requestBodySchemaName: 'CashboxTerminalPaymentMethodUpdate',
      responseSchema: cashboxTerminalPaymentMethodResponseSchema,
      responseSchemaName: 'CashboxTerminalPaymentMethod',
    },
    delete: {
      summary: 'Soft delete a cashbox terminal payment method association',
      responses: {
        '204': { description: 'Record deactivated' },
        '404': {
          description: 'Record not found',
          schema: z.object({ error: z.string() }),
          schemaName: 'ErrorResponse',
        },
      },
    },
  },
};

export async function DELETE(_request: Request, context: Params) {
  const { id } = await context.params;
  const result = await deactivateCashboxTerminalPaymentMethod(id);

  if (!result) {
    return NextResponse.json(
      { error: 'Terminal payment method record not found' },
      { status: 404 },
    );
  }

  return new NextResponse(null, { status: 204 });
}
