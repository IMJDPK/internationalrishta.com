# User & Bureau Payment Process

## Overview

Both regular users and marriage bureaus require manual payment verification before account activation.

---

## Regular User Payment Flow

### 1. User Signs Up

- Visit `/en/auth/signup` or `/ur/auth/signup`
- Fill registration form
- Submit → Account created (inactive)

### 2. Payment Instructions Page

- Automatically redirected to `/en/payment-instructions`
- Shows payment details:
  - **Amount**: PKR 3,999 (Referral) or PKR 4,999 (Direct)
  - **Account**: 03002027977 (RAAST/JazzCash)
  - **Account Name**: Jawad Khalid Khan

### 3. User Actions Required

User must:

1. ✅ Send payment via RAAST or JazzCash to **03002027977**
2. ✅ Send email to **info@internationalrishta.com** with:
   - Full name
   - Email address
   - Transaction ID / Screenshot
   - Amount paid
3. ✅ Send WhatsApp/SMS to **03002027977** to verify

### 4. Admin Verification

You (Admin) will:

1. Check JazzCash account for payment
2. Check email: info@internationalrishta.com
3. Verify WhatsApp/SMS on 03002027977
4. Go to Supabase → `profiles` table
5. Find the user by email
6. Run SQL to activate:

```sql
UPDATE profiles
SET
  payment_status = 'verified',
  account_active = true,
  payment_verified_at = NOW()
WHERE email = 'user@example.com';
```

### 5. User Gets Access

- User can now access all features
- Profile is visible in discover
- Can send messages, view matches, etc.

---

## Bureau Payment Flow

### 1. Bureau Registers

- Visit `/en/bureau/register` or `/ur/bureau/register`
- Fill all bureau details
- Submit → Status: `pending`

### 2. Bureau Makes Payment

- **Amount**: PKR 10,000 (Registration Fee)
- **Account**: 03002027977 (JazzCash)
- **Account Name**: Jawad Khalid Khan

### 3. Bureau Sends Confirmation

Same process as users:

- Email to **bureau@internationalrishta.com** (or info@)
- WhatsApp/SMS to **03002027977**

### 4. Admin Verifies Bureau

1. Check payment in JazzCash
2. Go to Supabase → `marriage_bureaus` table
3. Verify bureau details
4. Run SQL:

```sql
UPDATE marriage_bureaus
SET
  status = 'approved',
  verified = true,
  registration_fee_paid = true,
  payment_verified_at = NOW(),
  licensed_at = NOW()
WHERE email = 'bureau@example.com';
```

### 5. Bureau Activated

- Bureau can log in
- Can generate referral codes
- Appears in public directory
- Can track referrals and earnings

---

## Setup Instructions

### Step 1: Run Database Migrations

**In Supabase → SQL Editor**, run these two files in order:

1. **First**: `supabase/user-payment-migration.sql`
2. **Second**: `supabase/bureau-approval-migration.sql`

### Step 2: Create Your Admin Account

```sql
-- Make yourself a super admin
INSERT INTO admin_users (id, email, role)
VALUES (
  'your-user-id-from-auth-users',
  'your-email@example.com',
  'super_admin'
);
```

### Step 3: Test the Flow

1. **Test User Signup**:

   - Sign up at `/en/auth/signup`
   - See payment instructions
   - Verify you can activate from Supabase

2. **Test Bureau Registration**:
   - Register at `/en/bureau/register`
   - Verify email notifications
   - Activate from Supabase

---

## Daily Admin Tasks

### Morning Routine (5 minutes)

1. Check JazzCash for payments
2. Check email: info@internationalrishta.com
3. Check WhatsApp: 03002027977
4. Match payments to user emails
5. Activate accounts in Supabase

### Quick Activation Process

```sql
-- Activate user
UPDATE profiles
SET payment_status = 'verified', account_active = true, payment_verified_at = NOW()
WHERE email = 'user@example.com';

-- Activate bureau
UPDATE marriage_bureaus
SET status = 'approved', verified = true, registration_fee_paid = true, payment_verified_at = NOW()
WHERE email = 'bureau@example.com';
```

---

## Future Enhancements

### Phase 1 (Current - Manual)

✅ Users send payment manually  
✅ Email/SMS confirmation  
✅ Admin verifies in Supabase

### Phase 2 (Automated - Later)

- [ ] Auto-email notifications with payment details
- [ ] Admin dashboard to approve with one click
- [ ] Payment receipt upload feature
- [ ] SMS notifications to users when activated

### Phase 3 (Fully Automated - Future)

- [ ] JazzCash API integration
- [ ] RAAST webhook integration
- [ ] Automatic payment verification
- [ ] Instant account activation

---

## Contact Points

**Users Contact**:

- Email: info@internationalrishta.com
- WhatsApp: 03002027977

**Bureaus Contact**:

- Email: bureau@internationalrishta.com (or info@)
- WhatsApp: 03002027977

**Payment Account**:

- JazzCash/RAAST: 03002027977
- Account Name: Jawad Khalid Khan

---

## Quick Reference

| Item              | User Payment                 | Bureau Payment                 |
| ----------------- | ---------------------------- | ------------------------------ |
| Amount            | PKR 3,999 / 4,999            | PKR 10,000                     |
| Method            | RAAST/JazzCash               | RAAST/JazzCash                 |
| Account           | 03002027977                  | 03002027977                    |
| Email             | info@internationalrishta.com | bureau@internationalrishta.com |
| Verification Time | 24 hours                     | 24-48 hours                    |
| Table             | profiles                     | marriage_bureaus               |
| Status Field      | payment_status               | status                         |
| Activation Field  | account_active               | verified                       |

---

**Status:** Ready for testing!  
**Next:** Run SQL migrations and test signup flow.
