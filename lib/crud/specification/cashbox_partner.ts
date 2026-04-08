import { sql, and, type SQL, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { cashbox_partnerInSpecification } from '@/lib/schema/schema';
import type {
  CashboxPartnerCreate,
  CashboxPartnerResponse,
  CashboxPartnerUpdate,
} from '@/types/db/specification/cashboxPartner';

export type CashboxPartnerFilters = {
  partnerName?: string;
  partnerStatus?: string;
};

export const mapCashboxPartner = (
  partner: Record<string, unknown>,
): CashboxPartnerResponse => ({
  cashboxPartnerId: partner.cashbox_partner_id as string,
  partnerName: partner.partner_name as string | null,
  partnerStatus: partner.partner_status as string,
  logo: partner.logo as string | null,
  url: partner.url as string | null,
  tranId: partner.tran_id as number | null,
  tranDate: partner.tran_date as string,
  tranPeriod: partner.tran_period as string | null,
  userId: partner.user_id as string | null,
});

export async function listCashboxPartners(filters: CashboxPartnerFilters) {
  const conditions: SQL[] = [];

  if (filters.partnerName) {
    conditions.push(
      sql`LOWER(${cashbox_partnerInSpecification.partner_name}) LIKE ${`%${filters.partnerName.toLowerCase()}%`}`,
    );
  }

  if (filters.partnerStatus) {
    conditions.push(
      sql`LOWER(${cashbox_partnerInSpecification.partner_status}) = ${filters.partnerStatus.toLowerCase()}`,
    );
  }

  const query = db
    .select()
    .from(cashbox_partnerInSpecification)
    .orderBy(cashbox_partnerInSpecification.partner_name);

  const partners = conditions.length
    ? await query.where(and(...conditions))
    : await query;

  return partners.map(mapCashboxPartner);
}

export async function createCashboxPartner(payload: CashboxPartnerCreate) {
  const partnerData = {
    partner_name: payload.partnerName ?? null,
    partner_status: payload.partnerStatus ?? 'Active',
    logo: payload.logo ?? null,
    url: payload.url ?? null,
    tran_id: payload.tranId ?? null,
    tran_period: payload.tranPeriod ?? null,
    user_id: payload.userId ?? null,
  };

  const [created] = await db
    .insert(cashbox_partnerInSpecification)
    .values(partnerData)
    .returning();

  return mapCashboxPartner(created);
}

export async function getCashboxPartnerById(id: string) {
  const [partner] = await db
    .select()
    .from(cashbox_partnerInSpecification)
    .where(eq(cashbox_partnerInSpecification.cashbox_partner_id, id));

  return partner ? mapCashboxPartner(partner) : null;
}

export async function updateCashboxPartner(
  id: string,
  payload: CashboxPartnerUpdate,
) {
  const updates: Record<string, unknown> = {};

  if (payload.partnerName !== undefined)
    updates.partner_name = payload.partnerName;
  if (payload.partnerStatus !== undefined)
    updates.partner_status = payload.partnerStatus;
  if (payload.logo !== undefined) updates.logo = payload.logo;
  if (payload.url !== undefined) updates.url = payload.url;
  if (payload.tranId !== undefined) updates.tran_id = payload.tranId ?? null;
  if (payload.tranPeriod !== undefined)
    updates.tran_period = payload.tranPeriod;
  if (payload.userId !== undefined) updates.user_id = payload.userId;

  if (!Object.keys(updates).length) {
    return null;
  }

  const [updated] = await db
    .update(cashbox_partnerInSpecification)
    .set(updates)
    .where(eq(cashbox_partnerInSpecification.cashbox_partner_id, id))
    .returning();

  return updated ? mapCashboxPartner(updated) : null;
}

export async function deactivateCashboxPartner(id: string) {
  const [updated] = await db
    .update(cashbox_partnerInSpecification)
    .set({ partner_status: 'Inactive' })
    .where(eq(cashbox_partnerInSpecification.cashbox_partner_id, id))
    .returning();

  return updated ? true : false;
}
