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

-- Update existing profiles to have 'pending' payment status
UPDATE public.profiles 
SET payment_status = 'pending', account_active = false
WHERE payment_status IS NULL;

-- Create payment notifications table
CREATE TABLE IF NOT EXISTS public.payment_notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  email text not null,
  phone text,
  payment_method text not null,
  amount integer not null,
  transaction_id text,
  message text,
  status text DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  created_at timestamp with time zone default now(),
  verified_at timestamp with time zone,
  verified_by uuid references auth.users
);

-- Enable RLS
ALTER TABLE public.payment_notifications ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own payment notification
CREATE POLICY "Users can submit payment notification"
ON public.payment_notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own notifications
CREATE POLICY "Users can view own payment notifications"
ON public.payment_notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create admin roles table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid references auth.users primary key,
  email text not null,
  role text DEFAULT 'admin', -- 'super_admin', 'admin', 'support'
  created_at timestamp with time zone default now()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin users
CREATE POLICY "Admins can view admin users"
ON public.admin_users
FOR SELECT
TO authenticated
USING (auth.uid() IN (SELECT id FROM public.admin_users));

COMMENT ON COLUMN public.profiles.payment_status IS 'Payment verification status: pending (not paid), payment_sent (user claims payment sent), verified (admin confirmed), failed (payment issue)';
COMMENT ON COLUMN public.profiles.account_active IS 'Whether user can access premium features - activated after payment verification';
COMMENT ON TABLE public.payment_notifications IS 'User payment submission for manual verification';
