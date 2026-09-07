# UMUNOTA MVP

UMUNOTA is a Rwanda-first everyday task marketplace: **People. Time. Solutions.** The product matches customers with trusted local runners for errands, pickup/delivery, market shopping, repairs, laundry/document tasks and flexible “get it done” work.

## What works in this build

- Premium responsive black + gold dashboard matching the approved design direction.
- Demo-mode state persists in `localStorage`, so task creation and workflow actions work without external credentials.
- Task lifecycle: posted → funds authorized → accepted → in progress → completion proof → payment requested → approved/disputed → paid.
- My Tasks filtering and detailed per-task timeline.
- Runner discovery with ratings, trust scores, verification status and skills.
- Community experience posts, verified-task badges, ratings, comments and helpful reactions.
- Payments workspace that reflects task states.
- KYC/trust center that distinguishes submitted checks from genuinely verified checks.
- Profile/security UI.
- Login/signup with two modes:
  - local demo fallback when no Supabase environment variables are configured;
  - real Supabase Auth when production keys are configured.
- Supabase Postgres schema, RLS policies, auth profile trigger and trust/payment/task data model.
- Production middleware protects app routes when Supabase is configured.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. In demo mode use the prefilled login values or go directly to `/dashboard`.

## Production environment

Copy `.env.example` to `.env.local` and configure:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PAYMENT_PROVIDER_SECRET=
KYC_PROVIDER_SECRET=
```

Never expose service-role, payment-provider or KYC-provider secrets in browser code.

## Security / trust rules

UMUNOTA must never mark a person as KYC verified simply because an ID was uploaded. Verification should be driven by an authoritative KYC/liveness provider or an auditable manual review. Sensitive identity documents should remain private and use short-lived signed access.

Likewise, the UI models an escrow-style workflow but the application should not claim to custody funds unless the actual legal/payment setup permits it. Use an appropriately licensed payment provider and signed provider webhooks for payment authorization, release, refunds and disputes.

For production, add MFA/step-up authentication around payout changes and high-risk actions, webhook signature verification, server-only payment/KYC transitions, abuse/rate limits, audit logs, device/session management, storage policies, observability and automated tests.

## Main routes

- `/dashboard`
- `/tasks`
- `/tasks/new`
- `/tasks/[id]`
- `/runners`
- `/community`
- `/payments`
- `/kyc`
- `/profile`
- `/login`
- `/signup`
