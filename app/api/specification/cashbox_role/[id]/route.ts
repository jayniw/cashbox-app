import { NextResponse } from 'next/server';
import { z } from 'zod';
import { parseJsonRequestBody } from '@/lib/api/parseJsonRequest';
import {
  deactivateCashboxRole,
  getCashboxRoleById,
  updateCashboxRole,
} from '@/lib/crud/specification/cashbox_role';
import {
  cashboxRoleResponseSchema,
  cashboxRoleUpdateSchema,
} from '@/types/db/specification/cashboxRole';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Params) {
  const { id } = await context.params;
  const role = await getCashboxRoleById(id);

  if (!role) {
    return NextResponse.json({ error: 'Role not found' }, { status: 404 });
  }

  return NextResponse.json(role);
}

export async function PATCH(request: Request, context: Params) {
  const { id } = await context.params;
  const parsed = await parseJsonRequestBody(request, cashboxRoleUpdateSchema);
  if (parsed.errorResponse) return parsed.errorResponse;

  const updated = await updateCashboxRole(id, parsed.value);

  if (updated === null) {
    return NextResponse.json(
      { error: 'No fields provided to update' },
      { status: 400 },
    );
  }

  if (!updated) {
    return NextResponse.json({ error: 'Role not found' }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export const cashboxRoleByIdOpenApi = {
  path: '/api/specification/cashbox_role/{id}',
  tag: 'CRUD - cashbox role',
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
      description: 'Cashbox role ID',
    },
  ],
  operations: {
    get: {
      summary: 'Get a cashbox role by ID',
      responseSchema: cashboxRoleResponseSchema,
      responseSchemaName: 'CashboxRole',
    },
    patch: {
      summary: 'Update a cashbox role',
      requestBodySchema: cashboxRoleUpdateSchema,
      requestBodySchemaName: 'CashboxRoleUpdate',
      responseSchema: cashboxRoleResponseSchema,
      responseSchemaName: 'CashboxRole',
    },
    delete: {
      summary: 'Soft delete a cashbox role',
      responses: {
        '204': { description: 'Cashbox role deactivated' },
        '404': {
          description: 'Cashbox role not found',
          schema: z.object({ error: z.string() }),
          schemaName: 'ErrorResponse',
        },
      },
    },
  },
};

export async function DELETE(_request: Request, context: Params) {
  const { id } = await context.params;
  const result = await deactivateCashboxRole(id);

  if (!result) {
    return NextResponse.json({ error: 'Role not found' }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
