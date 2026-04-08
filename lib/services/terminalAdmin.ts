export type TerminalResponse = {
  cashboxTerminalId: string;
  terminalName: string | null;
  ipAddress: string | null;
  geoPoint: string | null;
  geoUrl: string | null;
  isActive: boolean;
  tranId: number | null;
  tranDate: string;
  tranPeriod: string | null;
  userId: string | null;
};

export type TerminalCreatePayload = {
  terminalName?: string;
  ipAddress?: string | null;
  geoPoint?: string | null;
  geoUrl?: string | null;
  isActive?: boolean;
};

export type TerminalUpdatePayload = TerminalCreatePayload;

export type SelectOption = {
  id: string;
  label: string;
};

export type TerminalRelations = {
  partnerIds: string[];
  operationIds: string[];
  paymentMethodIds: string[];
};

const fetchJson = async <T>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> => {
  const response = await fetch(input, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Request failed: ${response.status} ${response.statusText} - ${text}`,
    );
  }

  return response.json();
};

export async function listTerminals() {
  return fetchJson<TerminalResponse[]>('/api/specification/cashbox_terminal');
}

export async function createTerminal(payload: TerminalCreatePayload) {
  return fetchJson<TerminalResponse>('/api/specification/cashbox_terminal', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateTerminal(
  id: string,
  payload: TerminalUpdatePayload,
) {
  return fetchJson<TerminalResponse>(
    `/api/specification/cashbox_terminal/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );
}

export async function deactivateTerminal(id: string) {
  return fetchJson<null>(`/api/specification/cashbox_terminal/${id}`, {
    method: 'DELETE',
  });
}

export async function listPartners() {
  return fetchJson<SelectOption[]>('/api/specification/cashbox_partner').then(
    (items) =>
      items.map((item: any) => ({
        id: item.cashbox_partner_id,
        label: item.partner_name ?? item.cashbox_partner_id,
      })),
  );
}

export async function listOperations() {
  return fetchJson<SelectOption[]>('/api/specification/cashbox_operation').then(
    (items) =>
      items.map((item: any) => ({
        id: item.cashbox_operation_id,
        label: item.cashbox_operation_name ?? item.cashbox_operation_id,
      })),
  );
}

export async function listPaymentMethods() {
  return fetchJson<SelectOption[]>(
    '/api/specification/cashbox_payment_method',
  ).then((items) =>
    items.map((item: any) => ({
      id: item.cashbox_payment_method_id,
      label: item.payment_method_name ?? item.cashbox_payment_method_id,
    })),
  );
}

async function fetchRelationRecords(
  url: string,
): Promise<Array<Record<string, unknown>>> {
  return fetchJson<Array<Record<string, unknown>>>(url);
}

export async function listTerminalPartners(terminalId: string) {
  const data = await fetchRelationRecords(
    `/api/specification/cashbox_terminal_partner?cashboxTerminalId=${encodeURIComponent(
      terminalId,
    )}`,
  );

  return data.map((item) => ({
    id: item.cashbox_terminal_partner_id as string,
    relatedId: item.cashbox_partner_id as string,
    isActive: Boolean(item.is_active),
  }));
}

export async function listTerminalOperations(terminalId: string) {
  const data = await fetchRelationRecords(
    `/api/specification/cashbox_terminal_operation?cashboxTerminalId=${encodeURIComponent(
      terminalId,
    )}`,
  );

  return data.map((item) => ({
    id: item.cashbox_terminal_operation_id as string,
    relatedId: item.cashbox_operation_id as string,
    isActive: Boolean(item.is_active),
  }));
}

export async function listTerminalPaymentMethods(terminalId: string) {
  const data = await fetchRelationRecords(
    `/api/specification/cashbox_terminal_payment_method?cashboxTerminalId=${encodeURIComponent(
      terminalId,
    )}`,
  );

  return data.map((item) => ({
    id: item.cashbox_terminal_payment_method_id as string,
    relatedId: item.cashbox_payment_method_id as string,
    isActive: Boolean(item.is_active),
  }));
}

export async function createTerminalPartner(
  terminalId: string,
  partnerId: string,
) {
  return fetchJson<unknown>('/api/specification/cashbox_terminal_partner', {
    method: 'POST',
    body: JSON.stringify({
      cashboxTerminalId: terminalId,
      cashboxPartnerId: partnerId,
    }),
  });
}

export async function createTerminalOperation(
  terminalId: string,
  operationId: string,
) {
  return fetchJson<unknown>('/api/specification/cashbox_terminal_operation', {
    method: 'POST',
    body: JSON.stringify({
      cashboxTerminalId: terminalId,
      cashboxOperationId: operationId,
    }),
  });
}

