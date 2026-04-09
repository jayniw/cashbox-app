import { NextResponse } from 'next/server';
import { parseJsonRequestBody } from '@/lib/api/parseJsonRequest';
import { getRequestUserId } from '@/lib/api/audit';
import {
  createCashboxPaymentMethodProvider,
  listCashboxPaymentMethodProviders,
} from '@/lib/crud/specification/cashbox_payment_method_provider';
import {
  cashboxPaymentMethodProviderCreateSchema,
  cashboxPaymentMethodProviderQuerySchema,
  cashboxPaymentMethodProviderResponseSchema,
} from '@/types/db/specification/cashboxPaymentMethodProvider';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const queryParams = cashboxPaymentMethodProviderQuerySchema.parse({
    paymentGatewayId:
      url.searchParams.get('paymentGatewayId') ??
      url.searchParams.get('payment_gateway_id') ??
      undefined,
    paymentMethodId:
      url.searchParams.get('paymentMethodId') ??
      url.searchParams.get('payment_method_id') ??
      undefined,
    providerName:
      url.searchParams.get('providerName') ??
      url.searchParams.get('provider_name') ??
      undefined,
  });

  const providers = await listCashboxPaymentMethodProviders(queryParams);
  return NextResponse.json(providers);
}

export async function POST(request: Request) {
  const parsed = await parseJsonRequestBody(
    request,
    cashboxPaymentMethodProviderCreateSchema,
  );
  if (parsed.errorResponse) return parsed.errorResponse;
  const requestUserId = getRequestUserId(request);

  const created = await createCashboxPaymentMethodProvider({
    ...parsed.value,
    userId: requestUserId,
  });

  return NextResponse.json(created, { status: 201 });
}

export const cashboxPaymentMethodProviderOpenApi = {
  path: '/api/specification/cashbox_payment_method_provider',
  tag: 'CRUD - cashbox payment method provider',
  operations: {
    get: {
      summary: 'List cashbox payment method providers',
      description:
        'Returns a list of cashbox payment method providers. Use optional query parameters to filter results.',
      querySchema: cashboxPaymentMethodProviderQuerySchema,
      querySchemaName: 'CashboxPaymentMethodProviderQuery',
      responseSchema: cashboxPaymentMethodProviderResponseSchema.array(),
      responseSchemaName: 'CashboxPaymentMethodProviderList',
    },
    post: {
      summary: 'Create a new cashbox payment method provider',
      requestBodySchema: cashboxPaymentMethodProviderCreateSchema,
      requestBodySchemaName: 'CashboxPaymentMethodProviderCreate',
      responseSchema: cashboxPaymentMethodProviderResponseSchema,
      responseSchemaName: 'CashboxPaymentMethodProvider',
    },
  },
};
