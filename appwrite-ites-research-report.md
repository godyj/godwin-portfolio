# Appwrite Sites: Deep Research Report
## Open-Source Alternative to Vercel

**Research Date:** December 31, 2025

---

## Executive Summary

**Appwrite Sites** is a new web hosting product launched in May 2025 as part of the Appwrite ecosystem. It positions itself as an open-source, full-stack alternative to Vercel, offering both static and SSR hosting integrated with Appwrite's backend services (Auth, Database, Storage, Functions, Messaging).

**Key Finding:** Appwrite Sites is best suited for projects that benefit from an integrated backend + frontend solution, particularly when you want to avoid managing multiple services. For purely frontend/static sites with no backend needs, Vercel remains the more mature option.

---

## What is Appwrite Sites?

Appwrite Sites allows you to deploy and host websites/web apps directly within the Appwrite platform. Unlike Vercel (frontend-focused), Appwrite Sites is part of a complete backend platform.

### Core Features

| Feature | Details |
|---------|---------|
| **Static Hosting** | SPAs, landing pages, documentation sites |
| **SSR Support** | Next.js, Nuxt, SvelteKit, Astro, Remix, Angular |
| **Git Integration** | GitHub auto-deploy on push |
| **Preview Deployments** | Unique URLs per PR/branch/commit |
| **Global CDN** | Content distributed worldwide |
| **DDoS Protection** | Built-in protection mechanisms |
| **Custom Domains** | CNAME or full NS configuration |
| **Manual Deployment** | Drag-and-drop without Git |
| **Instant Rollbacks** | One-click restore to previous deployments |
| **Self-Hosting** | 100% open source, can run on your infrastructure |

### Supported Frameworks

- Next.js, Nuxt, SvelteKit, Angular, Astro, Remix
- Flutter Web (static)
- React, Vue.js, Vanilla JS
- Lynx, Analog
- Any static site generator

---

## Pricing Comparison

### Appwrite Pricing

| Plan | Cost | Sites | Bandwidth | Storage | Key Limits |
|------|------|-------|-----------|---------|------------|
| **Free** | $0 | Unlimited | 5GB/mo | 2GB | 2 projects, 75K MAU, community support |
| **Pro** | $25/mo | Unlimited | 2TB/mo | 150GB | Dedicated resources, email support, daily backups |
| **Enterprise** | Custom | Unlimited | Custom | Custom | SLAs, SSO, SOC-2/HIPAA, dedicated support |

**Important:** Sites is **FREE until August 1, 2025** - pricing will be introduced after.

### Vercel Pricing

| Plan | Cost | Key Inclusions |
|------|------|----------------|
| **Hobby** | $0 | 100GB bandwidth, 1M edge requests, personal/non-commercial only |
| **Pro** | $20/mo + usage | 1TB bandwidth, 10M edge requests, $20 included credit, team collaboration |
| **Enterprise** | Custom | Multi-region, 99.99% SLA, managed WAF, advanced support |

### Cost Analysis

**For a personal website (low traffic):**
- **Appwrite Free:** $0 (5GB bandwidth, unlimited sites)
- **Vercel Hobby:** $0 (100GB bandwidth) - *but non-commercial only*

**For a production app (moderate traffic):**
- **Appwrite Pro:** $25/mo (includes 2TB bandwidth + full backend)
- **Vercel Pro:** $20/mo + ~$15-50/mo for additional bandwidth/functions

**Key Difference:** Appwrite Pro includes backend services (database, auth, storage, functions) that would require separate services with Vercel.

---

## Detailed Pros and Cons

### Appwrite Sites PROS

