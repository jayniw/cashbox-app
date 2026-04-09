import { NextResponse } from 'next/server';
import { z } from 'zod';
import { parseJsonRequestBody } from '@/lib/api/parseJsonRequest';
import {
  deactivateCashboxOperation,
  getCashboxOperationById,
  updateCashboxOperation,
} from '@/lib/crud/specification/cashbox_operation';
import {
  cashboxOperationResponseSchema,
  cashboxOperationUpdateSchema,
} from '@/types/db/specification/cashboxOperation';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Params) {
  const { id } = await context.params;
  const operation = await getCashboxOperationById(id);

  if (!operation) {
    return NextResponse.json({ error: 'Operation not found' }, { status: 404 });
  }

  return NextResponse.json(operation);
}

export async function PATCH(request: Request, context: Params) {
  const { id } = await context.params;
  const parsed = await parseJsonRequestBody(
    request,
    cashboxOperationUpdateSchema,
  );
  if (parsed.errorResponse) return parsed.errorResponse;
  const updatePayload = { ...parsed.value } as any;
  delete updatePayload.userId;

  const updated = await updateCashboxOperation(id, updatePayload);

  if (updated === null) {
    return NextResponse.json(
      { error: 'No fields provided to update' },
      { status: 400 },
    );
  }

  if (!updated) {
    return NextResponse.json({ error: 'Operation not found' }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, context: Params) {
  const { id } = await context.params;
  const result = await deactivateCashboxOperation(id);

  if (!result) {
    return NextResponse.json({ error: 'Operation not found' }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}

export const cashboxOperationByIdOpenApi = {
  path: '/api/specification/cashbox_operation/{id}',
  tag: 'CRUD - cashbox operation',
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
      description: 'Cashbox operation ID',
    },
  ],
  operations: {
    get: {
      summary: 'Get a cashbox operation by ID',
      responseSchema: cashboxOperationResponseSchema,
      responseSchemaName: 'CashboxOperation',
    },
    patch: {
      summary: 'Update a cashbox operation',
      requestBodySchema: cashboxOperationUpdateSchema,
      requestBodySchemaName: 'CashboxOperationUpdate',
      responseSchema: cashboxOperationResponseSchema,
      responseSchemaName: 'CashboxOperation',
    },
    delete: {
      summary: 'Soft delete a cashbox operation',
      responses: {
        '204': { description: 'Cashbox operation deactivated' },
        '404': {
          description: 'Cashbox operation not found',
          schema: z.object({ error: z.string() }),
          schemaName: 'ErrorResponse',
        },
      },
    },
  },
};
