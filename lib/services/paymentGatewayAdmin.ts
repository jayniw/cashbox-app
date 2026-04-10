import type {
  CashboxPaymentGatewayResponse,
  CashboxPaymentGatewayCreate,
  CashboxPaymentGatewayUpdate,
} from '@/types/db/specification/cashboxPaymentGateway';
import { fetchJson, type SelectOption } from './api';

export type { CashboxPaymentGatewayResponse } from '@/types/db/specification/cashboxPaymentGateway';

export async function listPaymentGateways() {
  return fetchJson<CashboxPaymentGatewayResponse[]>(
    '/api/specification/cashbox_payment_gateway',
  );
}

export async function listPaymentGatewayOptions() {
  return fetchJson<Array<Record<string, unknown>>>(
    '/api/specification/cashbox_payment_gateway',
  ).then((items) =>
    items.map((item) => {
      const id =
        (item.cashbox_payment_gateway_id as string | undefined) ??
        (item.cashboxPaymentGatewayId as string | undefined) ??
        (item.id as string | undefined);
      const label =
        (item.payment_gateway_name as string | undefined) ??
        (item.paymentGatewayName as string | undefined) ??
        id;
      return {
        id: id ?? '',
        label: label ?? '',
      };
    }),
  );
}

export async function createPaymentGateway(
  payload: CashboxPaymentGatewayCreate,
) {
  return fetchJson<CashboxPaymentGatewayResponse>(
    '/api/specification/cashbox_payment_gateway',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}

export async function updatePaymentGateway(
  id: string,
  payload: CashboxPaymentGatewayUpdate,
) {
  return fetchJson<CashboxPaymentGatewayResponse>(
    `/api/specification/cashbox_payment_gateway/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );
}
