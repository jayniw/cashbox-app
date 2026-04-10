import type {
  CashboxPaymentMethodResponse,
  CashboxPaymentMethodCreate,
  CashboxPaymentMethodUpdate,
} from '@/types/db/specification/cashboxPaymentMethod';
import { fetchJson, type SelectOption } from './api';

export type { CashboxPaymentMethodResponse } from '@/types/db/specification/cashboxPaymentMethod';

export async function listPaymentMethodRecords() {
  return fetchJson<CashboxPaymentMethodResponse[]>(
    '/api/specification/cashbox_payment_method',
  );
}

export async function listPaymentMethods(): Promise<SelectOption[]> {
  return fetchJson<Array<Record<string, unknown>>>(
    '/api/specification/cashbox_payment_method',
  ).then((items) =>
    items.map((item) => {
      const id =
        (item.cashbox_payment_method_id as string | undefined) ??
        (item.cashboxPaymentMethodId as string | undefined) ??
        (item.id as string | undefined);
      const label =
        (item.payment_method_name as string | undefined) ??
        (item.paymentMethodName as string | undefined) ??
        id;

      return {
        id: id ?? '',
        label: label ?? '',
      };
    }),
  );
}

export async function listPaymentMethodOptions(): Promise<SelectOption[]> {
  return listPaymentMethods();
}

export async function createPaymentMethod(payload: CashboxPaymentMethodCreate) {
  return fetchJson<CashboxPaymentMethodResponse>(
    '/api/specification/cashbox_payment_method',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}

export async function updatePaymentMethod(
  id: string,
  payload: CashboxPaymentMethodUpdate,
) {
  return fetchJson<CashboxPaymentMethodResponse>(
    `/api/specification/cashbox_payment_method/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );
}
