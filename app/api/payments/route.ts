import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isPaypackConfigured, paypackCashIn, paypackCashOut, paypackFindTransaction } from '@/lib/paypack';

const phoneSchema = z.string().regex(/^07\d{8}$/, 'Use a Rwanda mobile number like 078xxxxxxx');

const schema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('cashin'),
    taskId: z.string().uuid(),
    amount: z.number().int().positive(),
    phone: phoneSchema,
  }),
  z.object({
    action: z.literal('cashout'),
    taskId: z.string().uuid(),
    amount: z.number().int().positive(),
    phone: phoneSchema,
  }),
  z.object({
    action: z.literal('find'),
    ref: z.string().min(6),
  }),
]);

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payment request', details: parsed.error.flatten() }, { status: 400 });
  }

  if (!isPaypackConfigured()) {
    return NextResponse.json(
      { error: 'Paypack is not configured', required: ['PAYPACK_CLIENT_ID', 'PAYPACK_CLIENT_SECRET'] },
      { status: 503 }
    );
  }

  try {
    if (parsed.data.action === 'find') {
      const transaction = await paypackFindTransaction(parsed.data.ref);
      return NextResponse.json({ ok: true, provider: 'paypack', transaction });
    }

    const idempotencyKey = `${parsed.data.taskId.replace(/-/g, '').slice(0, 20)}${parsed.data.action}`.slice(0, 32);
    const transaction = parsed.data.action === 'cashin'
      ? await paypackCashIn({ amount: parsed.data.amount, phone: parsed.data.phone, idempotencyKey })
      : await paypackCashOut({ amount: parsed.data.amount, phone: parsed.data.phone, idempotencyKey });

    return NextResponse.json({
      ok: true,
      provider: 'paypack',
      mobileNetwork: transaction.provider ?? 'detected-by-paypack',
      transaction,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Payment provider request failed';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
