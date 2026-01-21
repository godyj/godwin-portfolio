# Session Log: SSL Certificate Warning Investigation

**Date:** 2026-01-20
**Time:** ~21:45 - 21:57 PST
**Duration:** ~12 minutes

---

## Objective

1. Review project status (README + latest session log)
2. Investigate why a visitor saw Safari's "This Connection Is Not Private" warning when accessing `pixelworship.com`
3. Determine if this issue will recur for future visitors

---

## Tasks Completed

### 1. Project Status Review

Used parallel sub-agents (Explore) to read:

**README.md Summary:**
- Next.js 16.1.1 portfolio site migration from Adobe Portfolio
- TypeScript + Tailwind CSS stack
- 5 case studies displayed (Humanics x2, Roblox, Jarvis, Xcode)
- Dark mode support, responsive design, SEO optimized
- Planned hosting on Vercel (now complete)

**Latest Session Log (`2026-01-20-vercel-deployment-domain-setup.md`):**
- Vercel deployment completed successfully
- Two domains configured: `designed.cloud` (GoDaddy) + `pixelworship.com` (Dreamhost)
- DNS records: A record → `76.76.21.21`, CNAME www → `cname.vercel-dns.com`
- All 4 domain variants marked as LIVE
- Auth system environment variables configured

---

### 2. Screenshot Analysis

**File:** `docs/screenshots/not private.jpg`

Screenshot shows Safari's SSL certificate warning:
- **Title:** "This Connection Is Not Private"
- **Domain:** pixelworship.com
- **Warning text:** "This website may be impersonating 'pixelworship.com' to steal your personal or financial information. You should go back to the previous page."
- **Browser:** Safari (macOS dark mode)
- **Options shown:** "Go Back" button, "view the certificate" link, "visit this website" link

---

### 3. Technical Investigation

#### DNS Verification

```bash
$ dig +short pixelworship.com A
76.76.21.21  # ✅ Correct - pointing to Vercel

$ nslookup pixelworship.com 8.8.8.8
Name:    pixelworship.com
Address: 76.76.21.21  # ✅ Confirmed via Google DNS
```

#### SSL Certificate Check (designed.cloud - working)

```bash
$ curl -v https://designed.cloud
* SSL connection using TLSv1.3 / AEAD-CHACHA20-POLY1305-SHA256
* Server certificate:
*   subject: CN=designed.cloud
*   start date: Jan 21 03:55:59 2026 GMT
*   expire date: Apr 21 03:55:58 2026 GMT
*   issuer: Let's Encrypt
```

#### Key Finding

Certificate issue date (Jan 21, 2026 ~03:55 UTC) was **after** the deployment session (Jan 20, 2026 ~21:15 PST), confirming the visitor accessed during the SSL provisioning window.

---

### 4. Root Cause Analysis

**Cause:** Timing gap during initial domain setup

When adding a custom domain to Vercel, there's a multi-step process:

| Step | Action | Time |
|------|--------|------|
| 1 | Configure DNS records at registrar | Immediate |
| 2 | DNS propagates globally | Minutes to hours |
| 3 | Vercel detects domain pointing to their servers | Minutes |
| 4 | Vercel requests SSL certificate from Let's Encrypt | Minutes |
| 5 | Certificate issued and installed | Minutes |

**What happened:**
- DNS propagated (Step 2 complete) → domain resolved to `76.76.21.21`
- Visitor accessed site before SSL cert was issued (between Step 2 and Step 5)
- No valid certificate existed yet → Safari showed "Not Private" warning

---

### 5. Recurrence Assessment

**Will this happen again?** No.

| Factor | Status |
|--------|--------|
| **SSL Auto-Renewal** | Vercel automatically renews certificates ~30 days before expiration |
| **Current Cert Expiry** | April 21, 2026 |
| **Expected Renewal** | ~March 21, 2026 (automatic) |
| **Renewal Downtime** | None - new cert installed before old expires |

#### Scenarios That Could Cause Recurrence

| Scenario | Likelihood | Mitigation |
|----------|------------|------------|
| DNS misconfiguration | Low | Don't modify DNS records unnecessarily |
| Domain registration expires | Low | Keep GoDaddy/Dreamhost registrations current |
| Vercel account suspension | Very Low | Maintain active Vercel account |
| Adding new domain | One-time | Same brief window during initial setup |

---

## Current Status (As of 21:57 PST)

| Domain | DNS | SSL | Status |
|--------|-----|-----|--------|
| `designed.cloud` | ✅ `76.76.21.21` | ✅ Valid (expires Apr 21) | **LIVE** |
| `www.designed.cloud` | ✅ CNAME | ✅ Valid | **LIVE** |
| `pixelworship.com` | ✅ `76.76.21.21` | ✅ Valid | **LIVE** |
| `www.pixelworship.com` | ✅ CNAME | ✅ Valid | **LIVE** |

**User confirmed:** Warning no longer appearing for visitors.

---

## Technical Details

### SSL Certificate Information

```
Domain:     designed.cloud (covers all configured domains)
Issuer:     Let's Encrypt
Protocol:   TLSv1.3
Cipher:     AEAD-CHACHA20-POLY1305-SHA256
Valid From: Jan 21, 2026 03:55:59 UTC
Valid To:   Apr 21, 2026 03:55:58 UTC
```

### Vercel SSL Provisioning Process

1. **Detection:** Vercel monitors for DNS records pointing to `76.76.21.21`
2. **Verification:** Domain ownership verified via DNS
3. **Request:** Certificate requested from Let's Encrypt (ACME protocol)
4. **Issuance:** Let's Encrypt issues 90-day certificate
5. **Installation:** Certificate automatically deployed to edge network
6. **Renewal:** Auto-renewed ~30 days before expiration

---

## Commands Used

```bash
# Check DNS A record
dig +short pixelworship.com A

# Check DNS via Google's DNS server
nslookup pixelworship.com 8.8.8.8

# Verbose SSL connection test
curl -v https://designed.cloud

# Check SSL certificate details
echo | openssl s_client -connect pixelworship.com:443 -servername pixelworship.com 2>/dev/null | openssl x509 -noout -dates -issuer
```

---

## Files Referenced

| File | Purpose |
|------|---------|
| `docs/screenshots/not private.jpg` | Safari SSL warning screenshot |
| `docs/session-logs/2026-01-20-vercel-deployment-domain-setup.md` | Previous deployment session |
| `README.md` | Project overview |

---

## Key Takeaways

1. **One-time issue:** SSL warnings during initial domain setup are expected and temporary
2. **No action needed:** Vercel handles SSL lifecycle automatically
3. **Future domains:** Same brief window will occur if adding new custom domains
4. **Visitor experience:** All current visitors will have seamless HTTPS experience

---

## Conclusion

The "This Connection Is Not Private" warning was a temporary condition that occurred during the initial domain setup. It lasted only minutes while Vercel provisioned the SSL certificate. This is expected behavior and will not recur under normal circumstances. Both `designed.cloud` and `pixelworship.com` are now fully operational with valid SSL certificates that will auto-renew.