import { fetchJson, type SelectOption } from './api';

export async function listPaymentMethods() {
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
