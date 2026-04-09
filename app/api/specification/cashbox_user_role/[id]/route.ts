import { NextResponse } from 'next/server';
import { parseJsonRequestBody } from '@/lib/api/parseJsonRequest';
import { z } from 'zod';
import {
  getCashboxUserRoleById,
  updateCashboxUserRole,
} from '@/lib/crud/specification/cashbox_user_role';
import {
  cashboxUserRoleResponseSchema,
  cashboxUserRoleUpdateSchema,
} from '@/types/db/specification/cashboxUserRole';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Params) {
  const { id } = await context.params;
  const item = await getCashboxUserRoleById(id);

  if (!item) {
    return NextResponse.json(
      { error: 'User role record not found' },
      { status: 404 },
    );
  }

  return NextResponse.json(item);
}

export async function PATCH(request: Request, context: Params) {
  const { id } = await context.params;
  const parsed = await parseJsonRequestBody(
    request,
    cashboxUserRoleUpdateSchema,
  );
  if (parsed.errorResponse) return parsed.errorResponse;
  const updatePayload = { ...parsed.value } as any;
  delete updatePayload.userId;

  const updated = await updateCashboxUserRole(id, updatePayload);

  if (updated === null) {
    return NextResponse.json(
      { error: 'No fields provided to update' },
      { status: 400 },
    );
  }

  if (!updated) {
    return NextResponse.json(
      { error: 'User role record not found' },
      { status: 404 },
    );
  }

  return NextResponse.json(updated);
}

export const cashboxUserRoleByIdOpenApi = {
  path: '/api/specification/cashbox_user_role/{id}',
  tag: 'CRUD - cashbox user role',
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
      description: 'User role relationship ID',
    },
  ],
  operations: {
    get: {
      summary: 'Get a cashbox user role link by ID',
      responseSchema: cashboxUserRoleResponseSchema,
      responseSchemaName: 'CashboxUserRole',
    },
    patch: {
      summary: 'Update a cashbox user role link',
      requestBodySchema: cashboxUserRoleUpdateSchema,
      requestBodySchemaName: 'CashboxUserRoleUpdate',
      responseSchema: cashboxUserRoleResponseSchema,
      responseSchemaName: 'CashboxUserRole',
    },
  },
};
