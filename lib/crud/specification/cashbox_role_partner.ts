import { sql, and, type SQL, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { cashbox_role_partnerInSpecification } from '@/lib/schema/schema';
import type {
  CashboxRolePartnerCreate,
  CashboxRolePartnerResponse,
  CashboxRolePartnerQuery,
  CashboxRolePartnerUpdate,
} from '@/types/db/specification/cashboxRolePartner';
import { formatTranPeriod } from '@/lib/date_utils';

export const mapCashboxRolePartner = (
  row: Record<string, unknown>,
): CashboxRolePartnerResponse => ({
  cashboxRolePartnerId: row.cashbox_role_partner_id as string,
  cashboxRoleId: row.cashbox_role_id as string,
  cashboxPartnerId: row.cashbox_partner_id as string,
  isActive: row.is_active as boolean,
  tranId: row.tran_id as number,
  tranDate: row.tran_date as string,
  tranPeriod: row.tran_period as string | null,
  userId: row.user_id as string | null,
});

export async function listCashboxRolePartners(
  filters: CashboxRolePartnerQuery,
) {
  const conditions: SQL[] = [];

  if (filters.cashboxRoleId) {
    conditions.push(
      eq(
        cashbox_role_partnerInSpecification.cashbox_role_id,
        filters.cashboxRoleId,
      ),
    );
  }
  if (filters.cashboxPartnerId) {
    conditions.push(
      eq(
        cashbox_role_partnerInSpecification.cashbox_partner_id,
        filters.cashboxPartnerId,
      ),
    );
  }
  if (filters.isActive) {
    const isActive = filters.isActive.toLowerCase();
    if (isActive === 'true' || isActive === 'false') {
      conditions.push(
        eq(cashbox_role_partnerInSpecification.is_active, isActive === 'true'),
      );
    }
  }

  const query = db.select().from(cashbox_role_partnerInSpecification);
  const rows = conditions.length
    ? await query.where(and(...conditions))
    : await query;

  return rows.map(mapCashboxRolePartner);
}

export async function createCashboxRolePartner(
  payload: CashboxRolePartnerCreate,
) {
  const [created] = await db
    .insert(cashbox_role_partnerInSpecification)
    .values({
      cashbox_role_id: payload.cashboxRoleId,
      cashbox_partner_id: payload.cashboxPartnerId,
      is_active: payload.isActive ?? true,
      ...(payload.userId !== undefined ? { user_id: payload.userId } : {}),
    })
    .returning();

  return mapCashboxRolePartner(created);
}

export async function getCashboxRolePartnerById(id: string) {
  const [row] = await db
    .select()
    .from(cashbox_role_partnerInSpecification)
    .where(eq(cashbox_role_partnerInSpecification.cashbox_role_partner_id, id));

  return row ? mapCashboxRolePartner(row) : null;
}

export async function updateCashboxRolePartner(
  id: string,
  payload: CashboxRolePartnerUpdate,
) {
  const updates: Record<string, unknown> = {};

  if (payload.cashboxRoleId !== undefined)
    updates.cashbox_role_id = payload.cashboxRoleId;
  if (payload.cashboxPartnerId !== undefined)
    updates.cashbox_partner_id = payload.cashboxPartnerId;
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
    .update(cashbox_role_partnerInSpecification)
    .set(updates)
    .where(eq(cashbox_role_partnerInSpecification.cashbox_role_partner_id, id))
    .returning();

  return updated ? mapCashboxRolePartner(updated) : null;
}

export async function deactivateCashboxRolePartner(id: string) {
  const updates: Record<string, unknown> = {};
  updates.is_active = false;
  const now = new Date();
  updates.tran_date = now.toISOString();
  updates.tran_period = formatTranPeriod(now);
  const [updated] = await db
    .update(cashbox_role_partnerInSpecification)
    .set(updates)
    .where(eq(cashbox_role_partnerInSpecification.cashbox_role_partner_id, id))
    .returning();

  return updated ? true : false;
}
