import { NextResponse } from 'next/server';
import { parseJsonRequestBody } from '@/lib/api/parseJsonRequest';
import {
  getCashboxRoleById,
  updateCashboxRole,
} from '@/lib/crud/specification/cashbox_role';
import {
  cashboxRoleResponseSchema,
  cashboxRoleUpdateSchema,
  type CashboxRoleUpdate,
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
  const parsed = await parseJsonRequestBody<CashboxRoleUpdate>(
    request,
    cashboxRoleUpdateSchema,
  );
  if (parsed.errorResponse) return parsed.errorResponse;
  const { userId, ...updatePayload } = parsed.value;

  const updated = await updateCashboxRole(id, updatePayload);

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
  },
};
