# 🎯 Deploy to Production - Quick Start

## Prerequisites

- GitHub account
- Supabase account (free tier OK)
- Vercel account (free tier OK)
- Domain: internationalrishta.com

---

## Step 1: Supabase Setup (10 minutes)

1. **Create Project:**
   - Go to https://supabase.com/dashboard
   - Click "New Project"
   - Name: `international-rishta`
   - Region: Singapore
   - Password: (save this!)

2. **Deploy Database:**
   - SQL Editor → New Query
   - Copy content from `supabase/schema.sql`
   - Paste and click "Run"

3. **Get Credentials:**
   - Settings → API
   - Copy these (save for Vercel):
     - Project URL
     - anon public key
     - service_role key

4. **Configure Auth:**
   - Authentication → URL Configuration
   - Site URL: `https://internationalrishta.com`
   - Redirect URLs: `https://internationalrishta.com/**`

---

## Step 2: Push to GitHub (5 minutes)

```bash
# In your project directory
git add .
git commit -m "Ready for production"
git push origin main
```

---

## Step 3: Deploy to Vercel (5 minutes)

1. **Import Project:**
   - Go to https://vercel.com
   - Click "Add New... → Project"
   - Import your GitHub repo
   - Click "Deploy" (will build but may fail - that's OK)

2. **Add Environment Variables:**
   - Go to Settings → Environment Variables
   - Add each variable below:

```env
NEXT_PUBLIC_SUPABASE_URL=<from Supabase step 3>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from Supabase step 3>
SUPABASE_SERVICE_ROLE_KEY=<from Supabase step 3>
NEXT_PUBLIC_DAILY_API_KEY=0e11919686e89e5720f0b76083c804634ebe069749b2dc58128482f3500b1d7b
NEXT_PUBLIC_DAILY_DOMAIN=internationalrishta.daily.co
NEXT_PUBLIC_APP_URL=https://internationalrishta.com
NODE_ENV=production
```

3. **Redeploy:**
   - Deployments tab → Click "Redeploy"
   - Wait for build to complete (2-3 minutes)

---

## Step 4: Connect Domain (10 minutes)

1. **Add Domain in Vercel:**
   - Settings → Domains
   - Add: `internationalrishta.com`
   - Copy the DNS records shown

2. **Update DNS at Your Registrar:**
   - Go to your domain registrar (where you bought internationalrishta.com)
   - Add CNAME record:
     ```
     Type: CNAME
     Name: @
     Value: cname.vercel-dns.com
     ```
   - Save changes

3. **Wait for DNS:**
   - Usually 5-30 minutes
   - Check status in Vercel Domains tab
   - SSL certificate auto-provisions when ready

---

## Step 5: Test (5 minutes)

1. Visit https://internationalrishta.com
2. Click through pages (English and Urdu)
3. Try signing up with test email
4. Check Supabase Dashboard → Auth → Users

**✅ If you see your user, you're live!**

---

## Troubleshooting

### Build Fails

```bash
# Test locally first
npm run build

# Fix any errors, then
git add .
git commit -m "Fix build errors"
git push
```

### Domain Not Loading

- Wait 30 minutes for DNS propagation
- Check https://dnschecker.org
- Try incognito mode (bypass cache)

### Auth Not Working

- Verify `NEXT_PUBLIC_APP_URL` in Vercel env vars
- Check Supabase redirect URLs include your domain
- Check browser console for errors (F12)

---

## Total Time: ~35 minutes

After this, your site is **LIVE** at https://internationalrishta.com 🎉

**Next:**

- Set up payment gateway (RAAST)
- Configure email service (Resend)
- Add monitoring (optional)

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for detailed verification steps.
