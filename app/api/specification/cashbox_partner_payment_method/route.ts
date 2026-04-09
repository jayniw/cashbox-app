import { NextResponse } from 'next/server';
import { parseJsonRequestBody } from '@/lib/api/parseJsonRequest';
import { getRequestUserId } from '@/lib/api/audit';
import {
  createCashboxPartnerPaymentMethod,
  listCashboxPartnerPaymentMethods,
} from '@/lib/crud/specification/cashbox_partner_payment_method';
import {
  cashboxPartnerPaymentMethodCreateSchema,
  cashboxPartnerPaymentMethodQuerySchema,
  cashboxPartnerPaymentMethodResponseSchema,
} from '@/types/db/specification/cashboxPartnerPaymentMethod';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const queryParams = cashboxPartnerPaymentMethodQuerySchema.parse({
    cashboxPartnerId:
      url.searchParams.get('cashboxPartnerId') ??
      url.searchParams.get('cashbox_partner_id') ??
      undefined,
    cashboxPaymentMethodId:
      url.searchParams.get('cashboxPaymentMethodId') ??
      url.searchParams.get('cashbox_payment_method_id') ??
      undefined,
    isActive:
      url.searchParams.get('isActive') ??
      url.searchParams.get('is_active') ??
      undefined,
  });

  const items = await listCashboxPartnerPaymentMethods(queryParams);
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const parsed = await parseJsonRequestBody(
    request,
    cashboxPartnerPaymentMethodCreateSchema,
  );
  if (parsed.errorResponse) return parsed.errorResponse;
  const requestUserId = getRequestUserId(request);

  const created = await createCashboxPartnerPaymentMethod({
    ...parsed.value,
    userId: requestUserId,
  });
  return NextResponse.json(created, { status: 201 });
}

export const cashboxPartnerPaymentMethodOpenApi = {
  path: '/api/specification/cashbox_partner_payment_method',
  tag: 'CRUD - cashbox partner payment method',
  operations: {
    get: {
      summary: 'List cashbox partner payment method links',
      description:
        'Returns a list of partner-payment method associations. Use optional query parameters to filter by partner, payment method, or active state.',
      querySchema: cashboxPartnerPaymentMethodQuerySchema,
      querySchemaName: 'CashboxPartnerPaymentMethodQuery',
      responseSchema: cashboxPartnerPaymentMethodResponseSchema.array(),
      responseSchemaName: 'CashboxPartnerPaymentMethodList',
    },
    post: {
      summary: 'Create a new cashbox partner payment method association',
      requestBodySchema: cashboxPartnerPaymentMethodCreateSchema,
      requestBodySchemaName: 'CashboxPartnerPaymentMethodCreate',
      responseSchema: cashboxPartnerPaymentMethodResponseSchema,
      responseSchemaName: 'CashboxPartnerPaymentMethod',
    },
  },
};
