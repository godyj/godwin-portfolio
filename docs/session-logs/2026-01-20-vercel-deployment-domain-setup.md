# Session Log: Vercel Deployment & Domain Setup

**Date:** 2026-01-21
**Time:** ~23:30 PST (Jan 20) - 00:10 PST (Jan 21)
**Duration:** ~2 hours (including account migration)

---

## Objective

Deploy the Godwin Portfolio Next.js site to Vercel and configure two custom domains:
- `designed.cloud` (registered at GoDaddy)
- `pixelworship.com` (registered at Dreamhost)

---

## Tasks Completed

### 1. Vercel Project Setup

**Initial Deployment Attempt (Failed)**
- Ran `vercel --yes` to deploy
- Build failed due to missing environment variables
- Error: Upstash Redis and Resend API keys not configured

**Environment Variables Added**
Added the following env vars for both `production` and `preview` environments:

| Variable | Environment |
|----------|-------------|
| `UPSTASH_REDIS_REST_URL` | production, preview |
| `UPSTASH_REDIS_REST_TOKEN` | production, preview |
| `RESEND_API_KEY` | production, preview |
| `SUPER_ADMIN_EMAIL` | production, preview |
| `NEXT_PUBLIC_SITE_URL` | production, preview |

Commands used:
```bash
printf "<value>" | vercel env add <VAR_NAME> production
printf "<value>" | vercel env add <VAR_NAME> preview
```

**Successful Deployments**
- Preview deployment: `vercel --yes` - Success
- Production deployment: `vercel --prod --yes` - Success

Preview URL: `https://godwin-portfolio-5sdfnzvuc-godwin-johnsons-projects-7a9f3f29.vercel.app`

---

### 2. Domain Configuration in Vercel

Added 4 domains to the Vercel project:
```bash
vercel domains add designed.cloud
vercel domains add www.designed.cloud
vercel domains add pixelworship.com
vercel domains add www.pixelworship.com
```

All domains configured to serve the site independently (no redirects).

---

### 3. DNS Configuration

#### GoDaddy (designed.cloud)

**Records Added/Modified:**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | `76.76.21.21` | 3600 (1 hour) |
| CNAME | www | `cname.vercel-dns.com` | 1 Hour |

*Note: TTL initially set to 600 for faster propagation, then updated to 3600 after verification.*

**Records Deleted:**
- CNAME `ftp` → `designed.cloud` (not needed)
- CNAME `email` → `email.secureserver.net` (no email used on domain)

**Records Kept:**
- CNAME `_domainconnect` → GoDaddy domain connect feature (harmless)
- SOA record (system managed)

#### Dreamhost (pixelworship.com)

**Records Added:**

| Type | Name | Value |
|------|------|-------|
| A | @ | `76.76.21.21` |
| CNAME | www | `cname.vercel-dns.com` |

*Note: Dreamhost does not expose TTL settings in their panel - managed automatically with default values.*

**Records Kept:**
- NS records for ns1/ns2/ns3.dreamhost.com (required)

---

### 4. DNS Propagation Verification

Verified using `dig` command:

```bash
dig +short designed.cloud A
# Result: 76.76.21.21 ✅

dig +short www.designed.cloud CNAME
# Result: cname.vercel-dns.com. ✅

dig +short pixelworship.com A
# Result: (pending - Dreamhost still processing)

dig +short www.pixelworship.com CNAME
# Result: cname.vercel-dns.com. ✅
```

**Final Status:**
- `https://designed.cloud` - **LIVE** ✅
- `https://www.designed.cloud` - **LIVE** ✅
- `https://pixelworship.com` - **LIVE** ✅
- `https://www.pixelworship.com` - **LIVE** ✅

---

## Key Decisions Made

1. **Deployment approach:** GitHub integration with Vercel (Option A)
   - Push to `main` → production deployment
   - Push to other branches → preview deployment

2. **Domain strategy:** Both domains serve site independently
   - No redirects between domains
   - Both `designed.cloud` and `pixelworship.com` serve the same content

3. **DNS method:** A/CNAME records (not nameserver transfer)
   - Keeps domains at original registrars
   - Easier to manage other services if needed later

---

## Commands Reference

```bash
# Deploy preview
vercel --yes

# Deploy production
vercel --prod --yes

# Add environment variable
printf "<value>" | vercel env add <NAME> production

# Add domain
vercel domains add <domain>

# Check domain status
vercel domains inspect <domain>

# List all domains
vercel domains ls

# Check DNS propagation
dig +short <domain> A
dig +short <domain> CNAME
```

