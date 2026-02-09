# International Rishta - Launch Guide

**Domain:** internationalrishta.com  
**Payment:** RAAST via JazzCash (03002027977) - Jawad Khalid Khan  
**Date:** January 3, 2026

---

## 🚀 Quick Deploy Commands (TL;DR)

If you already have everything set up, here's the fast track:

```bash
# 1. Ensure you're on latest main branch
git add .
git commit -m "Production ready"
git push origin main

# 2. Deploy to Vercel (first time)
# Just connect GitHub repo at vercel.com, it auto-deploys

# 3. Check deployment
# Visit: https://internationalrishta.com
```

**Prerequisites before quick deploy:**

- ✅ Supabase project created with schema deployed
- ✅ Environment variables set in Vercel dashboard
- ✅ Domain DNS pointing to Vercel
- ✅ Auth redirect URLs configured in Supabase

**First time?** Follow the detailed guide below ⬇️

---

## 🚀 Phase 1: Environment & Infrastructure Setup

### Step 1.1: Configure `.env.local` (Local Development)

Create `.env.local` in project root (git-ignored):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Daily.co (Video Calls)
NEXT_PUBLIC_DAILY_API_KEY=0e11919686e89e5720f0b76083c804634ebe069749b2dc58128482f3500b1d7b
NEXT_PUBLIC_DAILY_DOMAIN=internationalrishta.daily.co

# RAAST Payment Gateway
NEXT_PUBLIC_RAAST_MERCHANT_ID=your_merchant_id
NEXT_PUBLIC_RAAST_API_KEY=your_api_key
RAAST_WEBHOOK_SECRET=your_webhook_secret

# Email (Resend.com or SendGrid)
RESEND_API_KEY=your_resend_key

# App Config
NEXT_PUBLIC_APP_URL=https://internationalrishta.com
NODE_ENV=development
```

**✅ Action:** Fill in these values as you set up each service below.

---

### Step 1.2: Set Up Supabase Project

1. **Go to:** https://supabase.com → Sign up / Login
2. **Create new project:**
   - Name: `international-rishta-prod`
   - Region: Choose closest to Pakistan (Singapore or India)
   - Password: Store securely
3. **Get credentials:**
   - Go to Settings → API → Copy `Project URL` and `anon key`
   - Paste into `.env.local`

4. **Deploy schema:**

   ```bash
   # In supabase/schema.sql, copy entire content
   # Go to Supabase Dashboard → SQL Editor → New Query
   # Paste schema.sql content and run
   ```

5. **Enable Auth providers:**
   - Dashboard → Authentication → Providers

- Enable: Google OAuth
   - Add redirect URL: `https://internationalrishta.com/en/auth/callback`

**✅ Action:** Test local auth flow with `npm run dev` on signup page.

---

### Step 1.3: Set Up Daily.co

1. **Already done:** You have API key `0e11919686e89e5720f0b76083c804634ebe069749b2dc58128482f3500b1d7b`
2. **Verify subdomain:** internationalrishta.daily.co (from setup screen)
3. **Add to `.env.local`:**
   ```env
   NEXT_PUBLIC_DAILY_API_KEY=0e11919686e89e5720f0b76083c804634ebe069749b2dc58128482f3500b1d7b
   NEXT_PUBLIC_DAILY_DOMAIN=internationalrishta.daily.co
   ```

**✅ Action:** Test video call UI on Messages page (currently mock, will wire to Daily SDK next).

---

## 🏦 Phase 2: Payment Integration (RAAST/JazzCash)

### Step 2.1: Register with RAAST

1. **Contact:** RAAST (Pakistani payment gateway)
   - Website: https://raast.npl.org.pk/ (or check with JazzCash partner)
   - Account setup: Provide business details + Jawad Khalid Khan info
   - Get: Merchant ID, API Key, Webhook secret

2. **Store in `.env.local`:**
   ```env
   NEXT_PUBLIC_RAAST_MERCHANT_ID=your_merchant_id
   NEXT_PUBLIC_RAAST_API_KEY=your_api_key
   RAAST_WEBHOOK_SECRET=your_webhook_secret
   ```

### Step 2.2: Implement Payment Processing

**Create payment helper** (`src/lib/raast.ts`):

```typescript
export async function initiateRaastPayment({
  amount: number,
  description: string,
  userId: string,
  paymentType: 'subscription' | 'bureau_registration' | 'verification'
}) {
  // Call RAAST API to create payment request
  // Return: payment link / QR code for user
}

export async function verifyRaastWebhook(signature: string, body: any) {
  // Verify webhook signature using RAAST_WEBHOOK_SECRET
  // Update user subscription / bureau status in Supabase
}
```

**Update signup flow:**

- After plan selection → redirect to RAAST payment
- On success → auto-create subscription in Supabase
- Email confirmation sent

**Update bureau registration:**

- Step 3 → RAAST QR/link for PKR 20,000 + PKR 200,000
- Webhook updates `bureaus` table status to "pending_review"
- Admin can see pending applications

**✅ Action:** Set up RAAST merchant account and get credentials.

