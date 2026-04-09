import { NextResponse } from 'next/server';
import { z } from 'zod';
import { parseJsonRequestBody } from '@/lib/api/parseJsonRequest';
import {
  deactivateCashboxRolePaymentMethod,
  getCashboxRolePaymentMethodById,
  updateCashboxRolePaymentMethod,
} from '@/lib/crud/specification/cashbox_role_payment_method';
import {
  cashboxRolePaymentMethodResponseSchema,
  cashboxRolePaymentMethodUpdateSchema,
} from '@/types/db/specification/cashboxRolePaymentMethod';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Params) {
  const { id } = await context.params;
  const item = await getCashboxRolePaymentMethodById(id);

  if (!item) {
    return NextResponse.json(
      { error: 'Role payment method record not found' },
      { status: 404 },
    );
  }

  return NextResponse.json(item);
}

export async function PATCH(request: Request, context: Params) {
  const { id } = await context.params;
  const parsed = await parseJsonRequestBody(
    request,
    cashboxRolePaymentMethodUpdateSchema,
  );
  if (parsed.errorResponse) return parsed.errorResponse;
  const updatePayload = { ...parsed.value } as any;
  delete updatePayload.userId;

  const updated = await updateCashboxRolePaymentMethod(id, updatePayload);

  if (updated === null) {
    return NextResponse.json(
      { error: 'No fields provided to update' },
      { status: 400 },
    );
  }

  if (!updated) {
    return NextResponse.json(
      { error: 'Role payment method record not found' },
      { status: 404 },
    );
  }

  return NextResponse.json(updated);
}

export const cashboxRolePaymentMethodByIdOpenApi = {
  path: '/api/specification/cashbox_role_payment_method/{id}',
  tag: 'CRUD - cashbox role payment method',
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
      description: 'Role payment method relationship ID',
    },
  ],
  operations: {
    get: {
      summary: 'Get a cashbox role payment method link by ID',
      responseSchema: cashboxRolePaymentMethodResponseSchema,
      responseSchemaName: 'CashboxRolePaymentMethod',
    },
    patch: {
      summary: 'Update a cashbox role payment method link',
      requestBodySchema: cashboxRolePaymentMethodUpdateSchema,
      requestBodySchemaName: 'CashboxRolePaymentMethodUpdate',
      responseSchema: cashboxRolePaymentMethodResponseSchema,
      responseSchemaName: 'CashboxRolePaymentMethod',
    },
    delete: {
      summary: 'Soft delete a cashbox role payment method link',
      responses: {
        '204': { description: 'Role payment method link deactivated' },
        '404': {
          description: 'Role payment method link not found',
          schema: z.object({ error: z.string() }),
          schemaName: 'ErrorResponse',
        },
      },
    },
  },
};

export async function DELETE(_request: Request, context: Params) {
  const { id } = await context.params;
  const result = await deactivateCashboxRolePaymentMethod(id);

  if (!result) {
    return NextResponse.json(
      { error: 'Role payment method record not found' },
      { status: 404 },
    );
  }

  return new NextResponse(null, { status: 204 });
}
