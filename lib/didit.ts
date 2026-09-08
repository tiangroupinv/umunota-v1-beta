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
    const detail = typeof data?.detail === 'string' ? data.detail : 'Unable to create verification session';
    throw new Error(detail);
  }

  if (typeof data?.session_id !== 'string' || typeof data?.url !== 'string') {
    throw new Error('Didit returned an invalid verification session');
  }

  return data as { session_id: string; url: string; status: string };
}

function shortenFloats(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shortenFloats);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, child]) => [key, shortenFloats(child)])
    );
  }
  if (typeof value === 'number' && !Number.isInteger(value) && value % 1 === 0) {
    return Math.trunc(value);
  }
  return value;
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

function safeEqualHex(expected: string, received: string | null) {
  if (!received) return false;
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(received, 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function freshTimestamp(timestamp: string | null) {
  if (!timestamp) return false;
  const incoming = Number.parseInt(timestamp, 10);
  const now = Math.floor(Date.now() / 1000);
  return Number.isFinite(incoming) && Math.abs(now - incoming) <= 300;
}

export function verifyDiditWebhook(input: {
  rawBody: string;
  body: unknown;
  signatureV2: string | null;
  signatureRaw: string | null;
  timestamp: string | null;
}) {
  const secret = process.env.DIDIT_WEBHOOK_SECRET;
  if (!secret || !freshTimestamp(input.timestamp)) return false;

  if (input.signatureV2) {
    const canonical = JSON.stringify(sortKeys(shortenFloats(input.body)));
    const expected = crypto.createHmac('sha256', secret).update(canonical, 'utf8').digest('hex');
    if (safeEqualHex(expected, input.signatureV2)) return true;
  }

  if (input.signatureRaw) {
    const expected = crypto.createHmac('sha256', secret).update(input.rawBody, 'utf8').digest('hex');
    if (safeEqualHex(expected, input.signatureRaw)) return true;
  }

  return false;
}
