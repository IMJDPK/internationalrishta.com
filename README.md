# International Rishta — MVP Blueprint

A beginner-friendly, step-by-step plan to build the Pakistan-only matrimonial platform with verified profiles, filters, private messaging, 2‑day preview + demo bot, PKR 3,999 referred vs PKR 4,999 direct subscriptions, weekly bureau payouts, per‑city licensing (20 max), device fingerprinting + single-session, consented location analytics, multilingual (Urdu/English, RTL), and a minimalist UI inspired by Shopify Winter 2026.

---

## 1) Vision & Principles
- Connection, trust, love, culture, destiny
- Patience-led: “Find what lasts, in time.”
- Privacy-first: encrypted messaging, verified identities
- Pakistan launch; global messaging “coming soon”
- Login options: email/phone first; Google OAuth enabled

Assets to use: `assets/logo-golden.png`, `assets/raast-payment.png`, hero videos (`assets/Banner-Video-01-15-21.mp4`, `assets/Banner-Video-07-06-21.mp4`, `assets/Banner-Video-10-24-19.mp4`), and hero banners (`assets/Banner - International RishtaConnecting Hearts Worldwide.png`, `assets/Banner - Meet Your MatchAcross the Globe.png`).

---

## 2) UI/UX Frame (Page Map)
- Landing (Home): Video-backed hero (muted/loop, MP4 assets), value props, pricing, “Pakistan now, global soon”, subscription counter
- How It Works: 4–6 steps from profile → verification → filters → preview → subscribe → match/message/video → optional in‑person verification
- Discover: Filters (sect, biradari, marital status, education, profession, smoking/drinking, relocation, age range, radius), swipe cards, verified badges, boosts
- Messaging: Private threads, read receipts, typing, video unlock progress; “Encrypted & private” microcopy
- Pricing: Direct (PKR 4,999 with perks) vs Bureau referral (PKR 3,999), verification fees
- Bureau: Directory (20 licenses/city), bureau profile, referral code, registration (20k HBL application + 200k registration), dashboard, payouts
- Admin: Applications review, payments verification, cities capacity, analytics (online now, city distribution), payouts, violations, license transfers
- Mobile App parity: Android/iOS screens mirrored from web IA; shared design tokens and components for consistency

Design cues: generous whitespace, organic shapes, golden accents, soft typography hierarchy, subtle motion. Pagination/listing: consistent card grids with numbered pagination or cursor-based “Load more” that mirrors the swipe/list view; keep spacing and typography tokens consistent across sections.

---

## 3) Feature Checklist (MVP Status)
- Platform Setup: Next.js 14 + Tailwind + Shadcn UI + TypeScript — Pending
- Backend: Supabase (Postgres, Auth, Realtime, Storage) — Pending
- i18n/RTL: `next-intl`, locales `/en`, `/ur`, RTL-ready — Pending
- Cities & Licensing: Seed ~38 Pakistani cities, cap=20 per city, waitlist — Pending
- Auth & Onboarding: Email/phone, terms with consented geolocation — Pending
- Verification Docs: ID front/back + face front/side upload & review — Pending
- Preview Mode: 2‑day trial, demo chatbot, limited swipes — Pending
- Filters & Discovery: Comprehensive filters + swipe stack — Pending
- Matching & Messaging: Mutual matches, realtime threads, encrypted-at-rest — Pending
- Points & Video Calls: Progress system, Daily.co integration, unlock rules — Pending
- Pricing & Payments: Direct 4,999 perks; Bureau 3,999 referral & lifetime commission — Pending
- Payment Verification: HBL/Raast proof upload; agent verifies ≤30 minutes — Pending
- Bureau Systems: Registration, directory, referral codes, weekly payouts — Pending
- Admin Dashboards: Applications, payments, capacity, analytics, payouts — Pending
- Security: Device fingerprinting (FingerprintJS), single-session enforcement — Pending
- Analytics: Presence, active users by city/province, subscription counter — Pending

---

