import { sql, and, type SQL, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { cashbox_payment_method_providerInSpecification } from '@/lib/schema/schema';
import type {
  CashboxPaymentMethodProviderCreate,
  CashboxPaymentMethodProviderQuery,
  CashboxPaymentMethodProviderResponse,
  CashboxPaymentMethodProviderUpdate,
} from '@/types/db/specification/cashboxPaymentMethodProvider';
import { formatTranPeriod } from '@/lib/date_utils';

export const mapCashboxPaymentMethodProvider = (
  row: Record<string, unknown>,
): CashboxPaymentMethodProviderResponse => ({
  cashboxPaymentMethodProviderId:
    row.cashbox_payment_method_provider_id as string,
  paymentMethodId: row.cashbox_payment_method_id as string,
  paymentGatewayId: row.cashbox_payment_gateway_id as string,
  providerName: row.provider_name as string,
  providerDescription: row.provider_description as string | null,
  tranId: row.tran_id as number | null,
  tranDate: row.tran_date as string,
  tranPeriod: row.tran_period as string | null,
  userId: row.user_id as string | null,
});

export async function listCashboxPaymentMethodProviders(
  filters: CashboxPaymentMethodProviderQuery,
) {
  const conditions: SQL[] = [];

  if (filters.paymentGatewayId) {
    conditions.push(
      eq(
        cashbox_payment_method_providerInSpecification.cashbox_payment_gateway_id,
        filters.paymentGatewayId,
      ),
    );
  }

  if (filters.paymentMethodId) {
    conditions.push(
      eq(
        cashbox_payment_method_providerInSpecification.cashbox_payment_method_id,
        filters.paymentMethodId,
      ),
    );
  }

  if (filters.providerName) {
    conditions.push(
      sql`LOWER(${cashbox_payment_method_providerInSpecification.provider_name}) LIKE ${`%${filters.providerName.toLowerCase()}%`}`,
    );
  }

  const query = db
    .select()
    .from(cashbox_payment_method_providerInSpecification)
    .orderBy(cashbox_payment_method_providerInSpecification.provider_name);

  const rows = conditions.length
    ? await query.where(and(...conditions))
    : await query;

  return rows.map(mapCashboxPaymentMethodProvider);
}

export async function createCashboxPaymentMethodProvider(
  payload: CashboxPaymentMethodProviderCreate,
) {
  const [created] = await db
    .insert(cashbox_payment_method_providerInSpecification)
    .values({
      cashbox_payment_method_id: payload.paymentMethodId,
      cashbox_payment_gateway_id: payload.paymentGatewayId,
      provider_name: payload.providerName,
      provider_description: payload.providerDescription,
      ...(payload.tranId !== undefined ? { tran_id: payload.tranId } : {}),
      ...(payload.tranPeriod !== undefined
        ? { tran_period: payload.tranPeriod }
        : {}),
      ...(payload.userId !== undefined ? { user_id: payload.userId } : {}),
    })
    .returning();

  return mapCashboxPaymentMethodProvider(created);
}

export async function getCashboxPaymentMethodProviderById(id: string) {
  const [row] = await db
    .select()
    .from(cashbox_payment_method_providerInSpecification)
    .where(
      eq(
        cashbox_payment_method_providerInSpecification.cashbox_payment_method_provider_id,
        id,
      ),
    );

  return row ? mapCashboxPaymentMethodProvider(row) : null;
}

export async function updateCashboxPaymentMethodProvider(
  id: string,
  payload: CashboxPaymentMethodProviderUpdate,
) {
  const updates: Record<string, unknown> = {};

  if (payload.paymentMethodId !== undefined) {
    updates.cashbox_payment_method_id = payload.paymentMethodId;
  }

  if (payload.paymentGatewayId !== undefined) {
    updates.cashbox_payment_gateway_id = payload.paymentGatewayId;
  }

  if (payload.providerName !== undefined) {
    updates.provider_name = payload.providerName;
  }

  if (payload.providerDescription !== undefined) {
    updates.provider_description = payload.providerDescription;
  }

  if (payload.tranId !== undefined) {
    updates.tran_id = payload.tranId;
  }

  if (payload.tranPeriod !== undefined) {
    updates.tran_period = payload.tranPeriod;
  }

  if (payload.userId !== undefined) {
    updates.user_id = payload.userId;
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
    .update(cashbox_payment_method_providerInSpecification)
    .set(updates)
    .where(
      eq(
        cashbox_payment_method_providerInSpecification.cashbox_payment_method_provider_id,
        id,
      ),
    )
    .returning();

  return updated ? mapCashboxPaymentMethodProvider(updated) : null;
}
