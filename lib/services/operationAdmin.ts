import { fetchJson, type SelectOption } from './api';

export type OperationGroup = {
  partnerId: string;
  partnerLabel: string;
  operations: SelectOption[];
};

function normalizeOperationItem(item: Record<string, unknown>): SelectOption {
  const id =
    (item.cashbox_operation_id as string | undefined) ??
    (item.cashboxOperationId as string | undefined) ??
    (item.id as string | undefined);
  const label =
    (item.operation_name as string | undefined) ??
    (item.operationName as string | undefined) ??
    id;

  return {
    id: id ?? '',
    label: label ?? '',
  };
}

export async function listOperationsByPartner(
  partnerIds: string[],
  partnerLabels: Record<string, string> = {},
) {
  if (!partnerIds || partnerIds.length === 0) {
    return [] as OperationGroup[];
  }

  const responses = await Promise.all(
    partnerIds.map(async (partnerId) => {
      const items = await fetchJson<Array<Record<string, unknown>>>(
        `/api/specification/cashbox_operation?partnerId=${encodeURIComponent(
          partnerId,
        )}`,
      );
      return {
        partnerId,
        items,
      };
    }),
  );

  return responses.map(({ partnerId, items }) => ({
    partnerId,
    partnerLabel: partnerLabels[partnerId] ?? partnerId,
    operations: items.map(normalizeOperationItem).filter((option) => option.id),
  }));
}
