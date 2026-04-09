import { and, eq, type SQL } from 'drizzle-orm';
import { db } from '@/lib/db';
import { cashbox_terminal_operationInSpecification } from '@/lib/schema/schema';
import type {
  CashboxTerminalOperationCreate,
  CashboxTerminalOperationResponse,
  CashboxTerminalOperationUpdate,
} from '@/types/db/specification/cashboxTerminalOperation';
import { formatTranPeriod } from '@/lib/date_utils';

export type CashboxTerminalOperationFilters = {
  cashboxTerminalId?: string;
  cashboxOperationId?: string;
  isActive?: string;
};

export const mapCashboxTerminalOperation = (
  row: Record<string, unknown>,
): CashboxTerminalOperationResponse => ({
  cashboxTerminalOperationId: row.cashbox_terminal_operation_id as string,
  cashboxTerminalId: row.cashbox_terminal_id as string,
  cashboxOperationId: row.cashbox_operation_id as string,
  isActive: row.is_active as boolean,
  tranId: row.tran_id as number,
  tranDate: row.tran_date as string,
  tranPeriod: row.tran_period as string | null,
  userId: row.user_id as string | null,
});

export async function listCashboxTerminalOperations(
  filters: CashboxTerminalOperationFilters,
) {
  const conditions: SQL[] = [];

  if (filters.cashboxTerminalId) {
    conditions.push(
      eq(
        cashbox_terminal_operationInSpecification.cashbox_terminal_id,
        filters.cashboxTerminalId,
      ),
    );
  }

  if (filters.cashboxOperationId) {
    conditions.push(
      eq(
        cashbox_terminal_operationInSpecification.cashbox_operation_id,
        filters.cashboxOperationId,
      ),
    );
  }

  if (filters.isActive) {
    conditions.push(
      eq(
        cashbox_terminal_operationInSpecification.is_active,
        filters.isActive.toLowerCase() === 'true',
      ),
    );
  }

  const query = db
    .select()
    .from(cashbox_terminal_operationInSpecification)
    .orderBy(
      cashbox_terminal_operationInSpecification.cashbox_terminal_operation_id,
    );

  const rows = conditions.length
    ? await query.where(and(...conditions))
    : await query;

  return rows.map(mapCashboxTerminalOperation);
}

export async function createCashboxTerminalOperation(
  payload: CashboxTerminalOperationCreate,
) {
  const [created] = await db
    .insert(cashbox_terminal_operationInSpecification)
    .values({
      cashbox_terminal_id: payload.cashboxTerminalId,
      cashbox_operation_id: payload.cashboxOperationId,
      is_active: payload.isActive ?? true,
      ...(payload.userId !== undefined ? { user_id: payload.userId } : {}),
    })
    .returning();

  return mapCashboxTerminalOperation(created);
}

export async function getCashboxTerminalOperationById(id: string) {
  const [row] = await db
    .select()
    .from(cashbox_terminal_operationInSpecification)
    .where(
      eq(
        cashbox_terminal_operationInSpecification.cashbox_terminal_operation_id,
        id,
      ),
    );

  return row ? mapCashboxTerminalOperation(row) : null;
}

export async function updateCashboxTerminalOperation(
  id: string,
  payload: CashboxTerminalOperationUpdate,
) {
  const updates: Record<string, unknown> = {};

  if (payload.cashboxTerminalId !== undefined) {
    updates.cashbox_terminal_id = payload.cashboxTerminalId;
  }

  if (payload.cashboxOperationId !== undefined) {
    updates.cashbox_operation_id = payload.cashboxOperationId;
  }

  if (payload.isActive !== undefined) {
    updates.is_active = payload.isActive;
  }

  if (Object.keys(updates).length) {
    const now = new Date();
    updates.tran_date = now.toISOString();
    updates.tran_period = formatTranPeriod(now);
  }

  if (!Object.keys(updates).length) {
    return null;
  }

  const [updated] = await db
    .update(cashbox_terminal_operationInSpecification)
    .set(updates)
    .where(
      eq(
        cashbox_terminal_operationInSpecification.cashbox_terminal_operation_id,
        id,
      ),
    )
    .returning();

  return updated ? mapCashboxTerminalOperation(updated) : null;
}

export async function deactivateCashboxTerminalOperation(id: string) {
  const updates: Record<string, unknown> = {};
  updates.is_active = false;
  const now = new Date();
  updates.tran_date = now.toISOString();
  updates.tran_period = formatTranPeriod(now);
  const [updated] = await db
    .update(cashbox_terminal_operationInSpecification)
    .set(updates)
    .where(
      eq(
        cashbox_terminal_operationInSpecification.cashbox_terminal_operation_id,
        id,
      ),
    )
    .returning();

  return !!updated;
}
