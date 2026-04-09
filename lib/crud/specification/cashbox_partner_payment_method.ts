import { and, type SQL, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { cashbox_partner_payment_methodInSpecification } from '@/lib/schema/schema';
import { formatTranPeriod } from '@/lib/date_utils';
import type {
  CashboxPartnerPaymentMethodCreate,
  CashboxPartnerPaymentMethodResponse,
  CashboxPartnerPaymentMethodQuery,
  CashboxPartnerPaymentMethodUpdate,
} from '@/types/db/specification/cashboxPartnerPaymentMethod';

export const mapCashboxPartnerPaymentMethod = (
  row: Record<string, unknown>,
): CashboxPartnerPaymentMethodResponse => ({
  cashboxPartnerPaymentMethodId:
    row.cashbox_partner_payment_method_id as string,
  cashboxPartnerId: row.cashbox_partner_id as string,
  cashboxPaymentMethodId: row.cashbox_payment_method_id as string,
  isActive: row.is_active as boolean,
  tranId: row.tran_id as number,
  tranDate: row.tran_date as string,
  tranPeriod: row.tran_period as string | null,
  userId: row.user_id as string | null,
});

export async function listCashboxPartnerPaymentMethods(
  filters: CashboxPartnerPaymentMethodQuery,
) {
  const conditions: SQL[] = [];

  if (filters.cashboxPartnerId) {
    conditions.push(
      eq(
        cashbox_partner_payment_methodInSpecification.cashbox_partner_id,
        filters.cashboxPartnerId,
      ),
    );
  }

  if (filters.cashboxPaymentMethodId) {
    conditions.push(
      eq(
        cashbox_partner_payment_methodInSpecification.cashbox_payment_method_id,
        filters.cashboxPaymentMethodId,
      ),
    );
  }

  if (filters.isActive) {
    const isActive = filters.isActive.toLowerCase();
    if (isActive === 'true' || isActive === 'false') {
      conditions.push(
        eq(
          cashbox_partner_payment_methodInSpecification.is_active,
          isActive === 'true',
        ),
      );
    }
  }

  const query = db.select().from(cashbox_partner_payment_methodInSpecification);
  const rows = conditions.length
    ? await query.where(and(...conditions))
    : await query;

  return rows.map(mapCashboxPartnerPaymentMethod);
}

export async function createCashboxPartnerPaymentMethod(
  payload: CashboxPartnerPaymentMethodCreate,
) {
  const [created] = await db
    .insert(cashbox_partner_payment_methodInSpecification)
    .values({
      cashbox_partner_id: payload.cashboxPartnerId,
      cashbox_payment_method_id: payload.cashboxPaymentMethodId,
      is_active: payload.isActive ?? true,
      ...(payload.userId !== undefined ? { user_id: payload.userId } : {}),
    })
    .returning();

  return mapCashboxPartnerPaymentMethod(created);
}

export async function getCashboxPartnerPaymentMethodById(id: string) {
  const [row] = await db
    .select()
    .from(cashbox_partner_payment_methodInSpecification)
    .where(
      eq(
        cashbox_partner_payment_methodInSpecification.cashbox_partner_payment_method_id,
        id,
      ),
    );

  return row ? mapCashboxPartnerPaymentMethod(row) : null;
}

export async function updateCashboxPartnerPaymentMethod(
  id: string,
  payload: CashboxPartnerPaymentMethodUpdate,
) {
  const updates: Record<string, unknown> = {};

  if (payload.cashboxPartnerId !== undefined)
    updates.cashbox_partner_id = payload.cashboxPartnerId;
  if (payload.cashboxPaymentMethodId !== undefined)
    updates.cashbox_payment_method_id = payload.cashboxPaymentMethodId;
  if (payload.isActive !== undefined) updates.is_active = payload.isActive;

  if (Object.keys(updates).length) {
    const now = new Date();
    updates.tran_date = now.toISOString();
    updates.tran_period = formatTranPeriod(now);
  }

  if (!Object.keys(updates).length) {
    return null;
  }

  const [updated] = await db
    .update(cashbox_partner_payment_methodInSpecification)
    .set(updates)
    .where(
      eq(
        cashbox_partner_payment_methodInSpecification.cashbox_partner_payment_method_id,
        id,
      ),
    )
    .returning();

  return updated ? mapCashboxPartnerPaymentMethod(updated) : null;
}

export async function deactivateCashboxPartnerPaymentMethod(id: string) {
  const updates: Record<string, unknown> = {};
  updates.is_active = false;
  const now = new Date();
  updates.tran_date = now.toISOString();
  updates.tran_period = formatTranPeriod(now);
  const [updated] = await db
    .update(cashbox_partner_payment_methodInSpecification)
    .set(updates)
    .where(
      eq(
        cashbox_partner_payment_methodInSpecification.cashbox_partner_payment_method_id,
        id,
      ),
    )
    .returning();

  return updated ? true : false;
}
