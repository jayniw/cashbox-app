import { NextResponse } from 'next/server';
import { z } from 'zod';
import { parseJsonRequestBody } from '@/lib/api/parseJsonRequest';
import {
  deactivateCashboxUserTerminal,
  getCashboxUserTerminalById,
  updateCashboxUserTerminal,
} from '@/lib/crud/specification/cashbox_user_terminal';
import {
  cashboxUserTerminalResponseSchema,
  cashboxUserTerminalUpdateSchema,
} from '@/types/db/specification/cashboxUserTerminal';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Params) {
  const { id } = await context.params;
  const item = await getCashboxUserTerminalById(id);

  if (!item) {
    return NextResponse.json(
      { error: 'User terminal record not found' },
      { status: 404 },
    );
  }

  return NextResponse.json(item);
}

export async function PATCH(request: Request, context: Params) {
  const { id } = await context.params;
  const parsed = await parseJsonRequestBody(
    request,
    cashboxUserTerminalUpdateSchema,
  );
  if (parsed.errorResponse) return parsed.errorResponse;
  const updatePayload = { ...parsed.value } as any;
  delete updatePayload.userId;

  const updated = await updateCashboxUserTerminal(id, updatePayload);

  if (updated === null) {
    return NextResponse.json(
      { error: 'No fields provided to update' },
      { status: 400 },
    );
  }

  if (!updated) {
    return NextResponse.json(
      { error: 'User terminal record not found' },
      { status: 404 },
    );
  }

  return NextResponse.json(updated);
}

export const cashboxUserTerminalByIdOpenApi = {
  path: '/api/specification/cashbox_user_terminal/{id}',
  tag: 'CRUD - cashbox user terminal',
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
      description: 'User terminal relationship ID',
    },
  ],
  operations: {
    get: {
      summary: 'Get a cashbox user terminal link by ID',
      responseSchema: cashboxUserTerminalResponseSchema,
      responseSchemaName: 'CashboxUserTerminal',
    },
    patch: {
      summary: 'Update a cashbox user terminal link',
      requestBodySchema: cashboxUserTerminalUpdateSchema,
      requestBodySchemaName: 'CashboxUserTerminalUpdate',
      responseSchema: cashboxUserTerminalResponseSchema,
      responseSchemaName: 'CashboxUserTerminal',
    },
    delete: {
      summary: 'Soft delete a cashbox user terminal link',
      responses: {
        '204': { description: 'User terminal link deactivated' },
        '404': {
          description: 'User terminal record not found',
          schema: z.object({ error: z.string() }),
          schemaName: 'ErrorResponse',
        },
      },
    },
  },
};

export async function DELETE(_request: Request, context: Params) {
  const { id } = await context.params;
  const result = await deactivateCashboxUserTerminal(id);

  if (!result) {
    return NextResponse.json(
      { error: 'User terminal record not found' },
      { status: 404 },
    );
  }

  return new NextResponse(null, { status: 204 });
}
