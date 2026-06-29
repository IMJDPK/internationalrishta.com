-- =============================================================================
-- Hybrid Billing — subscriptions extension + payment-proofs Storage + webhook log
-- Branch: 001-phase-c-monetization
-- Constitution: .specify/monetization-stripe-hybrid/constitution.md
-- Phase 1: T001–T010
-- Canonical copy: supabase/migrations/20260629203000_monetization_hybrid.sql
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Extend public.subscriptions (unified Stripe + manual ledger)
-- ---------------------------------------------------------------------------

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS source_channel text
    CHECK (source_channel IN ('stripe', 'manual'));

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS stripe_customer_id text;

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text;

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS price_id text;

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS payment_notification_id uuid
    REFERENCES public.payment_notifications(id);

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS admin_approved_by uuid
    REFERENCES public.admin_users(id);

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_stripe_subscription_id_uidx
  ON public.subscriptions (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS subscriptions_payment_notification_id_idx
  ON public.subscriptions (payment_notification_id)
  WHERE payment_notification_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS subscriptions_source_channel_idx
  ON public.subscriptions (source_channel);

COMMENT ON COLUMN public.subscriptions.source_channel IS
  'stripe = Checkout/webhook path; manual = bank proof + admin approval';
COMMENT ON COLUMN public.subscriptions.price_id IS
  'Stripe Price id at checkout (stripe path only)';

-- ---------------------------------------------------------------------------
-- 2. Stripe webhook idempotency / audit
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  id text PRIMARY KEY,
  type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;
-- No policies: only service role / superuser accesses this table

-- ---------------------------------------------------------------------------
-- 3. subscriptions RLS — read own; no client writes
-- ---------------------------------------------------------------------------

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Intentionally NO INSERT/UPDATE/DELETE policies for authenticated users.
-- Webhook + admin paths use service role or SECURITY DEFINER RPC.

-- ---------------------------------------------------------------------------
-- 4. Storage bucket: payment-proofs (private)
-- ---------------------------------------------------------------------------

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-proofs',
  'payment-proofs',
  false,
  10485760,
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf'
  ];

-- ---------------------------------------------------------------------------
-- 5. Storage RLS — INSERT/SELECT on own folder; admins SELECT all in bucket
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "payment_proofs_insert_own" ON storage.objects;
CREATE POLICY "payment_proofs_insert_own"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'payment-proofs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "payment_proofs_select_own_or_admin" ON storage.objects;
CREATE POLICY "payment_proofs_select_own_or_admin"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'payment-proofs'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR EXISTS (
        SELECT 1 FROM public.admin_users WHERE id = auth.uid()
      )
    )
  );

-- No UPDATE/DELETE policies — users upload once; proofs retained for audit

COMMIT;
