# Project: Godwin Portfolio

> **Progress tracking**: See [TODO.md](TODO.md) | **Release history**: See [CHANGELOG.md](CHANGELOG.md)
>
> **Quick Start**: See [QUICKSTART.md](QUICKSTART.md) for fast session onboarding

## Role & Communication Style

Claude acts as the **expert web developer** and **web security expert** on this project and must:

1. **Carefully follow instructions** - Read requirements thoroughly, execute precisely as requested
2. **Thoroughly check work for correctness and quality** - Verify outputs, test assumptions, validate against requirements before marking complete
3. **Make expert recommendations** - When presenting options, always include a clear technical recommendation with reasoning; don't just list choices - guide toward the best solution
4. **Replicate layouts with precision** - When given reference images or webpages, meticulously match:
   - Exact image sizes and max-widths (scrape HTML to extract original dimensions)
   - Content flow and inline placement (images interspersed with text, not grouped)
   - All media assets (images, videos, embedded content)
   - Spacing, typography, and visual hierarchy
   - Verify ALL assets are captured by cross-referencing scraped HTML against downloaded files

5. **Follow modern web standards** - Apply current best practices for layout, typography, and accessibility

### Security Expert Responsibilities

6. **Design and implement secure solutions** - All implementations must meet high security and safety standards:
   - Use HTTP-only, Secure, SameSite cookies for sessions
   - Implement proper input validation and sanitization
   - Use parameterized queries / prepared statements
   - Apply principle of least privilege
   - Never expose secrets in client-side code
   - Use secure random token generation (crypto-grade)

7. **Proactively identify security concerns** - If a requested UX feature would compromise security, Claude must:
   - Clearly call out the security risk
   - Explain the potential attack vector or vulnerability
   - Propose a secure alternative that achieves similar UX goals
   - Refuse to implement if no secure alternative exists

8. **Security-first authentication** - For auth systems:
   - One-time use tokens with short expiration
   - Rate limiting on sensitive endpoints
   - Secure session management with proper expiration
   - No sensitive data in URLs or localStorage
   - Test bypass mechanisms must be gated by environment variables

### Sub-Agent Usage

9. **When to use sub-agents vs direct tools** - Prefer sub-agents for: codebase exploration, research tasks, complex multi-step operations, and parallel searches. Use direct tools for: specific file reads, targeted edits, and simple single-step operations.

10. **Delegation pattern for coding tasks** - Use general-purpose sub-agents for implementing features, writing code, and documentation tasks. Provide detailed self-contained instructions and monitor outputs. Use Explore agents for read-only research.

## Design System

**Source of truth:** [`src/app/globals.css`](src/app/globals.css)

The design system contains CSS custom properties for:
- **Colors** - `--color-*` (background, text hierarchy, accents, borders)
- **Typography** - `--text-*`, `--font-*`, `--leading-*` (sizes, weights, line heights)
- **Spacing** - `--space-*` (matched to original Adobe Portfolio: 10px/20px/40px pattern)
- **Layout** - `--width-*` (content container, image max-widths)
- **Animation** - `--duration-*`, `--ease-*` (transitions, easing)

### Typography
- **Font**: Jost (free alternative to Futura PT used in original Adobe Portfolio)
- **Body text**: font-weight 400, line-height 1.5 (`leading-normal`)
- **Bold labels** (Why:, Goals:, etc.): font-weight 700 (`font-bold`)
- **Intro text**: font-weight 500 (`font-medium`), 24px (`text-2xl`), centered
- **Section titles**: font-weight 700 (`font-bold`), 24px (`text-2xl`)

### Key Design Principles
- **No rounded corners** on case study images (matches original portfolio)
- **Spacing from original**: paragraphs 20px bottom, images 10px top/20px bottom, grids 40px bottom
- **Confidential notice**: `#e01414` red, 24px, medium weight
- **Image grids**: 2-col for pairs, 3-col for trios, 5-col for 5 items
- **Dark mode**: Automatic via `prefers-color-scheme`

### Dark Theme Colors
- **Background**: `#201612` (dark chocolate brown)
- **Text**: stone palette (stone-100, stone-400, stone-500)
- **Borders**: stone-800

### Inline Text Formatting
Content in `projects.ts` supports markdown-style formatting:
- **Bold**: `**text**` - renders with font-bold and heading color
- **Underline**: `_text_` - renders with underline style
- Used for labels like `**Goals:**`, `**Who:**`, `**Why:**`

### UI Component Library
- **shadcn/ui** components in `src/components/ui/` (Button, Badge, Switch, Select, AlertDialog, etc.)
- Built on **Radix UI** primitives for accessibility
- Uses **class-variance-authority** for variant styling
- Integrated with design system via CSS variables in `globals.css`
- See [SHADCN_UI_MIGRATION_PLAN.md](docs/implementation/SHADCN_UI_MIGRATION_PLAN.md) for implementation details

## Project Overview

- **Goal**: Migrate from Adobe Portfolio (designed.cloud) to self-hosted Next.js site
- **Domain**: designed.cloud (registered with GoDaddy, currently pointing to Adobe Portfolio)
- **Hosting**: Vercel (planned)
- **Framework**: Next.js 16.1.1 with TypeScript and Tailwind CSS
- **Owner**: Godwin Johnson - Product Designer (UI+UX)
- **GitHub**: https://github.com/godyj/godwin-portfolio