export async function createTerminalPaymentMethod(
  terminalId: string,
  paymentMethodId: string,
) {
  return fetchJson<unknown>(
    '/api/specification/cashbox_terminal_payment_method',
    {
      method: 'POST',
      body: JSON.stringify({
        cashboxTerminalId: terminalId,
        cashboxPaymentMethodId: paymentMethodId,
      }),
    },
  );
}

export async function updateTerminalPartner(
  relationId: string,
  payload: { isActive?: boolean },
) {
  return fetchJson<unknown>(
    `/api/specification/cashbox_terminal_partner/${relationId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );
}

export async function updateTerminalOperation(
  relationId: string,
  payload: { isActive?: boolean },
) {
  return fetchJson<unknown>(
    `/api/specification/cashbox_terminal_operation/${relationId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );
}

export async function updateTerminalPaymentMethod(
  relationId: string,
  payload: { isActive?: boolean },
) {
  return fetchJson<unknown>(
    `/api/specification/cashbox_terminal_payment_method/${relationId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );
}

export async function deactivateTerminalPartner(relationId: string) {
  return fetchJson<null>(
    `/api/specification/cashbox_terminal_partner/${relationId}`,
    { method: 'DELETE' },
  );
}

export async function deactivateTerminalOperation(relationId: string) {
  return fetchJson<null>(
    `/api/specification/cashbox_terminal_operation/${relationId}`,
    { method: 'DELETE' },
  );
}

export async function deactivateTerminalPaymentMethod(relationId: string) {
  return fetchJson<null>(
    `/api/specification/cashbox_terminal_payment_method/${relationId}`,
    { method: 'DELETE' },
  );
}

export async function getTerminalRelations(terminalId: string) {
  const [partners, operations, paymentMethods] = await Promise.all([
    listTerminalPartners(terminalId),
    listTerminalOperations(terminalId),
    listTerminalPaymentMethods(terminalId),
  ]);

  return {
    partnerIds: partners.map((item) => item.relatedId),
    operationIds: operations.map((item) => item.relatedId),
    paymentMethodIds: paymentMethods.map((item) => item.relatedId),
  };
}

const syncRelations = async (
  terminalId: string,
  selectedIds: string[],
  existingRecords: Array<{ id: string; relatedId: string; isActive: boolean }>,
  createFn: (terminalId: string, itemId: string) => Promise<unknown>,
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
      actions.push(createFn(terminalId, selectedId));
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

export async function syncTerminalPartners(
  terminalId: string,
  selectedPartnerIds: string[],
) {
  const existing = await listTerminalPartners(terminalId);
  return syncRelations(
    terminalId,
    selectedPartnerIds,
    existing,
    createTerminalPartner,
    updateTerminalPartner,
    deactivateTerminalPartner,
  );
}

export async function syncTerminalOperations(
  terminalId: string,
  selectedOperationIds: string[],
) {
  const existing = await listTerminalOperations(terminalId);
  return syncRelations(
    terminalId,
    selectedOperationIds,
    existing,
    createTerminalOperation,
    updateTerminalOperation,
    deactivateTerminalOperation,
  );
}

export async function syncTerminalPaymentMethods(
  terminalId: string,
  selectedPaymentMethodIds: string[],
) {
  const existing = await listTerminalPaymentMethods(terminalId);
  return syncRelations(
    terminalId,
    selectedPaymentMethodIds,
    existing,
    createTerminalPaymentMethod,
    updateTerminalPaymentMethod,
    deactivateTerminalPaymentMethod,
  );
}

export async function createTerminalWithRelations(
  payload: TerminalCreatePayload,
  partnerIds: string[],
  operationIds: string[],
  paymentMethodIds: string[],
) {
  const terminal = await createTerminal(payload);
  await Promise.all([
    syncTerminalPartners(terminal.cashboxTerminalId, partnerIds),
    syncTerminalOperations(terminal.cashboxTerminalId, operationIds),
    syncTerminalPaymentMethods(terminal.cashboxTerminalId, paymentMethodIds),
  ]);
  return terminal;
}

export async function updateTerminalWithRelations(
  id: string,
  payload: TerminalUpdatePayload,
  partnerIds: string[],
  operationIds: string[],
  paymentMethodIds: string[],
) {
  const terminal = await updateTerminal(id, payload);
  await Promise.all([
    syncTerminalPartners(id, partnerIds),
    syncTerminalOperations(id, operationIds),
    syncTerminalPaymentMethods(id, paymentMethodIds),
  ]);
  return terminal;
}
