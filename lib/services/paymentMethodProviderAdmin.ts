import type {
  CashboxPaymentMethodProviderResponse,
  CashboxPaymentMethodProviderCreate,
  CashboxPaymentMethodProviderUpdate,
} from '@/types/db/specification/cashboxPaymentMethodProvider';
import { fetchJson } from './api';

export type { CashboxPaymentMethodProviderResponse } from '@/types/db/specification/cashboxPaymentMethodProvider';

export async function listPaymentMethodProviders() {
  return fetchJson<CashboxPaymentMethodProviderResponse[]>(
    '/api/specification/cashbox_payment_method_provider',
  );
}

export async function createPaymentMethodProvider(
  payload: CashboxPaymentMethodProviderCreate,
) {
  return fetchJson<CashboxPaymentMethodProviderResponse>(
    '/api/specification/cashbox_payment_method_provider',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}

export async function updatePaymentMethodProvider(
  id: string,
  payload: CashboxPaymentMethodProviderUpdate,
) {
  return fetchJson<CashboxPaymentMethodProviderResponse>(
    `/api/specification/cashbox_payment_method_provider/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );
}
