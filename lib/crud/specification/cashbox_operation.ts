import { sql, and, type SQL, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { cashbox_operationInSpecification } from '@/lib/schema/schema';
import type {
  CashboxOperationCreate,
  CashboxOperationResponse,
  CashboxOperationUpdate,
} from '@/types/db/specification/cashboxOperation';

export type CashboxOperationFilters = {
  partnerId?: string;
  operationName?: string;
  isActive?: string;
};

export const mapCashboxOperation = (
  operation: Record<string, unknown>,
): CashboxOperationResponse => ({
  cashboxOperationId: operation.cashbox_operation_id as string,
  cashboxPartnerId: operation.cashbox_partner_id as string,
  operationName: operation.operation_name as string,
  isActive: operation.is_active as boolean,
  tranId: operation.tran_id as number | null,
  tranDate: operation.tran_date as string,
  tranPeriod: operation.tran_period as string | null,
  userId: operation.user_id as string | null,
});

export async function listCashboxOperations(filters: CashboxOperationFilters) {
  const conditions: SQL[] = [];

  if (filters.partnerId) {
    conditions.push(
      eq(
        cashbox_operationInSpecification.cashbox_partner_id,
        filters.partnerId,
      ),
    );
  }

  if (filters.operationName) {
    conditions.push(
      sql`LOWER(${cashbox_operationInSpecification.operation_name}) LIKE ${`%${filters.operationName.toLowerCase()}%`}`,
    );
  }

  if (filters.isActive) {
    conditions.push(
      eq(
        cashbox_operationInSpecification.is_active,
        filters.isActive.toLowerCase() === 'true',
      ),
    );
  }

  const query = db
    .select()
    .from(cashbox_operationInSpecification)
    .orderBy(cashbox_operationInSpecification.operation_name);

  const operations = conditions.length
    ? await query.where(and(...conditions))
    : await query;

  return operations.map(mapCashboxOperation);
}

export async function createCashboxOperation(payload: CashboxOperationCreate) {
  const operationData = {
    cashbox_partner_id: payload.partnerId,
    operation_name: payload.operationName,
    is_active: payload.isActive ?? true,
    tran_id: payload.tranId ?? null,
    tran_period: payload.tranPeriod ?? null,
    user_id: payload.userId ?? null,
  };

  const [created] = await db
    .insert(cashbox_operationInSpecification)
    .values(operationData)
    .returning();

  return mapCashboxOperation(created);
}

export async function getCashboxOperationById(id: string) {
  const [operation] = await db
    .select()
    .from(cashbox_operationInSpecification)
    .where(eq(cashbox_operationInSpecification.cashbox_operation_id, id));

  return operation ? mapCashboxOperation(operation) : null;
}

export async function updateCashboxOperation(
  id: string,
  payload: CashboxOperationUpdate,
) {
  const updates: Record<string, unknown> = {};

  if (payload.partnerId !== undefined) {
    updates.cashbox_partner_id = payload.partnerId;
  }

  if (payload.operationName !== undefined) {
    updates.operation_name = payload.operationName;
  }

  if (payload.isActive !== undefined) {
    updates.is_active = payload.isActive;
  }

  if (payload.tranId !== undefined) {
    updates.tran_id = payload.tranId ?? null;
  }

  if (payload.tranPeriod !== undefined) {
    updates.tran_period = payload.tranPeriod;
  }

  if (payload.userId !== undefined) {
    updates.user_id = payload.userId;
  }

  if (Object.keys(updates).length) {
    updates.tran_date = new Date().toISOString();
  }

  if (!Object.keys(updates).length) {
    return null;
  }

  const [updated] = await db
    .update(cashbox_operationInSpecification)
    .set(updates)
    .where(eq(cashbox_operationInSpecification.cashbox_operation_id, id))
    .returning();

  return updated ? mapCashboxOperation(updated) : null;
}

export async function deactivateCashboxOperation(id: string) {
  const [updated] = await db
    .update(cashbox_operationInSpecification)
    .set({ is_active: false })
    .where(eq(cashbox_operationInSpecification.cashbox_operation_id, id))
    .returning();

  return updated ? true : false;
}
