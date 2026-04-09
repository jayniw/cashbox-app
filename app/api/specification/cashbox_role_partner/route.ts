import { NextResponse } from 'next/server';
import { parseJsonRequestBody } from '@/lib/api/parseJsonRequest';
import { getRequestUserId } from '@/lib/api/audit';
import {
  createCashboxRolePartner,
  listCashboxRolePartners,
} from '@/lib/crud/specification/cashbox_role_partner';
import {
  cashboxRolePartnerCreateSchema,
  cashboxRolePartnerQuerySchema,
  cashboxRolePartnerResponseSchema,
} from '@/types/db/specification/cashboxRolePartner';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const queryParams = cashboxRolePartnerQuerySchema.parse({
    cashboxRoleId:
      url.searchParams.get('cashboxRoleId') ??
      url.searchParams.get('cashbox_role_id') ??
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

  const items = await listCashboxRolePartners(queryParams);
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const parsed = await parseJsonRequestBody(
    request,
    cashboxRolePartnerCreateSchema,
  );
  if (parsed.errorResponse) return parsed.errorResponse;
  const requestUserId = getRequestUserId(request);

  const created = await createCashboxRolePartner({
    ...parsed.value,
    userId: requestUserId,
  });
  return NextResponse.json(created, { status: 201 });
}

export const cashboxRolePartnerOpenApi = {
  path: '/api/specification/cashbox_role_partner',
  tag: 'CRUD - cashbox role partner',
  operations: {
    get: {
      summary: 'List cashbox role partner links',
      description:
        'Returns a list of role-partner associations. Use optional query parameters to filter by role, partner, or active state.',
      querySchema: cashboxRolePartnerQuerySchema,
      querySchemaName: 'CashboxRolePartnerQuery',
      responseSchema: cashboxRolePartnerResponseSchema.array(),
      responseSchemaName: 'CashboxRolePartnerList',
    },
    post: {
      summary: 'Create a new cashbox role partner association',
      requestBodySchema: cashboxRolePartnerCreateSchema,
      requestBodySchemaName: 'CashboxRolePartnerCreate',
      responseSchema: cashboxRolePartnerResponseSchema,
      responseSchemaName: 'CashboxRolePartner',
    },
  },
};
