import { and, type SQL, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { cashbox_user_terminalInSpecification } from '@/lib/schema/schema';
import { formatTranPeriod } from '@/lib/date_utils';
import type {
  CashboxUserTerminalCreate,
  CashboxUserTerminalResponse,
  CashboxUserTerminalQuery,
  CashboxUserTerminalUpdate,
} from '@/types/db/specification/cashboxUserTerminal';

export const mapCashboxUserTerminal = (
  row: Record<string, unknown>,
): CashboxUserTerminalResponse => ({
  cashboxUserTerminalId: row.cashbox_user_terminal_id as string,
  cashboxUserId: row.cashbox_user_id as string,
  cashboxTerminalId: row.cashbox_terminal_id as string,
  isActive: row.is_active as boolean,
  tranId: row.tran_id as number,
  tranDate: row.tran_date as string,
  tranPeriod: row.tran_period as string | null,
  userId: row.user_id as string | null,
});

export async function listCashboxUserTerminals(
  filters: CashboxUserTerminalQuery,
) {
  const conditions: SQL[] = [];

  if (filters.cashboxUserId) {
    conditions.push(
      eq(
        cashbox_user_terminalInSpecification.cashbox_user_id,
        filters.cashboxUserId,
      ),
    );
  }

  if (filters.cashboxTerminalId) {
    conditions.push(
      eq(
        cashbox_user_terminalInSpecification.cashbox_terminal_id,
        filters.cashboxTerminalId,
      ),
    );
  }

  if (filters.isActive) {
    const isActive = filters.isActive.toLowerCase();
    if (isActive === 'true' || isActive === 'false') {
      conditions.push(
        eq(cashbox_user_terminalInSpecification.is_active, isActive === 'true'),
      );
    }
  }

  const query = db.select().from(cashbox_user_terminalInSpecification);
  const rows = conditions.length
    ? await query.where(and(...conditions))
    : await query;

  return rows.map(mapCashboxUserTerminal);
}

export async function createCashboxUserTerminal(
  payload: CashboxUserTerminalCreate,
) {
  const [created] = await db
    .insert(cashbox_user_terminalInSpecification)
    .values({
      cashbox_user_id: payload.cashboxUserId,
      cashbox_terminal_id: payload.cashboxTerminalId,
      is_active: payload.isActive ?? true,
      ...(payload.userId !== undefined ? { user_id: payload.userId } : {}),
    })
    .returning();

  return mapCashboxUserTerminal(created);
}

export async function getCashboxUserTerminalById(id: string) {
  const [row] = await db
    .select()
    .from(cashbox_user_terminalInSpecification)
    .where(
      eq(cashbox_user_terminalInSpecification.cashbox_user_terminal_id, id),
    );

  return row ? mapCashboxUserTerminal(row) : null;
}

export async function updateCashboxUserTerminal(
  id: string,
  payload: CashboxUserTerminalUpdate,
) {
  const updates: Record<string, unknown> = {};

  if (payload.cashboxUserId !== undefined)
    updates.cashbox_user_id = payload.cashboxUserId;
  if (payload.cashboxTerminalId !== undefined)
    updates.cashbox_terminal_id = payload.cashboxTerminalId;
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
    .update(cashbox_user_terminalInSpecification)
    .set(updates)
    .where(
      eq(cashbox_user_terminalInSpecification.cashbox_user_terminal_id, id),
    )
    .returning();

  return updated ? mapCashboxUserTerminal(updated) : null;
}

export async function deactivateCashboxUserTerminal(id: string) {
  const [updated] = await db
    .update(cashbox_user_terminalInSpecification)
    .set({ is_active: false })
    .where(
      eq(cashbox_user_terminalInSpecification.cashbox_user_terminal_id, id),
    )
    .returning();

  return updated ? true : false;
}
