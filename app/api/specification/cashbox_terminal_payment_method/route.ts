import { NextResponse } from 'next/server';
import {
  createCashboxTerminalPaymentMethod,
  listCashboxTerminalPaymentMethods,
} from '@/lib/crud/specification/cashbox_terminal_payment_method';
import { parseJsonRequestBody } from '@/lib/api/parseJsonRequest';
import {
  cashboxTerminalPaymentMethodCreateSchema,
  cashboxTerminalPaymentMethodQuerySchema,
  cashboxTerminalPaymentMethodResponseSchema,
} from '@/types/db/specification/cashboxTerminalPaymentMethod';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const queryParams = cashboxTerminalPaymentMethodQuerySchema.parse({
    cashboxTerminalId:
      url.searchParams.get('cashboxTerminalId') ??
      url.searchParams.get('cashbox_terminal_id') ??
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

  const items = await listCashboxTerminalPaymentMethods(queryParams);
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const parsed = await parseJsonRequestBody(
    request,
    cashboxTerminalPaymentMethodCreateSchema,
  );
  if (parsed.errorResponse) return parsed.errorResponse;

  const created = await createCashboxTerminalPaymentMethod(parsed.value);
  return NextResponse.json(created, { status: 201 });
}

export const cashboxTerminalPaymentMethodOpenApi = {
  path: '/api/specification/cashbox_terminal_payment_method',
  tag: 'CRUD - cashbox terminal payment method',
  operations: {
    get: {
      summary: 'List cashbox terminal payment method links',
      description:
        'Returns a list of terminal-payment method associations. Use optional query parameters to filter by terminal, payment method, or active state.',
      querySchema: cashboxTerminalPaymentMethodQuerySchema,
      querySchemaName: 'CashboxTerminalPaymentMethodQuery',
      responseSchema: cashboxTerminalPaymentMethodResponseSchema.array(),
      responseSchemaName: 'CashboxTerminalPaymentMethodList',
    },
    post: {
      summary: 'Create a new cashbox terminal payment method association',
      requestBodySchema: cashboxTerminalPaymentMethodCreateSchema,
      requestBodySchemaName: 'CashboxTerminalPaymentMethodCreate',
      responseSchema: cashboxTerminalPaymentMethodResponseSchema,
      responseSchemaName: 'CashboxTerminalPaymentMethod',
    },
  },
};