---

## Notes

- TTL explanation: TTL is in seconds (600 = 10 minutes, 3600 = 1 hour)
- Vercel auto-provisions SSL certificates once DNS propagates
- Preview deployments get unique URLs for testing before production
- Environment variables needed for auth system (Upstash Redis + Resend email)

---

## Session 2: Account Migration & Final Setup (2026-01-21 00:00-00:10 PST)

### Problem Discovered

Initial deployment was under the wrong Vercel account (`sk-godwin`) instead of the intended account (`godyj`).

### Account Migration Steps

1. **Logged out of sk-godwin:**
   ```bash
   vercel logout
   ```

2. **Logged into godyj:**
   ```bash
   vercel login
   # User completed OAuth in browser
   ```

3. **Re-linked project to new account:**
   ```bash
   rm -rf .vercel
   vercel link --yes
   # Linked to: godwin-johnsons-projects-1dd01557/godwin-portfolio
   ```

4. **Added environment variables (with correct method):**

   **Issue:** Using `echo` added trailing newlines, causing Redis URL validation to fail.

   **Fix:** Used `printf '%s'` instead of `echo`:
   ```bash
   printf '%s' "https://humane-mako-18147.upstash.io" | vercel env add UPSTASH_REDIS_REST_URL production
   printf '%s' "https://humane-mako-18147.upstash.io" | vercel env add UPSTASH_REDIS_REST_URL preview
   # ... repeated for all 5 env vars
   ```

5. **First deployment succeeded:**
   ```bash
   vercel --prod
   # Build: Ready
   # URL: https://godwin-portfolio-neon.vercel.app
   ```

### Domain Migration

**Problem:** Domains were still claimed by `sk-godwin` account at the account level.

**Resolution Steps:**

1. Removed domains from sk-godwin project
2. Deleted entire project from sk-godwin account
3. Released domains from sk-godwin account-level settings (`vercel.com/account/domains`)
4. Added domains to godyj account:
   ```bash
   vercel domains add designed.cloud      # ✅ Success
   vercel domains add www.designed.cloud  # ✅ Success
   vercel domains add pixelworship.com    # ✅ Success
   vercel domains add www.pixelworship.com # ✅ Success
   ```

### Final Configuration

**Updated `NEXT_PUBLIC_SITE_URL` for production:**
```bash
printf '%s' "https://designed.cloud" | vercel env add NEXT_PUBLIC_SITE_URL production --force
vercel --prod --yes  # Redeployed to apply change
```

This ensures magic link emails use the correct production URL.

---

## Final Verification

```bash
curl -sI https://designed.cloud | head -5
# HTTP/2 200 ✅

curl -sI https://pixelworship.com | head -5
# HTTP/2 200 ✅

vercel domains ls
# designed.cloud      - godyj - ✅
# pixelworship.com    - godyj - ✅
```

---

## Final Status

| Item | Status |
|------|--------|
| Vercel account | `godyj` (correct) |
| Project | `godwin-johnsons-projects-1dd01557/godwin-portfolio` |
| Production URL | https://godwin-portfolio-neon.vercel.app |
| designed.cloud | **LIVE** ✅ |
| www.designed.cloud | **LIVE** ✅ |
| pixelworship.com | **LIVE** ✅ |
| www.pixelworship.com | **LIVE** ✅ |
| Environment variables | All 5 configured (production + preview) |
| NEXT_PUBLIC_SITE_URL | `https://designed.cloud` |
| SSL certificates | Auto-provisioned by Vercel ✅ |

---

## Dashboard Links

- **Vercel Dashboard:** https://vercel.com/godwin-johnsons-projects-1dd01557/godwin-portfolio
- **Live Site:** https://designed.cloud
- **Alternate Domain:** https://pixelworship.com

---

## Lessons Learned

1. **Use `printf '%s'` not `echo`** when piping values to Vercel CLI - `echo` adds trailing newlines
2. **Domains are claimed at account level** in Vercel, not just project level - must release from account settings
3. **Check `vercel whoami`** before deploying to ensure correct account

---

## Next Steps

- [x] Verify `pixelworship.com` is working once Dreamhost propagation completes
- [x] Increase TTL to 3600 (1 hour) on GoDaddy after confirming everything works
- [x] Update `NEXT_PUBLIC_SITE_URL` to `https://designed.cloud` for production
- [x] Migrate project from sk-godwin to godyj account
- [ ] Test auth flow on production (magic link emails)
- [ ] Update QUICKSTART.md with deployment status