| Category | Benefit |
|----------|---------|
| **Integrated Stack** | Frontend + backend (auth, database, storage, functions) in one platform - no need to manage multiple services |
| **Open Source** | 100% open source - can self-host for complete control and data ownership |
| **Automatic CORS** | No CORS configuration needed - Sites deployments are automatically trusted |
| **Secure Previews** | Preview URLs scoped to your project only (unlike Vercel's shared *.vercel.app namespace) |
| **Framework Agnostic** | Equal SSR support across all frameworks (not optimized for just one) |
| **Built-in Variables** | Automatic injection of project ID, API endpoint, region, API keys |
| **Manual Deploy** | Drag-and-drop deployment without Git for quick updates |
| **Container Isolation** | SSR runs in isolated containers with full runtime access |
| **Rollbacks** | Instant one-click rollback to any previous deployment |
| **No Vendor Lock-in** | Self-hostable, can migrate away anytime |
| **Simpler Billing** | One platform, one invoice for everything |

### Appwrite Sites CONS

| Category | Limitation |
|----------|------------|
| **New Product** | Launched May 2025 - less battle-tested than Vercel (10+ years) |
| **Pricing TBD** | Free until Aug 2025, final pricing structure not yet announced |
| **Smaller Community** | Fewer tutorials, Stack Overflow answers, third-party integrations |
| **Edge Functions** | No dedicated edge runtime like Vercel's Edge Functions |
| **ISR Not Mentioned** | Incremental Static Regeneration support unclear |
| **Limited Regions** | Growing network but fewer PoPs than Vercel currently |
| **No GitLab/Bitbucket** | Currently only GitHub integration (Vercel supports all three) |
| **Enterprise Features** | SSO, SOC-2 compliance only on Enterprise tier |
| **Log Retention** | 24 hours on Free, 7 days on Pro (Vercel: 1 hour free, 1-3 days pro) |

### Vercel PROS

| Category | Benefit |
|----------|---------|
| **Maturity** | 10+ years in production, extremely battle-tested |
| **Next.js Optimization** | First-class Next.js support (they maintain it) |
| **Edge Network** | Massive global edge network, edge functions |
| **ISR** | Best-in-class Incremental Static Regeneration |
| **Analytics** | Built-in speed insights and web analytics |
| **Enterprise Ready** | SOC-2, HIPAA, 99.99% SLA available |
| **Ecosystem** | Huge marketplace, integrations, templates |
| **v0 AI** | AI-powered UI generation tool |

### Vercel CONS

| Category | Limitation |
|----------|------------|
| **Closed Source** | Proprietary platform, no self-hosting option |
| **Frontend Only** | Need separate services for backend (Supabase, Firebase, etc.) |
| **CORS Complexity** | Must manually configure allowed origins |
| **Preview Security** | Shared *.vercel.app namespace - wildcard CORS is risky |
| **Hobby Restrictions** | Free tier is personal/non-commercial only |
| **Cost Scaling** | Usage-based pricing can spike unexpectedly |
| **Vendor Lock-in** | Harder to migrate away from Vercel-specific features |
| **Multiple Invoices** | Need separate accounts for backend services |

---

## Use Case Analysis

### For Sacred Knot

**Assuming Sacred Knot is a production web application with:**
- User authentication
- Database for content/data
- Possibly file storage
- Server-side rendering

| Factor | Appwrite Sites | Vercel |
|--------|---------------|--------|
| **Backend Needs** | Built-in auth, database, storage | Requires Supabase/Firebase + integration |
| **Simplicity** | Single platform | Multiple services to manage |
| **Cost (Pro tier)** | ~$25/mo all-inclusive | ~$20/mo Vercel + $25/mo Supabase = $45/mo |
| **Open Source** | Yes - can self-host if needed | No |
| **Risk** | Newer platform, pricing TBD | Proven, stable pricing |
| **Maturity** | New (May 2025) | Established |

**Recommendation for Sacred Knot:**
- **Consider Appwrite Sites IF:**
  - You value open source and data ownership
  - You want unified frontend + backend
  - You're okay with a newer platform
  - You want to reduce infrastructure complexity

- **Stick with Vercel IF:**
  - You need maximum stability/maturity
  - You're heavily invested in Next.js-specific features (ISR, edge middleware)
  - You already have a working backend setup
  - Enterprise compliance is required now

### For Personal Website

**Assuming a personal portfolio/blog with:**
- Static or minimal SSR
- Low to moderate traffic
- Possibly a contact form or simple features

| Factor | Appwrite Sites | Vercel |
|--------|---------------|--------|
| **Free Tier** | 5GB bandwidth, commercial use OK | 100GB bandwidth, non-commercial only |
| **Simplicity** | One platform if you add features later | Frontend only |
| **Overkill?** | Backend features you may not need | Right-sized for static sites |
| **Future Growth** | Easy to add auth/database later | Need to integrate external services |

**Recommendation for Personal Website:**
- **Use Appwrite Sites IF:**
  - You want room to grow (add auth, database features later)
  - You want to experiment with Appwrite ecosystem
  - You plan commercial use (freelance portfolio, etc.)

- **Use Vercel IF:**
  - Purely personal, non-commercial
  - You just need reliable static hosting
  - You want the most mature option

---

## Key Differentiators Summary

| Aspect | Appwrite Sites | Vercel |
|--------|---------------|--------|
| **Philosophy** | Full-stack integrated platform | Frontend-focused hosting |
| **Open Source** | Yes (self-hostable) | No |
| **Backend** | Built-in (Auth, DB, Storage, Functions) | None (BYO) |
| **Best For** | Unified full-stack apps | Next.js, frontend-heavy apps |
| **Maturity** | New (2025) | Established (2015+) |
| **Pricing** | Simpler, all-inclusive | Usage-based, can spike |
| **Vendor Lock-in** | Low (can self-host) | Higher |

---

## Final Verdict

### Should You Consider Appwrite Sites?

**YES, for these scenarios:**
1. You want an all-in-one platform (frontend + backend)
2. Open source and data ownership matter to you
3. You're building a new project and want simpler architecture
4. You want to avoid managing multiple services/invoices
5. You're comfortable being an early adopter

**NO/WAIT, for these scenarios:**
1. You need proven enterprise-grade stability today
2. You're heavily dependent on Next.js-specific features
3. You need GitLab/Bitbucket integration
4. Your team is already productive with Vercel workflow
5. You need SOC-2/HIPAA compliance immediately

### Bottom Line

**For Sacred Knot:** Worth trying Appwrite Sites in a staging environment. The integrated backend could simplify your architecture significantly. However, keep your current setup as fallback until Appwrite Sites matures further.

**For Personal Website:** Either works well. Appwrite Sites gives you more room to grow; Vercel is simpler for pure static hosting.

---

## Sources

- [Appwrite Sites Announcement](https://appwrite.io/blog/post/announcing-appwrite-sites)
- [Appwrite Sites vs Vercel Comparison](https://appwrite.io/blog/post/open-source-vercel-alternative)
- [Appwrite Pricing](https://appwrite.io/pricing)
- [Vercel Pricing](https://vercel.com/pricing)
- [Appwrite Sites Documentation](https://appwrite.io/docs/products/sites)
