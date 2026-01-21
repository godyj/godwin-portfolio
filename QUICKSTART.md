# Godwin Portfolio - Quick Start

> Last updated: 2026-01-21 00:10 PST

## TL;DR

Portfolio site migration from Adobe Portfolio → Next.js + Vercel

**Current Handoff:** See [COMMS.md](COMMS.md) for latest session status

```bash
cd /Users/godwinjohnson/Development/godwin-portfolio
npm run dev
# → http://localhost:3000 (or 3001 if 3000 is in use)
```

## Current State: DEPLOYED & LIVE

| Component | Status |
|-----------|--------|
| Pages (Home, About, Contact, Projects) | ✅ Done |
| Full case study content (5 projects) | ✅ Done |
| About bio (exact match) | ✅ Done |
| Navigation + dark mode | ✅ Done |
| Project images (all 5 thumbnails) | ✅ Done |
| Helmet logo | ✅ Done |
| Yellow hero section | ✅ Done |
| **Design system (globals.css)** | ✅ Done |
| **Jarvis case study (18 images + video)** | ✅ Done |
| **Typography & spacing matched** | ✅ Done |
| **Consistent page layouts** | ✅ Done |
| **Fade-in animations** | ✅ Done |
| **Project card hover (overlay + zoom)** | ✅ Done |
| **Color token system** | ✅ Done |
| **Nav hover indicator** | ✅ Done |
| **Lightbox + Video player** | ✅ Done |
| **Xcode case study (22 images)** | ✅ Done (verified 2025-12-31) |
| **Roblox case study (12 images)** | ✅ Done (verified 2025-12-31) |
| **Humanics Swap & Withdraw (21 images)** | ✅ Done (verified 2025-12-31) |
| **Humanics Calendar Sharing (40 images)** | ✅ Done (verified 2026-01-03) |
| **Image zoom for flow diagrams** | ✅ Done (2026-01-03) |
| **Auth walking skeleton** | ✅ Done (2026-01-03) |
| **Home page UI refinements** | ✅ Done (2026-01-03) |
| **Project Selection UI** | ✅ Done (2026-01-20) |
| **Vercel deployment** | ✅ Done (2026-01-21) |
| **Domain config** | ✅ Done (2026-01-21) |

## Xcode Images: VERIFIED CORRECT

### Verification (2025-12-31)
All 22 Xcode case study images have been verified to be correct:

1. **Downloaded fresh copies** from Adobe CDN with auth hashes
2. **Compared MD5 checksums** of all 22 local files vs fresh CDN downloads
3. **All 22 images match exactly** - the files are identical to the CDN source

### Image Mapping (Verified)
| # | Local File | CDN UUID | Status |
|---|------------|----------|--------|
| 1 | app-icon.jpg | d4fef044... | ✅ Match |
| 2 | touch-bar-interface.jpg | 59f65d23... | ✅ Match |
| 3 | main-window.jpg | a5d7f55d... | ✅ Match |
| 4 | 6-contexts.jpg | a5569218... | ✅ Match |
| 5 | mind-map.jpg | b0a8b81a... | ✅ Match |
| 6 | window-toolbar-navigator.jpg | 8a9647bb... | ✅ Match |
| 7 | touchbar-exploration-toolbar.jpg | 3627d11c... | ✅ Match |
| 8 | touchbar-exploration-filter-field.jpg | 03daf9ee... | ✅ Match |
| 9 | touchbar-final-toolbar-navigator.jpg | c91d0078... | ✅ Match |
| 10 | window-top-bar-editor.jpg | a61ad53e... | ✅ Match |
| 11 | touchbar-final-editor-top-bar.jpg | 9f0bec77... | ✅ Match |
| 12 | window-ib-canvas.jpg | b2e196fd... | ✅ Match |
| 13 | touchbar-final-ib-canvas.jpg | 62ad2b73... | ✅ Match |
| 14 | window-debug-bar.jpg | c91a64a8... | ✅ Match |
| 15 | touchbar-final-debug-bar.jpg | c7a8cfa5... | ✅ Match |
| 16 | window-view-debugger.jpg | 4354639b... | ✅ Match |
| 17 | touchbar-view-filter-exploration-previews.jpg | 7249663b... | ✅ Match |
| 18 | touchbar-view-filter-exploration-no-previews-1.jpg | eb2e141d... | ✅ Match |
| 19 | touchbar-view-filter-exploration-no-previews-2.jpg | f453fded... | ✅ Match |
| 20 | touchbar-final-view-debugger.jpg | 67579c0a... | ✅ Match |
| 21 | touchbar-final-view-filter.jpg | ca8c9b93... | ✅ Match |
| 22 | glyphs.jpg | 28adeaac... | ✅ Match |

