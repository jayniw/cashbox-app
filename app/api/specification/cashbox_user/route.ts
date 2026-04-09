import { NextResponse } from 'next/server';
import { parseJsonRequestBody } from '@/lib/api/parseJsonRequest';
import { getRequestUserId } from '@/lib/api/audit';
import {
  createCashboxUser,
  listCashboxUsers,
} from '@/lib/crud/specification/cashbox_user';
import {
  cashboxUserCreateSchema,
  cashboxUserQuerySchema,
  cashboxUserResponseSchema,
} from '@/types/db/specification/cashboxUser';

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

  const users = await listCashboxUsers(queryParams);
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const parsed = await parseJsonRequestBody(request, cashboxUserCreateSchema);
  if (parsed.errorResponse) return parsed.errorResponse;
  const requestUserId = getRequestUserId(request);

  const created = await createCashboxUser({ ...parsed.value, userId: requestUserId });
  return NextResponse.json(created, { status: 201 });
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
