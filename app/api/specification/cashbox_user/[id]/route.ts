import { NextResponse } from 'next/server';
import { z } from 'zod';
import { parseJsonRequestBody } from '@/lib/api/parseJsonRequest';
import {
  deactivateCashboxUser,
  getCashboxUserById,
  updateCashboxUser,
} from '@/lib/crud/specification/cashbox_user';
import {
  cashboxUserResponseSchema,
  cashboxUserUpdateSchema,
} from '@/types/db/specification/cashboxUser';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Params) {
  const { id } = await context.params;
  const user = await getCashboxUserById(id);

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(request: Request, context: Params) {
  const { id } = await context.params;
  const parsed = await parseJsonRequestBody(request, cashboxUserUpdateSchema);
  if (parsed.errorResponse) return parsed.errorResponse;

  const updated = await updateCashboxUser(id, parsed.value);

  if (updated === null) {
    return NextResponse.json(
      { error: 'No fields provided to update' },
      { status: 400 },
    );
  }

  if (!updated) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export const cashboxUserByIdOpenApi = {
  path: '/api/specification/cashbox_user/{id}',
  tag: 'CRUD - cashbox user',
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
      description: 'Cashbox user ID',
    },
  ],
  operations: {
    get: {
      summary: 'Get a cashbox user by ID',
      responseSchema: cashboxUserResponseSchema,
      responseSchemaName: 'CashboxUser',
    },
    patch: {
      summary: 'Update a cashbox user',
      requestBodySchema: cashboxUserUpdateSchema,
      requestBodySchemaName: 'CashboxUserUpdate',
      responseSchema: cashboxUserResponseSchema,
      responseSchemaName: 'CashboxUser',
    },
    delete: {
      summary: 'Soft delete a cashbox user',
      responses: {
        '204': { description: 'Cashbox user deactivated' },
        '404': {
          description: 'Cashbox user not found',
          schema: z.object({ error: z.string() }),
          schemaName: 'ErrorResponse',
        },
      },
    },
  },
};

export async function DELETE(_request: Request, context: Params) {
  const { id } = await context.params;

  const result = await deactivateCashboxUser(id);

  if (!result) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