### Cache Issue Fix (2025-12-31)
**Problem:** Images appeared wrong on page despite files being correct. Next.js image optimization cache (`.next/cache/images`) was corrupted.

**Fix:**
```bash
rm -rf .next && npm run dev
```

### Xcode Project Config
In `projects.ts`, Xcode uses:
- `layout: "content-first"` (no hero image)
- `sections` with `blocks` array for interspersed text/images

## Design System

**Source of truth:** `src/app/globals.css`

### Typography
- **Font**: Jost (free alternative to Futura PT used in original)
- **Line height**: 1.5 (`leading-normal`)
- **Body text**: 400 weight
- **Bold labels**: 700 weight (`font-bold`)
- **Intro text**: 500 weight (`font-medium`), 24px

### Spacing (matched to original Adobe Portfolio)
| Token | Value | Use |
|-------|-------|-----|
| `--space-2-5` | 10px | Image padding-top |
| `--space-5` | 20px | Paragraph/image padding-bottom |
| `--space-10` | 40px | Image grid padding-bottom |
| `--color-accent-red` | #e01414 | Confidential notices |

## Authentication System: COMPLETE

### What's Implemented

- **Magic link auth** via Resend email (domain: designed.cloud)
- **Upstash Redis** for session/token storage
- **Admin dashboard** at `/admin` to approve/deny/revoke viewers
- **Project locking** via `locked: true` in projects.ts
- **Granular access control** - can limit viewers to specific projects
- **Lock/check badges** on project cards showing access status

### Currently Locked Projects
- `xcode-touch-bar` - Apple Xcode (Touch Bar)
- `roblox-nux` - Roblox (NUX)

### Test Accounts
- **Admin**: godwinjohnson@me.com (full access)
- **Viewer**: godyj@me.com (Xcode only, not Roblox)

### Documentation
- **Analysis**: [docs/AUTH_ANALYSIS.md](docs/AUTH_ANALYSIS.md) - Database & email choice rationale
- **Implementation**: [docs/AUTH_IMPLEMENTATION_PLAN.md](docs/AUTH_IMPLEMENTATION_PLAN.md) - Full plan with code
- **How Auth Works**: See CLAUDE.md → Authentication System section

## Project Selection UI: COMPLETE (2026-01-20)

### What's Implemented
- **Project Selection Modal** - Admin can choose which projects to grant when approving
- **"Select All" toggle** - Grants access to all current and future locked projects
- **Track requested project** - Modal defaults to the project user requested access from
- **Edit flow** - Admin can modify viewer's project access after approval
- **Project badges** - Dashboard shows which projects each viewer has access to

### Key Files
| File | Purpose |
|------|---------|
| `src/components/ProjectSelectionModal.tsx` | Modal with project checkboxes |
| `src/app/admin/AdminDashboard.tsx` | Admin UI with approve/edit flows |
| `src/app/admin/api/locked-projects/route.ts` | GET locked projects |
| `src/app/admin/api/update-access/route.ts` | POST to update viewer's projects |

### Documentation
- **Implementation**: [docs/implementation/PROJECT_SELECTION_UI_PLAN.md](docs/implementation/PROJECT_SELECTION_UI_PLAN.md)
- **Session log**: [docs/session-logs/2026-01-20-project-selection-ui-planning.md](docs/session-logs/2026-01-20-project-selection-ui-planning.md)