## 4) Data Model (Guidance)
Tables (Postgres + RLS):
- `profiles`: user_id, name, dob, gender, bio, photos[], preferences(jsonb), verification_status, trial_ends_at, subscription_active, subscription_price, referred_by_agent_id, last_active, consent_location, location_source, city, province, lat, lon, geohash, device_fingerprint
- `verification_documents`: user_id, id_front_url, id_back_url, face_front_url, face_side_url, status, agent_id, reviewed_at, notes
- `subscriptions`: user_id, status(enum: trial|active|past_due|canceled), is_paid, is_trial, started_at, expires_at, price, source(enum: direct|bureau_referral)
- `messages`: conversation_id, sender_id, recipient_id, content (pgcrypto-encrypted), created_at, read_at, metadata(jsonb)
- `matches`: user1_id, user2_id, status(enum), matched_at
- `conversations`: id, match_id, last_message_at, unread_count_user1, unread_count_user2
- `user_points_history`: user_id, points_change, reason(enum), created_at
- `video_call_unlocks`: user_id, match_id, unlocked_at, points_spent, days_waited
- `payments`: type(enum: application|registration|subscription|verification), amount, method(enum: raast|hbl), proof_url, bank_ref, sender_number, verified_by_agent_id, verified_at
- `cities`: id, name, province, license_cap=20, licenses_issued, applications_enabled
- `bureau_applications`: bureau_name, city_id, status, applied_at, review_due_at(+14d), decision_at, payment_proof_id
- `bureaus`: id, application_id, city_id, license_number, status(enum: active|suspended|revoked|transferred), activated_at
- `agent_referrals`: agent_id, user_id, referral_code, referred_at, commission_rate=0.20, lifetime_commission=true, total_paid
- `weekly_commissions`: agent_id, week_start, week_end, total_amount, payout_status
- `payout_requests`: agent_id, amount, destination, status, requested_at, completed_at
- `agent_violations`: agent_id, violation_type, severity, penalty_amount, resolved_at
- `license_transfers`: license_id, seller_bureau_id, buyer_bureau_id, buyer_price, platform_fee_pct=20, platform_fee_amount, escrow_status
- `stats_total_subscriptions`: paid_active_count, trial_active_count, updated_at

Indexes: profiles by location and activity; messages by conversation+created_at; subscriptions by status+expires_at.

---

## 5) Security, Privacy, Encryption
- Transport: HTTPS/TLS; at-rest encryption on Supabase
- RLS: strict row-level access; users only read/write their own data
- Messages: pgcrypto column encryption for `messages.content`; app-managed keys in server environment
- E2E Path: optional client-side E2E for 1:1 DMs (later); store only metadata; trade-off: no server-side search/moderation of body
- Device Fingerprinting: FingerprintJS to prevent trial abuse; single-session enforcement with session token rotation

---

## 6) Location & Admin Analytics
- Consent-first: Browser Geolocation on login; fallback IP geolocation for city/province
- Store: `consent_location`, `location_source`, `city`, `province`, `geohash` (no raw lat/lon in admin views)
- Presence: Supabase Realtime Presence for “active now”; `last_seen_at` for recent activity
- Subscription Counter: `stats_total_subscriptions` updated by webhook/trigger; public header fetch with 15–60s cache; admin dashboard live updates

---

## 7) Pricing, Payments, Payouts
- Direct Users: PKR 4,999/month; perks — stars/points grants, boosts, faster video unlock, advanced filters, higher quotas, priority support
- Bureau Referral Users: PKR 3,999/month; 20% lifetime commission to bureau (PKR 800/month); platform keeps 80%
- Verification Fees: In-person verification PKR 20,000 total; 80% to bureau; mutual consent required
- Bureau Registration: PKR 20,000 HBL application fee (non-refundable) + PKR 200,000 registration on approval
  - HBL Account: IMJD YOUR DIGITAL MEDIA PARTNER — 50347000837855 (deposit proof upload)
- Weekly Payouts: Mon–Sun cut-off; reconcile Monday; pay Tuesday–Thursday; min threshold (e.g., PKR 2,000); holdback for disputes; failure retries
- Anti-Kickback: Prohibit discounts/cashbacks; penalties escalate from fine to suspension to revocation
- License Transfer Marketplace: Buyer pays price + 20% platform fee; escrow; audit trail; dispute resolution

---

## 8) Marriage Bureau: Licensing & Directory
- Cap: 20 licenses per city (Pakistan-wide initial list ~38 cities)
- Registration: application with docs, 14-day SLA, payment proof, interview, approval; license issued on registration payment
- Directory: searchable bureaus by city; referral codes & QR; users can select bureau; agent dashboard for earnings and payouts

