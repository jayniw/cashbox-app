import { NextResponse } from 'next/server';
import { parseJsonRequestBody } from '@/lib/api/parseJsonRequest';
import {
  createCashboxPaymentMethod,
  listCashboxPaymentMethods,
} from '@/lib/crud/specification/cashbox_payment_method';
import {
  cashboxPaymentMethodCreateSchema,
  cashboxPaymentMethodQuerySchema,
  cashboxPaymentMethodResponseSchema,
} from '@/types/db/specification/cashboxPaymentMethod';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const queryParams = cashboxPaymentMethodQuerySchema.parse({
    paymentMethodName:
      url.searchParams.get('paymentMethodName') ??
      url.searchParams.get('payment_method_name') ??
      undefined,
    isActive:
      url.searchParams.get('isActive') ??
      url.searchParams.get('is_active') ??
      undefined,
  });

  const methods = await listCashboxPaymentMethods(queryParams);
  return NextResponse.json(methods);
}

export async function POST(request: Request) {
  const parsed = await parseJsonRequestBody(
    request,
    cashboxPaymentMethodCreateSchema,
  );
  if (parsed.errorResponse) return parsed.errorResponse;

  const created = await createCashboxPaymentMethod(parsed.value);
  return NextResponse.json(created, { status: 201 });
}

export const cashboxPaymentMethodOpenApi = {
  path: '/api/specification/cashbox_payment_method',
  tag: 'CRUD - cashbox payment method',
  operations: {
    get: {
      summary: 'List cashbox payment methods',
      description:
        'Returns a list of cashbox payment methods. Use optional query parameters to filter results.',
      querySchema: cashboxPaymentMethodQuerySchema,
      querySchemaName: 'CashboxPaymentMethodQuery',
      responseSchema: cashboxPaymentMethodResponseSchema.array(),
      responseSchemaName: 'CashboxPaymentMethodList',
    },
    post: {
      summary: 'Create a new cashbox payment method',
      requestBodySchema: cashboxPaymentMethodCreateSchema,
      requestBodySchemaName: 'CashboxPaymentMethodCreate',
      responseSchema: cashboxPaymentMethodResponseSchema,
      responseSchemaName: 'CashboxPaymentMethod',
    },
  },
};
