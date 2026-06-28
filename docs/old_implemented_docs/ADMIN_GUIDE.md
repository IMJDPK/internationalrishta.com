# Admin Dashboard Guide

## Access the Dashboard

**URL**: `http://localhost:3001/admin/dashboard` (or your production domain)

## First-Time Setup

Before you can access the admin dashboard, you need to add yourself as an admin:

### Step 1: Login to your platform

- Go to your website
- Click "Sign In"
- Login with Google (use your account)

### Step 2: Get your User ID

- After login, open your browser console (F12)
- Run this command:

```javascript
// Get your user ID from Supabase
const supabase = createClient();
const {
  data: { user },
} = await supabase.auth.getUser();
console.log("Your User ID:", user.id);
```

Or go to Supabase Dashboard → Authentication → Users → copy your User ID

### Step 3: Add yourself as admin in Supabase

Go to Supabase Dashboard → SQL Editor and run:

```sql
-- Replace 'YOUR_USER_ID' with your actual ID from Step 2
INSERT INTO admin_users (id, email, role, created_at)
VALUES (
  'YOUR_USER_ID',
  'your-email@gmail.com',
  'super_admin',
  NOW()
);
```

### Step 4: Access the dashboard

- Visit `/admin/dashboard`
- You should now see the admin interface

---

## Dashboard Features

### 1. **Stats Overview**

See at a glance:

- Total users registered
- Active users (payment verified)
- Pending payments
- Total bureaus
- Pending bureau approvals

### 2. **User Approvals Tab**

Shows all users awaiting payment verification:

**User Information Displayed:**

- Full name
- Email address
- Phone number
- Subscription plan (referral/direct)
- Registration date
- Expected payment amount (PKR 3,999 or 4,999)
- Payment status (pending/payment_sent)

**Actions:**

- **✓ Approve**: Activates user account immediately

  - Sets `payment_status = 'verified'`
  - Sets `account_active = true`
  - Records `payment_verified_at` timestamp
  - User can now access full platform features

- **✗ Reject**: Marks payment as failed
  - Sets `payment_status = 'failed'`
  - User remains inactive
  - You can manually contact them about re-payment

### 3. **Bureau Approvals Tab**

Shows all bureaus awaiting approval:

**Bureau Information Displayed:**

- Bureau name
- City/location
- Contact phone
- Email address
- License number
- Physical address
- Registration fee (PKR 10,000)
- Status (pending/payment_pending)

**Actions:**

- **✓ Approve**: Activates bureau

  - Sets `status = 'approved'`
  - Sets `verified = true`
  - Sets `registration_fee_paid = true`
  - Records verification and licensing timestamps
  - Bureau appears in public directory

- **✗ Reject**: Rejects bureau application
  - Sets `status = 'rejected'`
  - Bureau won't appear in directory
  - You can manually contact them with reason

---

## Daily Admin Workflow

### Morning Routine (Check Payments)

1. **Check Email** (`info@internationalrishta.com`)

   - Look for payment confirmation emails
   - Note: Transaction ID, amount, sender name

2. **Check WhatsApp** (03002027977)

   - Review payment screenshots
   - Verify JazzCash/RAAST transaction details

3. **Login to Admin Dashboard**

   - Visit `/admin/dashboard`
   - Click "Pending Users" tab

4. **Verify & Approve**
   - Match email/WhatsApp details with pending users
   - Verify payment amount matches subscription tier
   - Click "✓ Approve" to activate user
   - User receives instant access

### Weekly Routine (Bureau Approvals)

1. **Check Bureau Email** (`bureau@internationalrishta.com`)

   - Review new bureau registration requests
   - Verify license documents attached

2. **Login to Admin Dashboard**

   - Click "Pending Bureaus" tab

3. **Review Bureau Details**

   - Verify license number authenticity
   - Check if address/phone is legitimate
   - Google the bureau name to verify reputation

4. **Check Payment**

   - Confirm PKR 10,000 payment received via JazzCash/RAAST
   - Match transaction with bureau application

5. **Approve or Reject**
   - Click "✓ Approve" if everything checks out
   - Bureau immediately appears in public directory
   - Or click "✗ Reject" with reason sent via email

---

## Manual Verification Checklist

### For User Payments

- [ ] Email received at info@internationalrishta.com
- [ ] WhatsApp message/screenshot received
- [ ] Transaction ID matches JazzCash/RAAST records
- [ ] Amount is PKR 3,999 (referral) or PKR 4,999 (direct)
- [ ] User exists in "Pending Users" list
- [ ] Email matches user account email

### For Bureau Payments

- [ ] Email received at bureau@internationalrishta.com
- [ ] License documents attached and verified
- [ ] Payment of PKR 10,000 confirmed
- [ ] Bureau details look legitimate
- [ ] Address and phone verified via Google
- [ ] No duplicate bureau in same city

---

## Troubleshooting

### Can't access dashboard?

**Error**: "Access Denied: You are not authorized"

**Solution**:

- Ensure you ran the SQL command to add yourself as admin
- Check your user ID is correct in admin_users table
- Logout and login again
- Clear browser cache/cookies

### Approve button not working?

**Solution**:

- Check browser console for errors (F12)
- Verify internet connection
- Refresh the page and try again
- Check Supabase connection is active

### User still can't access after approval?

**Solution**:

- User should logout and login again
- Check in Supabase: profiles table → verify `account_active = true`
- Verify `payment_status = 'verified'`
- Ask user to clear browser cache

### Bureau not showing in directory?

**Solution**:

- Check bureau status is 'approved' not 'pending'
- Verify `verified = true` in marriage_bureaus table
- Check if bureau's city has license slots available
- Refresh the bureau directory page

---

## Security Best Practices

1. **Never share admin credentials**

   - Only add trusted team members to admin_users table
   - Each admin should have their own Google account

2. **Verify payments before approval**

   - Always cross-check with JazzCash/RAAST records
   - Don't approve based on screenshots alone
   - Verify transaction IDs are real

3. **Keep records**

   - Screenshot payment confirmations
   - Save bureau license documents
   - Document rejection reasons

4. **Regular audits**
   - Weekly: Review all active users
   - Monthly: Audit bureau listings
   - Check for duplicate accounts/fraudulent activity

---

## Quick Reference

| Action              | Location                          | Time Expected |
| ------------------- | --------------------------------- | ------------- |
| Verify user payment | Admin Dashboard → Pending Users   | 1-2 minutes   |
| Approve user        | Click ✓ Approve button            | Instant       |
| Reject payment      | Click ✗ Reject button             | Instant       |
| Approve bureau      | Admin Dashboard → Pending Bureaus | 5-10 minutes  |
| Add new admin       | Supabase SQL Editor               | 1 minute      |

---

## Future Enhancements

### Phase 2 (Automated Notifications)

- Email sent automatically when user approved
- SMS notifications for bureau approvals
- Rejection emails with reasons

### Phase 3 (Payment API Integration)

- Auto-verify JazzCash payments via API
- Real-time payment status updates
- Reduce manual verification to 10%

### Phase 4 (Advanced Admin Features)

- Bulk approve/reject
- Search and filter users
- Export payment reports
- Analytics dashboard
- Revenue tracking

---

## Support

**For technical issues:**

- Check this guide first
- Review Supabase logs
- Contact platform developer

**For payment disputes:**

- Contact user via email/phone
- Request payment proof
- Verify with JazzCash support

**For bureau complaints:**

- Review bureau profile
- Contact bureau directly
- Option to suspend/remove bureau license
