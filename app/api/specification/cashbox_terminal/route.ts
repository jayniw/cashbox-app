import { NextResponse } from 'next/server';
import {
  createCashboxTerminal,
  listCashboxTerminals,
} from '@/lib/crud/specification/cashbox_terminal';
import { parseJsonRequestBody } from '@/lib/api/parseJsonRequest';
import { getRequestUserId } from '@/lib/api/audit';
import {
  cashboxTerminalCreateSchema,
  cashboxTerminalQuerySchema,
  cashboxTerminalResponseSchema,
} from '@/types/db/specification/cashboxTerminal';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const queryParams = cashboxTerminalQuerySchema.parse({
    terminalName:
      url.searchParams.get('terminalName') ??
      url.searchParams.get('terminal_name') ??
      undefined,
    ipAddress:
      url.searchParams.get('ipAddress') ??
      url.searchParams.get('ip_address') ??
      undefined,
    isActive:
      url.searchParams.get('isActive') ??
      url.searchParams.get('is_active') ??
      undefined,
  });

  const terminals = await listCashboxTerminals(queryParams);
  return NextResponse.json(terminals);
}

export async function POST(request: Request) {
  const parsed = await parseJsonRequestBody(
    request,
    cashboxTerminalCreateSchema,
  );
  if (parsed.errorResponse) return parsed.errorResponse;
  const requestUserId = getRequestUserId(request);

  const created = await createCashboxTerminal({ ...parsed.value, userId: requestUserId });
  return NextResponse.json(created, { status: 201 });
}

export const cashboxTerminalOpenApi = {
  path: '/api/specification/cashbox_terminal',
  tag: 'CRUD - cashbox terminal',
  operations: {
    get: {
      summary: 'List cashbox terminals',
      description:
        'Returns a list of cashbox terminals. Use optional query parameters to filter results.',
      querySchema: cashboxTerminalQuerySchema,
      querySchemaName: 'CashboxTerminalQuery',
      responseSchema: cashboxTerminalResponseSchema.array(),
      responseSchemaName: 'CashboxTerminalList',
    },
    post: {
      summary: 'Create a new cashbox terminal',
      requestBodySchema: cashboxTerminalCreateSchema,
      requestBodySchemaName: 'CashboxTerminalCreate',
      responseSchema: cashboxTerminalResponseSchema,
      responseSchemaName: 'CashboxTerminal',
    },
  },
};