---

## 9) Internationalization (Any Language)
- Library: `next-intl` (App Router) with ICU messages
- Locales: start with `/en`, `/ur`; add more later (RTL-ready)
- Fonts: Noto Nastaliq Urdu (Urdu), Noto Naskh Arabic (Arabic), Inter or Plus Jakarta Sans (Latin)
- CSS/RTL: set `dir` from locale; Tailwind logical utilities (`text-start/end`, `ps-*`, `pe-*`);
- Formatting: `Intl.DateTimeFormat` and `Intl.NumberFormat` (PKR); Urdu numerals via `ur-PK-u-nu-arabext`
- SEO: locale-prefixed routes, canonical + `hreflang`, multilingual sitemap

---

## 10) Implementation Roadmap (Beginner Friendly)
Phase 0 — Prep (1–2 days)
- Install Node.js (LTS) and create project
- Initialize Next.js App Router + Tailwind + Shadcn UI
- Add Supabase project; connect keys in `.env`
- Enable Google login in Supabase Auth (see OAuth steps below)

Phase 1 — Foundations (1 week)
- Auth (email/phone), i18n provider, RTL, base layout
- Seed cities; set license caps; basic admin route stubs

Phase 2 — Onboarding & Verification (1 week)
- Profile wizard; doc uploads; verification status
- Preview mode (2 days); demo bot match; limited swipes

Phase 3 — Discovery & Messaging (1–2 weeks)
- Filters; swipe interface; mutual match
- Realtime messaging; pgcrypto for message bodies

Phase 4 — Payments & Pricing (1 week)
- Checkout pages; HBL/Raast proof upload
- Agent verification queue; subscription activation
- Direct tier perks; bureau referral logic

Phase 5 — Bureau & Admin (1–2 weeks)
- Bureau registration, directory, dashboards
- Weekly commissions and payouts; violations; license transfer marketplace

Phase 6 — Analytics & Polish (1 week)
- Presence map; subscription counter; performance
- Accessibility, RTL refinements; copy polishing

---

## 11) Quick Commands (for later setup)
```bash
# Create app
npx create-next-app@latest internationalrishta --ts --use-npm --src-dir --app --import-alias "@/*"
cd internationalrishta

# Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# UI + i18n
npm install shadcn-ui clsx next-intl

# Supabase
npm install @supabase/supabase-js

# Security
npm install @fingerprintjs/fingerprintjs

# Animations (optional)
npm install framer-motion @studio-freight/lenis
```

---

## 12) Assets & Visuals
- Use `assets/logo-golden.png` for branding
- Payment QR: `assets/raast-payment.png`
- Hero videos: `assets/Banner-Video-01-15-21.mp4`, `assets/Banner-Video-07-06-21.mp4`, `assets/Banner-Video-10-24-19.mp4`
- Hero banners: `assets/Banner - International RishtaConnecting Hearts Worldwide.png`, `assets/Banner - Meet Your MatchAcross the Globe.png`

---

## 13) Futuristic Visual Direction (Web + Mobile)
- Aesthetic: Sophisticated, minimal, with confident contrast; deep gradients on dark, soft ivory on light; golden accents for brand moments.
- Layout: Modular cards with glassy layers, rounded-rectangle geometry, soft shadows; asymmetric grids and generous whitespace.
- Motion: Subtle parallax on hero, smooth swipe animations, microinteractions on buttons/chips; use Framer Motion + Lenis for fluidity. Hero video: auto-play muted/loop with overlay gradient for text legibility; fallback to banner image on low-power or prefers-reduced-motion.
- Typography: Elegant serif for hero headlines; modern sans for body (Plus Jakarta Sans/Inter); Urdu with Noto Nastaliq; consistent scale via design tokens.
- Iconography: Thin-stroke, minimal; mirrored for RTL.
- 3D/Depth hints: Light bloom particles or starfields behind hero; accent glows behind CTA clusters; blurred blobs for atmosphere (keep performance in check).
- Accessibility: Maintain 4.5:1 contrast on text; respect prefers-reduced-motion; tap targets 44px min on mobile.

