import { NextResponse } from 'next/server';
import { parseJsonRequestBody } from '@/lib/api/parseJsonRequest';
import { getRequestUserId } from '@/lib/api/audit';
import {
  createCashboxPartner,
  listCashboxPartners,
} from '@/lib/crud/specification/cashbox_partner';
import {
  cashboxPartnerCreateSchema,
  cashboxPartnerQuerySchema,
  cashboxPartnerResponseSchema,
} from '@/types/db/specification/cashboxPartner';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const queryParams = cashboxPartnerQuerySchema.parse({
    partnerName:
      url.searchParams.get('partnerName') ??
      url.searchParams.get('partner_name') ??
      undefined,
    partnerStatus:
      url.searchParams.get('partnerStatus') ??
      url.searchParams.get('partner_status') ??
      undefined,
  });

  const partners = await listCashboxPartners(queryParams);
  return NextResponse.json(partners);
}

export async function POST(request: Request) {
  const parsed = await parseJsonRequestBody(
    request,
    cashboxPartnerCreateSchema,
  );
  if (parsed.errorResponse) return parsed.errorResponse;
  const requestUserId = getRequestUserId(request);

  const created = await createCashboxPartner({ ...parsed.value, userId: requestUserId });
  return NextResponse.json(created, { status: 201 });
}

export const cashboxPartnerOpenApi = {
  path: '/api/specification/cashbox_partner',
  tag: 'CRUD - cashbox partner',
  operations: {
    get: {
      summary: 'List cashbox partners',
      description:
        'Returns a list of cashbox partners. Use optional query parameters to filter results.',
      querySchema: cashboxPartnerQuerySchema,
      querySchemaName: 'CashboxPartnerQuery',
      responseSchema: cashboxPartnerResponseSchema.array(),
      responseSchemaName: 'CashboxPartnerList',
    },
    post: {
      summary: 'Create a new cashbox partner',
      requestBodySchema: cashboxPartnerCreateSchema,
      requestBodySchemaName: 'CashboxPartnerCreate',
      responseSchema: cashboxPartnerResponseSchema,
      responseSchemaName: 'CashboxPartner',
    },
  },
};
