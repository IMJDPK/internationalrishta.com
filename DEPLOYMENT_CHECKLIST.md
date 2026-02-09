# 🚀 Deployment Checklist - International Rishta

## Pre-Deployment Setup

### 1. Supabase Setup

- [ ] Create Supabase project (https://supabase.com)
- [ ] Copy Project URL and anon key
- [ ] Copy service_role key (keep secret!)
- [ ] Run schema.sql in SQL Editor
- [ ] Configure Auth redirect URLs:
  - [ ] `https://internationalrishta.com/en/auth/callback`
  - [ ] `https://internationalrishta.com/ur/auth/callback`
- [ ] Set Site URL to `https://internationalrishta.com`
- [ ] Enable Google OAuth (optional)
- [ ] Create storage buckets:
  - [ ] `profile-photos` (public)
  - [ ] `verification-docs` (private)

### 2. GitHub Repository

- [ ] Code pushed to GitHub
- [ ] Main branch is production-ready
- [ ] No sensitive data in repo (check .env.local is in .gitignore)

### 3. Environment Variables Ready

Copy these values (you'll paste them in Vercel):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
NEXT_PUBLIC_DAILY_API_KEY=0e11919686e89e5720f0b76083c804634ebe069749b2dc58128482f3500b1d7b
NEXT_PUBLIC_DAILY_DOMAIN=internationalrishta.daily.co
NEXT_PUBLIC_APP_URL=https://internationalrishta.com
NODE_ENV=production
```

---

## Vercel Deployment

### 4. Connect to Vercel

- [ ] Go to https://vercel.com
- [ ] Sign up/login with GitHub
- [ ] Click "Add New... → Project"
- [ ] Import your GitHub repository
- [ ] Select `internationalrishta.com` repo

### 5. Configure Project

- [ ] Framework: Next.js (auto-detected)
- [ ] Build command: `npm run build` (default)
- [ ] Output directory: `.next` (default)
- [ ] Click "Deploy" (will fail - expected)

### 6. Add Environment Variables

- [ ] Go to Settings → Environment Variables
- [ ] Add all variables from step 3
- [ ] Select: Production, Preview, Development for each
- [ ] Click "Redeploy" from Deployments tab

### 7. Domain Configuration

- [ ] Go to Settings → Domains
- [ ] Add `internationalrishta.com`
- [ ] Copy DNS records shown by Vercel

### 8. Update DNS (at your domain registrar)

- [ ] Add CNAME record: `@ → cname.vercel-dns.com`
  - OR A record: `@ → 76.76.21.21`
- [ ] Add CNAME for www: `www → cname.vercel-dns.com`
- [ ] Wait 5-30 minutes for propagation
- [ ] Check DNS: https://dnschecker.org

### 9. Verify SSL Certificate

- [ ] Wait for green checkmark in Vercel Domains tab
- [ ] Visit `https://internationalrishta.com` (should show padlock)

---

## Post-Deployment Testing

### 10. Smoke Tests

- [ ] Homepage loads: `https://internationalrishta.com`
- [ ] English version: `https://internationalrishta.com/en`
- [ ] Urdu version: `https://internationalrishta.com/ur`
- [ ] RTL layout works in Urdu
- [ ] Navigation menu works
- [ ] All pages accessible:
  - [ ] Discover
  - [ ] Pricing
  - [ ] Bureau
  - [ ] About
  - [ ] Privacy Policy
  - [ ] Terms of Service

### 11. Authentication Test

- [ ] Go to signup page
- [ ] Open browser console (F12)
- [ ] Create test account with your email
- [ ] Check for errors in console
- [ ] Verify user appears in Supabase Dashboard → Auth → Users

### 12. Mobile Testing

- [ ] Open on mobile browser
- [ ] Test navigation
- [ ] Check responsive design
- [ ] Verify forms work

### 13. Performance Check

- [ ] Run Lighthouse in Chrome DevTools
- [ ] Target scores:
  - [ ] Performance: >80
  - [ ] Accessibility: >90
  - [ ] Best Practices: >90
  - [ ] SEO: >90

---

## Monitoring Setup

### 14. Vercel Analytics

- [ ] Already enabled by default
- [ ] Check Dashboard → Analytics tab
- [ ] Monitor real-time visitors

### 15. Error Tracking

- [ ] Check Vercel → Deployments → Functions tab
- [ ] Monitor for errors
- [ ] Set up Sentry (optional):
  ```bash
  npm install @sentry/nextjs
  npx @sentry/wizard@latest -i nextjs
  ```

### 16. Supabase Monitoring

- [ ] Go to Supabase Dashboard → Logs
- [ ] Check API logs
- [ ] Monitor Auth logs
- [ ] Set up email alerts for errors

---

## Common Issues & Solutions

### Site Not Loading

✅ **Solution:**

1. Check DNS propagation: https://dnschecker.org
2. Verify domain added in Vercel Domains tab
3. Check deployment status (should be green checkmark)
4. Clear browser cache or try incognito mode

### Build Failed

✅ **Solution:**

1. Check Vercel build logs
2. Test build locally: `npm run build`
3. Fix TypeScript/ESLint errors
4. Redeploy

### Auth Not Working

✅ **Solution:**

1. Verify `NEXT_PUBLIC_APP_URL=https://internationalrishta.com`
2. Check Supabase redirect URLs match domain
3. Ensure anon key is correct
4. Check browser console for errors

### Environment Variables Not Working

✅ **Solution:**

1. Verify all `NEXT_PUBLIC_*` variables are set
2. Check variable names (case-sensitive)
3. Redeploy after adding variables
4. Clear Vercel cache: Deployments → Redeploy

---

## Success Criteria ✨

You're live when all these are ✅:

- [ ] `https://internationalrishta.com` loads without errors
- [ ] SSL certificate active (green padlock)
- [ ] Both `/en` and `/ur` routes work
- [ ] Can create a new account
- [ ] User appears in Supabase database
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Vercel Analytics showing visitors

---

## Next Steps After Launch

### Week 1

- [ ] Monitor error logs daily
- [ ] Test all user flows
- [ ] Set up backup schedule for Supabase
- [ ] Document any issues

### Week 2

- [ ] Integrate payment gateway (RAAST)
- [ ] Test payment flow end-to-end
- [ ] Set up email notifications
- [ ] Create admin dashboard access

### Week 3

- [ ] Launch marketing campaign
- [ ] Monitor user registrations
- [ ] Collect feedback
- [ ] Fix any bugs

---

## Emergency Contacts

| Issue            | Action                              |
| ---------------- | ----------------------------------- |
| Site down        | Check Vercel status page, check DNS |
| Build fails      | Check build logs in Vercel          |
| Database errors  | Check Supabase logs and status      |
| Auth not working | Verify environment variables        |
| Domain issues    | Contact domain registrar support    |

---

**Questions?** Check the detailed [LAUNCH_GUIDE.md](./LAUNCH_GUIDE.md) or Vercel/Supabase documentation.

**Ready to deploy?** Start at step 1! 🚀
