import { NextResponse } from 'next/server';
import { z } from 'zod';
import { parseJsonRequestBody } from '@/lib/api/parseJsonRequest';
import {
  deactivateCashboxTerminal,
  getCashboxTerminalById,
  updateCashboxTerminal,
} from '@/lib/crud/specification/cashbox_terminal';
import {
  cashboxTerminalResponseSchema,
  cashboxTerminalUpdateSchema,
} from '@/types/db/specification/cashboxTerminal';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Params) {
  const { id } = await context.params;
  const terminal = await getCashboxTerminalById(id);

  if (!terminal) {
    return NextResponse.json({ error: 'Terminal not found' }, { status: 404 });
  }

  return NextResponse.json(terminal);
}

export async function PATCH(request: Request, context: Params) {
  const { id } = await context.params;
  const parsed = await parseJsonRequestBody(
    request,
    cashboxTerminalUpdateSchema,
  );
  if (parsed.errorResponse) return parsed.errorResponse;
  const updatePayload = { ...parsed.value } as any;
  delete updatePayload.userId;

  const updated = await updateCashboxTerminal(id, updatePayload);

  if (updated === null) {
    return NextResponse.json(
      { error: 'No fields provided to update' },
      { status: 400 },
    );
  }

  if (!updated) {
    return NextResponse.json({ error: 'Terminal not found' }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export const cashboxTerminalByIdOpenApi = {
  path: '/api/specification/cashbox_terminal/{id}',
  tag: 'CRUD - cashbox terminal',
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
      description: 'Cashbox terminal ID',
    },
  ],
  operations: {
    get: {
      summary: 'Get a cashbox terminal by ID',
      responseSchema: cashboxTerminalResponseSchema,
      responseSchemaName: 'CashboxTerminal',
    },
    patch: {
      summary: 'Update a cashbox terminal',
      requestBodySchema: cashboxTerminalUpdateSchema,
      requestBodySchemaName: 'CashboxTerminalUpdate',
      responseSchema: cashboxTerminalResponseSchema,
      responseSchemaName: 'CashboxTerminal',
    },
    delete: {
      summary: 'Soft delete a cashbox terminal',
      responses: {
        '204': { description: 'Cashbox terminal deactivated' },
        '404': {
          description: 'Cashbox terminal not found',
          schema: z.object({ error: z.string() }),
          schemaName: 'ErrorResponse',
        },
      },
    },
  },
};

export async function DELETE(_request: Request, context: Params) {
  const { id } = await context.params;
  const result = await deactivateCashboxTerminal(id);

  if (!result) {
    return NextResponse.json({ error: 'Terminal not found' }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
