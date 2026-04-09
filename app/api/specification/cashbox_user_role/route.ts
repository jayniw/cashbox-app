import { NextResponse } from 'next/server';
import { parseJsonRequestBody } from '@/lib/api/parseJsonRequest';
import { getRequestUserId } from '@/lib/api/audit';
import {
  createCashboxUserRole,
  listCashboxUserRoles,
} from '@/lib/crud/specification/cashbox_user_role';
import {
  cashboxUserRoleCreateSchema,
  cashboxUserRoleQuerySchema,
  cashboxUserRoleResponseSchema,
} from '@/types/db/specification/cashboxUserRole';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const queryParams = cashboxUserRoleQuerySchema.parse({
    cashboxUserId:
      url.searchParams.get('cashboxUserId') ??
      url.searchParams.get('cashbox_user_id') ??
      undefined,
    cashboxRoleId:
      url.searchParams.get('cashboxRoleId') ??
      url.searchParams.get('cashbox_role_id') ??
      undefined,
  });

  const items = await listCashboxUserRoles(queryParams);
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const parsed = await parseJsonRequestBody(
    request,
    cashboxUserRoleCreateSchema,
  );
  if (parsed.errorResponse) return parsed.errorResponse;
  const requestUserId = getRequestUserId(request);

  const created = await createCashboxUserRole({
    ...parsed.value,
    userId: requestUserId,
  });
  return NextResponse.json(created, { status: 201 });
}

export const cashboxUserRoleOpenApi = {
  path: '/api/specification/cashbox_user_role',
  tag: 'CRUD - cashbox user role',
  operations: {
    get: {
      summary: 'List cashbox user role links',
      description:
        'Returns a list of user-role associations. Use optional query parameters to filter by user or role.',
      querySchema: cashboxUserRoleQuerySchema,
      querySchemaName: 'CashboxUserRoleQuery',
      responseSchema: cashboxUserRoleResponseSchema.array(),
      responseSchemaName: 'CashboxUserRoleList',
    },
    post: {
      summary: 'Create a new cashbox user role association',
      requestBodySchema: cashboxUserRoleCreateSchema,
      requestBodySchemaName: 'CashboxUserRoleCreate',
      responseSchema: cashboxUserRoleResponseSchema,
      responseSchemaName: 'CashboxUserRole',
    },
  },
};
