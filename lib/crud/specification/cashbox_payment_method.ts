import { and, eq, type SQL, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { cashbox_payment_methodInSpecification } from '@/lib/schema/schema';
import type {
  CashboxPaymentMethodCreate,
  CashboxPaymentMethodResponse,
  CashboxPaymentMethodUpdate,
} from '@/types/db/specification/cashboxPaymentMethod';

export type CashboxPaymentMethodFilters = {
  paymentMethodName?: string;
  isActive?: string;
};

export const mapCashboxPaymentMethod = (
  method: Record<string, unknown>,
): CashboxPaymentMethodResponse => ({
  cashboxPaymentMethodId: method.cashbox_payment_method_id as string,
  paymentMethodName: method.payment_method_name as string,
  isActive: method.is_active as boolean,
  tranId: method.tran_id as number,
  tranDate: method.tran_date as string,
  tranPeriod: method.tran_period as string | null,
  userId: method.user_id as string | null,
});

export async function listCashboxPaymentMethods(
  filters: CashboxPaymentMethodFilters,
) {
  const conditions: SQL[] = [];

  if (filters.paymentMethodName) {
    conditions.push(
      sql`LOWER(${cashbox_payment_methodInSpecification.payment_method_name}) LIKE ${`%${filters.paymentMethodName.toLowerCase()}%`}`,
    );
  }

  if (filters.isActive) {
    conditions.push(
      sql`LOWER(${cashbox_payment_methodInSpecification.is_active}) = ${filters.isActive.toLowerCase()}`,
    );
  }

  const query = db
    .select()
    .from(cashbox_payment_methodInSpecification)
    .orderBy(cashbox_payment_methodInSpecification.payment_method_name);

  const methods = conditions.length
    ? await query.where(and(...conditions))
    : await query;
  return methods.map(mapCashboxPaymentMethod);
}

export async function createCashboxPaymentMethod(
  payload: CashboxPaymentMethodCreate,
) {
  const [created] = await db
    .insert(cashbox_payment_methodInSpecification)
    .values({
      payment_method_name: payload.paymentMethodName,
      is_active: payload.isActive ?? true,
      ...(payload.userId !== undefined ? { user_id: payload.userId } : {}),
    })
    .returning();

  return mapCashboxPaymentMethod(created);
}

export async function getCashboxPaymentMethodById(id: string) {
  const [method] = await db
    .select()
    .from(cashbox_payment_methodInSpecification)
    .where(
      eq(cashbox_payment_methodInSpecification.cashbox_payment_method_id, id),
    );

  return method ? mapCashboxPaymentMethod(method) : null;
}

export async function updateCashboxPaymentMethod(
  id: string,
  payload: CashboxPaymentMethodUpdate,
) {
  const updates: Record<string, unknown> = {};

  if (payload.paymentMethodName !== undefined) {
    updates.payment_method_name = payload.paymentMethodName;
  }

  if (payload.isActive !== undefined) {
    updates.is_active = payload.isActive;
  }

  if (Object.keys(updates).length) {
    updates.tran_date = new Date().toISOString();
  }

  if (!Object.keys(updates).length) {
    return null;
  }

  const [updated] = await db
    .update(cashbox_payment_methodInSpecification)
    .set(updates)
    .where(
      eq(cashbox_payment_methodInSpecification.cashbox_payment_method_id, id),
    )
    .returning();

  return updated ? mapCashboxPaymentMethod(updated) : null;
}

export async function deactivateCashboxPaymentMethod(id: string) {
  const [updated] = await db
    .update(cashbox_payment_methodInSpecification)
    .set({ is_active: false })
    .where(
      eq(cashbox_payment_methodInSpecification.cashbox_payment_method_id, id),
    )
    .returning();

  return !!updated;
}
