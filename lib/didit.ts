import crypto from 'node:crypto';

const DIDIT_BASE_URL = 'https://verification.didit.me';

function required(name: 'DIDIT_API_KEY' | 'DIDIT_WORKFLOW_ID') {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

export async function createDiditSession(input: {
  userId: string;
  callbackUrl: string;
  email?: string | null;
  phone?: string | null;
}) {
  const response = await fetch(`${DIDIT_BASE_URL}/v3/session/`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': required('DIDIT_API_KEY'),
    },
    body: JSON.stringify({
      workflow_id: required('DIDIT_WORKFLOW_ID'),
      vendor_data: input.userId,
      callback: input.callbackUrl,
      callback_method: 'both',
      language: 'en',
      metadata: { product: 'umunota', purpose: 'marketplace_kyc' },
      contact_details: {
        email: input.email || undefined,
        phone: input.phone || undefined,
        send_notification_emails: false,
      },
    }),
    cache: 'no-store',
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.detail || 'Unable to create verification session');
  }
  return data as { session_id: string; url: string; status: string };
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((out, key) => {
        out[key] = sortKeys((value as Record<string, unknown>)[key]);
        return out;
      }, {});
  }
  return value;
}

export function verifyDiditWebhook(body: unknown, signature: string | null, timestamp: string | null) {
  const secret = process.env.DIDIT_WEBHOOK_SECRET;
  if (!secret || !signature || !timestamp) return false;

  const incoming = Number(timestamp);
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(incoming) || Math.abs(now - incoming) > 300) return false;

  const canonical = JSON.stringify(sortKeys(body));
  const expected = crypto.createHmac('sha256', secret).update(canonical, 'utf8').digest('hex');
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signature, 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
