# Authentication System Analysis

> Created: 2026-01-03 | Author: Claude (Expert Review)

## Executive Summary

This document analyzes database and email service options for implementing magic link authentication on the Godwin Portfolio site. The goal is to lock certain projects behind email-based authentication while keeping costs at $0 for a portfolio with minimal traffic.

---

## 1. Database Options Analysis

### Option A: Vercel KV

| Attribute | Details |
|-----------|---------|
| **Free Tier** | 30,000 requests/month |
| **Storage** | 256 MB |
| **Provider** | Redis-compatible (via Upstash partnership) |
| **Integration** | Native Vercel, 1-click setup |

**Pros:**
- Zero configuration in Vercel dashboard
- Native SDK (`@vercel/kv`)
- Automatic environment variables

**Cons:**
- Limited free tier (30K requests)
- No overages on Hobby plan - hard wall when limit hit
- Actually uses Upstash under the hood (why not go direct?)

### Option B: Upstash Redis (Recommended)

| Attribute | Details |
|-----------|---------|
| **Free Tier** | 500,000 commands/month |
| **Storage** | 256 MB |
| **Databases** | 10 free databases |
| **Bandwidth** | 200 GB/month free |

**Pros:**
- 16x more requests than Vercel KV (500K vs 30K)
- Pay-as-you-go beyond free tier ($0.20/100K requests)
- Same Redis API as Vercel KV
- No cold starts
- Works perfectly with Vercel (official integration)

**Cons:**
- Requires separate account setup (5 minutes)
- Manual environment variable configuration

### Option C: Turso SQLite

| Attribute | Details |
|-----------|---------|
| **Free Tier** | 500M rows read/month, 10M rows written |
| **Storage** | 5 GB |
| **Databases** | 500 free |

**Pros:**
- Extremely generous limits
- Full SQL support
- Great for relational data

**Cons:**
- Overkill for simple key-value auth data
- More complex setup (SQL schema, migrations)
- Heavier SDK

### Option D: JSON File (Not Recommended)

| Attribute | Details |
|-----------|---------|
| **Cost** | $0 |
| **Persistence** | None (resets on deploy) |

**Pros:**
- Zero setup
- Works locally

**Cons:**
- Data lost on every Vercel deploy (serverless = ephemeral)
- Not production-viable
- Manual JSON editing for admin

---

## 2. Database Recommendation: Upstash Redis

### Rationale

1. **Free Tier is Sufficient**: For a portfolio site with ~10-50 visitors/month, 500K requests is essentially unlimited
2. **Cost Safety**: Pay-as-you-go means no surprise bills - you pay $0.20 per 100K requests beyond free tier
3. **Vercel Compatibility**: Official Vercel marketplace integration, works seamlessly
4. **Same API as Vercel KV**: If you ever want to migrate, code works unchanged
5. **No Cold Starts**: Databases stay responsive (important for magic link validation)

### Expected Usage

| Operation | Frequency | Monthly Requests |
|-----------|-----------|------------------|
| Magic link generation | ~5/month | 5 |
| Link validation | ~5/month | 5 |
| Session checks | ~100/month | 100 |
| Admin operations | ~10/month | 10 |
| **Total** | | **~120 requests** |

**Verdict**: 0.024% of free tier used. Upstash is effectively free forever for this use case.

---

## 3. Email Service Options Analysis

### Option A: Resend (Recommended)

| Attribute | Details |
|-----------|---------|
| **Free Tier** | 3,000 emails/month (100/day) |
| **Domains** | 1 on free tier |
| **Analytics** | Paid plans only |

**Pros:**
- Modern developer experience (best-in-class)
- React Email integration
- Simple API (`resend.emails.send()`)
- Excellent deliverability
- Founded by former SendGrid engineer

**Cons:**
- No analytics on free tier (not needed for auth emails)
- 100/day limit (plenty for portfolio)

### Option B: SendGrid (Not Viable)

