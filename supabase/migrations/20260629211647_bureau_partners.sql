-- =============================================================================
-- Phase D — Bureau Partners Directory
-- Branch: 20260629-203913-bureau-partners-directory
-- Constitution: .specify/bureau-partners-directory/constitution.md
-- Phase 1: T001–T012
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. marriage_bureaus — payout rules + directory gate
-- ---------------------------------------------------------------------------

ALTER TABLE public.marriage_bureaus
  ADD COLUMN IF NOT EXISTS is_approved boolean NOT NULL DEFAULT false;

ALTER TABLE public.marriage_bureaus
  ADD COLUMN IF NOT EXISTS commission_type text NOT NULL DEFAULT 'percentage';

ALTER TABLE public.marriage_bureaus
  DROP CONSTRAINT IF EXISTS marriage_bureaus_commission_type_check;

ALTER TABLE public.marriage_bureaus
  ADD CONSTRAINT marriage_bureaus_commission_type_check
    CHECK (commission_type IN ('flat', 'percentage'));

ALTER TABLE public.marriage_bureaus
  ADD COLUMN IF NOT EXISTS commission_rate numeric(10, 4) NOT NULL DEFAULT 0.2000;

ALTER TABLE public.marriage_bureaus
  DROP CONSTRAINT IF EXISTS marriage_bureaus_commission_rate_check;

ALTER TABLE public.marriage_bureaus
  ADD CONSTRAINT marriage_bureaus_commission_rate_check
    CHECK (commission_rate > 0);

ALTER TABLE public.marriage_bureaus
  ADD COLUMN IF NOT EXISTS approved_at timestamptz;

ALTER TABLE public.marriage_bureaus
  ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES public.admin_users(id);

COMMENT ON COLUMN public.marriage_bureaus.is_approved IS
  'Directory gate — true only after admin approval';
COMMENT ON COLUMN public.marriage_bureaus.commission_rate IS
  'percentage: decimal rate (0.20 = 20%); flat: fixed PKR per activation';

-- Backfill: use status when column exists (bureau-approval-migration), else verified only
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'marriage_bureaus'
      AND column_name = 'status'
  ) THEN
    UPDATE public.marriage_bureaus
    SET is_approved = true
    WHERE status = 'approved'
      AND verified = true
      AND is_approved = false;
  ELSE
    UPDATE public.marriage_bureaus
    SET is_approved = true
    WHERE verified = true
      AND is_approved = false;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 2. profiles — referred_by_bureau_id + write-once trigger
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referred_by_bureau_id uuid
    REFERENCES public.marriage_bureaus(id);

CREATE INDEX IF NOT EXISTS profiles_referred_by_bureau_id_idx
  ON public.profiles(referred_by_bureau_id);

CREATE OR REPLACE FUNCTION public.profiles_referral_write_once()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.referred_by_bureau_id IS NOT NULL
     AND NEW.referred_by_bureau_id IS DISTINCT FROM OLD.referred_by_bureau_id
     AND auth.uid() = OLD.id
     AND NOT EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  THEN
    RAISE EXCEPTION 'referred_by_bureau_id is immutable for end-users';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_referral_write_once_trigger ON public.profiles;

CREATE TRIGGER profiles_referral_write_once_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.profiles_referral_write_once();

-- ---------------------------------------------------------------------------
-- 3. bureau_commissions — accrual ledger (idempotent on subscription_id)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.bureau_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bureau_id uuid NOT NULL REFERENCES public.marriage_bureaus(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  subscription_id uuid NOT NULL UNIQUE REFERENCES public.subscriptions(id) ON DELETE RESTRICT,
  subscription_amount numeric(10, 2) NOT NULL,
  commission_type text NOT NULL CHECK (commission_type IN ('flat', 'percentage')),
  commission_rate numeric(10, 4) NOT NULL,
  commission_amount numeric(10, 2) NOT NULL,
  status text NOT NULL DEFAULT 'accrued'
    CHECK (status IN ('accrued', 'paid', 'void')),
  accrued_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz,
  void_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bureau_commissions_void_reason_check CHECK (
    status <> 'void' OR void_reason IS NOT NULL
  )
);

COMMENT ON COLUMN public.bureau_commissions.commission_amount IS
  'Calculated payout amount (PKR) snapshotted at accrual';
COMMENT ON COLUMN public.bureau_commissions.subscription_id IS
  'UNIQUE — one commission row per paid subscription activation';

CREATE INDEX IF NOT EXISTS bureau_commissions_bureau_id_idx
  ON public.bureau_commissions(bureau_id);

CREATE INDEX IF NOT EXISTS bureau_commissions_user_id_idx
  ON public.bureau_commissions(user_id);

ALTER TABLE public.bureau_commissions ENABLE ROW LEVEL SECURITY;

-- No INSERT/UPDATE/DELETE policies for authenticated — service role only

DROP POLICY IF EXISTS "Bureau owners read own commissions" ON public.bureau_commissions;

CREATE POLICY "Bureau owners read own commissions"
  ON public.bureau_commissions
  FOR SELECT
  TO authenticated
  USING (
    bureau_id IN (
      SELECT mb.id
      FROM public.marriage_bureaus AS mb
      WHERE mb.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins read all commissions" ON public.bureau_commissions;

CREATE POLICY "Admins read all commissions"
  ON public.bureau_commissions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
  );

-- ---------------------------------------------------------------------------
-- 4. marriage_bureaus RLS — public directory uses is_approved only
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Public can view approved bureaus" ON public.marriage_bureaus;

CREATE POLICY "Public can view approved bureaus"
  ON public.marriage_bureaus
  FOR SELECT
  TO anon, authenticated
  USING (is_approved = true);

COMMIT;
