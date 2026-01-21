# TODO

> Active tasks and pending work for the Godwin Portfolio migration.

## Completed - Jarvis Case Study

- [x] Scraped all 5 project pages for image URLs via Firecrawl
- [x] Created image URL reference: `public/images/projects/image-urls.json`
- [x] Downloaded all 18 Jarvis images
- [x] Downloaded Jarvis prototype video (jarvis-prototype.mp4)
- [x] Implemented content blocks system for inline images
- [x] Matched image max-widths from original site
- [x] Added content-first layout for Jarvis page header
- [x] Added large intro text styling (24px, medium weight)
- [x] Removed rounded corners from images (matching original)

## In Progress - Styling & Layout

### Phase 1: Core Styling (Complete)
- [x] Analyze original Adobe Portfolio styling patterns
- [x] Document web design standards in CLAUDE.md
- [x] Remove rounded corners from case study images
- [x] Fine-tune intro text sizing and spacing
- [x] Verify all Jarvis sections match original layout
- [x] Add bold labels (Goals:, Who:, etc.) to case studies
- [x] Implement inline formatting (**bold**, _underline_)

### Phase 2: Typography Refinements (Complete)
- [x] Match font family closer to original (Jost - Futura PT alternative)
- [x] Audit heading hierarchy across all pages
- [x] Ensure consistent text colors (foreground, muted, captions)
- [x] Review line-height and letter-spacing
- [x] Refactor styles using inheritance and constants

