import { NextResponse } from 'next/server';
import { parseJsonRequestBody } from '@/lib/api/parseJsonRequest';
import { getRequestUserId } from '@/lib/api/audit';
import {
  createCashboxRolePaymentMethod,
  listCashboxRolePaymentMethods,
} from '@/lib/crud/specification/cashbox_role_payment_method';
import {
  cashboxRolePaymentMethodCreateSchema,
  cashboxRolePaymentMethodQuerySchema,
  cashboxRolePaymentMethodResponseSchema,
} from '@/types/db/specification/cashboxRolePaymentMethod';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const queryParams = cashboxRolePaymentMethodQuerySchema.parse({
    cashboxRoleId:
      url.searchParams.get('cashboxRoleId') ??
      url.searchParams.get('cashbox_role_id') ??
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

  const items = await listCashboxRolePaymentMethods(queryParams);
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const parsed = await parseJsonRequestBody(
    request,
    cashboxRolePaymentMethodCreateSchema,
  );
  if (parsed.errorResponse) return parsed.errorResponse;
  const requestUserId = getRequestUserId(request);

  const created = await createCashboxRolePaymentMethod({
    ...parsed.value,
    userId: requestUserId,
  });
  return NextResponse.json(created, { status: 201 });
}

export const cashboxRolePaymentMethodOpenApi = {
  path: '/api/specification/cashbox_role_payment_method',
  tag: 'CRUD - cashbox role payment method',
  operations: {
    get: {
      summary: 'List cashbox role payment method links',
      description:
        'Returns a list of role-payment method associations. Use optional query parameters to filter by role, payment method, or active state.',
      querySchema: cashboxRolePaymentMethodQuerySchema,
      querySchemaName: 'CashboxRolePaymentMethodQuery',
      responseSchema: cashboxRolePaymentMethodResponseSchema.array(),
      responseSchemaName: 'CashboxRolePaymentMethodList',
    },
    post: {
      summary: 'Create a new cashbox role payment method association',
      requestBodySchema: cashboxRolePaymentMethodCreateSchema,
      requestBodySchemaName: 'CashboxRolePaymentMethodCreate',
      responseSchema: cashboxRolePaymentMethodResponseSchema,
      responseSchemaName: 'CashboxRolePaymentMethod',
    },
  },
};
