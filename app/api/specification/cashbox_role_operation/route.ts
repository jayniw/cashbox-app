import { NextResponse } from 'next/server';
import { parseJsonRequestBody } from '@/lib/api/parseJsonRequest';
import { getRequestUserId } from '@/lib/api/audit';
import {
  createCashboxRoleOperation,
  listCashboxRoleOperations,
} from '@/lib/crud/specification/cashbox_role_operation';
import {
  cashboxRoleOperationCreateSchema,
  cashboxRoleOperationQuerySchema,
  cashboxRoleOperationResponseSchema,
} from '@/types/db/specification/cashboxRoleOperation';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const queryParams = cashboxRoleOperationQuerySchema.parse({
    cashboxRoleId:
      url.searchParams.get('cashboxRoleId') ??
      url.searchParams.get('cashbox_role_id') ??
      undefined,
    cashboxOperationId:
      url.searchParams.get('cashboxOperationId') ??
      url.searchParams.get('cashbox_operation_id') ??
      undefined,
    isActive:
      url.searchParams.get('isActive') ??
      url.searchParams.get('is_active') ??
      undefined,
  });

  const items = await listCashboxRoleOperations(queryParams);
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const parsed = await parseJsonRequestBody(
    request,
    cashboxRoleOperationCreateSchema,
  );
  if (parsed.errorResponse) return parsed.errorResponse;
  const requestUserId = getRequestUserId(request);

  const created = await createCashboxRoleOperation({
    ...parsed.value,
    userId: requestUserId,
  });
  return NextResponse.json(created, { status: 201 });
}

export const cashboxRoleOperationOpenApi = {
  path: '/api/specification/cashbox_role_operation',
  tag: 'CRUD - cashbox role operation',
  operations: {
    get: {
      summary: 'List cashbox role operation links',
      description:
        'Returns a list of role-operation associations. Use optional query parameters to filter by role, operation, or active state.',
      querySchema: cashboxRoleOperationQuerySchema,
      querySchemaName: 'CashboxRoleOperationQuery',
      responseSchema: cashboxRoleOperationResponseSchema.array(),
      responseSchemaName: 'CashboxRoleOperationList',
    },
    post: {
      summary: 'Create a new cashbox role operation association',
      requestBodySchema: cashboxRoleOperationCreateSchema,
      requestBodySchemaName: 'CashboxRoleOperationCreate',
      responseSchema: cashboxRoleOperationResponseSchema,
      responseSchemaName: 'CashboxRoleOperation',
    },
  },
};