### Phase 3: Dark Theme & Colors (Complete)
- [x] Implement warm brown dark theme (stone palette)
- [x] Custom dark background (#201612)
- [x] Consistent dark mode borders (stone-800)

### Phase 4: Navigation & Interactions (Complete)
- [x] Work link scrolls to projects section
- [x] Smooth scroll on home page
- [x] Hash navigation from other pages
- [ ] Project cards: Hover effects, image zoom transitions (done)
- [ ] Page transitions: Smooth fade between pages (optional)
- [ ] Back to top button (optional)
- [ ] Lightbox for images (optional enhancement)

## Completed - Xcode Case Study

- [x] Downloaded all 22 Xcode images
- [x] Structure sections with content blocks
- [x] Match layout to original
- [x] Fixed inline labels (removed incorrect **Analysis:**)
- [x] Added bold numbered goals (**1.**, **2.**, **3.**)
- [x] Updated title to "Apple Xcode (Touch Bar)"
- [x] Verified via Playwright

## Completed - Roblox Case Study

- [x] Downloaded all 12 Roblox images via Playwright
- [x] Structure sections with content blocks
- [x] Match layout to original
- [x] Added inline labels (Discovery and Acquisition, Signup, D0 Cycle, Challenge, Goal, Solution, Risks)
- [x] Matched image max-widths (600px, 800px, 768px, 400px, 450px)
- [x] Updated title to "Roblox (NUX)"
- [x] All 21 inline labels verified via Playwright comparison

## Completed - Humanics Calendar Sharing

- [x] Downloaded all 40 case study images via Playwright
- [x] Structure sections with content blocks
- [x] Match layout to original
- [x] Added inline labels (Exploration 1:, Exploration 2:, Exploration 3:)
- [x] Image grids: 4-image, 5-image, 6-image, 3-image, 2-image
- [x] Updated title to "Humanics (Calendar Sharing)"
- [x] Verified via Playwright

## Completed - Humanics Swap & Withdraw

- [x] Downloaded all 21 case study images via Playwright
- [x] Structure sections with content blocks
- [x] Match layout to original
- [x] Added inline label (Other Locations:)
- [x] Updated title to "Humanics (Swap & Withdraw)"
- [x] Verified via Playwright

## Phase 1: Image Zoom for Large Images ✅ COMPLETE

Large images like "Interaction Flow" diagrams have zoom functionality.

- [x] Add zoom capability to Lightbox component
- [x] Enable zoom for flow diagrams and spec images (8 images in Humanics Calendar)
- [x] Click to zoom in, click again to reset
- [x] Scroll wheel zoom support
- [x] Pan/drag when zoomed
- [x] Double-tap zoom on mobile
- [x] Zoom indicator pill showing zoom level

## Phase 3: Home Page UI Refinements ✅ COMPLETE (2026-01-03)

- [x] ProjectsSection fade-in animation on project cards
- [x] Raised ProjectsSection by 10px when hero is fully visible
- [x] "X more below" indicator when cards are hidden below fold
  - [x] Only shows after top 2 cards are 40%+ visible
  - [x] Styled with ProjectsSection fill color + outer ring (brand-yellow at 20%)
  - [x] Interactive - clicking scrolls to reveal all hidden cards
  - [x] Fixed "0 more below" flash using displayCount

## Phase 2: Project Authentication System ✅ COMPLETE

Lock projects behind email-based magic link authentication.

**Documentation:**
- [docs/AUTH_ANALYSIS.md](docs/AUTH_ANALYSIS.md) - Database & email service analysis
- [docs/AUTH_IMPLEMENTATION_PLAN.md](docs/AUTH_IMPLEMENTATION_PLAN.md) - Full implementation plan

### Architecture ✅ COMPLETE
- [x] Design database schema for viewer access (Redis keys: viewer, token, session, sessions)
- [x] Choose email service → **Resend** (3K emails/month free)
- [x] Choose database → **Upstash Redis** (500K requests/month free)
- [x] Define magic link flow (15-min tokens, 7-day sessions)
- [x] Security review (rate limiting, crypto-grade tokens, input validation)

### Walking Skeleton ✅ COMPLETE (2026-01-03)
- [x] Install dependencies (`@upstash/redis @upstash/ratelimit resend zod`)
- [x] Create `src/lib/auth/*` (redis, tokens, sessions, validation, ratelimit, email, types)
- [x] Create `/api/auth/request` route (with rate limiting, validation)
- [x] Create `/api/auth/verify` route
- [x] Create `/api/auth/logout` route
- [x] Create `/api/auth/test-session` route (Playwright bypass)
- [x] Create `AccessRequestModal` component
- [x] Create `ProtectedProject` wrapper component
- [x] Create `/admin` page (list/approve/deny viewers)
- [x] Create Playwright test helpers (`tests/helpers/auth.ts`)
- [x] Add `locked: true` to Xcode and Roblox projects
- [x] Add `locked: true` to all 5 projects (2026-01-21)
- [x] Verify Resend domain (designed.cloud) with DNS records
- [x] Test full flow: admin login → viewer request → approval → access
- [x] Lock/check badges on project cards

### Project Selection UI ✅ COMPLETE (2026-01-20)
- [x] Project selection modal for approve/edit flows
- [x] "Select All" toggle with individual project checkboxes
- [x] Track requested project in viewer record
- [x] Modal defaults to requested project (not "Select All") when approving
- [x] Edit flow shows current access and allows changes
- [x] Project badges show which projects viewer has access to

### Refinements (After Skeleton)
- [ ] Design better admin login solution (currently requires magic link from locked project)
- [x] Project selection UI in admin approval flow (checkboxes)
- [ ] Admin ability to delete/remove viewers from list
- [ ] Approve from denied list should show project selection modal (not auto-approve)
- [ ] Consider inline approval UI instead of modal (reduced clicks)
- [ ] Admin UI to choose which projects are locked/unlocked globally (all 5 currently locked via code)
- [ ] Expiration date picker for viewer access
- [ ] React Email templates
- [ ] Audit logging
- [ ] Image protection - prevent easy downloading of portfolio images (right-click disable, drag prevention, CSS overlay techniques)

## Deployment ✅ COMPLETE (2026-01-21)

### Pre-deployment
- [x] All case study images saved to `/public/images/projects/`
- [x] Run `npm run build` successfully
- [x] Test all pages locally
- [x] Test dark mode on all pages
- [ ] Test mobile responsiveness

### Vercel Setup
- [x] Push code to GitHub
- [x] Connect repository to Vercel (godyj account)
- [x] Deploy to Vercel
- [x] Note Vercel deployment URL: https://godwin-portfolio-neon.vercel.app

### Domain Configuration
- [x] Add `designed.cloud` as custom domain in Vercel
- [x] Add `pixelworship.com` as custom domain in Vercel
- [x] DNS records already configured (A record: 76.76.21.21, CNAME: cname.vercel-dns.com)
- [x] DNS propagation complete

### Post-deployment
- [x] Verify site loads at `designed.cloud`
- [x] Verify site loads at `pixelworship.com`
- [x] Verify SSL certificate is active
- [ ] Test all pages and navigation
- [ ] Test on mobile devices
- [ ] Verify dark mode works
- [x] Test auth flow on production (magic link emails) ✅