## Next Session: Refinements

### Remaining Refinements (see [TODO.md](TODO.md))
- [ ] Admin ability to delete/remove viewers from list
- [ ] Approve from denied list should show project selection modal
- [ ] Admin UI to choose which projects are locked/unlocked globally
- [ ] Expiration date picker for viewer access
- [ ] React Email templates for prettier emails
- [ ] Test auth flow on production (magic link emails)

## Key Files

| File | Purpose |
|------|---------|
| `src/data/projects.ts` | All project content (edit here to update) |
| `src/app/page.tsx` | Home page - yellow hero + project grid |
| `src/app/about/page.tsx` | About page |
| `src/app/contact/page.tsx` | Contact form |
| `src/app/projects/[id]/page.tsx` | Project detail template |
| `src/components/Navigation.tsx` | Header nav with logo |
| `src/components/ProjectContent.tsx` | Case study renderer with lightbox |
| `src/components/Lightbox.tsx` | Full-screen image viewer |
| `src/components/VideoPlayer.tsx` | Custom video player with play overlay |
| `src/app/globals.css` | Global styles + design system |

## Images Location

```
/public/images/
├── logo.png                    # Helmet logo (21 KB)
└── projects/
    ├── humanics-calendar.png   # Thumbnail
    ├── humanics-swap.png       # Thumbnail
    ├── roblox.png              # Thumbnail
    ├── jarvis.png              # Thumbnail
    ├── xcode.png               # Thumbnail
    ├── humanics-calendar/      # 40 case study images (verified)
    ├── humanics-swap/          # 21 case study images (verified)
    ├── roblox/                 # 12 case study images (verified)
    ├── jarvis/                 # 18 case study images
    └── xcode/                  # 22 case study images (verified)
```

## Projects in Portfolio

| ID | Title | Year | Images |
|----|-------|------|--------|
| `humanics-calendar-sharing` | Humanics (Calendar Sharing) | July 2019 | ✅ Done (40 images) |
| `humanics-swap-withdraw` | Humanics (Swap & Withdraw) | May 2019 | ✅ Done (21 images) |
| `roblox-nux` | Roblox (NUX) | Aug 2018 | ✅ Done (12 images) |
| `jarvis` | Jarvis (Connected Car App) | June 2017 | ✅ Done (18 images) |
| `xcode-touch-bar` | Apple Xcode (Touch Bar) | Aug 2016 | ✅ Done (22 images) |

## Common Tasks

### Add/Edit a Project
Edit `src/data/projects.ts` - each project has:
- `id`, `title`, `subtitle`, `description`
- `role`, `skills[]`, `results`
- `sections[]` - array of `{title, content}` or `{title, blocks}` for case study

### Change Styling
- Global: `src/app/globals.css`

### Update Contact Form
Currently uses `mailto:` - can integrate:
- Formspree
- EmailJS
- Custom API route

## Tech Stack
- Next.js 16.1.1 (App Router)
- TypeScript
- Tailwind CSS
- Vercel (deployment)

## Page Layout Pattern

All pages use consistent layout:
```jsx
<div className="min-h-screen bg-white dark:bg-background-page pt-[70px]">
  <div className="max-w-3xl mx-auto px-6 py-16">
    <div className={`transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      {/* Content */}
    </div>
  </div>
