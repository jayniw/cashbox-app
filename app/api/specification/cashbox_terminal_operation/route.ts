import { NextResponse } from 'next/server';
import {
  createCashboxTerminalOperation,
  listCashboxTerminalOperations,
} from '@/lib/crud/specification/cashbox_terminal_operation';
import { parseJsonRequestBody } from '@/lib/api/parseJsonRequest';
import { getRequestUserId } from '@/lib/api/audit';
import {
  cashboxTerminalOperationCreateSchema,
  cashboxTerminalOperationQuerySchema,
  cashboxTerminalOperationResponseSchema,
} from '@/types/db/specification/cashboxTerminalOperation';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const queryParams = cashboxTerminalOperationQuerySchema.parse({
    cashboxTerminalId:
      url.searchParams.get('cashboxTerminalId') ??
      url.searchParams.get('cashbox_terminal_id') ??
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

  const items = await listCashboxTerminalOperations(queryParams);
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const parsed = await parseJsonRequestBody(
    request,
    cashboxTerminalOperationCreateSchema,
  );
  if (parsed.errorResponse) return parsed.errorResponse;
  const requestUserId = getRequestUserId(request);

  const created = await createCashboxTerminalOperation({ ...parsed.value, userId: requestUserId });
  return NextResponse.json(created, { status: 201 });
}

export const cashboxTerminalOperationOpenApi = {
  path: '/api/specification/cashbox_terminal_operation',
  tag: 'CRUD - cashbox terminal operation',
  operations: {
    get: {
      summary: 'List cashbox terminal operation links',
      description:
        'Returns a list of terminal-operation associations. Use optional query parameters to filter by terminal, operation, or active state.',
      querySchema: cashboxTerminalOperationQuerySchema,
      querySchemaName: 'CashboxTerminalOperationQuery',
      responseSchema: cashboxTerminalOperationResponseSchema.array(),
      responseSchemaName: 'CashboxTerminalOperationList',
    },
    post: {
      summary: 'Create a new cashbox terminal operation association',
      requestBodySchema: cashboxTerminalOperationCreateSchema,
      requestBodySchemaName: 'CashboxTerminalOperationCreate',
      responseSchema: cashboxTerminalOperationResponseSchema,
      responseSchemaName: 'CashboxTerminalOperation',
    },
  },
};
