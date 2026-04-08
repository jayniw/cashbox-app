import { NextResponse } from 'next/server';
import { z } from 'zod';
import { parseJsonRequestBody } from '@/lib/api/parseJsonRequest';
import {
  deactivateCashboxTerminalPartner,
  getCashboxTerminalPartnerById,
  updateCashboxTerminalPartner,
} from '@/lib/crud/specification/cashbox_terminal_partner';
import {
  cashboxTerminalPartnerResponseSchema,
  cashboxTerminalPartnerUpdateSchema,
} from '@/types/db/specification/cashboxTerminalPartner';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Params) {
  const { id } = await context.params;
  const item = await getCashboxTerminalPartnerById(id);

  if (!item) {
    return NextResponse.json(
      { error: 'Terminal partner record not found' },
      { status: 404 },
    );
  }

  return NextResponse.json(item);
}

export async function PATCH(request: Request, context: Params) {
  const { id } = await context.params;
  const parsed = await parseJsonRequestBody(
    request,
    cashboxTerminalPartnerUpdateSchema,
  );
  if (parsed.errorResponse) return parsed.errorResponse;

  const updated = await updateCashboxTerminalPartner(id, parsed.value);

  if (updated === null) {
    return NextResponse.json(
      { error: 'No fields provided to update' },
      { status: 400 },
    );
  }

  if (!updated) {
    return NextResponse.json(
      { error: 'Terminal partner record not found' },
      { status: 404 },
    );
  }

  return NextResponse.json(updated);
}

export const cashboxTerminalPartnerByIdOpenApi = {
  path: '/api/specification/cashbox_terminal_partner/{id}',
  tag: 'CRUD - cashbox terminal partner',
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
      description: 'Cashbox terminal partner association ID',
    },
  ],
  operations: {
    get: {
      summary: 'Get a cashbox terminal partner link by ID',
      responseSchema: cashboxTerminalPartnerResponseSchema,
      responseSchemaName: 'CashboxTerminalPartner',
    },
    patch: {
      summary: 'Update a cashbox terminal partner association',
      requestBodySchema: cashboxTerminalPartnerUpdateSchema,
      requestBodySchemaName: 'CashboxTerminalPartnerUpdate',
      responseSchema: cashboxTerminalPartnerResponseSchema,
      responseSchemaName: 'CashboxTerminalPartner',
    },
    delete: {
      summary: 'Soft delete a cashbox terminal partner association',
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
  const result = await deactivateCashboxTerminalPartner(id);

  if (!result) {
    return NextResponse.json(
      { error: 'Terminal partner record not found' },
      { status: 404 },
    );
  }

  return new NextResponse(null, { status: 204 });
}
