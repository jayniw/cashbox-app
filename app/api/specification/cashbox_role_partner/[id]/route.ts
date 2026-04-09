import { NextResponse } from 'next/server';
import { z } from 'zod';
import { parseJsonRequestBody } from '@/lib/api/parseJsonRequest';
import {
  deactivateCashboxRolePartner,
  getCashboxRolePartnerById,
  updateCashboxRolePartner,
} from '@/lib/crud/specification/cashbox_role_partner';
import {
  cashboxRolePartnerResponseSchema,
  cashboxRolePartnerUpdateSchema,
} from '@/types/db/specification/cashboxRolePartner';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Params) {
  const { id } = await context.params;
  const item = await getCashboxRolePartnerById(id);

  if (!item) {
    return NextResponse.json(
      { error: 'Role partner record not found' },
      { status: 404 },
    );
  }

  return NextResponse.json(item);
}

export async function PATCH(request: Request, context: Params) {
  const { id } = await context.params;
  const parsed = await parseJsonRequestBody(
    request,
    cashboxRolePartnerUpdateSchema,
  );
  if (parsed.errorResponse) return parsed.errorResponse;
  const updatePayload = { ...parsed.value } as any;
  delete updatePayload.userId;

  const updated = await updateCashboxRolePartner(id, updatePayload);

  if (updated === null) {
    return NextResponse.json(
      { error: 'No fields provided to update' },
      { status: 400 },
    );
  }

  if (!updated) {
    return NextResponse.json(
      { error: 'Role partner record not found' },
      { status: 404 },
    );
  }

  return NextResponse.json(updated);
}

export const cashboxRolePartnerByIdOpenApi = {
  path: '/api/specification/cashbox_role_partner/{id}',
  tag: 'CRUD - cashbox role partner',
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
      description: 'Role partner relationship ID',
    },
  ],
  operations: {
    get: {
      summary: 'Get a cashbox role partner link by ID',
      responseSchema: cashboxRolePartnerResponseSchema,
      responseSchemaName: 'CashboxRolePartner',
    },
    patch: {
      summary: 'Update a cashbox role partner link',
      requestBodySchema: cashboxRolePartnerUpdateSchema,
      requestBodySchemaName: 'CashboxRolePartnerUpdate',
      responseSchema: cashboxRolePartnerResponseSchema,
      responseSchemaName: 'CashboxRolePartner',
    },
    delete: {
      summary: 'Soft delete a cashbox role partner link',
      responses: {
        '204': { description: 'Role partner link deactivated' },
        '404': {
          description: 'Role partner link not found',
          schema: z.object({ error: z.string() }),
          schemaName: 'ErrorResponse',
        },
      },
    },
  },
};

export async function DELETE(_request: Request, context: Params) {
  const { id } = await context.params;
  const result = await deactivateCashboxRolePartner(id);

  if (!result) {
    return NextResponse.json(
      { error: 'Role partner record not found' },
      { status: 404 },
    );
  }

  return new NextResponse(null, { status: 204 });
}
