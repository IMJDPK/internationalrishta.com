-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "postgis";

-- Users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  phone text unique,
  full_name text not null,
  date_of_birth date,
  gender text check (gender in ('male', 'female')),
  
  -- Location
  city text,
  location geography(point, 4326),
  
  -- Physical attributes
  height integer, -- in cm
  
  -- Personal info
  sect text,
  biradari text,
  marital_status text check (marital_status in ('never_married', 'divorced', 'widowed')),
  education text,
  profession text,
  
  -- Preferences
  smoking boolean default false,
  drinking boolean default false,
  willing_to_relocate boolean default false,
  
  -- Verification
  verified boolean default false,
  verification_status text check (verification_status in ('pending', 'approved', 'rejected')) default 'pending',
  verified_at timestamp with time zone,
  
  -- Subscription
  subscription_tier text check (subscription_tier in ('referral', 'direct')) not null,
  subscription_status text check (subscription_status in ('active', 'cancelled', 'expired')) default 'active',
  subscription_started_at timestamp with time zone default now(),
  
  -- Referral
  referred_by_bureau_id uuid references public.marriage_bureaus(id),
  referral_code text,
  
  -- Points and engagement
  points integer default 0,
  stars integer default 0,
  
  -- Profile completion
  profile_completion integer default 0,
  
  -- Timestamps
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  last_active timestamp with time zone default now()
);

-- Marriage Bureaus table
create table public.marriage_bureaus (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references auth.users on delete cascade not null,
  
  name text not null,
  city text not null,
  address text not null,
  phone text not null,
  email text not null,
  
  -- Licensing
  license_number text unique not null,
  registration_fee_paid boolean default false,
  licensed_at timestamp with time zone,
  
  -- Referral tracking
  referral_code text unique not null,
  total_referrals integer default 0,
  
  -- Verification
  verified boolean default false,
  
  -- Rating
  rating numeric(3, 2) default 0,
  total_reviews integer default 0,
  
  -- Timestamps
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Photos table
create table public.photos (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  url text not null,
  is_primary boolean default false,
  order_index integer default 0,
  created_at timestamp with time zone default now()
);

-- Matches table
create table public.matches (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  matched_user_id uuid references public.profiles on delete cascade not null,
  
  -- Swipe data
  user_liked boolean,
  matched_liked boolean,
  
  -- Match status
  is_match boolean default false,
  matched_at timestamp with time zone,
  
  created_at timestamp with time zone default now(),
  
  unique(user_id, matched_user_id)
);

-- Messages table
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references public.profiles on delete cascade not null,
  receiver_id uuid references public.profiles on delete cascade not null,
  match_id uuid references public.matches on delete cascade not null,
  
  content text not null,
  
  -- Encryption
  encrypted boolean default true,
  
  -- Status
  read boolean default false,
  read_at timestamp with time zone,
  
  created_at timestamp with time zone default now()
);

-- Video calls table
create table public.video_calls (
  id uuid default uuid_generate_v4() primary key,
  match_id uuid references public.matches on delete cascade not null,
  caller_id uuid references public.profiles on delete cascade not null,
  receiver_id uuid references public.profiles on delete cascade not null,
  
  -- Call data
  started_at timestamp with time zone,
  ended_at timestamp with time zone,
  duration integer, -- in seconds
  
  -- Unlock requirements
  unlocked boolean default false,
  points_required integer default 100,
  days_required integer default 7,
  
  created_at timestamp with time zone default now()
);

-- Subscriptions table
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  
  tier text check (tier in ('referral', 'direct')) not null,
  amount numeric(10, 2) not null,
  
  -- Payment
  payment_method text,
  payment_reference text,
  paid boolean default false,
  paid_at timestamp with time zone,
  
  -- Billing period
  period_start timestamp with time zone not null,
  period_end timestamp with time zone not null,
  
  -- Bureau commission (for referral tier)
  bureau_id uuid references public.marriage_bureaus(id),
  commission_amount numeric(10, 2),
  commission_paid boolean default false,
  
  created_at timestamp with time zone default now()
);

-- In-person verifications table
create table public.in_person_verifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  bureau_id uuid references public.marriage_bureaus on delete cascade not null,
  
  -- Fee structure
  total_fee numeric(10, 2) default 20000,
  bureau_share numeric(10, 2) default 16000,
  platform_share numeric(10, 2) default 4000,
  
  -- Status
  status text check (status in ('requested', 'scheduled', 'completed', 'cancelled')) default 'requested',
  scheduled_at timestamp with time zone,
  completed_at timestamp with time zone,
  
  -- Payment
  paid boolean default false,
  paid_at timestamp with time zone,
  bureau_paid boolean default false,
  bureau_paid_at timestamp with time zone,
  
  -- Notes
  notes text,
  
  created_at timestamp with time zone default now()
);

-- Points transactions table
create table public.points_transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  
  amount integer not null,
  type text check (type in ('earned', 'spent')) not null,
  reason text not null,
  
  created_at timestamp with time zone default now()
);

-- Commission payouts table
create table public.commission_payouts (
  id uuid default uuid_generate_v4() primary key,
  bureau_id uuid references public.marriage_bureaus on delete cascade not null,
  
  -- Payout period
  period_start timestamp with time zone not null,
  period_end timestamp with time zone not null,
  
  -- Amounts
  subscription_commission numeric(10, 2) default 0,
  verification_commission numeric(10, 2) default 0,
  total_amount numeric(10, 2) not null,
  
  -- Payment
  paid boolean default false,
  paid_at timestamp with time zone,
  payment_reference text,
  
  created_at timestamp with time zone default now()
);

-- Create indexes
create index profiles_city_idx on public.profiles(city);
create index profiles_subscription_tier_idx on public.profiles(subscription_tier);
create index profiles_verified_idx on public.profiles(verified);
create index matches_user_id_idx on public.matches(user_id);
create index matches_matched_user_id_idx on public.matches(matched_user_id);
create index messages_sender_id_idx on public.messages(sender_id);
create index messages_receiver_id_idx on public.messages(receiver_id);
create index subscriptions_user_id_idx on public.subscriptions(user_id);
create index subscriptions_bureau_id_idx on public.subscriptions(bureau_id);

-- Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.marriage_bureaus enable row level security;
alter table public.photos enable row level security;
alter table public.matches enable row level security;
alter table public.messages enable row level security;
alter table public.video_calls enable row level security;
alter table public.subscriptions enable row level security;
alter table public.in_person_verifications enable row level security;
alter table public.points_transactions enable row level security;

-- RLS Policies
-- Profiles: Users can view verified profiles, update their own
create policy "Verified profiles are viewable by authenticated users"
  on public.profiles for select
  using (auth.role() = 'authenticated' and verified = true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Photos: Users can manage their own photos
create policy "Users can view verified user photos"
  on public.photos for select
  using (exists (select 1 from public.profiles where profiles.id = photos.user_id and profiles.verified = true));

create policy "Users can manage own photos"
  on public.photos for all
  using (auth.uid() = user_id);

-- Matches: Users can view their own matches
create policy "Users can view own matches"
  on public.matches for select
  using (auth.uid() = user_id or auth.uid() = matched_user_id);

create policy "Users can create matches"
  on public.matches for insert
  with check (auth.uid() = user_id);

-- Messages: Users can view/send messages in their matches
create policy "Users can view own messages"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can send messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);

-- Functions
-- Update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

create trigger handle_bureaus_updated_at
  before update on public.marriage_bureaus
  for each row
  execute function public.handle_updated_at();
