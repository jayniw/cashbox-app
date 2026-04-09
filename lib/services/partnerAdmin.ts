import { fetchJson, type SelectOption } from './api';

export async function listPartners() {
  return fetchJson<Array<Record<string, unknown>>>(
    '/api/specification/cashbox_partner',
  ).then((items) =>
    items.map((item) => {
      const id =
        (item.cashbox_partner_id as string | undefined) ??
        (item.cashboxPartnerId as string | undefined) ??
        (item.id as string | undefined);
      const label =
        (item.partner_name as string | undefined) ??
        (item.partnerName as string | undefined) ??
        id;

      return {
        id: id ?? '',
        label: label ?? '',
      };
    }),
  );
}
