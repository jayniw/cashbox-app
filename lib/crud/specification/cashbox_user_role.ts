import { and, type SQL, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { cashbox_user_roleInSpecification } from '@/lib/schema/schema';
import { formatTranPeriod } from '@/lib/date_utils';
import type {
  CashboxUserRoleCreate,
  CashboxUserRoleResponse,
  CashboxUserRoleQuery,
  CashboxUserRoleUpdate,
} from '@/types/db/specification/cashboxUserRole';

export const mapCashboxUserRole = (
  row: Record<string, unknown>,
): CashboxUserRoleResponse => ({
  cashboxUserRoleId: row.cashbox_user_role_id as string,
  cashboxUserId: row.cashbox_user_id as string,
  cashboxRoleId: row.cashbox_role_id as string,
  isDefault: row.is_default as boolean,
  tranId: row.tran_id as number,
  tranDate: row.tran_date as string,
  tranPeriod: row.tran_period as string | null,
  userId: row.user_id as string | null,
});

export async function listCashboxUserRoles(filters: CashboxUserRoleQuery) {
  const conditions: SQL[] = [];

  if (filters.cashboxUserId) {
    conditions.push(
      eq(
        cashbox_user_roleInSpecification.cashbox_user_id,
        filters.cashboxUserId,
      ),
    );
  }

  if (filters.cashboxRoleId) {
    conditions.push(
      eq(
        cashbox_user_roleInSpecification.cashbox_role_id,
        filters.cashboxRoleId,
      ),
    );
  }

  const query = db.select().from(cashbox_user_roleInSpecification);
  const rows = conditions.length
    ? await query.where(and(...conditions))
    : await query;

  return rows.map(mapCashboxUserRole);
}

export async function createCashboxUserRole(payload: CashboxUserRoleCreate) {
  const [created] = await db
    .insert(cashbox_user_roleInSpecification)
    .values({
      cashbox_user_id: payload.cashboxUserId,
      cashbox_role_id: payload.cashboxRoleId,
      is_default: payload.isDefault ?? true,
      ...(payload.userId !== undefined ? { user_id: payload.userId } : {}),
    })
    .returning();

  return mapCashboxUserRole(created);
}

export async function getCashboxUserRoleById(id: string) {
  const [row] = await db
    .select()
    .from(cashbox_user_roleInSpecification)
    .where(eq(cashbox_user_roleInSpecification.cashbox_user_role_id, id));

  return row ? mapCashboxUserRole(row) : null;
}

export async function updateCashboxUserRole(
  id: string,
  payload: CashboxUserRoleUpdate,
) {
  const updates: Record<string, unknown> = {};

  if (payload.cashboxUserId !== undefined)
    updates.cashbox_user_id = payload.cashboxUserId;
  if (payload.cashboxRoleId !== undefined)
    updates.cashbox_role_id = payload.cashboxRoleId;
  if (payload.isDefault !== undefined) updates.is_default = payload.isDefault;

  if (Object.keys(updates).length) {
    const now = new Date();
    updates.tran_date = now.toISOString();
    updates.tran_period = formatTranPeriod(now);
  }

  if (!Object.keys(updates).length) {
    return null;
  }

  const [updated] = await db
    .update(cashbox_user_roleInSpecification)
    .set(updates)
    .where(eq(cashbox_user_roleInSpecification.cashbox_user_role_id, id))
    .returning();

  return updated ? mapCashboxUserRole(updated) : null;
}