Key screens (web + mobile parity):
- Landing: Hero CTA stack, “Pakistan now, global soon” ribbon, subscription counter, trust strip (verified, safety, privacy), pricing, bureau CTA.
- Onboarding: Multi-step flow (profile basics, docs upload, filters, preview timer, payment prompt), progress indicator.
- Discover: Swipe deck + list toggle; filter drawer; “boost” and “super-like” affordances; verified and bureau badges.
- Profile: Media gallery (photos/video), compatibility summary, verification badges, interests/values, location (city-level), filters match score.
- Messaging: Clean chat with encryption note, read receipts, typing, attachments; video call entry when unlocked.
- Payments: HBL/Raast proof upload, status pill (pending/approved), price differentiation for referral vs direct.
- Bureau: Directory grid, bureau profile pages, referral code display/QR, application flow.
- Admin: Dashboards for applications, payments, capacity, analytics, payouts, violations, transfers.

Design tokens to share across web/mobile:
- Colors: Dark background (near-black/charcoal), Light background (ivory/sand), Accent gold, Emerald teal, Muted neutrals.
- Radius: 16–20px cards; 999px pills; chips 12–14px radius.
- Shadows: Soft ambient + subtle directional; glassmorphism at low opacity.
- Motion: 200–350ms ease; longer (600–800ms) for hero parallax; use reduced-motion fallbacks.

---

## 14) Mobile App Framework Plan (Android/iOS)
Goal: Ship Android/iOS with near-feature-parity to web using a shared design system and API layer.

Recommended stack: React Native + Expo Router
- Why: Fast delivery, reuse design tokens, component patterns align with Next.js/React, Expo build service, OTA updates for non-native changes.
- Navigation: Expo Router (file-based), deep links, locale-aware routing.
- UI: React Native Paper/Tamagui (or custom) with shared tokens; Lottie for microinteractions.
- State/query: React Query (TanStack) for API cache; Zustand/Recoil for local UI state.
- Auth: Supabase Auth via `@supabase/supabase-js` (mobile), secure storage for tokens.
- Realtime: Supabase Realtime for presence and messaging; WebRTC/video via Daily React Native SDK.
- Localization: `expo-localization` + `next-intl`-compatible message packs; RTL via `I18nManager.forceRTL` per locale.
- Analytics: Expo Analytics or Segment/Amplitude; crash reporting via Sentry.

API alignment
- Use the same Supabase backend and policies as web.
- Keep DTOs consistent; version any breaking API changes.
- Media: Upload via pre-signed URLs to Supabase Storage; image compression client-side.

Mobile feature parity (phaseable)
- Phase 1: Auth, onboarding, verification upload, filters, discover (swipe), matches, messaging (text), payments (proof upload), subscription status, referral code entry, bureau directory view.
- Phase 2: Points/boosts, video unlock and calls, presence indicators, in-person verification requests, bureau referral QR scanner.
- Phase 3: Agent/bureau app mode (restricted), payouts view for agents, notifications center, offline-friendly inbox caching.

CI/CD for mobile
- Use Expo EAS builds for Android/iOS; configure app.json for locales, icons, splash.
- Environment: Use secure EAS secrets for Supabase keys/Daily keys.
- Release: Internal testing tracks (Play Console/TestFlight) before prod.

---

---

## 13) Glossary
- RLS: Row Level Security (Postgres)
- ICU: International Components for Unicode message formatting
- ISR: Incremental Static Regeneration (Next.js caching)
- E2E: End‑to‑End encryption

---

## 14) Notes
This document is your build checklist. Start Phase 0, and I’ll help scaffold code next when you’re ready.

---

## 17) Contact, Footer, and Legal
- Helpline email: info@internationalrishta.com
- Address: 8 The Green STE A, Dover, Delaware, USA 19901
- Footer: “© 2024 International Rishta — A project by IMJD Your Digital Media Partner — https://imjd.asia”
- Accessibility: Add contact and address to footer; ensure links are keyboard accessible; keep RTL/LTR footer layout consistent.

---

### Node.js (Next.js) on cPanel
- Prerequisites: cPanel with “Setup Node.js App” (Passenger) enabled, SSH access, Node 18+.
- Environment: set `NODE_ENV=production` and required secrets in cPanel UI.

