import { sql, and, type SQL, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { cashbox_terminalInSpecification } from '@/lib/schema/schema';
import { formatTranPeriod } from '@/lib/date_utils';
import type {
  CashboxTerminalCreate,
  CashboxTerminalResponse,
  CashboxTerminalUpdate,
} from '@/types/db/specification/cashboxTerminal';

export type CashboxTerminalFilters = {
  terminalName?: string;
  ipAddress?: string;
  isActive?: string;
};

export const mapCashboxTerminal = (
  terminal: Record<string, unknown>,
): CashboxTerminalResponse => ({
  cashboxTerminalId: terminal.cashbox_terminal_id as string,
  terminalName: terminal.terminal_name as string | null,
  ipAddress: terminal.ip_address as string | null,
  geoPoint: terminal.geo_point as string | null,
  geoUrl: terminal.geo_url as string | null,
  isActive: terminal.is_active as boolean,
  tranId: terminal.tran_id as number | null,
  tranDate: terminal.tran_date as string,
  tranPeriod: terminal.tran_period as string | null,
  userId: terminal.user_id as string | null,
});

export async function listCashboxTerminals(filters: CashboxTerminalFilters) {
  const conditions: SQL[] = [];

  if (filters.terminalName) {
    conditions.push(
      sql`LOWER(${cashbox_terminalInSpecification.terminal_name}) LIKE ${`%${filters.terminalName.toLowerCase()}%`}`,
    );
  }

  if (filters.ipAddress) {
    conditions.push(
      sql`LOWER(${cashbox_terminalInSpecification.ip_address}) LIKE ${`%${filters.ipAddress.toLowerCase()}%`}`,
    );
  }

  if (filters.isActive) {
    conditions.push(
      sql`LOWER(${cashbox_terminalInSpecification.is_active}) = ${filters.isActive.toLowerCase()}`,
    );
  }

  const query = db
    .select()
    .from(cashbox_terminalInSpecification)
    .orderBy(cashbox_terminalInSpecification.terminal_name);

  const terminals = conditions.length
    ? await query.where(and(...conditions))
    : await query;
  return terminals.map(mapCashboxTerminal);
}

function parseGeoPoint(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  const matches = trimmed.match(
    /^\(?\s*([-+]?\d+(?:\.\d+)?)\s*,\s*([-+]?\d+(?:\.\d+)?)\s*\)?$/,
  );
  if (!matches) {
    return null;
  }

  const x = Number(matches[1]);
  const y = Number(matches[2]);
  return sql`point(${x}, ${y})`;
}

export async function createCashboxTerminal(payload: CashboxTerminalCreate) {
  const now = new Date();
  const [created] = await db
    .insert(cashbox_terminalInSpecification)
    .values({
      terminal_name: payload.terminalName ?? null,
      ip_address: payload.ipAddress ?? null,
      geo_point: parseGeoPoint(payload.geoPoint),
      geo_url: payload.geoUrl ?? null,
      is_active: payload.isActive ?? true,
      ...(payload.userId !== undefined ? { user_id: payload.userId } : {}),
      tran_date: now.toISOString(),
      tran_period: formatTranPeriod(now),
    })
    .returning();

  return mapCashboxTerminal(created);
}

export async function getCashboxTerminalById(id: string) {
  const [terminal] = await db
    .select()
    .from(cashbox_terminalInSpecification)
    .where(eq(cashbox_terminalInSpecification.cashbox_terminal_id, id));

  return terminal ? mapCashboxTerminal(terminal) : null;
}

export async function updateCashboxTerminal(
  id: string,
  payload: CashboxTerminalUpdate,
) {
  const updates: Record<string, unknown> = {};

  if (payload.terminalName !== undefined)
    updates.terminal_name = payload.terminalName;
  if (payload.ipAddress !== undefined)
    updates.ip_address = payload.ipAddress ?? null;
  if (payload.geoPoint !== undefined)
    updates.geo_point =
      payload.geoPoint === null ? null : parseGeoPoint(payload.geoPoint);
  if (payload.geoUrl !== undefined) updates.geo_url = payload.geoUrl ?? null;
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
    .update(cashbox_terminalInSpecification)
    .set(updates)
    .where(eq(cashbox_terminalInSpecification.cashbox_terminal_id, id))
    .returning();

  return updated ? mapCashboxTerminal(updated) : null;
}

export async function deactivateCashboxTerminal(id: string) {
  const updates: Record<string, unknown> = {};
  updates.is_active = false;
  const now = new Date();
  updates.tran_date = now.toISOString();
  updates.tran_period = formatTranPeriod(now);
  const [updated] = await db
    .update(cashbox_terminalInSpecification)
    .set(updates)
    .where(eq(cashbox_terminalInSpecification.cashbox_terminal_id, id))
    .returning();

  return updated ? true : false;
}
