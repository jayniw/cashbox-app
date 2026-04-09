import { NextResponse } from 'next/server';
import {
  createCashboxOperation,
  listCashboxOperations,
} from '@/lib/crud/specification/cashbox_operation';
import { parseJsonRequestBody } from '@/lib/api/parseJsonRequest';
import {
  cashboxOperationCreateSchema,
  cashboxOperationQuerySchema,
  cashboxOperationResponseSchema,
} from '@/types/db/specification/cashboxOperation';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const queryParams = cashboxOperationQuerySchema.parse({
    partnerId:
      url.searchParams.get('partnerId') ??
      url.searchParams.get('cashbox_partner_id') ??
      undefined,
    operationName:
      url.searchParams.get('operationName') ??
      url.searchParams.get('operation_name') ??
      undefined,
    isActive:
      url.searchParams.get('isActive') ??
      url.searchParams.get('is_active') ??
      undefined,
  });

  const operations = await listCashboxOperations(queryParams);
  return NextResponse.json(operations);
}

export async function POST(request: Request) {
  const parsed = await parseJsonRequestBody(
    request,
    cashboxOperationCreateSchema,
  );
  if (parsed.errorResponse) return parsed.errorResponse;

  const created = await createCashboxOperation(parsed.value);
  return NextResponse.json(created, { status: 201 });
}

export const cashboxOperationOpenApi = {
  path: '/api/specification/cashbox_operation',
  tag: 'CRUD - cashbox operation',
  operations: {
    get: {
      summary: 'List cashbox operations',
      description:
        'Returns a list of cashbox operations. Use optional query parameters to filter results.',
      querySchema: cashboxOperationQuerySchema,
      querySchemaName: 'CashboxOperationQuery',
      responseSchema: cashboxOperationResponseSchema.array(),
      responseSchemaName: 'CashboxOperationList',
    },
    post: {
      summary: 'Create a new cashbox operation',
      requestBodySchema: cashboxOperationCreateSchema,
      requestBodySchemaName: 'CashboxOperationCreate',
      responseSchema: cashboxOperationResponseSchema,
      responseSchemaName: 'CashboxOperation',
    },
  },
};