---

## 📧 Phase 3: Email Notifications

### Step 3.1: Choose Email Provider

**Option A: Resend.com (Recommended)**

```bash
npm install resend
```

**Option B: SendGrid**

```bash
npm install @sendgrid/mail
```

### Step 3.2: Create Email Templates

**Create** `src/lib/emails.ts`:

```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email: string, name: string) {
  await resend.emails.send({
    from: "noreply@internationalrishta.com",
    to: email,
    subject: "Welcome to International Rishta",
    html: `<h1>Welcome ${name}!</h1><p>Your 2-day trial starts now.</p>`,
  });
}

export async function sendBureauApprovalEmail(
  bureauEmail: string,
  code: string,
) {
  await resend.emails.send({
    from: "partners@internationalrishta.com",
    to: bureauEmail,
    subject: "Bureau Registration Received",
    html: `<h1>Thank you!</h1><p>Your referral code: <strong>${code}</strong></p><p>We'll review in 14 days.</p>`,
  });
}

export async function sendPaymentConfirmation(
  email: string,
  reference: string,
  amount: number,
) {
  await resend.emails.send({
    from: "payments@internationalrishta.com",
    to: email,
    subject: `Payment Confirmed - PKR ${amount}`,
    html: `<h1>Payment Received</h1><p>Reference: ${reference}</p>`,
  });
}
```

**✅ Action:** Set up Resend account (free tier available) and get API key.

---

## 🔗 Phase 4: Domain & Deployment (Vercel + Supabase)

### Step 4.1: Prepare Your Supabase Project for Production

1. **Go to Supabase Dashboard:** https://supabase.com/dashboard
   - Select your project or create a new one: `international-rishta-prod`
   - Region: Choose closest to Pakistan (Singapore recommended)

2. **Get Production Credentials:**
   - Go to **Settings → API**
   - Copy:
     - `Project URL` (looks like: `https://xxxxx.supabase.co`)
     - `anon public` key
     - `service_role` key (⚠️ Keep this secret!)
   - Save these for Vercel env setup

3. **Deploy Database Schema:**
   - Go to **SQL Editor** in Supabase Dashboard
   - Click **New Query**
   - Open `supabase/schema.sql` from your project
   - Copy entire content and paste into query editor
   - Click **Run** to create all tables, functions, and policies

4. **Configure Authentication:**
   - Go to **Authentication → URL Configuration**
   - Set **Site URL:** `https://internationalrishta.com`
   - Add **Redirect URLs:**
     - `https://internationalrishta.com/en/auth/callback`
     - `https://internationalrishta.com/ur/auth/callback`
     - `https://internationalrishta.com/**` (wildcard for all routes)
