import type {
  CashboxRoleResponse,
  CashboxRoleCreate,
  CashboxRoleUpdate,
} from '@/types/db/specification/cashboxRole';
import type { SelectOption } from './api';
import { fetchJson } from './api';

export type { CashboxRoleResponse } from '@/types/db/specification/cashboxRole';

export async function listRoles() {
  return fetchJson<CashboxRoleResponse[]>('/api/specification/cashbox_role');
}

export async function createRole(payload: CashboxRoleCreate) {
  return fetchJson<CashboxRoleResponse>('/api/specification/cashbox_role', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateRole(id: string, payload: CashboxRoleUpdate) {
  return fetchJson<CashboxRoleResponse>(
    `/api/specification/cashbox_role/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );
}

export async function listRolePartners(roleId: string) {
  return fetchJson<Array<Record<string, unknown>>>(
    `/api/specification/cashbox_role_partner?cashboxRoleId=${encodeURIComponent(
      roleId,
    )}`,
  ).then((items) =>
    items.map((item) => ({
      id:
        (item.cashbox_role_partner_id as string | undefined) ??
        (item.cashboxRolePartnerId as string | undefined) ??
        '',
      relatedId:
        (item.cashbox_partner_id as string | undefined) ??
        (item.cashboxPartnerId as string | undefined) ??
        '',
      isActive:
        (item.is_active as boolean | undefined) ??
        (item.isActive as boolean | undefined) ??
        false,
    })),
  );
}

export async function listRoleOperations(roleId: string) {
  return fetchJson<Array<Record<string, unknown>>>(
    `/api/specification/cashbox_role_operation?cashboxRoleId=${encodeURIComponent(
      roleId,
    )}`,
  ).then((items) =>
    items.map((item) => ({
      id:
        (item.cashbox_role_operation_id as string | undefined) ??
        (item.cashboxRoleOperationId as string | undefined) ??
        '',
      relatedId:
        (item.cashbox_operation_id as string | undefined) ??
        (item.cashboxOperationId as string | undefined) ??
        '',
      isActive:
        (item.is_active as boolean | undefined) ??
        (item.isActive as boolean | undefined) ??
        false,
    })),
  );
}

export async function listRolePaymentMethods(roleId: string) {
  return fetchJson<Array<Record<string, unknown>>>(
    `/api/specification/cashbox_role_payment_method?cashboxRoleId=${encodeURIComponent(
      roleId,
    )}`,
  ).then((items) =>
    items.map((item) => ({
      id:
        (item.cashbox_role_payment_method_id as string | undefined) ??
        (item.cashboxRolePaymentMethodId as string | undefined) ??
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

export async function getRoleRelations(roleId: string) {
  const [partners, operations, paymentMethods] = await Promise.all([
    listRolePartners(roleId),
    listRoleOperations(roleId),
    listRolePaymentMethods(roleId),
  ]);

  return {
    partnerIds: partners.map((item) => item.relatedId),
    operationIds: operations.map((item) => item.relatedId),
    paymentMethodIds: paymentMethods.map((item) => item.relatedId),
  };
}

async function createRoleRelation(
  path: string,
  payload: Record<string, unknown>,
) {
  return fetchJson<unknown>(`/api/specification/${path}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

async function updateRoleRelation(
  path: string,
  relationId: string,
  payload: { isActive: boolean },
) {
  return fetchJson<unknown>(`/api/specification/${path}/${relationId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

async function deactivateRoleRelation(path: string, relationId: string) {
  return fetchJson<null>(`/api/specification/${path}/${relationId}`, {
    method: 'DELETE',
  });
}

export async function createRolePartner(roleId: string, partnerId: string) {
  return createRoleRelation('cashbox_role_partner', {
    cashboxRoleId: roleId,
    cashboxPartnerId: partnerId,
  });
}

export async function createRoleOperation(roleId: string, operationId: string) {
  return createRoleRelation('cashbox_role_operation', {
    cashboxRoleId: roleId,
    cashboxOperationId: operationId,
  });
}

export async function createRolePaymentMethod(
  roleId: string,
  paymentMethodId: string,
) {
  return createRoleRelation('cashbox_role_payment_method', {
    cashboxRoleId: roleId,
    cashboxPaymentMethodId: paymentMethodId,
  });
}

export async function updateRolePartner(
  relationId: string,
  payload: { isActive?: boolean },
) {
  return updateRoleRelation('cashbox_role_partner', relationId, {
    isActive: payload.isActive ?? true,
  });
}

export async function updateRoleOperation(
  relationId: string,
  payload: { isActive?: boolean },
) {
  return updateRoleRelation('cashbox_role_operation', relationId, {
    isActive: payload.isActive ?? true,
  });
}

export async function updateRolePaymentMethod(
  relationId: string,
  payload: { isActive?: boolean },
) {
  return updateRoleRelation('cashbox_role_payment_method', relationId, {
    isActive: payload.isActive ?? true,
  });
}

export async function deactivateRolePartner(relationId: string) {
  return deactivateRoleRelation('cashbox_role_partner', relationId);
}

export async function deactivateRoleOperation(relationId: string) {
  return deactivateRoleRelation('cashbox_role_operation', relationId);
}

export async function deactivateRolePaymentMethod(relationId: string) {
  return deactivateRoleRelation('cashbox_role_payment_method', relationId);
}

const syncRelations = async (
  roleId: string,
  selectedIds: string[],
  existingRecords: Array<{ id: string; relatedId: string; isActive: boolean }>,
  createFn: (roleId: string, itemId: string) => Promise<unknown>,
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
      actions.push(createFn(roleId, selectedId));
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

export async function syncRolePartners(
  roleId: string,
  selectedPartnerIds: string[],
) {
  const existing = await listRolePartners(roleId);
  return syncRelations(
    roleId,
    selectedPartnerIds,
    existing,
    createRolePartner,
    updateRolePartner,
    deactivateRolePartner,
  );
}

export async function syncRoleOperations(
  roleId: string,
  selectedOperationIds: string[],
) {
  const existing = await listRoleOperations(roleId);
  return syncRelations(
    roleId,
    selectedOperationIds,
    existing,
    createRoleOperation,
    updateRoleOperation,
    deactivateRoleOperation,
  );
}

export async function syncRolePaymentMethods(
  roleId: string,
  selectedPaymentMethodIds: string[],
) {
  const existing = await listRolePaymentMethods(roleId);
  return syncRelations(
    roleId,
    selectedPaymentMethodIds,
    existing,
    createRolePaymentMethod,
    updateRolePaymentMethod,
    deactivateRolePaymentMethod,
  );
}

export async function createRoleWithRelations(
  payload: CashboxRoleCreate,
  partnerIds: string[],
  operationIds: string[],
  paymentMethodIds: string[],
) {
  const role = await createRole(payload);
  await Promise.all([
    syncRolePartners(role.cashboxRoleId, partnerIds),
    syncRoleOperations(role.cashboxRoleId, operationIds),
    syncRolePaymentMethods(role.cashboxRoleId, paymentMethodIds),
  ]);
  return role;
}

export async function updateRoleWithRelations(
  id: string,
  payload: CashboxRoleUpdate,
  partnerIds: string[],
  operationIds: string[],
  paymentMethodIds: string[],
) {
  const role = await updateRole(id, payload);
  await Promise.all([
    syncRolePartners(id, partnerIds),
    syncRoleOperations(id, operationIds),
    syncRolePaymentMethods(id, paymentMethodIds),
  ]);
  return role;
}
