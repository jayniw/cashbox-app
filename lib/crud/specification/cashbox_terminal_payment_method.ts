import { and, eq, type SQL } from 'drizzle-orm';
import { db } from '@/lib/db';
import { cashbox_terminal_payment_methodInSpecification } from '@/lib/schema/schema';
import type {
  CashboxTerminalPaymentMethodCreate,
  CashboxTerminalPaymentMethodResponse,
  CashboxTerminalPaymentMethodUpdate,
} from '@/types/db/specification/cashboxTerminalPaymentMethod';
import { formatTranPeriod } from '@/lib/date_utils';

export type CashboxTerminalPaymentMethodFilters = {
  cashboxTerminalId?: string;
  cashboxPaymentMethodId?: string;
  isActive?: string;
};

export const mapCashboxTerminalPaymentMethod = (
  row: Record<string, unknown>,
): CashboxTerminalPaymentMethodResponse => ({
  cashboxTerminalPaymentMethodId:
    row.cashbox_terminal_payment_method_id as string,
  cashboxTerminalId: row.cashbox_terminal_id as string,
  cashboxPaymentMethodId: row.cashbox_payment_method_id as string,
  isActive: row.is_active as boolean,
  tranId: row.tran_id as number,
  tranDate: row.tran_date as string,
  tranPeriod: row.tran_period as string | null,
  userId: row.user_id as string | null,
});

export async function listCashboxTerminalPaymentMethods(
  filters: CashboxTerminalPaymentMethodFilters,
) {
  const conditions: SQL[] = [];

  if (filters.cashboxTerminalId) {
    conditions.push(
      eq(
        cashbox_terminal_payment_methodInSpecification.cashbox_terminal_id,
        filters.cashboxTerminalId,
      ),
    );
  }

  if (filters.cashboxPaymentMethodId) {
    conditions.push(
      eq(
        cashbox_terminal_payment_methodInSpecification.cashbox_payment_method_id,
        filters.cashboxPaymentMethodId,
      ),
    );
  }

  if (filters.isActive) {
    conditions.push(
      eq(
        cashbox_terminal_payment_methodInSpecification.is_active,
        filters.isActive.toLowerCase() === 'true',
      ),
    );
  }

  const query = db
    .select()
    .from(cashbox_terminal_payment_methodInSpecification)
    .orderBy(
      cashbox_terminal_payment_methodInSpecification.cashbox_terminal_payment_method_id,
    );

  const rows = conditions.length
    ? await query.where(and(...conditions))
    : await query;

  return rows.map(mapCashboxTerminalPaymentMethod);
}

export async function createCashboxTerminalPaymentMethod(
  payload: CashboxTerminalPaymentMethodCreate,
) {
  const [created] = await db
    .insert(cashbox_terminal_payment_methodInSpecification)
    .values({
      cashbox_terminal_id: payload.cashboxTerminalId,
      cashbox_payment_method_id: payload.cashboxPaymentMethodId,
      is_active: payload.isActive ?? true,
      ...(payload.userId !== undefined ? { user_id: payload.userId } : {}),
    })
    .returning();

  return mapCashboxTerminalPaymentMethod(created);
}

export async function getCashboxTerminalPaymentMethodById(id: string) {
  const [row] = await db
    .select()
    .from(cashbox_terminal_payment_methodInSpecification)
    .where(
      eq(
        cashbox_terminal_payment_methodInSpecification.cashbox_terminal_payment_method_id,
        id,
      ),
    );

  return row ? mapCashboxTerminalPaymentMethod(row) : null;
}

export async function updateCashboxTerminalPaymentMethod(
  id: string,
  payload: CashboxTerminalPaymentMethodUpdate,
) {
  const updates: Record<string, unknown> = {};

  if (payload.cashboxTerminalId !== undefined) {
    updates.cashbox_terminal_id = payload.cashboxTerminalId;
  }

  if (payload.cashboxPaymentMethodId !== undefined) {
    updates.cashbox_payment_method_id = payload.cashboxPaymentMethodId;
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
    .update(cashbox_terminal_payment_methodInSpecification)
    .set(updates)
    .where(
      eq(
        cashbox_terminal_payment_methodInSpecification.cashbox_terminal_payment_method_id,
        id,
      ),
    )
    .returning();

  return updated ? mapCashboxTerminalPaymentMethod(updated) : null;
}

export async function deactivateCashboxTerminalPaymentMethod(id: string) {
  const [updated] = await db
    .update(cashbox_terminal_payment_methodInSpecification)
    .set({ is_active: false })
    .where(
      eq(
        cashbox_terminal_payment_methodInSpecification.cashbox_terminal_payment_method_id,
        id,
      ),
    )
    .returning();

  return !!updated;
}
