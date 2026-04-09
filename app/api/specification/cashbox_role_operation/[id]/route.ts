import { NextResponse } from 'next/server';
import { z } from 'zod';
import { parseJsonRequestBody } from '@/lib/api/parseJsonRequest';
import {
  deactivateCashboxRoleOperation,
  getCashboxRoleOperationById,
  updateCashboxRoleOperation,
} from '@/lib/crud/specification/cashbox_role_operation';
import {
  cashboxRoleOperationResponseSchema,
  cashboxRoleOperationUpdateSchema,
} from '@/types/db/specification/cashboxRoleOperation';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Params) {
  const { id } = await context.params;
  const item = await getCashboxRoleOperationById(id);

  if (!item) {
    return NextResponse.json(
      { error: 'Role operation record not found' },
      { status: 404 },
    );
  }

  return NextResponse.json(item);
}

export async function PATCH(request: Request, context: Params) {
  const { id } = await context.params;
  const parsed = await parseJsonRequestBody(
    request,
    cashboxRoleOperationUpdateSchema,
  );
  if (parsed.errorResponse) return parsed.errorResponse;
  const updatePayload = { ...parsed.value } as any;
  delete updatePayload.userId;

  const updated = await updateCashboxRoleOperation(id, updatePayload);

  if (updated === null) {
    return NextResponse.json(
      { error: 'No fields provided to update' },
      { status: 400 },
    );
  }

  if (!updated) {
    return NextResponse.json(
      { error: 'Role operation record not found' },
      { status: 404 },
    );
  }

  return NextResponse.json(updated);
}

export const cashboxRoleOperationByIdOpenApi = {
  path: '/api/specification/cashbox_role_operation/{id}',
  tag: 'CRUD - cashbox role operation',
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
      description: 'Role operation relationship ID',
    },
  ],
  operations: {
    get: {
      summary: 'Get a cashbox role operation link by ID',
      responseSchema: cashboxRoleOperationResponseSchema,
      responseSchemaName: 'CashboxRoleOperation',
    },
    patch: {
      summary: 'Update a cashbox role operation link',
      requestBodySchema: cashboxRoleOperationUpdateSchema,
      requestBodySchemaName: 'CashboxRoleOperationUpdate',
      responseSchema: cashboxRoleOperationResponseSchema,
      responseSchemaName: 'CashboxRoleOperation',
    },
    delete: {
      summary: 'Soft delete a cashbox role operation link',
      responses: {
        '204': { description: 'Role operation link deactivated' },
        '404': {
          description: 'Role operation link not found',
          schema: z.object({ error: z.string() }),
          schemaName: 'ErrorResponse',
        },
      },
    },
  },
};

export async function DELETE(_request: Request, context: Params) {
  const { id } = await context.params;
  const result = await deactivateCashboxRoleOperation(id);

  if (!result) {
    return NextResponse.json(
      { error: 'Role operation record not found' },
      { status: 404 },
    );
  }

  return new NextResponse(null, { status: 204 });
}
