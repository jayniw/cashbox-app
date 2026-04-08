import { NextResponse } from 'next/server';
import { sql, and, type SQL } from 'drizzle-orm';
import { db } from '@/lib/db';
import { cashbox_userInSpecification } from '@/lib/schema/schema';
import {
  cashboxUserCreateSchema,
  cashboxUserQuerySchema,
  cashboxUserResponseSchema,
} from '@/types/db/specification/cashboxUser';

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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const queryParams = cashboxUserQuerySchema.parse({
    userName:
      url.searchParams.get('userName') ??
      url.searchParams.get('user_name') ??
      undefined,
    authenticationType:
      url.searchParams.get('authenticationType') ??
      url.searchParams.get('authentication_type') ??
      undefined,
    userStatus:
      url.searchParams.get('userStatus') ??
      url.searchParams.get('user_status') ??
      undefined,
  });

  const conditions: SQL[] = [];

  if (queryParams.userName) {
    conditions.push(
      sql`LOWER(${cashbox_userInSpecification.user_name}) LIKE ${`%${queryParams.userName.toLowerCase()}%`}`,
    );
  }

  if (queryParams.authenticationType) {
    conditions.push(
      sql`LOWER(${cashbox_userInSpecification.authentication_type}) = ${queryParams.authenticationType.toLowerCase()}`,
    );
  }

  if (queryParams.userStatus) {
    conditions.push(
      sql`LOWER(${cashbox_userInSpecification.user_status}) = ${queryParams.userStatus.toLowerCase()}`,
    );
  }

  const query = db
    .select()
    .from(cashbox_userInSpecification)
    .orderBy(cashbox_userInSpecification.user_name);

  const users = conditions.length
    ? await query.where(and(...conditions))
    : await query;

  return NextResponse.json(users.map(mapCashboxUser));
}

export async function POST(request: Request) {
  const body = cashboxUserCreateSchema.parse(await request.json());
  const userData = {
    user_name: body.userName,
    authentication_type: body.authenticationType ?? 'email',
    user_status: body.userStatus ?? 'Active',
    user_email: body.userEmail ?? null,
    user_phone: body.userPhone ?? null,
    user_id: body.userId ?? null,
  };

  const [created] = await db
    .insert(cashbox_userInSpecification)
    .values(userData)
    .returning();

  return NextResponse.json(mapCashboxUser(created), { status: 201 });
}

export const cashboxUserOpenApi = {
  path: '/api/specification/cashbox_user',
  tag: 'CRUD - cashbox user',
  operations: {
    get: {
      summary: 'List cashbox users',
      description:
        'Returns a list of cashbox users. Use optional query parameters to filter results.',
      querySchema: cashboxUserQuerySchema,
      querySchemaName: 'CashboxUserQuery',
      responseSchema: cashboxUserResponseSchema.array(),
      responseSchemaName: 'CashboxUserList',
    },
    post: {
      summary: 'Create a new cashbox user',
      requestBodySchema: cashboxUserCreateSchema,
      requestBodySchemaName: 'CashboxUserCreate',
      responseSchema: cashboxUserResponseSchema,
      responseSchemaName: 'CashboxUser',
    },
  },
};