5. **Enable Auth Providers:**
   - Go to **Authentication → Providers**
   - Enable **Email** (already enabled by default)
   - Enable **Google OAuth:**
     - Get credentials from [Google Cloud Console](https://console.cloud.google.com)
     - Create OAuth 2.0 Client ID
     - Authorized redirect URI: Use the callback URL from Supabase
     - Add Client ID and Secret in Supabase

6. **Configure Storage (for profile photos):**
   - Go to **Storage**
   - Create bucket: `profile-photos` (public)
   - Create bucket: `verification-docs` (private, RLS protected)

---

### Step 4.2: Deploy to Vercel

**A. Connect Repository to Vercel**

1. **Push your code to GitHub** (if not already):

   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

2. **Go to Vercel:** https://vercel.com
   - Sign up / Login (use GitHub account for easy connection)
   - Click **Add New... → Project**
   - Import your repository: `internationalrishta.com`
   - Vercel will auto-detect Next.js

3. **Configure Build Settings:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)
   - Click **Deploy** (will fail first time - that's OK, we need env vars)

**B. Add Environment Variables in Vercel**

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings → Environment Variables**
3. Add these one by one (Production, Preview, Development):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

NEXT_PUBLIC_DAILY_API_KEY=0e11919686e89e5720f0b76083c804634ebe069749b2dc58128482f3500b1d7b
NEXT_PUBLIC_DAILY_DOMAIN=internationalrishta.daily.co

NEXT_PUBLIC_APP_URL=https://internationalrishta.com
NODE_ENV=production
```

**Optional (add when ready):**

```env
NEXT_PUBLIC_RAAST_MERCHANT_ID=your_merchant_id
NEXT_PUBLIC_RAAST_API_KEY=your_api_key
RAAST_WEBHOOK_SECRET=your_webhook_secret
RESEND_API_KEY=your_resend_api_key
```

4. **Redeploy:**
   - Go to **Deployments** tab
   - Click ⋯ on latest deployment → **Redeploy**
   - Or push a new commit to trigger auto-deployment

---

### Step 4.3: Configure Custom Domain (internationalrishta.com)

1. **Add Domain in Vercel:**
   - Go to **Settings → Domains**
   - Enter: `internationalrishta.com`
   - Click **Add**

2. **Configure DNS (at your domain registrar):**

   Vercel will show you DNS records to add. You'll need:

   **Option A: Using CNAME (Recommended if allowed):**

   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

   **Option B: Using A Record:**

   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   ```

3. **Add www subdomain (optional):**

   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

4. **Wait for DNS propagation:**
   - Usually takes 5-30 minutes
   - Check status in Vercel Domains tab
   - Once verified, Vercel auto-provisions SSL certificate

---

### Step 4.4: Post-Deployment Verification

**1. Test Your Site:**

- Visit: `https://internationalrishta.com`
- Check both locales: `/en` and `/ur`
- Verify RTL layout in Urdu
- Test navigation between pages

**2. Verify Supabase Connection:**

- Open browser console (F12)
- Try signing up with test email
- Check Supabase Dashboard → Authentication → Users
- Verify user was created

**3. Check Vercel Deployment:**

- Go to **Vercel Dashboard → Analytics**
- Monitor for errors in **Real-time Logs**
- Check build logs if issues occur

**4. Test from Different Devices:**

- Mobile (Android/iOS)
- Desktop browsers (Chrome, Safari, Firefox)
- Verify responsive design

---

### Step 4.5: Common Issues & Fixes

**Issue: Site shows 404 or doesn't load**

- Check DNS propagation: https://dnschecker.org
- Verify domain is added in Vercel
- Check deployment status (should be green checkmark)

**Issue: Auth not working**

- Verify `NEXT_PUBLIC_APP_URL` matches your domain
- Check Supabase redirect URLs include your domain
- Ensure all env vars are set in Vercel

**Issue: Build fails**

- Check Vercel build logs
- Verify no TypeScript errors: `npm run build` locally
- Ensure all dependencies in package.json

**Issue: Environment variables not working**

- All `NEXT_PUBLIC_*` vars must be set before build
- Redeploy after adding env vars
- Check variable names match exactly (case-sensitive)

---

### Step 4.6: Enable Production Monitoring (Optional)

1. **Vercel Analytics:**
   - Already enabled by default
   - View in Dashboard → Analytics tab

2. **Error Tracking (Sentry):**

   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```

   - Add `SENTRY_DSN` to Vercel env vars

3. **Supabase Logs:**
   - Dashboard → Logs
   - Monitor database queries, auth events
   - Set up alerts for errors

---

## 🧪 Phase 5: Testing Checklist

### Frontend Testing

- [ ] Homepage loads (en/ur)
- [ ] Navigation switches locales
- [ ] Discover page swipe works
- [ ] Pricing page shows plans
- [ ] Bureau page + registration form works
- [ ] All legal pages render (privacy, terms, etc.)
- [ ] RTL layout correct in Urdu

### Auth Testing

- [ ] Google signup works
- [ ] Email signup validation
- [ ] Password strength indicator
- [ ] Phone formatting (03XX-XXXXXXX)
- [ ] Signin redirects to discover
- [ ] Trial plan auto-selected

### Payment Testing (Sandbox)

- [ ] RAAST sandbox payment link generates
- [ ] User redirected to payment
- [ ] Webhook receives success
- [ ] Subscription created in Supabase
- [ ] Email confirmation sent

### Bureau Testing

- [ ] Registration form 3-step flow
- [ ] File upload for payment proof
- [ ] CNIC auto-formatting
- [ ] RAAST payment for PKR 220K
- [ ] Bureau entry in "pending_review"
- [ ] Referral code email sent

---

## 📋 Phase 6: Go-Live Checklist

### Before Launch

- [ ] All environment variables set
- [ ] Supabase schema deployed
- [ ] RAAST merchant account active
- [ ] Resend email sender verified
- [ ] Domain pointing to hosting
- [ ] SSL certificate active (https://)
- [ ] Test payment flow end-to-end
- [ ] Smoke test all pages

### Launch Day

- [ ] Monitor error logs
- [ ] Check email delivery (Resend)
- [ ] Verify payment webhook
- [ ] Test signup as new user
- [ ] Confirm bureau registration works
- [ ] Monitor Supabase usage

### Post-Launch (Week 1)

- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Enable analytics (Vercel, Google Analytics)
- [ ] Create admin dashboard for approvals
- [ ] Backup Supabase daily
- [ ] Document support process

---

## 📞 Key Contacts & Credentials

| Service  | Contact                      | Status             |
| -------- | ---------------------------- | ------------------ |
| Domain   | internationalrishta.com      | ✅ Ready           |
| Payment  | RAAST/JazzCash - 03002027977 | ⏳ Pending setup   |
| Supabase | https://supabase.com         | ⏳ Pending setup   |
| Daily.co | Video subdomain              | ✅ Ready           |
| Email    | Resend.com                   | ⏳ Pending setup   |
| Hosting  | Vercel OR cPanel             | ⏳ Choose & deploy |

---

## 🚨 Critical Path to Launch

1. **Week 1:** Supabase + RAAST setup + Email provider
2. **Week 2:** Wire payment integration + test end-to-end
3. **Week 3:** Deploy to production + domain setup
4. **Week 4:** Final testing + go-live

**Ready?** Let me know which step you'd like to start with!
