import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { cashbox_userInSpecification } from '@/lib/schema/schema';
import { z } from 'zod';
import {
  cashboxUserResponseSchema,
  cashboxUserUpdateSchema,
} from '@/types/db/specification/cashboxUser';

type Params = { params: Promise<{ id: string }> };

const mapCashboxUser = (user: Record<string, unknown>) => ({
  cashboxUserId: user.cashbox_user_id,
  userName: user.user_name,
  authenticationType: user.authentication_type,
  userStatus: user.user_status,
  userEmail: user.user_email,
  userPhone: user.user_phone,
  tranId: user.tran_id,
  tranDate: user.tran_date,
  tranPeriod: user.tran_period,
  userId: user.user_id,
});

export async function GET(_request: Request, context: Params) {
  const { id } = await context.params;
  const [user] = await db
    .select()
    .from(cashbox_userInSpecification)
    .where(eq(cashbox_userInSpecification.cashbox_user_id, id));

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(mapCashboxUser(user));
}

export async function PATCH(request: Request, context: Params) {
  const { id } = await context.params;
  const body = cashboxUserUpdateSchema.parse(await request.json());
  const updates: Record<string, unknown> = {};

  if (body.userName !== undefined) updates.user_name = body.userName;
  if (body.authenticationType !== undefined)
    updates.authentication_type = body.authenticationType;
  if (body.userStatus !== undefined) updates.user_status = body.userStatus;
  if (body.userEmail !== undefined) updates.user_email = body.userEmail ?? null;
  if (body.userPhone !== undefined) updates.user_phone = body.userPhone ?? null;
  if (body.userId !== undefined) updates.user_id = body.userId;

  if (!Object.keys(updates).length) {
    return NextResponse.json(
      { error: 'No fields provided to update' },
      { status: 400 },
    );
  }

  const [updated] = await db
    .update(cashbox_userInSpecification)
    .set(updates)
    .where(eq(cashbox_userInSpecification.cashbox_user_id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(mapCashboxUser(updated));
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

  const [updated] = await db
    .update(cashbox_userInSpecification)
    .set({ user_status: 'Inactive' })
    .where(eq(cashbox_userInSpecification.cashbox_user_id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
