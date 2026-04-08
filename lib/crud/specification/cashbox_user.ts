import { sql, and, type SQL, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { cashbox_userInSpecification } from '@/lib/schema/schema';
import type {
  CashboxUserCreate,
  CashboxUserResponse,
  CashboxUserUpdate,
} from '@/types/db/specification/cashboxUser';

export type CashboxUserFilters = {
  userName?: string;
  authenticationType?: string;
  userStatus?: string;
};

export const mapCashboxUser = (
  user: Record<string, unknown>,
): CashboxUserResponse => ({
  cashboxUserId: user.cashbox_user_id as string,
  userName: user.user_name as string,
  authenticationType: user.authentication_type as string,
  userStatus: user.user_status as string,
  userEmail: user.user_email as string | null,
  userPhone: user.user_phone as string | null,
  tranId: user.tran_id as number | null,
  tranDate: user.tran_date as string,
  tranPeriod: user.tran_period as string | null,
  userId: user.user_id as string | null,
});

export async function listCashboxUsers(filters: CashboxUserFilters) {
  const conditions: SQL[] = [];

  if (filters.userName) {
    conditions.push(
      sql`LOWER(${cashbox_userInSpecification.user_name}) LIKE ${`%${filters.userName.toLowerCase()}%`}`,
    );
  }

  if (filters.authenticationType) {
    conditions.push(
      sql`LOWER(${cashbox_userInSpecification.authentication_type}) = ${filters.authenticationType.toLowerCase()}`,
    );
  }

  if (filters.userStatus) {
    conditions.push(
      sql`LOWER(${cashbox_userInSpecification.user_status}) = ${filters.userStatus.toLowerCase()}`,
    );
  }

  const query = db
    .select()
    .from(cashbox_userInSpecification)
    .orderBy(cashbox_userInSpecification.user_name);

  const users = conditions.length
    ? await query.where(and(...conditions))
    : await query;

  return users.map(mapCashboxUser);
}

export async function createCashboxUser(payload: CashboxUserCreate) {
  const userData = {
    user_name: payload.userName,
    authentication_type: payload.authenticationType ?? 'email',
    user_status: payload.userStatus ?? 'Active',
    user_email: payload.userEmail ?? null,
    user_phone: payload.userPhone ?? null,
    user_id: payload.userId ?? null,
  };

  const [created] = await db
    .insert(cashbox_userInSpecification)
    .values(userData)
    .returning();

  return mapCashboxUser(created);
}

export async function getCashboxUserById(id: string) {
  const [user] = await db
    .select()
    .from(cashbox_userInSpecification)
    .where(eq(cashbox_userInSpecification.cashbox_user_id, id));

  return user ? mapCashboxUser(user) : null;
}

export async function updateCashboxUser(
  id: string,
  payload: CashboxUserUpdate,
) {
  const updates: Record<string, unknown> = {};

  if (payload.userName !== undefined) updates.user_name = payload.userName;
  if (payload.authenticationType !== undefined)
    updates.authentication_type = payload.authenticationType;
  if (payload.userStatus !== undefined)
    updates.user_status = payload.userStatus;
  if (payload.userEmail !== undefined)
    updates.user_email = payload.userEmail ?? null;
  if (payload.userPhone !== undefined)
    updates.user_phone = payload.userPhone ?? null;
  if (payload.userId !== undefined) updates.user_id = payload.userId;

  if (!Object.keys(updates).length) {
    return null;
  }

  const [updated] = await db
    .update(cashbox_userInSpecification)
    .set(updates)
    .where(eq(cashbox_userInSpecification.cashbox_user_id, id))
    .returning();

  return updated ? mapCashboxUser(updated) : null;
}

export async function deactivateCashboxUser(id: string) {
  const [updated] = await db
    .update(cashbox_userInSpecification)
    .set({ user_status: 'Inactive' })
    .where(eq(cashbox_userInSpecification.cashbox_user_id, id))
    .returning();

  return updated ? true : false;
}
