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
WITH CHECK (auth.uid() = owner_id);

-- Policy: Allow users to update their own bureau (for adding payment receipt)
CREATE POLICY "Users can update own bureau registration"
ON public.marriage_bureaus
FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Policy: Allow users to view their own bureau
CREATE POLICY "Users can view own bureau"
ON public.marriage_bureaus
FOR SELECT
TO authenticated
USING (auth.uid() = owner_id);

-- Policy: Allow public to view approved bureaus only
CREATE POLICY "Public can view approved bureaus"
ON public.marriage_bureaus
FOR SELECT
TO public
USING (status = 'approved' AND verified = true);

-- Create notification table for bureau registrations
CREATE TABLE IF NOT EXISTS public.bureau_notifications (
  id uuid default uuid_generate_v4() primary key,
  bureau_id uuid references public.marriage_bureaus(id) on delete cascade not null,
  type text not null, -- 'registration', 'payment_uploaded', 'approved', 'rejected'
  message text not null,
  read boolean default false,
  created_at timestamp with time zone default now()
);

-- Enable RLS
ALTER TABLE public.bureau_notifications ENABLE ROW LEVEL SECURITY;

-- Allow service role to insert notifications
CREATE POLICY "Service role can insert notifications"
ON public.bureau_notifications
FOR INSERT
TO service_role
WITH CHECK (true);

COMMENT ON COLUMN public.marriage_bureaus.status IS 'Bureau approval status: pending (just registered), payment_pending (waiting for payment), approved (payment verified, active), rejected (registration denied)';
COMMENT ON TABLE public.bureau_notifications IS 'Notifications for bureau registration workflow - to be sent via email to bureau@internationalrishta.com';