| Attribute | Details |
|-----------|---------|
| **Free Tier** | DISCONTINUED (May 2025) |
| **Trial** | 60 days, 100 emails/day |

**Verdict**: No longer an option. Free tier was retired in May 2025.

### Option C: Postmark

| Attribute | Details |
|-----------|---------|
| **Free Tier** | 100 emails (one-time credit) |
| **Paid** | $15/month for 10K emails |

**Verdict**: Not cost-effective for low-volume portfolio.

### Option D: SMTP2GO

| Attribute | Details |
|-----------|---------|
| **Free Tier** | 1,000 emails/month (never expires) |
| **Daily Limit** | 200/day |

**Pros:**
- Never expires
- No credit card required

**Cons:**
- Older API design
- Less modern DX than Resend

---

## 4. Email Service Recommendation: Resend

### Rationale

1. **Generous Free Tier**: 3,000 emails/month is 100x what we need
2. **Best Developer Experience**: Clean API, TypeScript support, React Email templates
3. **Reliability**: Built for transactional emails (magic links, notifications)
4. **Cost Trajectory**: If growth happens, $20/month for 50K emails is reasonable
5. **Domain Verification**: Easy setup for `designed.cloud`

### Expected Usage

| Email Type | Frequency | Monthly Emails |
|------------|-----------|----------------|
| Viewer magic links | ~5/month | 5 |
| Admin notifications | ~5/month | 5 |
| Access granted emails | ~3/month | 3 |
| **Total** | | **~13 emails** |

**Verdict**: 0.43% of free tier used. Resend is effectively free forever for this use case.

---

## 5. Admin Authentication Recommendation

### Question: Should admin also use magic link?

### Recommendation: Yes, magic link for admin too

**Rationale:**

1. **Simplicity**: One authentication system, not two
2. **Security**: No password to remember or leak
3. **Consistency**: Same UX for admin and viewers
4. **Low Friction**: Admin access is infrequent (few times/month)

**Implementation:**
- Super admin email: `godwinjohnson@me.com` (hardcoded in config)
- When super admin requests access, skip approval flow
- Magic link sent directly to super admin email
- Session stored in cookie (7-day expiration)

### Alternative Considered: Password-based admin

**Rejected because:**
- Adds complexity (password hashing, reset flow)
- Another credential to manage
- No real security benefit for single-admin portfolio

---

## 6. Final Technology Stack

| Component | Choice | Cost | Rationale |
|-----------|--------|------|-----------|
| **Database** | Upstash Redis | $0 | 500K free requests, pay-as-you-go |
| **Email** | Resend | $0 | 3K free emails, modern API |
| **Auth Library** | Custom (no Auth.js) | $0 | Simpler for this use case |
| **Session Storage** | HTTP-only cookies | $0 | Secure, no client-side JS access |

### Total Recurring Cost: $0/month

---

## 7. Sources

- [Vercel KV Pricing](https://vercel.com/docs/storage/vercel-kv/usage-and-pricing)
- [Upstash Redis Pricing](https://upstash.com/pricing/redis)
- [Upstash New Pricing (March 2025)](https://upstash.com/blog/redis-new-pricing)
- [Turso Pricing](https://turso.tech/pricing)
- [Resend Pricing](https://resend.com/pricing)
- [Resend New Free Tier](https://resend.com/blog/new-free-tier)
- [SendGrid Free Plan Discontinued](https://www.twilio.com/en-us/changelog/sendgrid-free-plan)
- [Auth.js Resend Configuration](https://authjs.dev/guides/configuring-resend)

---

## 8. Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-01-03 | Upstash Redis over Vercel KV | 16x more free requests |
| 2026-01-03 | Resend over SendGrid | SendGrid retired free tier |
| 2026-01-03 | Custom auth over Auth.js | Simpler for single-use case |
| 2026-01-03 | Magic link for admin | Consistency, simplicity |
