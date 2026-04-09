import { NextResponse } from 'next/server';
import { parseJsonRequestBody } from '@/lib/api/parseJsonRequest';
import { getRequestUserId } from '@/lib/api/audit';
import {
  createCashboxPaymentGateway,
  listCashboxPaymentGateways,
} from '@/lib/crud/specification/cashbox_payment_gateway';
import {
  cashboxPaymentGatewayCreateSchema,
  cashboxPaymentGatewayQuerySchema,
  cashboxPaymentGatewayResponseSchema,
} from '@/types/db/specification/cashboxPaymentGateway';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const queryParams = cashboxPaymentGatewayQuerySchema.parse({
    paymentGatewayName:
      url.searchParams.get('paymentGatewayName') ??
      url.searchParams.get('payment_gateway_name') ??
      undefined,
    paymentGatewayType:
      url.searchParams.get('paymentGatewayType') ??
      url.searchParams.get('payment_gateway_type') ??
      undefined,
  });

  const gateways = await listCashboxPaymentGateways(queryParams);
  return NextResponse.json(gateways);
}

export async function POST(request: Request) {
  const parsed = await parseJsonRequestBody(
    request,
    cashboxPaymentGatewayCreateSchema,
  );
  if (parsed.errorResponse) return parsed.errorResponse;
  const requestUserId = getRequestUserId(request);

  const created = await createCashboxPaymentGateway({
    ...parsed.value,
    userId: requestUserId,
  });
  return NextResponse.json(created, { status: 201 });
}

export const cashboxPaymentGatewayOpenApi = {
  path: '/api/specification/cashbox_payment_gateway',
  tag: 'CRUD - cashbox payment gateway',
  operations: {
    get: {
      summary: 'List cashbox payment gateways',
      description:
        'Returns a list of cashbox payment gateways. Use optional query parameters to filter results.',
      querySchema: cashboxPaymentGatewayQuerySchema,
      querySchemaName: 'CashboxPaymentGatewayQuery',
      responseSchema: cashboxPaymentGatewayResponseSchema.array(),
      responseSchemaName: 'CashboxPaymentGatewayList',
    },
    post: {
      summary: 'Create a new cashbox payment gateway',
      requestBodySchema: cashboxPaymentGatewayCreateSchema,
      requestBodySchemaName: 'CashboxPaymentGatewayCreate',
      responseSchema: cashboxPaymentGatewayResponseSchema,
      responseSchemaName: 'CashboxPaymentGateway',
    },
  },
};
