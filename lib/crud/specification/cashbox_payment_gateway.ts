import { sql, and, type SQL, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { cashbox_payment_gatewayInSpecification } from '@/lib/schema/schema';
import type {
  CashboxPaymentGatewayCreate,
  CashboxPaymentGatewayQuery,
  CashboxPaymentGatewayResponse,
  CashboxPaymentGatewayUpdate,
} from '@/types/db/specification/cashboxPaymentGateway';
import { formatTranPeriod } from '@/lib/date_utils';

export const mapCashboxPaymentGateway = (
  row: Record<string, unknown>,
): CashboxPaymentGatewayResponse => ({
  cashboxPaymentGatewayId: row.cashbox_payment_gateway_id as string,
  paymentGatewayName: row.payment_gateway_name as string,
  paymentGatewayDescription: row.payment_gateway_description as string | null,
  gatewayConfiguration: row.gateway_configuration as unknown,
  paymentGatewayType: row.payment_gateway_type as string,
  tranId: row.tran_id as number | null,
  tranDate: row.tran_date as string,
  tranPeriod: row.tran_period as string | null,
  userId: row.user_id as string | null,
});

export async function listCashboxPaymentGateways(
  filters: CashboxPaymentGatewayQuery,
) {
  const conditions: SQL[] = [];

  if (filters.paymentGatewayName) {
    conditions.push(
      sql`LOWER(${cashbox_payment_gatewayInSpecification.payment_gateway_name}) LIKE ${`%${filters.paymentGatewayName.toLowerCase()}%`}`,
    );
  }

  if (filters.paymentGatewayType) {
    conditions.push(
      eq(
        cashbox_payment_gatewayInSpecification.payment_gateway_type,
        filters.paymentGatewayType,
      ),
    );
  }

  const query = db
    .select()
    .from(cashbox_payment_gatewayInSpecification)
    .orderBy(cashbox_payment_gatewayInSpecification.payment_gateway_name);

  const rows = conditions.length
    ? await query.where(and(...conditions))
    : await query;

  return rows.map(mapCashboxPaymentGateway);
}

export async function createCashboxPaymentGateway(
  payload: CashboxPaymentGatewayCreate,
) {
  const [created] = await db
    .insert(cashbox_payment_gatewayInSpecification)
    .values({
      payment_gateway_name: payload.paymentGatewayName,
      payment_gateway_description: payload.paymentGatewayDescription,
      gateway_configuration: payload.gatewayConfiguration ?? null,
      payment_gateway_type: payload.paymentGatewayType,
      ...(payload.tranId !== undefined ? { tran_id: payload.tranId } : {}),
      ...(payload.tranPeriod !== undefined
        ? { tran_period: payload.tranPeriod }
        : {}),
      ...(payload.userId !== undefined ? { user_id: payload.userId } : {}),
    })
    .returning();

  return mapCashboxPaymentGateway(created);
}

export async function getCashboxPaymentGatewayById(id: string) {
  const [row] = await db
    .select()
    .from(cashbox_payment_gatewayInSpecification)
    .where(
      eq(cashbox_payment_gatewayInSpecification.cashbox_payment_gateway_id, id),
    );

  return row ? mapCashboxPaymentGateway(row) : null;
}

export async function updateCashboxPaymentGateway(
  id: string,
  payload: CashboxPaymentGatewayUpdate,
) {
  const updates: Record<string, unknown> = {};

  if (payload.paymentGatewayName !== undefined) {
    updates.payment_gateway_name = payload.paymentGatewayName;
  }

  if (payload.paymentGatewayDescription !== undefined) {
    updates.payment_gateway_description = payload.paymentGatewayDescription;
  }

  if (payload.gatewayConfiguration !== undefined) {
    updates.gateway_configuration = payload.gatewayConfiguration;
  }

  if (payload.paymentGatewayType !== undefined) {
    updates.payment_gateway_type = payload.paymentGatewayType;
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
    .update(cashbox_payment_gatewayInSpecification)
    .set(updates)
    .where(
      eq(cashbox_payment_gatewayInSpecification.cashbox_payment_gateway_id, id),
    )
    .returning();

  return updated ? mapCashboxPaymentGateway(updated) : null;
}
