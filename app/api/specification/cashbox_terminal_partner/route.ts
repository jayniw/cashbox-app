import { NextResponse } from 'next/server';
import {
  createCashboxTerminalPartner,
  listCashboxTerminalPartners,
} from '@/lib/crud/specification/cashbox_terminal_partner';
import { parseJsonRequestBody } from '@/lib/api/parseJsonRequest';
import {
  cashboxTerminalPartnerCreateSchema,
  cashboxTerminalPartnerQuerySchema,
  cashboxTerminalPartnerResponseSchema,
} from '@/types/db/specification/cashboxTerminalPartner';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const queryParams = cashboxTerminalPartnerQuerySchema.parse({
    cashboxTerminalId:
      url.searchParams.get('cashboxTerminalId') ??
      url.searchParams.get('cashbox_terminal_id') ??
      undefined,
    cashboxPartnerId:
      url.searchParams.get('cashboxPartnerId') ??
      url.searchParams.get('cashbox_partner_id') ??
      undefined,
    isActive:
      url.searchParams.get('isActive') ??
      url.searchParams.get('is_active') ??
      undefined,
  });

  const items = await listCashboxTerminalPartners(queryParams);
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const parsed = await parseJsonRequestBody(
    request,
    cashboxTerminalPartnerCreateSchema,
  );
  if (parsed.errorResponse) return parsed.errorResponse;

  const created = await createCashboxTerminalPartner(parsed.value);
  return NextResponse.json(created, { status: 201 });
}

export const cashboxTerminalPartnerOpenApi = {
  path: '/api/specification/cashbox_terminal_partner',
  tag: 'CRUD - cashbox terminal partner',
  operations: {
    get: {
      summary: 'List cashbox terminal partner links',
      description:
        'Returns a list of terminal-partner associations. Use optional query parameters to filter by terminal, partner, or active state.',
      querySchema: cashboxTerminalPartnerQuerySchema,
      querySchemaName: 'CashboxTerminalPartnerQuery',
      responseSchema: cashboxTerminalPartnerResponseSchema.array(),
      responseSchemaName: 'CashboxTerminalPartnerList',
    },
    post: {
      summary: 'Create a new cashbox terminal partner association',
      requestBodySchema: cashboxTerminalPartnerCreateSchema,
      requestBodySchemaName: 'CashboxTerminalPartnerCreate',
      responseSchema: cashboxTerminalPartnerResponseSchema,
      responseSchemaName: 'CashboxTerminalPartner',
    },
  },
};
