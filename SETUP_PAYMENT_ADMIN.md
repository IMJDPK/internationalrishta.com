# 🚀 PAYMENT & ADMIN SYSTEM - SETUP GUIDE

**Complete this in 10 minutes to activate payment verification and admin dashboard!**

---

## ✅ Step 1: Run SQL Migration in Supabase

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select project: `internationalrishta`

2. **Open SQL Editor**
   - Left sidebar → Click "SQL Editor"
   - Click "New query"

3. **Copy & Paste Migration**
   - Open file: `supabase/COMPLETE_PAYMENT_ADMIN_MIGRATION.sql`
   - Copy ALL the contents
   - Paste into Supabase SQL Editor

4. **Run the Migration**
   - Click "Run" button (or Ctrl+Enter)
   - Wait 5-10 seconds
   - ✅ Success message should appear

**What this does:**

- Adds payment tracking to `profiles` table
- Creates `payment_notifications` table
- Creates `admin_users` table
- Adds bureau approval workflow to `marriage_bureaus`
- Creates `bureau_notifications` table
- Sets up all security policies

---

## ✅ Step 2: Make Yourself Admin

### Option A: Using Your Existing Account

1. **Get Your User ID**
   - In Supabase Dashboard → Authentication → Users
   - Find your email (the one you logged in with via Google)
   - Copy your User ID (looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

2. **Add Yourself as Admin**
   - Go back to SQL Editor
   - Run this command (replace `YOUR_USER_ID` with your actual ID):

```sql
INSERT INTO admin_users (id, email, role, created_at)
VALUES (
  'YOUR_USER_ID',
  'your-email@gmail.com',
  'super_admin',
  NOW()
);
```

### Option B: Create New Admin Account

1. **Sign up on your platform**
   - Visit: http://localhost:3001
   - Click "Sign In" → "Sign in with Google"
   - Use email you want for admin access

2. **Get the new User ID**
   - Follow Option A, Step 1 above

3. **Add as admin**
   - Follow Option A, Step 2 above

---

## ✅ Step 3: Access Admin Dashboard

1. **Visit Admin Dashboard**
   - URL: `http://localhost:3001/admin/dashboard`
   - Or: `https://yourdomain.com/admin/dashboard`

2. **Verify Access**
   - You should see the admin interface with stats
   - If you get "Access Denied" → re-check Step 2

---

## ✅ Step 4: Test Payment Flow (Users)

1. **Create Test User**
   - Open incognito/private browser window
   - Visit: `http://localhost:3001`
   - Click "Get Started" → Sign up with Google (different email)

2. **Check Payment Instructions**
   - After signup, you'll be redirected to `/payment-instructions`
   - Verify it shows:
     - ✅ Payment amount (PKR 3,999 or 4,999)
     - ✅ Phone number (03002027977)
     - ✅ Email (info@internationalrishta.com)
     - ✅ WhatsApp link
     - ✅ 3-step process

3. **Simulate Payment**
   - Note: You don't need to actually pay in testing
   - Just send yourself a test email to info@internationalrishta.com

4. **Approve in Admin Dashboard**
   - Go back to admin dashboard
   - Click "Pending Users" tab
   - You should see your test user
   - Click "✓ Approve" button
   - User is now activated!

5. **Verify User Access**
   - Go back to test user's browser window
   - Logout and login again
   - Should now have full access to platform

---

## ✅ Step 5: Test Bureau Flow (Optional)

1. **Create Bureau Application**
   - Visit: `/bureau`
   - Click "Register Your Bureau"
   - Fill out form with test data
   - Submit application

2. **Check Admin Dashboard**
   - Go to admin dashboard
   - Click "Pending Bureaus" tab
   - Verify your test bureau appears

3. **Approve Bureau**
   - Click "✓ Approve" button
   - Bureau should now appear in public directory

---

## 🎯 Quick Verification Checklist

After completing all steps, verify:

- [ ] SQL migration ran successfully (no errors)
- [ ] You can access `/admin/dashboard` without "Access Denied"
- [ ] Dashboard shows stats (even if all zeros)
- [ ] Test user signup redirects to payment-instructions page
- [ ] Test user appears in "Pending Users" tab
- [ ] Approve button works and activates user
- [ ] Approved user can access profile/discover pages

---

## 🚨 Troubleshooting

### "Error: relation 'admin_users' does not exist"

**Solution**: SQL migration didn't run completely

- Go back to Step 1
- Re-run the entire migration file
- Check for any red error messages

### "Access Denied" on admin dashboard

**Solution**: You're not in admin_users table

- Verify you ran the INSERT command in Step 2
- Check your User ID is correct
- Try in Supabase: `SELECT * FROM admin_users;` to see if you're there

### Test user not appearing in "Pending Users"

**Solution**: Profile not created properly

- Check in Supabase → Table Editor → profiles
- Verify user exists with `payment_status = 'pending'`
- Try refreshing admin dashboard

### Approve button doesn't work

**Solution**: RLS policy issue

- Check browser console (F12) for errors
- Verify admin policies created in Step 1
- Logout and login again to admin account

---

## 📱 Production Deployment

### Before Going Live:

1. **Update payment-instructions page**
   - Change localhost URLs to your domain
   - Verify phone/email are correct (03002027977, info@internationalrishta.com)

2. **Set up email forwarding**
   - Configure info@internationalrishta.com to forward to your Gmail
   - Configure bureau@internationalrishta.com similarly

3. **Test with real payment**
   - Have a friend sign up
   - Ask them to pay PKR 100 as test
   - Verify you receive JazzCash notification
   - Approve them in dashboard
   - Refund the PKR 100

4. **Add team members as admins**
   - For each person, get their User ID after they sign up
   - Run: `INSERT INTO admin_users...` with their details
   - They can now access admin dashboard

---

## 🔐 Security Notes

- Only add trusted people to `admin_users` table
- Never share admin credentials publicly
- Regularly audit admin_users table
- Keep payment verification strict (verify actual JazzCash transactions)
- Screenshot all payment confirmations for records

---

## 📊 Daily Admin Workflow

**Every Morning:**

1. Check email (info@internationalrishta.com) for payment confirmations
2. Check WhatsApp (03002027977) for payment screenshots
3. Login to admin dashboard
4. Review "Pending Users" tab
5. Verify payments with JazzCash/RAAST records
6. Click "✓ Approve" for verified payments
7. Click "✗ Reject" for invalid/suspicious payments

**Weekly:**

1. Review "Pending Bureaus" tab
2. Verify bureau license documents
3. Check bureau payment (PKR 10,000)
4. Approve legitimate bureaus
5. Audit approved bureaus list for quality

---

## ✅ Setup Complete!

You now have:

- ✅ Payment tracking for users
- ✅ Bureau approval workflow
- ✅ Admin dashboard with one-click approvals
- ✅ Manual verification system
- ✅ Security policies in place

**Next Steps:**

- Test the complete flow with real accounts
- Deploy to production (internationalrishta.com)
- Start accepting real payments!

**Need help?** Review `ADMIN_GUIDE.md` for detailed usage instructions.
