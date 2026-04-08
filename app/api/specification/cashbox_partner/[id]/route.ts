import { NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { cashbox_partnerInSpecification } from '@/lib/schema/schema';
import { z } from 'zod';
import {
  cashboxPartnerResponseSchema,
  cashboxPartnerUpdateSchema,
} from '@/types/db/specification/cashboxPartner';

type Params = { params: Promise<{ id: string }> };

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

export async function GET(_request: Request, context: Params) {
  const { id } = await context.params;
  const [partner] = await db
    .select()
    .from(cashbox_partnerInSpecification)
    .where(sql`${cashbox_partnerInSpecification.cashbox_partner_id} = ${id}`);

  if (!partner) {
    return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
  }

  return NextResponse.json(mapCashboxPartner(partner));
}

export async function PATCH(request: Request, context: Params) {
  const { id } = await context.params;
  const body = cashboxPartnerUpdateSchema.parse(await request.json());
  const updates: Record<string, unknown> = {};

  if (body.partnerName !== undefined) updates.partner_name = body.partnerName;
  if (body.partnerStatus !== undefined)
    updates.partner_status = body.partnerStatus;
  if (body.logo !== undefined) updates.logo = body.logo;
  if (body.url !== undefined) updates.url = body.url;
  if (body.tranId !== undefined) updates.tran_id = body.tranId ?? null;
  if (body.tranPeriod !== undefined) updates.tran_period = body.tranPeriod;
  if (body.userId !== undefined) updates.user_id = body.userId;

  if (!Object.keys(updates).length) {
    return NextResponse.json(
      { error: 'No fields provided to update' },
      { status: 400 },
    );
  }

  const [updated] = await db
    .update(cashbox_partnerInSpecification)
    .set(updates)
    .where(eq(cashbox_partnerInSpecification.cashbox_partner_id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
  }

  return NextResponse.json(mapCashboxPartner(updated));
}

export const cashboxPartnerByIdOpenApi = {
  path: '/api/specification/cashbox_partner/{id}',
  tag: 'CRUD - cashbox partner',
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
      description: 'Cashbox partner ID',
    },
  ],
  operations: {
    get: {
      summary: 'Get a cashbox partner by ID',
      responseSchema: cashboxPartnerResponseSchema,
      responseSchemaName: 'CashboxPartner',
    },
    patch: {
      summary: 'Update a cashbox partner',
      requestBodySchema: cashboxPartnerUpdateSchema,
      requestBodySchemaName: 'CashboxPartnerUpdate',
      responseSchema: cashboxPartnerResponseSchema,
      responseSchemaName: 'CashboxPartner',
    },
    delete: {
      summary: 'Soft delete a cashbox partner',
      responses: {
        '204': { description: 'Cashbox partner deactivated' },
        '404': {
          description: 'Cashbox partner not found',
          schema: z.object({ error: z.string() }),
          schemaName: 'ErrorResponse',
        },
      },
    },
  },
};

export async function DELETE(_request: Request, context: Params) {
  const { id } = await context.params;

  const [updated] = await db
    .update(cashbox_partnerInSpecification)
    .set({ partner_status: 'Inactive' })
    .where(eq(cashbox_partnerInSpecification.cashbox_partner_id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
