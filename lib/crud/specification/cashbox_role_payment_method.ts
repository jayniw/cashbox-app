import { sql, and, type SQL, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { cashbox_role_payment_methodInSpecification } from '@/lib/schema/schema';
import type {
  CashboxRolePaymentMethodCreate,
  CashboxRolePaymentMethodResponse,
  CashboxRolePaymentMethodQuery,
  CashboxRolePaymentMethodUpdate,
} from '@/types/db/specification/cashboxRolePaymentMethod';

export const mapCashboxRolePaymentMethod = (
  row: Record<string, unknown>,
): CashboxRolePaymentMethodResponse => ({
  cashboxRolePaymentMethodId: row.cashbox_role_payment_method_id as string,
  cashboxRoleId: row.cashbox_role_id as string,
  cashboxPaymentMethodId: row.cashbox_payment_method_id as string,
  isActive: row.is_active as boolean,
  tranId: row.tran_id as number,
  tranDate: row.tran_date as string,
  tranPeriod: row.tran_period as string | null,
  userId: row.user_id as string | null,
});

export async function listCashboxRolePaymentMethods(
  filters: CashboxRolePaymentMethodQuery,
) {
  const conditions: SQL[] = [];

  if (filters.cashboxRoleId) {
    conditions.push(
      eq(
        cashbox_role_payment_methodInSpecification.cashbox_role_id,
        filters.cashboxRoleId,
      ),
    );
  }
  if (filters.cashboxPaymentMethodId) {
    conditions.push(
      eq(
        cashbox_role_payment_methodInSpecification.cashbox_payment_method_id,
        filters.cashboxPaymentMethodId,
      ),
    );
  }
  if (filters.isActive) {
    const isActive = filters.isActive.toLowerCase();
    if (isActive === 'true' || isActive === 'false') {
      conditions.push(
        eq(
          cashbox_role_payment_methodInSpecification.is_active,
          isActive === 'true',
        ),
      );
    }
  }

  const query = db.select().from(cashbox_role_payment_methodInSpecification);
  const rows = conditions.length
    ? await query.where(and(...conditions))
    : await query;

  return rows.map(mapCashboxRolePaymentMethod);
}

export async function createCashboxRolePaymentMethod(
  payload: CashboxRolePaymentMethodCreate,
) {
  const [created] = await db
    .insert(cashbox_role_payment_methodInSpecification)
    .values({
      cashbox_role_id: payload.cashboxRoleId,
      cashbox_payment_method_id: payload.cashboxPaymentMethodId,
      is_active: payload.isActive ?? true,
      ...(payload.userId !== undefined ? { user_id: payload.userId } : {}),
    })
    .returning();

  return mapCashboxRolePaymentMethod(created);
}

export async function getCashboxRolePaymentMethodById(id: string) {
  const [row] = await db
    .select()
    .from(cashbox_role_payment_methodInSpecification)
    .where(
      eq(
        cashbox_role_payment_methodInSpecification.cashbox_role_payment_method_id,
        id,
      ),
    );

  return row ? mapCashboxRolePaymentMethod(row) : null;
}

export async function updateCashboxRolePaymentMethod(
  id: string,
  payload: CashboxRolePaymentMethodUpdate,
) {
  const updates: Record<string, unknown> = {};

  if (payload.cashboxRoleId !== undefined)
    updates.cashbox_role_id = payload.cashboxRoleId;
  if (payload.cashboxPaymentMethodId !== undefined)
    updates.cashbox_payment_method_id = payload.cashboxPaymentMethodId;
  if (payload.isActive !== undefined) updates.is_active = payload.isActive;

  if (Object.keys(updates).length) {
    updates.tran_date = new Date().toISOString();
  }

  if (!Object.keys(updates).length) {
    return null;
  }

  const [updated] = await db
    .update(cashbox_role_payment_methodInSpecification)
    .set(updates)
    .where(
      eq(
        cashbox_role_payment_methodInSpecification.cashbox_role_payment_method_id,
        id,
      ),
    )
    .returning();

  return updated ? mapCashboxRolePaymentMethod(updated) : null;
}

export async function deactivateCashboxRolePaymentMethod(id: string) {
  const [updated] = await db
    .update(cashbox_role_payment_methodInSpecification)
    .set({ is_active: false })
    .where(
      eq(
        cashbox_role_payment_methodInSpecification.cashbox_role_payment_method_id,
        id,
      ),
    )
    .returning();

  return updated ? true : false;
}