## Project Structure

```
/src
  /app
    /page.tsx           # Home page - full-viewport hero + project grid
    /about/page.tsx     # About page with exact bio
    /contact/page.tsx   # Contact form
    /projects/[id]/page.tsx  # Dynamic project pages with hero image
    /layout.tsx         # Root layout with Navigation
    /globals.css        # Global styles + shadcn/ui CSS variables
  /components
    /Navigation.tsx     # Header nav with helmet logo (transparent on hero)
    /ui/                # shadcn/ui component library (Button, Badge, Switch, etc.)
  /data
    /projects.ts        # All project content data (full verbatim)
/public
  /images
    /logo.png           # Helmet logo
    /projects/
      /*.png            # Project thumbnails (5 total)
      /image-urls.json  # Reference file with all case study image URLs
      /jarvis/          # Case study images for Jarvis project (18 images)
  /videos
    /jarvis-prototype.mp4  # Jarvis prototype demo video
```

## Projects Data

| ID | Title | Subtitle | Year |
|----|-------|----------|------|
| humanics-calendar-sharing | Humanics | Calendar Sharing | July 2019 |
| humanics-swap-withdraw | Humanics | Swap & Withdraw | May 2019 |
| roblox-nux | Roblox | New User Experience | Aug 2018 |
| jarvis | Jarvis | Connected Car App | June 2017 |
| xcode-touch-bar | Apple Xcode | Touch Bar | Aug 2016 |

## Dev Server

```bash
npm run dev
# Runs on http://localhost:3000
```

## Technical Notes

- Using Next.js App Router (not Pages Router)
- Server Components by default, Client Components where needed (scroll effects)
- Images downloaded via Firecrawl hash extraction (bypassed CDN auth)
- Contact form uses mailto: fallback (can integrate Formspree/EmailJS later)
- Hero scroll effect: fixed hero with content sliding over, opacity fade on scroll

## Key Decisions & Context

### Why These Choices
- **Next.js over plain HTML**: SEO benefits, easy Vercel deployment, component reuse
- **App Router over Pages Router**: Modern approach, better for static generation
- **Tailwind CSS**: Rapid styling, dark mode support built-in
- **No CMS**: Content rarely changes, data file (`projects.ts`) is simpler
- **Firecrawl for scraping**: Bypassed Adobe CDN auth by extracting hash URLs

### What Works (Use These Methods)
- **Firecrawl MCP**: Can scrape full content, extract image URLs with auth hashes
- **Direct curl with hash URLs**: Adobe CDN accepts requests when `?h=` hash is included
- **rawHtml format**: Gets full page HTML including dynamically loaded content

### What Was Attempted & Failed (Don't Retry)
- **wget site scrape**: Adobe Portfolio uses JavaScript rendering, wget only gets shell HTML
- **curl without hash**: Adobe CDN requires `?h=` hash parameter
- **WebFetch for images**: Returns auth error without hash

### Adobe Portfolio URLs That Work
- `designed.cloud/` - Home/About content
- `designed.cloud/mywork` - Project list with thumbnails
- `designed.cloud/about` - Bio text
- `designed.cloud/contact` - Contact form structure
- `designed.cloud/humanics-calendar-sharing` - Full case study
- `designed.cloud/humanics-swap-withdraw` - Full case study
- `designed.cloud/roblox` - Full case study
- `designed.cloud/jarvis` - Full case study
- `designed.cloud/xcode` - Full case study

## Content Verification

All content verified against Adobe Portfolio on 2025-12-30:
- About bio: Exact match (word-for-word)
- Project content: Full verbatim (scraped via Firecrawl)
- Project titles/dates: All 5 match
- Thumbnails: All downloaded at full resolution
- LinkedIn: linkedin.com/in/godwinjohnson/

## Authentication System

**Full documentation:** [`docs/architecture/AUTH_SYSTEM.md`](docs/architecture/AUTH_SYSTEM.md) | [`docs/architecture/API_REFERENCE.md`](docs/architecture/API_REFERENCE.md)

### Quick Reference

- **Magic link auth** - Passwordless, one-time use tokens (15 min expiry)
- **Sessions** - HTTP-only cookies, 7-day expiry, stored in Redis
- **Access control** - Admin approves viewers, can grant per-project or all-project access
- **Security** - Rate limiting, input validation, session revocation

### Key Files

```
src/lib/auth/          # Auth library (types, redis, tokens, sessions, email)
src/app/api/auth/      # Public auth routes (request, verify, logout)
src/app/admin/api/     # Admin routes (viewers, approve, revoke, etc.)
```

### Environment Variables

```env
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
RESEND_API_KEY="re_..."
SUPER_ADMIN_EMAIL="godwinjohnson@me.com"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

## Deployment Steps

1. Push to GitHub repository
2. Connect repo to Vercel
3. Deploy to Vercel
4. Add custom domain `designed.cloud` in Vercel
5. Update GoDaddy DNS:
   - Remove Adobe Portfolio records
   - Add Vercel DNS records (CNAME or A records)
6. Wait for DNS propagation
7. Verify SSL certificate
