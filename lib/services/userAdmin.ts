import type {
  CashboxUserResponse,
  CashboxUserCreate,
  CashboxUserUpdate,
} from '@/types/db/specification/cashboxUser';
import { fetchJson } from './api';

export type { CashboxUserResponse } from '@/types/db/specification/cashboxUser';

export type UserRelations = {
  roleIds: string[];
  terminalIds: string[];
};

export async function listUsers() {
  return fetchJson<CashboxUserResponse[]>('/api/specification/cashbox_user');
}

export async function createUser(payload: CashboxUserCreate) {
  return fetchJson<CashboxUserResponse>('/api/specification/cashbox_user', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateUser(id: string, payload: CashboxUserUpdate) {
  return fetchJson<CashboxUserResponse>(
    `/api/specification/cashbox_user/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );
}

export async function deactivateUser(id: string) {
  return fetchJson<null>(`/api/specification/cashbox_user/${id}`, {
    method: 'DELETE',
  });
}

async function fetchRelationRecords(url: string) {
  return fetchJson<Array<Record<string, unknown>>>(url);
}

export async function listUserRoles(userId: string) {
  return fetchRelationRecords(
    `/api/specification/cashbox_user_role?cashboxUserId=${encodeURIComponent(
      userId,
    )}`,
  ).then((items) =>
    items.map((item) => ({
      id:
        (item.cashbox_user_role_id as string | undefined) ??
        (item.cashboxUserRoleId as string | undefined) ??
        '',
      relatedId:
        (item.cashbox_role_id as string | undefined) ??
        (item.cashboxRoleId as string | undefined) ??
        '',
      isDefault:
        (item.is_default as boolean | undefined) ??
        (item.isDefault as boolean | undefined) ??
        false,
    })),
  );
}

export async function listUserTerminals(userId: string) {
  return fetchRelationRecords(
    `/api/specification/cashbox_user_terminal?cashboxUserId=${encodeURIComponent(
      userId,
    )}`,
  ).then((items) =>
    items.map((item) => ({
      id:
        (item.cashbox_user_terminal_id as string | undefined) ??
        (item.cashboxUserTerminalId as string | undefined) ??
        '',
      relatedId:
        (item.cashbox_terminal_id as string | undefined) ??
        (item.cashboxTerminalId as string | undefined) ??
        '',
      isActive:
        (item.is_active as boolean | undefined) ??
        (item.isActive as boolean | undefined) ??
        false,
    })),
  );
}

export async function getUserRelations(userId: string) {
  const [roles, terminals] = await Promise.all([
    listUserRoles(userId),
    listUserTerminals(userId),
  ]);

  return {
    roleIds: roles.map((item) => item.relatedId),
    terminalIds: terminals
      .filter((item) => item.isActive)
      .map((item) => item.relatedId),
  };
}

export async function createUserRole(userId: string, roleId: string) {
  return fetchJson<unknown>('/api/specification/cashbox_user_role', {
    method: 'POST',
    body: JSON.stringify({
      cashboxUserId: userId,
      cashboxRoleId: roleId,
    }),
  });
}

export async function createUserTerminal(userId: string, terminalId: string) {
  return fetchJson<unknown>('/api/specification/cashbox_user_terminal', {
    method: 'POST',
    body: JSON.stringify({
      cashboxUserId: userId,
      cashboxTerminalId: terminalId,
    }),
  });
}

export async function updateUserTerminal(
  relationId: string,
  payload: { isActive?: boolean },
) {
  return fetchJson<unknown>(
    `/api/specification/cashbox_user_terminal/${relationId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );
}

export async function deactivateUserTerminal(relationId: string) {
  return fetchJson<null>(
    `/api/specification/cashbox_user_terminal/${relationId}`,
    {
      method: 'DELETE',
    },
  );
}

const syncRelations = async (
  userId: string,
  selectedIds: string[],
  existingRecords: Array<{ id: string; relatedId: string; isActive: boolean }>,
  createFn: (userId: string, itemId: string) => Promise<unknown>,
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
      actions.push(createFn(userId, selectedId));
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

export async function syncUserTerminals(
  userId: string,
  selectedTerminalIds: string[],
) {
  const existing = await listUserTerminals(userId);
  return syncRelations(
    userId,
    selectedTerminalIds,
    existing,
    createUserTerminal,
    updateUserTerminal,
    deactivateUserTerminal,
  );
}

export async function syncUserRoles(userId: string, selectedRoleIds: string[]) {
  const existing = await listUserRoles(userId);
  const existingSet = new Set(existing.map((item) => item.relatedId));

  const actions: Promise<unknown>[] = [];

  for (const selectedId of selectedRoleIds) {
    if (!existingSet.has(selectedId)) {
      actions.push(createUserRole(userId, selectedId));
    }
  }

  await Promise.all(actions);
}

export async function createUserWithRelations(
  payload: CashboxUserCreate,
  roleIds: string[],
  terminalIds: string[],
) {
  const user = await createUser(payload);

  await Promise.all([
    syncUserRoles(user.cashboxUserId, roleIds),
    syncUserTerminals(user.cashboxUserId, terminalIds),
  ]);

  return user;
}

export async function updateUserWithRelations(
  id: string,
  payload: CashboxUserUpdate,
  roleIds: string[],
  terminalIds: string[],
) {
  const user = await updateUser(id, payload);

  await Promise.all([
    syncUserRoles(id, roleIds),
    syncUserTerminals(id, terminalIds),
  ]);

  return user;
}
