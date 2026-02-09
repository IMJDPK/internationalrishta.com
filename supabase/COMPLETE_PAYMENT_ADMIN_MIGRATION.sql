-- ============================================
-- COMPLETE PAYMENT & ADMIN SYSTEM MIGRATION
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- ====================================
-- PART 1: USER PAYMENT TRACKING
-- ====================================

-- Add payment and activation fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS payment_status text 
CHECK (payment_status IN ('pending', 'payment_sent', 'verified', 'failed')) 
DEFAULT 'pending';

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS payment_method text; -- 'raast' or 'jazzcash'

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS payment_amount integer;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS payment_transaction_id text;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS payment_sent_at timestamp with time zone;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS payment_verified_at timestamp with time zone;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS payment_verified_by uuid references auth.users;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS account_active boolean DEFAULT false;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS activation_notes text;

-- Create payment_notifications table for tracking user payment submissions
CREATE TABLE IF NOT EXISTS public.payment_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  email text NOT NULL,
  phone text,
  payment_method text NOT NULL,
  amount integer NOT NULL,
  transaction_id text,
  screenshot_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  admin_notes text,
  created_at timestamp with time zone DEFAULT now(),
  verified_at timestamp with time zone,
  verified_by uuid REFERENCES auth.users
);

-- Enable RLS on payment_notifications
ALTER TABLE public.payment_notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can submit their own payment notifications
CREATE POLICY "Users can submit payment notifications"
ON public.payment_notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own payment notifications
CREATE POLICY "Users can view own payment notifications"
ON public.payment_notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- ====================================
-- PART 2: ADMIN USERS TABLE
-- ====================================

-- Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('super_admin', 'moderator', 'support')),
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users,
  last_login timestamp with time zone
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view admin_users table
CREATE POLICY "Admins can view admin users"
ON public.admin_users
FOR SELECT
TO authenticated
USING (
  id IN (SELECT id FROM public.admin_users)
);

-- Policy: Allow a user to view their own admin row (needed for initial lookup)
CREATE POLICY "User can view own admin row"
ON public.admin_users
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Policy: Only super admins can insert new admins
CREATE POLICY "Super admins can insert admins"
ON public.admin_users
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- ====================================
-- PART 3: BUREAU APPROVAL WORKFLOW
-- ====================================

-- Add status field to marriage_bureaus table for approval workflow
ALTER TABLE public.marriage_bureaus 
ADD COLUMN IF NOT EXISTS status text 
CHECK (status IN ('pending', 'payment_pending', 'approved', 'rejected')) 
DEFAULT 'pending';

-- Add payment verification fields
ALTER TABLE public.marriage_bureaus 
ADD COLUMN IF NOT EXISTS payment_amount integer;

ALTER TABLE public.marriage_bureaus 
ADD COLUMN IF NOT EXISTS payment_receipt_url text;

ALTER TABLE public.marriage_bureaus 
ADD COLUMN IF NOT EXISTS payment_verified_at timestamp with time zone;

ALTER TABLE public.marriage_bureaus 
ADD COLUMN IF NOT EXISTS payment_verified_by uuid references auth.users;

-- Update existing rows to have 'pending' status
UPDATE public.marriage_bureaus 
SET status = 'pending' 
WHERE status IS NULL;

-- Enable RLS on marriage_bureaus
ALTER TABLE public.marriage_bureaus ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to insert their own bureau registration
CREATE POLICY "Users can register their own bureau"
ON public.marriage_bureaus
FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

-- Policy: Users can update their own bureau (only if not approved yet)
CREATE POLICY "Users can update own bureau"
ON public.marriage_bureaus
FOR UPDATE
TO authenticated
USING (owner_id = auth.uid() AND status != 'approved')
WITH CHECK (owner_id = auth.uid());

-- Policy: Users can view their own bureau
CREATE POLICY "Users can view own bureau"
ON public.marriage_bureaus
FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

-- Policy: Public can view only approved bureaus
CREATE POLICY "Public can view approved bureaus"
ON public.marriage_bureaus
FOR SELECT
TO public
USING (status = 'approved' AND verified = true);

-- Create bureau_notifications table for tracking submissions
CREATE TABLE IF NOT EXISTS public.bureau_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bureau_id uuid REFERENCES public.marriage_bureaus NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  payment_method text,
  amount integer,
  transaction_id text,
  receipt_url text,
  license_document_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'documents_pending', 'payment_pending', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamp with time zone DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid REFERENCES auth.users
);

-- Enable RLS on bureau_notifications
ALTER TABLE public.bureau_notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can submit bureau notifications
CREATE POLICY "Users can submit bureau notifications"
ON public.bureau_notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own bureau notifications
CREATE POLICY "Users can view own bureau notifications"
ON public.bureau_notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- ====================================
-- PART 4: ADMIN POLICIES ON MAIN TABLES
-- ====================================

-- Allow admins to view all payment notifications
CREATE POLICY "Admins can view all payment notifications"
ON public.payment_notifications
FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

-- Allow admins to update payment notifications
CREATE POLICY "Admins can update payment notifications"
ON public.payment_notifications
FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

-- Allow admins to view all bureau notifications
CREATE POLICY "Admins can view all bureau notifications"
ON public.bureau_notifications
FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

-- Allow admins to update bureau notifications
CREATE POLICY "Admins can update bureau notifications"
ON public.bureau_notifications
FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

-- Allow admins to update any profile for payment verification
CREATE POLICY "Admins can update profiles for verification"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

-- Allow admins to update any bureau for approval
CREATE POLICY "Admins can update bureaus for approval"
ON public.marriage_bureaus
FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

-- ====================================
-- COMPLETE! 
-- ====================================

-- Now add yourself as admin by running:
-- INSERT INTO admin_users (id, email, role, created_at)
-- VALUES ('YOUR_USER_ID', 'your-email@gmail.com', 'super_admin', NOW());
