import { NextResponse } from 'next/server';
import { z } from 'zod';
import { parseJsonRequestBody } from '@/lib/api/parseJsonRequest';
import {
  deactivateCashboxTerminalOperation,
  getCashboxTerminalOperationById,
  updateCashboxTerminalOperation,
} from '@/lib/crud/specification/cashbox_terminal_operation';
import {
  cashboxTerminalOperationResponseSchema,
  cashboxTerminalOperationUpdateSchema,
} from '@/types/db/specification/cashboxTerminalOperation';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Params) {
  const { id } = await context.params;
  const item = await getCashboxTerminalOperationById(id);

  if (!item) {
    return NextResponse.json(
      { error: 'Terminal operation record not found' },
      { status: 404 },
    );
  }

  return NextResponse.json(item);
}

export async function PATCH(request: Request, context: Params) {
  const { id } = await context.params;
  const parsed = await parseJsonRequestBody(
    request,
    cashboxTerminalOperationUpdateSchema,
  );
  if (parsed.errorResponse) return parsed.errorResponse;

  const updated = await updateCashboxTerminalOperation(id, parsed.value);

  if (updated === null) {
    return NextResponse.json(
      { error: 'No fields provided to update' },
      { status: 400 },
    );
  }

  if (!updated) {
    return NextResponse.json(
      { error: 'Terminal operation record not found' },
      { status: 404 },
    );
  }

  return NextResponse.json(updated);
}

export const cashboxTerminalOperationByIdOpenApi = {
  path: '/api/specification/cashbox_terminal_operation/{id}',
  tag: 'CRUD - cashbox terminal operation',
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
      description: 'Cashbox terminal operation association ID',
    },
  ],
  operations: {
    get: {
      summary: 'Get a cashbox terminal operation link by ID',
      responseSchema: cashboxTerminalOperationResponseSchema,
      responseSchemaName: 'CashboxTerminalOperation',
    },
    patch: {
      summary: 'Update a cashbox terminal operation association',
      requestBodySchema: cashboxTerminalOperationUpdateSchema,
      requestBodySchemaName: 'CashboxTerminalOperationUpdate',
      responseSchema: cashboxTerminalOperationResponseSchema,
      responseSchemaName: 'CashboxTerminalOperation',
    },
    delete: {
      summary: 'Soft delete a cashbox terminal operation association',
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
  const result = await deactivateCashboxTerminalOperation(id);

  if (!result) {
    return NextResponse.json(
      { error: 'Terminal operation record not found' },
      { status: 404 },
    );
  }

  return new NextResponse(null, { status: 204 });
}
