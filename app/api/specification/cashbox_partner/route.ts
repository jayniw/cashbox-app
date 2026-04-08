import { NextResponse } from 'next/server';
import { sql, and, type SQL } from 'drizzle-orm';
import { db } from '@/lib/db';
import { cashbox_partnerInSpecification } from '@/lib/schema/schema';
import {
  cashboxPartnerCreateSchema,
  cashboxPartnerQuerySchema,
  cashboxPartnerResponseSchema,
} from '@/types/db/specification/cashboxPartner';

const mapCashboxPartner = (partner: Record<string, unknown>) => ({
  cashboxPartnerId: partner.cashbox_partner_id,
  partnerName: partner.partner_name,
  partnerStatus: partner.partner_status,
  logo: partner.logo,
  url: partner.url,
  tranId: partner.tran_id,
  tranDate: partner.tran_date,
  tranPeriod: partner.tran_period,
  userId: partner.user_id,
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const queryParams = cashboxPartnerQuerySchema.parse({
    partnerName:
      url.searchParams.get('partnerName') ??
      url.searchParams.get('partner_name') ??
      undefined,
    partnerStatus:
      url.searchParams.get('partnerStatus') ??
      url.searchParams.get('partner_status') ??
      undefined,
  });

  const conditions: SQL[] = [];

  if (queryParams.partnerName) {
    conditions.push(
      sql`LOWER(${cashbox_partnerInSpecification.partner_name}) LIKE ${`%${queryParams.partnerName.toLowerCase()}%`}`,
    );
  }

  if (queryParams.partnerStatus) {
    conditions.push(
      sql`LOWER(${cashbox_partnerInSpecification.partner_status}) = ${queryParams.partnerStatus.toLowerCase()}`,
    );
  }

  const query = db
    .select()
    .from(cashbox_partnerInSpecification)
    .orderBy(cashbox_partnerInSpecification.partner_name);

  const partners = conditions.length
    ? await query.where(and(...conditions))
    : await query;

  return NextResponse.json(partners.map(mapCashboxPartner));
}

export async function POST(request: Request) {
  const body = cashboxPartnerCreateSchema.parse(await request.json());
  const partnerData = {
    partner_name: body.partnerName ?? null,
    partner_status: body.partnerStatus ?? 'Active',
    logo: body.logo ?? null,
    url: body.url ?? null,
    tran_id: body.tranId ?? null,
    tran_period: body.tranPeriod ?? null,
    user_id: body.userId ?? null,
  };

  const [created] = await db
    .insert(cashbox_partnerInSpecification)
    .values(partnerData)
    .returning();

  return NextResponse.json(mapCashboxPartner(created), { status: 201 });
}

export const cashboxPartnerOpenApi = {
  path: '/api/specification/cashbox_partner',
  tag: 'CashboxPartner',
  operations: {
    get: {
      summary: 'List cashbox partners',
      description:
        'Returns a list of cashbox partners. Use optional query parameters to filter results.',
      querySchema: cashboxPartnerQuerySchema,
      querySchemaName: 'CashboxPartnerQuery',
      responseSchema: cashboxPartnerResponseSchema.array(),
      responseSchemaName: 'CashboxPartnerList',
    },
    post: {
      summary: 'Create a new cashbox partner',
      requestBodySchema: cashboxPartnerCreateSchema,
      requestBodySchemaName: 'CashboxPartnerCreate',
      responseSchema: cashboxPartnerResponseSchema,
      responseSchemaName: 'CashboxPartner',
    },
  },
};
