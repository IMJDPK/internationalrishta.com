-- Base schema (CLI-safe order: marriage_bureaus before profiles FK)
-- Source: supabase/schema.sql

CREATE EXTENSION IF NOT EXISTS "postgis";

CREATE TABLE public.marriage_bureaus (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  city text NOT NULL,
  address text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  license_number text UNIQUE NOT NULL,
  registration_fee_paid boolean DEFAULT false,
  licensed_at timestamp with time zone,
  referral_code text UNIQUE NOT NULL,
  total_referrals integer DEFAULT 0,
  verified boolean DEFAULT false,
  rating numeric(3, 2) DEFAULT 0,
  total_reviews integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  phone text UNIQUE,
  full_name text NOT NULL,
  date_of_birth date,
  gender text CHECK (gender IN ('male', 'female')),
  city text,
  location geography(point, 4326),
  height integer,
  sect text,
  biradari text,
  marital_status text CHECK (marital_status IN ('never_married', 'divorced', 'widowed')),
  education text,
  profession text,
  smoking boolean DEFAULT false,
  drinking boolean DEFAULT false,
  willing_to_relocate boolean DEFAULT false,
  verified boolean DEFAULT false,
  verification_status text CHECK (verification_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  verified_at timestamp with time zone,
  subscription_tier text CHECK (subscription_tier IN ('referral', 'direct')) NOT NULL,
  subscription_status text CHECK (subscription_status IN ('active', 'cancelled', 'expired')) DEFAULT 'active',
  subscription_started_at timestamp with time zone DEFAULT now(),
  referred_by_bureau_id uuid REFERENCES public.marriage_bureaus(id),
  referral_code text,
  points integer DEFAULT 0,
  stars integer DEFAULT 0,
  profile_completion integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_active timestamp with time zone DEFAULT now()
);

CREATE TABLE public.photos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  is_primary boolean DEFAULT false,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.matches (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  matched_user_id uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  user_liked boolean,
  matched_liked boolean,
  is_match boolean DEFAULT false,
  matched_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, matched_user_id)
);

CREATE TABLE public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  match_id uuid REFERENCES public.matches ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  encrypted boolean DEFAULT true,
  read boolean DEFAULT false,
  read_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.video_calls (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id uuid REFERENCES public.matches ON DELETE CASCADE NOT NULL,
  caller_id uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  receiver_id uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  started_at timestamp with time zone,
  ended_at timestamp with time zone,
  duration integer,
  unlocked boolean DEFAULT false,
  points_required integer DEFAULT 100,
  days_required integer DEFAULT 7,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  tier text CHECK (tier IN ('referral', 'direct')) NOT NULL,
  amount numeric(10, 2) NOT NULL,
  payment_method text,
  payment_reference text,
  paid boolean DEFAULT false,
  paid_at timestamp with time zone,
  period_start timestamp with time zone NOT NULL,
  period_end timestamp with time zone NOT NULL,
  bureau_id uuid REFERENCES public.marriage_bureaus(id),
  commission_amount numeric(10, 2),
  commission_paid boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.in_person_verifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  bureau_id uuid REFERENCES public.marriage_bureaus ON DELETE CASCADE NOT NULL,
  total_fee numeric(10, 2) DEFAULT 20000,
  bureau_share numeric(10, 2) DEFAULT 16000,
  platform_share numeric(10, 2) DEFAULT 4000,
  status text CHECK (status IN ('requested', 'scheduled', 'completed', 'cancelled')) DEFAULT 'requested',
  scheduled_at timestamp with time zone,
  completed_at timestamp with time zone,
  paid boolean DEFAULT false,
  paid_at timestamp with time zone,
  bureau_paid boolean DEFAULT false,
  bureau_paid_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.points_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL,
  type text CHECK (type IN ('earned', 'spent')) NOT NULL,
  reason text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.commission_payouts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  bureau_id uuid REFERENCES public.marriage_bureaus ON DELETE CASCADE NOT NULL,
  period_start timestamp with time zone NOT NULL,
  period_end timestamp with time zone NOT NULL,
  subscription_commission numeric(10, 2) DEFAULT 0,
  verification_commission numeric(10, 2) DEFAULT 0,
  total_amount numeric(10, 2) NOT NULL,
  paid boolean DEFAULT false,
  paid_at timestamp with time zone,
  payment_reference text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX profiles_city_idx ON public.profiles(city);
CREATE INDEX profiles_subscription_tier_idx ON public.profiles(subscription_tier);
CREATE INDEX profiles_verified_idx ON public.profiles(verified);
CREATE INDEX matches_user_id_idx ON public.matches(user_id);
CREATE INDEX matches_matched_user_id_idx ON public.matches(matched_user_id);
CREATE INDEX messages_sender_id_idx ON public.messages(sender_id);
CREATE INDEX messages_receiver_id_idx ON public.messages(receiver_id);
CREATE INDEX subscriptions_user_id_idx ON public.subscriptions(user_id);
CREATE INDEX subscriptions_bureau_id_idx ON public.subscriptions(bureau_id);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marriage_bureaus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.in_person_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Verified profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated' AND verified = true);

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view verified user photos"
  ON public.photos FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = photos.user_id AND profiles.verified = true
  ));

CREATE POLICY "Users can manage own photos"
  ON public.photos FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own matches"
  ON public.matches FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = matched_user_id);

CREATE POLICY "Users can create matches"
  ON public.matches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own messages"
  ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_bureaus_updated_at
  BEFORE UPDATE ON public.marriage_bureaus
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
