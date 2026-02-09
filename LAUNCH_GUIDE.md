# International Rishta - Launch Guide

**Domain:** hosterpk.com  
**Payment:** RAAST via JazzCash (03002027977) - Jawad Khalid Khan  
**Date:** January 3, 2026

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
NEXT_PUBLIC_APP_URL=http://localhost:3000
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
   - Add redirect URL: `http://localhost:3000/en/auth/callback`
   - Later (production): `https://hosterpk.com/en/auth/callback`

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
    from: "noreply@hosterpk.com",
    to: email,
    subject: "Welcome to International Rishta",
    html: `<h1>Welcome ${name}!</h1><p>Your 2-day trial starts now.</p>`,
  });
}

export async function sendBureauApprovalEmail(
  bureauEmail: string,
  code: string
) {
  await resend.emails.send({
    from: "partners@hosterpk.com",
    to: bureauEmail,
    subject: "Bureau Registration Received",
    html: `<h1>Thank you!</h1><p>Your referral code: <strong>${code}</strong></p><p>We'll review in 14 days.</p>`,
  });
}

export async function sendPaymentConfirmation(
  email: string,
  reference: string,
  amount: number
) {
  await resend.emails.send({
    from: "payments@hosterpk.com",
    to: email,
    subject: `Payment Confirmed - PKR ${amount}`,
    html: `<h1>Payment Received</h1><p>Reference: ${reference}</p>`,
  });
}
```

**✅ Action:** Set up Resend account (free tier available) and get API key.

---

## 🔗 Phase 4: Domain & Deployment

### Step 4.1: Point Domain to Hosting

You're using **hosterpk.com** on cPanel.

**Option A: Deploy on Vercel (Recommended)**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add domain: hosterpk.com → Vercel dashboard
```

**Option B: Deploy on cPanel (SSH/Node.js)**

```bash
# Build app
npm run build

# Push to cPanel via cPanel file manager or git
# Ensure Node.js installed on cPanel
# Start with: pm2 start next start -p 3000
```

**Choose one and complete.**

### Step 4.2: Update Environment Variables (Production)

Go to hosting dashboard and add:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_DAILY_API_KEY=...
NEXT_PUBLIC_DAILY_DOMAIN=...
NEXT_PUBLIC_RAAST_MERCHANT_ID=...
NEXT_PUBLIC_RAAST_API_KEY=...
RAAST_WEBHOOK_SECRET=...
RESEND_API_KEY=...
NEXT_PUBLIC_APP_URL=https://hosterpk.com
NODE_ENV=production
```

### Step 4.3: Configure Supabase for Production

Update auth callback URL:

```
https://hosterpk.com/en/auth/callback
https://hosterpk.com/ur/auth/callback
```

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
| Domain   | hosterpk.com (cPanel)        | ✅ Ready           |
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
