import { NextResponse } from 'next/server';
import { parseJsonRequestBody } from '@/lib/api/parseJsonRequest';
import { getRequestUserId } from '@/lib/api/audit';
import {
  createCashboxRole,
  listCashboxRoles,
} from '@/lib/crud/specification/cashbox_role';
import {
  cashboxRoleCreateSchema,
  cashboxRoleQuerySchema,
  cashboxRoleResponseSchema,
} from '@/types/db/specification/cashboxRole';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const queryParams = cashboxRoleQuerySchema.parse({
    roleName:
      url.searchParams.get('roleName') ??
      url.searchParams.get('role_name') ??
      undefined,
  });

  const roles = await listCashboxRoles(queryParams);
  return NextResponse.json(roles);
}

export async function POST(request: Request) {
  const parsed = await parseJsonRequestBody(request, cashboxRoleCreateSchema);
  if (parsed.errorResponse) return parsed.errorResponse;
  const requestUserId = getRequestUserId(request);

  const created = await createCashboxRole({ ...parsed.value, userId: requestUserId });
  return NextResponse.json(created, { status: 201 });
}

export const cashboxRoleOpenApi = {
  path: '/api/specification/cashbox_role',
  tag: 'CRUD - cashbox role',
  operations: {
    get: {
      summary: 'List cashbox roles',
      description:
        'Returns a list of cashbox roles. Use optional query parameters to filter results.',
      querySchema: cashboxRoleQuerySchema,
      querySchemaName: 'CashboxRoleQuery',
      responseSchema: cashboxRoleResponseSchema.array(),
      responseSchemaName: 'CashboxRoleList',
    },
    post: {
      summary: 'Create a new cashbox role',
      requestBodySchema: cashboxRoleCreateSchema,
      requestBodySchemaName: 'CashboxRoleCreate',
      responseSchema: cashboxRoleResponseSchema,
      responseSchemaName: 'CashboxRole',
    },
  },
};
