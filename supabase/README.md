# Supabase Setup Instructions

## Prerequisites
- Supabase account (https://supabase.com)
- Project created in Supabase dashboard

## Setup Steps

### 1. Create Supabase Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Choose organization and region (closest to Pakistan - Singapore recommended)
4. Set database password (save it securely)
5. Wait for project to be provisioned

### 2. Run Database Schema
1. Open SQL Editor in Supabase dashboard
2. Copy contents of `supabase/schema.sql`
3. Paste and execute the SQL
4. Verify tables are created in Table Editor

### 3. Configure Authentication
1. Go to Authentication → Providers
2. Enable Email provider
3. Enable Google OAuth provider:
   - Get Google OAuth credentials from https://console.cloud.google.com
   - Add to Supabase auth providers
   - Set redirect URL: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`

### 4. Set Environment Variables
Create `.env.local` file in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Get these values from:
- Supabase Dashboard → Settings → API

### 5. Storage Buckets
Create storage buckets for user content:

1. Go to Storage
2. Create buckets:
   - `profiles` - for profile photos
   - `verification` - for ID and verification photos
   - `messages` - for message attachments (if needed)

3. Set bucket policies:
```sql
-- Allow authenticated users to upload to profiles bucket
create policy "Users can upload own profile photos"
on storage.objects for insert
with check (
  bucket_id = 'profiles' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to profile photos
create policy "Profile photos are publicly accessible"
on storage.objects for select
using (bucket_id = 'profiles');
```

### 6. Enable Realtime (for messaging)
1. Go to Database → Replication
2. Enable realtime for tables:
   - `messages`
   - `matches`
   - `profiles` (for online status)

### 7. Test Connection
Run the development server and test:
```bash
npm run dev
```

Visit http://localhost:3000 and try:
- Sign up with email
- Sign up with Google
- View profiles

## Database Schema Overview

### Core Tables
- **profiles** - User profiles (extends auth.users)
- **marriage_bureaus** - Licensed marriage bureau partners
- **photos** - User profile photos
- **matches** - Swipe matches between users
- **messages** - Encrypted messages between matches
- **video_calls** - Video call unlock tracking
- **subscriptions** - Monthly subscription payments
- **in_person_verifications** - Bureau verification appointments
- **points_transactions** - Points earned/spent log
- **commission_payouts** - Weekly bureau commission payments

### Key Features
- Row Level Security (RLS) enabled on all tables
- PostGIS extension for geolocation queries
- Automatic timestamp triggers
- Foreign key relationships for data integrity
- Indexes for performance

## Next Steps
1. Implement Supabase client in components
2. Add authentication flows
3. Set up real-time subscriptions for messaging
4. Configure storage for photo uploads
5. Test all features end-to-end

## Support
- Supabase Docs: https://supabase.com/docs
- GitHub Issues: Create issue in project repository
