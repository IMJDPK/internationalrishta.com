### Bureau Registration & Payment Approval Process

## Overview

Marriage bureaus can register through the website. After registration, they must make a payment to activate their account. Admin manually verifies payment and approves the bureau.

## Setup Steps

### 1. Update Database Schema

Run this SQL in **Supabase → SQL Editor**:

```sql
-- Run the bureau-approval-migration.sql file
```

Then execute: `supabase/bureau-approval-migration.sql`

### 2. Payment Details

**Payment Method:** JazzCash  
**Account:** 03002027977  
**Account Name:** Jawad Khalid Khan  
**Amount:** PKR 10,000 (Registration Fee)

### 3. Registration Flow

**Step 1: Bureau Fills Form**

- Visit: `/en/bureau/register` or `/ur/bureau/register`
- Fill all details (name, city, address, license, etc.)
- Submit → Status: `pending`

**Step 2: Auto-Notification Email**

- Email sent to: `bureau@internationalrishta.com`
- Contains: Bureau name, owner, city, phone, registration time
- Bureau receives confirmation email with payment instructions

**Step 3: Payment Instructions Shown**

- After registration, bureau sees payment page
- Shows: JazzCash account (03002027977 - Jawad Khalid Khan)
- Bureau uploads payment screenshot/receipt

**Step 4: Manual Verification (Admin)**

- Admin receives email notification
- Admin logs into Supabase → Database → `marriage_bureaus` table
- Finds the bureau record (status: `payment_pending`)
- Verifies JazzCash payment on phone
- Updates bureau record:
  ```sql
  UPDATE marriage_bureaus
  SET
    status = 'approved',
    verified = true,
    registration_fee_paid = true,
    payment_verified_at = NOW(),
    licensed_at = NOW()
  WHERE id = 'bureau-uuid-here';
  ```

**Step 5: Bureau Activated**

- Bureau can now log in
- Bureau can generate referral codes
- Bureau appears in public directory

### 4. Admin Panel (Simple)

For now, use **Supabase Dashboard**:

1. Go to **Database → Tables → marriage_bureaus**
2. Filter by `status = 'payment_pending'`
3. View payment receipts
4. Manually update status to `approved`

### 5. Email Template

When bureau registers, send this email to `bureau@internationalrishta.com`:

```
Subject: New Bureau Registration - [Bureau Name]

Bureau Details:
- Name: [Bureau Name]
- Owner: [Owner Name]
- City: [City]
- Phone: [Phone]
- Email: [Email]
- Address: [Address]
- License: [License Number]
- Registered: [Date/Time]

Status: Pending Payment

Action Required:
1. Contact bureau to confirm payment
2. Verify JazzCash payment on 03002027977
3. Update bureau status in Supabase to 'approved'

View in Supabase: https://supabase.com/dashboard/project/uwsphgmoqvmehvsfmylh/editor/[bureau-id]
```

### 6. Future Enhancements

- **Admin Dashboard:** Build custom admin panel to approve bureaus
- **Automated Payment:** Integrate JazzCash API for automatic verification
- **Email Service:** Use Resend.com to automate email notifications
- **Payment Webhooks:** Real-time payment notifications

### 7. Current Manual Process

**As Admin:**

1. Check email: bureau@internationalrishta.com
2. Open Supabase Dashboard
3. Go to `marriage_bureaus` table
4. Find pending bureau
5. Verify payment on JazzCash app/account
6. Run SQL:
   ```sql
   UPDATE marriage_bureaus
   SET status = 'approved', verified = true,
       registration_fee_paid = true,
       payment_verified_at = NOW()
   WHERE email = 'bureau_email@example.com';
   ```
7. Bureau is now active!

### 8. Bureau Login After Approval

Once approved, bureau can:

- Log in to `/en/bureau/dashboard` (to be built)
- Generate referral codes
- Track referrals
- View earnings
- Add/manage profiles

---

**Next Steps:**

1. Run `bureau-approval-migration.sql` in Supabase
2. Test bureau registration
3. Verify email notifications work
4. Test payment workflow
5. Build simple admin approval interface (optional)
