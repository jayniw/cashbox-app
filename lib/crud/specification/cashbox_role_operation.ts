import { sql, and, type SQL, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { cashbox_role_operationInSpecification } from '@/lib/schema/schema';
import type {
  CashboxRoleOperationCreate,
  CashboxRoleOperationResponse,
  CashboxRoleOperationQuery,
  CashboxRoleOperationUpdate,
} from '@/types/db/specification/cashboxRoleOperation';

export const mapCashboxRoleOperation = (
  row: Record<string, unknown>,
): CashboxRoleOperationResponse => ({
  cashboxRoleOperationId: row.cashbox_role_operation_id as string,
  cashboxRoleId: row.cashbox_role_id as string,
  cashboxOperationId: row.cashbox_operation_id as string,
  isActive: row.is_active as boolean,
  tranId: row.tran_id as number,
  tranDate: row.tran_date as string,
  tranPeriod: row.tran_period as string | null,
  userId: row.user_id as string | null,
});

export async function listCashboxRoleOperations(
  filters: CashboxRoleOperationQuery,
) {
  const conditions: SQL[] = [];

  if (filters.cashboxRoleId) {
    conditions.push(
      eq(
        cashbox_role_operationInSpecification.cashbox_role_id,
        filters.cashboxRoleId,
      ),
    );
  }
  if (filters.cashboxOperationId) {
    conditions.push(
      eq(
        cashbox_role_operationInSpecification.cashbox_operation_id,
        filters.cashboxOperationId,
      ),
    );
  }
  if (filters.isActive) {
    const isActive = filters.isActive.toLowerCase();
    if (isActive === 'true' || isActive === 'false') {
      conditions.push(
        eq(
          cashbox_role_operationInSpecification.is_active,
          isActive === 'true',
        ),
      );
    }
  }

  const query = db.select().from(cashbox_role_operationInSpecification);
  const rows = conditions.length
    ? await query.where(and(...conditions))
    : await query;

  return rows.map(mapCashboxRoleOperation);
}

export async function createCashboxRoleOperation(
  payload: CashboxRoleOperationCreate,
) {
  const [created] = await db
    .insert(cashbox_role_operationInSpecification)
    .values({
      cashbox_role_id: payload.cashboxRoleId,
      cashbox_operation_id: payload.cashboxOperationId,
      is_active: payload.isActive ?? true,
      ...(payload.userId !== undefined ? { user_id: payload.userId } : {}),
    })
    .returning();

  return mapCashboxRoleOperation(created);
}

export async function getCashboxRoleOperationById(id: string) {
  const [row] = await db
    .select()
    .from(cashbox_role_operationInSpecification)
    .where(
      eq(cashbox_role_operationInSpecification.cashbox_role_operation_id, id),
    );

  return row ? mapCashboxRoleOperation(row) : null;
}

export async function updateCashboxRoleOperation(
  id: string,
  payload: CashboxRoleOperationUpdate,
) {
  const updates: Record<string, unknown> = {};

  if (payload.cashboxRoleId !== undefined)
    updates.cashbox_role_id = payload.cashboxRoleId;
  if (payload.cashboxOperationId !== undefined)
    updates.cashbox_operation_id = payload.cashboxOperationId;
  if (payload.isActive !== undefined) updates.is_active = payload.isActive;

  if (Object.keys(updates).length) {
    updates.tran_date = new Date().toISOString();
  }

  if (!Object.keys(updates).length) {
    return null;
  }

  const [updated] = await db
    .update(cashbox_role_operationInSpecification)
    .set(updates)
    .where(
      eq(cashbox_role_operationInSpecification.cashbox_role_operation_id, id),
    )
    .returning();

  return updated ? mapCashboxRoleOperation(updated) : null;
}

export async function deactivateCashboxRoleOperation(id: string) {
  const [updated] = await db
    .update(cashbox_role_operationInSpecification)
    .set({ is_active: false })
    .where(
      eq(cashbox_role_operationInSpecification.cashbox_role_operation_id, id),
    )
    .returning();

  return updated ? true : false;
}