</div>
```

## Session History
- **Session 1 (2025-12-30)**: Initial setup, content extraction, all pages created
- **Session 2 (2025-12-30)**: Full verbatim content via Firecrawl, images downloaded, layout matched
- **Session 3 (2025-12-30)**: Design system created, Jarvis styling matched, spacing/typography finalized
- **Session 4 (2025-12-30)**: Fixed dark strip bug, consistent page layouts, nav flash fix, animations
- **Session 5 (2025-12-31)**: Project card hover overlay with info, image zoom effect, dark card backgrounds, color token system, scroll indicator pill hover, nav hover indicator
- **Session 6 (2025-12-31)**: Lightbox component, custom video player, Xcode case study structure added, 22 Xcode images downloaded
- **Session 7 (2025-12-31)**: Verified all 22 Xcode images are correct via Playwright visual comparison and MD5 checksum verification against fresh CDN downloads. Found and fixed corrupted Next.js image cache causing wrong images to display (fix: `rm -rf .next && npm run dev`)
- **Session 8 (2025-12-31)**: Fixed Xcode inline labels (removed incorrect **Analysis:**, added bold numbered goals). Completed Roblox case study: downloaded 12 images via Playwright, converted to blocks layout, matched max-widths, verified all 21 inline labels via Playwright comparison. Updated titles to "Apple Xcode (Touch Bar)" and "Roblox (NUX)"
- **Session 9 (2025-12-31)**: Completed Humanics Swap & Withdraw case study: downloaded 21 images via Playwright URL extraction, converted to blocks layout with images interspersed, added inline label "Other Locations:", verified against original site. Updated title to "Humanics (Swap & Withdraw)". Fixed list rendering to support em dashes (`–`) with tighter spacing (`space-y-1`)
- **Session 10 (2026-01-03)**: Completed Humanics Calendar Sharing case study (final case study): downloaded 40 images via Playwright URL extraction, converted to blocks layout with images interspersed, added inline labels (Exploration 1:, Exploration 2:, Exploration 3:), verified via Playwright. Updated title to "Humanics (Calendar Sharing)". **ALL 5 CASE STUDIES NOW COMPLETE** - Ready for deployment!
- **Session 11 (2026-01-03)**: Added image zoom for flow diagrams (ZoomableImage component). Planned authentication system: researched Upstash Redis (500K free) vs Vercel KV (30K free), Resend (3K emails free) vs SendGrid (discontinued). Created `docs/AUTH_ANALYSIS.md` and `docs/AUTH_IMPLEMENTATION_PLAN.md`. Security review: added rate limiting, crypto-grade tokens, input validation, uniform responses, session invalidation.
- **Session 12 (2026-01-03)**: **Completed authentication walking skeleton.** Full magic link auth implemented with Upstash Redis + Resend. Admin dashboard at `/admin` for viewer management. Verified domain `designed.cloud` in Resend with DNS records. Tested full flow: admin login → lock project → viewer request → admin approve → viewer access. Added lock/check badges on project cards (dark circle + lock for restricted, green circle + checkmark for access granted). Granular access control working - viewers can be limited to specific projects. Locked Xcode and Roblox projects for testing.
- **Session 13 (2026-01-03)**: **Home page UI refinements.** Added fade-in animation on project cards when navigating to Work section. Raised ProjectsSection by 10px when hero is fully visible. Added "X more below" indicator (appears when cards are 90%+ hidden, only after top 2 cards 40% visible, interactive scroll-to-reveal, styled with outer ring brand-yellow at 20%). Fixed "0 more below" flash using displayCount.
- **Session 14 (2026-01-20)**: **Project Selection UI complete.** Full implementation across 5 phases (21:20-23:20 PST): walking skeleton → modal component → API + validation → dashboard integration → UX bug fix → integration testing. Modal defaults to requested project (not "Select All"). Fixed 8 files to track `requestedProject` through request chain. All tests passed. Added 4 refinements to TODO.md.
- **Session 15 (2026-01-21)**: **Vercel deployment complete.** Migrated from sk-godwin to godyj Vercel account. Fixed env var issue (echo adds newlines, use printf). Released domains from old account. Added all 4 domains (designed.cloud, www.designed.cloud, pixelworship.com, www.pixelworship.com). Updated NEXT_PUBLIC_SITE_URL to production. **PORTFOLIO IS LIVE!**

## Links
- **Live site:** https://designed.cloud
- **Alternate domain:** https://pixelworship.com
- **Vercel Dashboard:** https://vercel.com/godwin-johnsons-projects-1dd01557/godwin-portfolio
- **Domain registrar (designed.cloud):** GoDaddy
- **Domain registrar (pixelworship.com):** Dreamhost
