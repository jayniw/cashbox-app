import { NextResponse } from 'next/server';
import { parseJsonRequestBody } from '@/lib/api/parseJsonRequest';
import { getRequestUserId } from '@/lib/api/audit';
import {
  createCashboxUserTerminal,
  listCashboxUserTerminals,
} from '@/lib/crud/specification/cashbox_user_terminal';
import {
  cashboxUserTerminalCreateSchema,
  cashboxUserTerminalQuerySchema,
  cashboxUserTerminalResponseSchema,
} from '@/types/db/specification/cashboxUserTerminal';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const queryParams = cashboxUserTerminalQuerySchema.parse({
    cashboxUserId:
      url.searchParams.get('cashboxUserId') ??
      url.searchParams.get('cashbox_user_id') ??
      undefined,
    cashboxTerminalId:
      url.searchParams.get('cashboxTerminalId') ??
      url.searchParams.get('cashbox_terminal_id') ??
      undefined,
    isActive:
      url.searchParams.get('isActive') ??
      url.searchParams.get('is_active') ??
      undefined,
  });

  const items = await listCashboxUserTerminals(queryParams);
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const parsed = await parseJsonRequestBody(
    request,
    cashboxUserTerminalCreateSchema,
  );
  if (parsed.errorResponse) return parsed.errorResponse;
  const requestUserId = getRequestUserId(request);

  const created = await createCashboxUserTerminal({
    ...parsed.value,
    userId: requestUserId,
  });
  return NextResponse.json(created, { status: 201 });
}

export const cashboxUserTerminalOpenApi = {
  path: '/api/specification/cashbox_user_terminal',
  tag: 'CRUD - cashbox user terminal',
  operations: {
    get: {
      summary: 'List cashbox user terminal links',
      description:
        'Returns a list of user-terminal associations. Use optional query parameters to filter by user, terminal, or active state.',
      querySchema: cashboxUserTerminalQuerySchema,
      querySchemaName: 'CashboxUserTerminalQuery',
      responseSchema: cashboxUserTerminalResponseSchema.array(),
      responseSchemaName: 'CashboxUserTerminalList',
    },
    post: {
      summary: 'Create a new cashbox user terminal association',
      requestBodySchema: cashboxUserTerminalCreateSchema,
      requestBodySchemaName: 'CashboxUserTerminalCreate',
      responseSchema: cashboxUserTerminalResponseSchema,
      responseSchemaName: 'CashboxUserTerminal',
    },
  },
};
