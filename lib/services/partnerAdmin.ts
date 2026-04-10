import type {
  CashboxPartnerResponse,
  CashboxPartnerCreate,
  CashboxPartnerUpdate,
} from '@/types/db/specification/cashboxPartner';
import { fetchJson, type SelectOption } from './api';

export type { CashboxPartnerResponse } from '@/types/db/specification/cashboxPartner';

export async function listPartners(): Promise<SelectOption[]> {
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

export async function listPartnerRecords() {
  return fetchJson<CashboxPartnerResponse[]>(
    '/api/specification/cashbox_partner',
  );
}

export async function createPartner(payload: CashboxPartnerCreate) {
  return fetchJson<CashboxPartnerResponse>(
    '/api/specification/cashbox_partner',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
}

export async function updatePartner(id: string, payload: CashboxPartnerUpdate) {
  return fetchJson<CashboxPartnerResponse>(
    `/api/specification/cashbox_partner/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );
}

export async function listPartnerPaymentMethods(partnerId: string) {
  return fetchJson<Array<Record<string, unknown>>>(
    `/api/specification/cashbox_partner_payment_method?cashboxPartnerId=${encodeURIComponent(
      partnerId,
    )}`,
  ).then((items) =>
    items.map((item) => ({
      id:
        (item.cashbox_partner_payment_method_id as string | undefined) ??
        (item.cashboxPartnerPaymentMethodId as string | undefined) ??
        '',
      relatedId:
        (item.cashbox_payment_method_id as string | undefined) ??
        (item.cashboxPaymentMethodId as string | undefined) ??
        '',
      isActive:
        (item.is_active as boolean | undefined) ??
        (item.isActive as boolean | undefined) ??
        false,
    })),
  );
}

export async function getPartnerRelations(partnerId: string) {
  const paymentMethods = await listPartnerPaymentMethods(partnerId);

  return {
    paymentMethodIds: paymentMethods.map((item) => item.relatedId),
  };
}

async function createPartnerRelation(
  path: string,
  payload: Record<string, unknown>,
) {
  return fetchJson<unknown>(`/api/specification/${path}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

async function updatePartnerRelation(
  path: string,
  relationId: string,
  payload: { isActive: boolean },
) {
  return fetchJson<unknown>(`/api/specification/${path}/${relationId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

async function deactivatePartnerRelation(path: string, relationId: string) {
  return fetchJson<null>(`/api/specification/${path}/${relationId}`, {
    method: 'DELETE',
  });
}

export async function createPartnerPaymentMethod(
  partnerId: string,
  paymentMethodId: string,
) {
  return createPartnerRelation('cashbox_partner_payment_method', {
    cashboxPartnerId: partnerId,
    cashboxPaymentMethodId: paymentMethodId,
  });
}

export async function updatePartnerPaymentMethod(
  relationId: string,
  payload: { isActive?: boolean },
) {
  return updatePartnerRelation('cashbox_partner_payment_method', relationId, {
    isActive: payload.isActive ?? true,
  });
}

export async function deactivatePartnerPaymentMethod(relationId: string) {
  return deactivatePartnerRelation(
    'cashbox_partner_payment_method',
    relationId,
  );
}

const syncRelations = async (
  partnerId: string,
  selectedIds: string[],
  existingRecords: Array<{ id: string; relatedId: string; isActive: boolean }>,
  createFn: (partnerId: string, itemId: string) => Promise<unknown>,
  updateFn: (
    relationId: string,
    payload: { isActive: boolean },
  ) => Promise<unknown>,
  deactivateFn: (relationId: string) => Promise<unknown>,
) => {
  const existingMap = new Map(
    existingRecords.map((record) => [record.relatedId, record]),
  );

  const selectedSet = new Set(selectedIds);
  const actions: Promise<unknown>[] = [];

  for (const selectedId of selectedIds) {
    const existing = existingMap.get(selectedId);
    if (!existing) {
      actions.push(createFn(partnerId, selectedId));
      continue;
    }
    if (!existing.isActive) {
      actions.push(updateFn(existing.id, { isActive: true }));
    }
  }

  for (const existing of existingRecords) {
    if (!selectedSet.has(existing.relatedId) && existing.isActive) {
      actions.push(deactivateFn(existing.id));
    }
  }

  await Promise.all(actions);
};

export async function syncPartnerPaymentMethods(
  partnerId: string,
  selectedPaymentMethodIds: string[],
) {
  const existing = await listPartnerPaymentMethods(partnerId);
  return syncRelations(
    partnerId,
    selectedPaymentMethodIds,
    existing,
    createPartnerPaymentMethod,
    updatePartnerPaymentMethod,
    deactivatePartnerPaymentMethod,
  );
}

export async function createPartnerWithRelations(
  payload: CashboxPartnerCreate,
  paymentMethodIds: string[],
) {
  const partner = await createPartner(payload);
  await syncPartnerPaymentMethods(partner.cashboxPartnerId, paymentMethodIds);
  return partner;
}

export async function updatePartnerWithRelations(
  id: string,
  payload: CashboxPartnerUpdate,
  paymentMethodIds: string[],
) {
  const partner = await updatePartner(id, payload);
  await syncPartnerPaymentMethods(id, paymentMethodIds);
  return partner;
}
