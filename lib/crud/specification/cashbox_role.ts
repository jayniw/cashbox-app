import { sql, and, type SQL, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { cashbox_roleInSpecification } from '@/lib/schema/schema';
import type {
  CashboxRoleCreate,
  CashboxRoleResponse,
  CashboxRoleUpdate,
} from '@/types/db/specification/cashboxRole';

export type CashboxRoleFilters = {
  roleName?: string;
};

export const mapCashboxRole = (
  role: Record<string, unknown>,
): CashboxRoleResponse => ({
  cashboxRoleId: role.cashbox_role_id as string,
  roleName: role.role_name as string | null,
  tranId: role.tran_id as number | null,
  tranDate: role.tran_date as string,
  tranPeriod: role.tran_period as string | null,
  userId: role.user_id as string | null,
});

export async function listCashboxRoles(filters: CashboxRoleFilters) {
  const conditions: SQL[] = [];

  if (filters.roleName) {
    conditions.push(
      sql`LOWER(${cashbox_roleInSpecification.role_name}) LIKE ${`%${filters.roleName.toLowerCase()}%`}`,
    );
  }

  const query = db
    .select()
    .from(cashbox_roleInSpecification)
    .orderBy(cashbox_roleInSpecification.role_name);

  const roles = conditions.length
    ? await query.where(and(...conditions))
    : await query;
  return roles.map(mapCashboxRole);
}

export async function createCashboxRole(payload: CashboxRoleCreate) {
  const roleData = {
    role_name: payload.roleName ?? null,
    user_id: payload.userId ?? null,
  };

  const [created] = await db
    .insert(cashbox_roleInSpecification)
    .values(roleData)
    .returning();

  return mapCashboxRole(created);
}

export async function getCashboxRoleById(id: string) {
  const [role] = await db
    .select()
    .from(cashbox_roleInSpecification)
    .where(eq(cashbox_roleInSpecification.cashbox_role_id, id));

  return role ? mapCashboxRole(role) : null;
}

export async function updateCashboxRole(
  id: string,
  payload: CashboxRoleUpdate,
) {
  const updates: Record<string, unknown> = {};

  if (payload.roleName !== undefined) updates.role_name = payload.roleName;
  if (payload.userId !== undefined) updates.user_id = payload.userId;

  if (!Object.keys(updates).length) {
    return null;
  }

  const [updated] = await db
    .update(cashbox_roleInSpecification)
    .set(updates)
    .where(eq(cashbox_roleInSpecification.cashbox_role_id, id))
    .returning();

  return updated ? mapCashboxRole(updated) : null;
}

export async function deactivateCashboxRole(id: string) {
  const [updated] = await db
    .update(cashbox_roleInSpecification)
    .set({ role_name: null })
    .where(eq(cashbox_roleInSpecification.cashbox_role_id, id))
    .returning();

  return updated ? true : false;
}