Steps:
1. Upload the project folder to your hosting account (e.g., `/home/<user>/apps/internationalrishta`).
2. In cPanel → Setup Node.js App:
   - Create Application → App Directory: `apps/internationalrishta`
   - Application URL: your domain or subdomain (e.g., `internationalrishta.com` or `app.internationalrishta.com`)
   - Node.js version: 18 or newer
   - Start script: `npm start`
3. Via SSH (or cPanel Terminal), install dependencies and build:

```bash
cd ~/apps/internationalrishta
npm ci
npm run build
```

4. Ensure `package.json` has a production start script:

```json
{
  "scripts": {
    "start": "next start -p 3000"
  }
}
```

5. In cPanel, click “Restart App” to boot the server. Passenger will proxy requests to the app internally; your domain should resolve to the Next.js server.

Notes:
- WebSockets: Supabase Realtime and Daily.co video run over HTTPS/WSS and work fine behind cPanel’s proxy.
- SSL: Enable AutoSSL/Let’s Encrypt in cPanel for HTTPS.
- Static assets: Next.js serves optimized assets from `.next`; no extra Apache config needed.

### Python Services on cPanel (optional)
If you add Python microservices (e.g., image checks, admin tools):
- Use cPanel → “Setup Python App” to create a virtualenv.
- Frameworks: FastAPI or Flask; run behind Passenger.
- Start command example (FastAPI): `uvicorn app:app --host 127.0.0.1 --port 8000` (cPanel manages the bind).

### Database Options
- Recommended: Supabase (managed PostgreSQL, Auth, Realtime, Storage). Your Next.js app can connect from cPanel using environment variables.
- Alternative: cPanel’s own databases.
  - PostgreSQL: use a direct `DATABASE_URL` with Prisma.
  - MySQL/MariaDB: supported widely; use Prisma or Sequelize. Some features (JSONB, FTS, geospatial) are richer in Postgres.

### Environment Variables (set in cPanel → Node App → Environment)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE` (server‑side only; never expose client‑side)
- `DAILY_API_KEY` (video)
- `FINGERPRINTJS_PUBLIC_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `ENCRYPTION_SECRET` (for pgcrypto column encryption)
- `GOOGLE_CLIENT_ID` (if using direct Google OAuth in Next.js) — optional when using Supabase hosted OAuth only

### Weekly Jobs on cPanel (Payouts/Stats)
- Use cPanel Cron Jobs to call a Next.js API route or run a Node script.
- Example (Monday 01:00 PKT):

```bash
curl -sS https://internationalrishta.com/api/payouts/run-weekly
```

Or run a Node script:

```bash
cd ~/apps/internationalrishta && NODE_ENV=production node scripts/run-weekly-payouts.js
```

### Uploads & Storage
- Prefer Supabase Storage (S3‑compatible, secure) for ID photos and profile images. cPanel public storage is not recommended for user PII.

### Troubleshooting

---

## 16) Google Login (Supabase OAuth)
We will allow users to sign in with Google in addition to email/phone.

Supabase setup
1) In Supabase Dashboard → Authentication → Providers → Google: enable.
2) In Google Cloud Console:
  - Create OAuth Client (Web Application).
  - Authorized redirect URI: `https://<your-supabase-project>.supabase.co/auth/v1/callback`.
  - Add your site origins: `https://internationalrishta.com` (and staging domains).
3) Paste the Google Client ID/Secret into Supabase provider settings.

Next.js usage
- Use the Supabase JS client: `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: '<SITE_URL>/auth/callback' } })`.
- After redirect, Supabase sets the session; read it via `supabase.auth.getSession()`.

Mobile (Expo/React Native)
- Use the same Supabase OAuth flow with `supabase.auth.signInWithOAuth` and a deep link redirect (e.g., `com.internationalrishta://auth-callback`). Register the scheme in app.json and in Supabase redirect URLs.

Notes
- Keep email/phone as primary; Google is optional for speed.
- Ensure your domain has HTTPS (cPanel AutoSSL/Let’s Encrypt) before enabling Google OAuth.
- If you host Next.js on cPanel, you do **not** need to store Google secrets in the app; Supabase hosts the OAuth dance. Only client ID/secret live in Supabase settings.
- If the app does not start: check cPanel “Error Log” and ensure `npm run build` completed.
- Update Node.js version in cPanel if build fails due to features (use 18+).
- After changes, always click “Restart App”.

