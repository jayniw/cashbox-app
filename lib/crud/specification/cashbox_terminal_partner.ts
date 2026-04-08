import { and, eq, type SQL } from 'drizzle-orm';
import { db } from '@/lib/db';
import { cashbox_terminal_partnerInSpecification } from '@/lib/schema/schema';
import type {
  CashboxTerminalPartnerCreate,
  CashboxTerminalPartnerResponse,
  CashboxTerminalPartnerUpdate,
} from '@/types/db/specification/cashboxTerminalPartner';

export type CashboxTerminalPartnerFilters = {
  cashboxTerminalId?: string;
  cashboxPartnerId?: string;
  isActive?: string;
};

export const mapCashboxTerminalPartner = (
  row: Record<string, unknown>,
): CashboxTerminalPartnerResponse => ({
  cashboxTerminalPartnerId: row.cashbox_terminal_partner_id as string,
  cashboxTerminalId: row.cashbox_terminal_id as string,
  cashboxPartnerId: row.cashbox_partner_id as string,
  isActive: row.is_active as boolean,
  tranId: row.tran_id as number,
  tranDate: row.tran_date as string,
  tranPeriod: row.tran_period as string | null,
  userId: row.user_id as string | null,
});

export async function listCashboxTerminalPartners(
  filters: CashboxTerminalPartnerFilters,
) {
  const conditions: SQL[] = [];

  if (filters.cashboxTerminalId) {
    conditions.push(
      eq(
        cashbox_terminal_partnerInSpecification.cashbox_terminal_id,
        filters.cashboxTerminalId,
      ),
    );
  }

  if (filters.cashboxPartnerId) {
    conditions.push(
      eq(
        cashbox_terminal_partnerInSpecification.cashbox_partner_id,
        filters.cashboxPartnerId,
      ),
    );
  }

  if (filters.isActive) {
    conditions.push(
      eq(
        cashbox_terminal_partnerInSpecification.is_active,
        filters.isActive.toLowerCase() === 'true',
      ),
    );
  }

  const query = db
    .select()
    .from(cashbox_terminal_partnerInSpecification)
    .orderBy(
      cashbox_terminal_partnerInSpecification.cashbox_terminal_partner_id,
    );

  const rows = conditions.length
    ? await query.where(and(...conditions))
    : await query;

  return rows.map(mapCashboxTerminalPartner);
}

export async function createCashboxTerminalPartner(
  payload: CashboxTerminalPartnerCreate,
) {
  const [created] = await db
    .insert(cashbox_terminal_partnerInSpecification)
    .values({
      cashbox_terminal_id: payload.cashboxTerminalId,
      cashbox_partner_id: payload.cashboxPartnerId,
      is_active: payload.isActive ?? true,
      user_id: payload.userId ?? null,
    })
    .returning();

  return mapCashboxTerminalPartner(created);
}

export async function getCashboxTerminalPartnerById(id: string) {
  const [row] = await db
    .select()
    .from(cashbox_terminal_partnerInSpecification)
    .where(
      eq(
        cashbox_terminal_partnerInSpecification.cashbox_terminal_partner_id,
        id,
      ),
    );

  return row ? mapCashboxTerminalPartner(row) : null;
}

export async function updateCashboxTerminalPartner(
  id: string,
  payload: CashboxTerminalPartnerUpdate,
) {
  const updates: Record<string, unknown> = {};

  if (payload.cashboxTerminalId !== undefined) {
    updates.cashbox_terminal_id = payload.cashboxTerminalId;
  }

  if (payload.cashboxPartnerId !== undefined) {
    updates.cashbox_partner_id = payload.cashboxPartnerId;
  }

  if (payload.isActive !== undefined) {
    updates.is_active = payload.isActive;
  }

  if (payload.userId !== undefined) {
    updates.user_id = payload.userId;
  }

  if (!Object.keys(updates).length) {
    return null;
  }

  const [updated] = await db
    .update(cashbox_terminal_partnerInSpecification)
    .set(updates)
    .where(
      eq(
        cashbox_terminal_partnerInSpecification.cashbox_terminal_partner_id,
        id,
      ),
    )
    .returning();

  return updated ? mapCashboxTerminalPartner(updated) : null;
}

export async function deactivateCashboxTerminalPartner(id: string) {
  const [updated] = await db
    .update(cashbox_terminal_partnerInSpecification)
    .set({ is_active: false })
    .where(
      eq(
        cashbox_terminal_partnerInSpecification.cashbox_terminal_partner_id,
        id,
      ),
    )
    .returning();

  return !!updated;
}
