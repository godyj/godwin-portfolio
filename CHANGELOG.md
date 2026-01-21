# Changelog

All notable changes to the Godwin Portfolio migration project.

---

## [1.5.0] - 2026-01-21 (00:37 PST)

### Added
- **Production deployment complete**: Portfolio now LIVE at two domains
  - Primary: https://designed.cloud (GoDaddy DNS)
  - Alternate: https://pixelworship.com (Dreamhost DNS)
  - All 4 variants working (with/without www)
  - SSL certificates active (Let's Encrypt, auto-renewing)

### Changed
- **Environment variables**: Migrated from local `.env` to Vercel production
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`
  - `RESEND_API_KEY`
  - `SUPER_ADMIN_EMAIL`
  - `NEXT_PUBLIC_SITE_URL` → `https://designed.cloud`

### Verified
- All authentication flows working in production ✅
- Magic link emails sending correctly via Resend ✅
- Admin dashboard accessible at /admin ✅
- Locked projects showing lock badges ✅
- SSL certificates valid on all domain variants ✅

### Technical Notes
- Migrated Vercel project from `sk-godwin` account to `godyj` account
- DNS propagation completed within 1 hour
- SSL certificate provisioning caused brief "connection not private" warning during initial setup (resolved automatically)

---

## [1.4.0] - 2026-01-20 (22:00 PST)

### Added
- **Project Selection UI for admin approval**: Admins can now grant viewers access to specific locked projects
  - New `ProjectSelectionModal.tsx` component (175 lines)
  - New `/admin/api/locked-projects` endpoint returns list of locked projects
  - Modal appears when approving pending viewers or editing approved viewer access
  - Intelligent defaults: pre-selects the project user originally requested access from

- **Requested project tracking**: System now remembers which project triggered access request
  - Added `requestedProject` field to `ViewerAccess` type
  - Flows through entire request chain (modal → API → Redis → admin dashboard)

### Changed
- **Admin dashboard**: Integrated project selection modal for Approve and Edit actions
- **Access request flow**: Now sends `projectId` to track which project user requested
- **Update access API**: Added validation to ensure at least one project is selected

### Fixed
- **UX bug**: Modal no longer defaults to "Select All" - now correctly defaults to requested project only

### Files Modified
- `src/lib/auth/types.ts` - Added `LockedProject` type, `requestedProject` to `ViewerAccess`
- `src/components/ProjectSelectionModal.tsx` - NEW (175 lines)
- `src/app/admin/api/locked-projects/route.ts` - NEW
- `src/app/admin/api/update-access/route.ts` - Added validation
- `src/app/admin/AdminDashboard.tsx` - Integrated modal
- `src/components/ProtectedProject.tsx` - Added projectId prop
- `src/components/AccessRequestModal.tsx` - Send projectId in request
- `src/app/api/auth/request/route.ts` - Store requestedProject
- `src/app/projects/[id]/page.tsx` - Pass projectId to ProtectedProject
- `src/app/resume/page.tsx` - Pass projectId to ProtectedProject

### Verified
- Modal correctly defaults to requested project ✅
- Admin can modify selection before confirming ✅
- Edit flow works for already-approved viewers ✅
- Access control properly enforces project-level permissions ✅

---

## [1.3.1] - 2026-01-03 (21:38 PST)

### Added
- **"X more below" indicator**: Shows when project cards are hidden below fold
  - Appears only after top 2 cards are 40%+ visible
  - Styled with ProjectsSection fill color, outer ring (brand-yellow at 20% opacity)
  - Interactive: clicking scrolls to reveal all hidden cards
  - Fixed "0 more below" flash by preserving last non-zero count during fade-out

### Changed
- **ProjectsSection positioning**: Raised by 10px when hero is fully visible (`-mt-[42px]`)
- **Project grid animation**: Fade-in animation on project cards when navigating to Work section

### Files Modified
- `src/components/ProjectsSection.tsx` - Animation, hidden card detection, interactive indicator
- `src/components/ProjectGrid.tsx` - Added `data-project-card` attribute for DOM selection

---

## [1.3.0] - 2026-01-03 (23:30 PST)

### Added
- **Authentication walking skeleton complete**: Full magic link auth system implemented
  - Upstash Redis for session/token storage
  - Resend for email with verified domain `designed.cloud`
  - Admin dashboard at `/admin` for viewer management
  - Lock/check badges on project cards showing access status
  - Granular access control (limit viewers to specific projects)

### Auth System Files Created
```
src/lib/auth/           # Auth library (8 files)
src/app/api/auth/       # API routes (request, verify, logout, test-session)
src/app/admin/          # Admin dashboard + API routes
src/components/         # AccessRequestModal, ProtectedProject, ProjectGrid
```

### Security Features
- HTTP-only, Secure, SameSite cookies
- 15-minute magic link expiration (one-time use)
- 7-day session expiration
- Rate limiting on auth endpoints
- Crypto-grade token generation (crypto.randomBytes)
- Bulk session revocation on access revoke

### Currently Locked Projects
- `xcode-touch-bar` - Apple Xcode (Touch Bar)
- `roblox-nux` - Roblox (NUX)

### Test Accounts
- Admin: godwinjohnson@me.com (full access)
- Viewer: godyj@me.com (Xcode only)

### Verified
- Admin login via magic link ✅
- Viewer access request → admin approval → viewer login ✅
- Lock icons for restricted projects ✅
- Checkmark icons for approved access ✅
- Granular project access control ✅

---

## [1.2.0] - 2026-01-03 (20:45 PST)

### Added
- **Authentication system architecture complete**: Full planning for magic link auth
  - Database: **Upstash Redis** (500K requests/month free vs Vercel KV's 30K)
  - Email: **Resend** (3K emails/month free; SendGrid discontinued free tier May 2025)
  - Magic link flow: 15-min token expiry, one-time use, 7-day sessions
  - Admin uses same magic link system (simplicity over separate password auth)

- **Documentation created**:
  - [docs/AUTH_ANALYSIS.md](docs/AUTH_ANALYSIS.md) - Database & email service comparison
  - [docs/AUTH_IMPLEMENTATION_PLAN.md](docs/AUTH_IMPLEMENTATION_PLAN.md) - Full implementation plan with code

- **Security Expert role added to CLAUDE.md**: Claude now acts as web security expert
  - Must design secure solutions (HTTP-only cookies, input validation, crypto-grade tokens)
  - Must proactively identify and call out security concerns
  - Must refuse insecure implementations or propose secure alternatives

### Security Review
Conducted full security audit against high standards. Issues found and fixed:

| Issue | Severity | Resolution |
|-------|----------|------------|
| No rate limiting | HIGH | Added @upstash/ratelimit (5-10 req/min per endpoint) |
| Email enumeration | HIGH | Uniform responses for all email requests |
| Weak token generation | MEDIUM | crypto.randomBytes(32) instead of nanoid |
| No input validation | MEDIUM | zod schemas for email and token validation |
| Session not invalidated on revoke | MEDIUM | invalidateAllSessions() bulk deletion |

### Playwright Testing
- Added test bypass API (`/api/auth/test-session`) with proper security gates
- `AUTH_TEST_MODE` environment variable required
- Test helpers: `loginAsViewer()`, `loginAsAdmin()`, `logout()`

### Key Learnings
1. **Vercel KV vs Upstash**: Vercel KV uses Upstash under the hood but with 16x fewer free requests (30K vs 500K) - go direct to Upstash for cost savings
2. **SendGrid free tier discontinued**: As of May 2025, Resend is the best free option for transactional email
3. **Security must be built in from the start**: Rate limiting and input validation are not "nice to haves" - they're required for the walking skeleton
4. **Uniform responses prevent enumeration**: Never reveal whether an email exists in the system through different response messages
5. **Session tracking enables revocation**: Store session IDs by email (`sessions:{email}`) for bulk invalidation when access is revoked

### Status
- Architecture: ✅ Complete
- Documentation: ✅ Complete
- Walking skeleton: ⏳ Awaiting user Upstash/Resend credentials

---

## [1.1.0] - 2026-01-03 (18:12 PST)

### Added
- **Image zoom functionality for large diagrams**: Flow diagrams and spec documents now support zoom
  - Click to zoom in (2x), click again to reset
  - Scroll wheel zoom (up to 4x)
  - Pan/drag when zoomed
  - Double-tap zoom on mobile
  - Zoom indicator pill showing current zoom level
  - Reset button when zoomed
- **Reusable ZoomableImage component** (`src/components/ZoomableImage.tsx`)
  - Can be used anywhere for zoomable images
  - Configurable max zoom level
  - Optional zoom hint

### Changed
- **Lightbox component**: Added `enableZoom` prop for zoom functionality
- **ContentBlock type**: Added `zoomable?: boolean` property for images

### Enabled zoom for
- Humanics Calendar: interaction-flow-initial, 4 brainstorm images, calendar-data-spec, flow-from-calendar, flow-from-profile
- Humanics Swap: workflow-diagram
- Roblox: ftux-flow

---

## [1.0.0] - 2026-01-03 (17:45 PST)

### Added
- **Humanics (Calendar Sharing) case study complete**: Full migration with 40 images - FINAL CASE STUDY!
  - Downloaded all 40 images from Adobe CDN via Playwright URL extraction
  - Converted to blocks layout with images interspersed with text
  - Image types: header intro, calendar views (2), user research photo, 4-image grid (round 1 screens), interaction flow, complicated diagram, brainstorming sketches (4), exploration grids (5-image ×2, 6-image, 3-image), round 2 screens (2-image ×2), calendar data spec, flow diagrams (2)
  - Image max-widths matched to original (350px mobile screens, 450px 2-col grids, 500px diagrams, 700px wide images)
  - Inline labels `**Exploration 1:**`, `**Exploration 2:**`, `**Exploration 3:**` verified via Playwright

### Changed
- **Title format standardization**: "Humanics" → "Humanics (Calendar Sharing)"
- **Layout**: Changed to `content-first` (centered header, no hero image)

### Image Structure
| Image Type | Count | Max Width |
|------------|-------|-----------|
| Header intro | 1 | 600px |
| Mobile screens (single) | 2 | 350px |
| User research photo | 1 | 700px |
| 4-image grid (round 1) | 1 | 700px |
| Interaction flow diagrams | 3 | 700px |
| Complicated diagram | 1 | 500px |
| Brainstorming sketches | 4 | 700px |
| 5-image grids (explorations) | 2 | 700px |
| 6-image grid (exploration 3) | 1 | 700px |
| 3-image grid (calendar flow) | 1 | 450px |
| 2-image grids (round 2) | 2 | 450px |
| Calendar data spec | 1 | 700px |

### Milestone
- **ALL 5 CASE STUDIES NOW COMPLETE** - Ready for Vercel deployment!
  - Humanics Calendar Sharing: 40 images
  - Humanics Swap & Withdraw: 21 images
  - Roblox NUX: 12 images
  - Jarvis: 18 images + 1 video
  - Apple Xcode Touch Bar: 22 images
  - **Total: 113 images + 1 video**

### Verified via Playwright
- All 40 images downloaded and render correctly
- Inline labels "Exploration 1:", "Exploration 2:", "Exploration 3:" match original site
- Page structure matches original Adobe Portfolio

### Technical Notes
- Used Playwright MCP to extract fresh image URLs with valid auth hashes
- Cleared Next.js cache (`rm -rf .next`) before verification
- Dev server runs on port 3000

---

## [0.9.4] - 2025-12-31 (20:01 PST)

### Added
- **Humanics (Swap & Withdraw) case study complete**: Full migration with 21 images
  - Downloaded all 21 images from Adobe CDN via Playwright URL extraction
  - Converted to blocks layout with images interspersed with text
  - Image types: header intro, brainstorming sketch, 5-image grids (hifi concepts, withdraw exploration), 2-image grids (other locations, pending states, final UI), workflow diagram
  - Image max-widths matched to original (350px single mobile screens, 450px 2-col grids, 700px wide images)
  - Inline label `**Other Locations:**` verified via Playwright comparison

### Changed
- **Title format standardization**: "Humanics" → "Humanics (Swap & Withdraw)"
- **Layout**: Changed to `content-first` (centered header, no hero image)

### Fixed
- **List rendering in ProjectContent.tsx**: Added em dash (`–`) detection for list items in `content` fields
- **List spacing**: Changed from `space-y-2` to `space-y-1` for tighter list spacing matching original
- **Stakeholders section**: Uses `content` field with em dash list items, now renders with proper tight spacing instead of separate paragraphs

### Image Structure
| Image Type | Count | Max Width |
|------------|-------|-----------|
| Header intro | 1 | 600px |
| Mobile screens (single) | 4 | 350px |
| Brainstorming sketch | 1 | 700px |
| 5-image grids | 2 | 700px |
| 2-image grids | 4 | 450-700px |
| Workflow diagram | 1 | 700px |

### Verified via Playwright
- All 21 images downloaded and render correctly
- Inline label "Other Locations:" matches original site
- Page structure matches original Adobe Portfolio

### Technical Notes
- Used Playwright MCP to extract fresh image URLs with valid auth hashes
- Cleared Next.js cache (`rm -rf .next`) before verification
- Dev server runs on port 3001 when 3000 is occupied

---

## [0.9.3] - 2025-12-31 (19:39 PST)

### Added
- **Roblox (NUX) case study complete**: Full migration with 12 images
  - Downloaded all 12 images from Adobe CDN via Playwright URL extraction
  - Converted to blocks layout with images interspersed with text
  - Image max-widths matched to original (600px, 800px, 768px, 400px, 450px)
  - All 21 inline labels verified via Playwright comparison

### Fixed
- **Xcode inline labels**: Removed incorrect `**Analysis:**` label (was just part of sentence)
- **Xcode numbered goals**: Added bold formatting to numbered items (`**1.**`, `**2.**`, `**3.**`)

### Changed
- **Title format standardization**:
  - Xcode: "Apple Xcode" → "Apple Xcode (Touch Bar)"
  - Roblox: "Roblox" → "Roblox (NUX)"
- **Roblox inline labels added**:
  - "Breaking Down the Problem": `**Discovery and Acquisition:**`, `**Signup:**`, `**D0 Cycle:**`
  - "Short Term Plan": `**Challenge:**`, `**Goal:**`, `**Solution:**`, `**Risks:**`

### Verified via Playwright
- All 12 Roblox images render at correct max-widths
- All 21 Roblox inline labels match original site exactly
- Visual comparison screenshots captured

### Technical Notes
- Used Playwright MCP to extract fresh image URLs with valid auth hashes
- Image hashes expire - must use Playwright to get live URLs, not cached scrapes
- Dev server runs on port 3002 when 3000 is occupied

---

## [0.9.2] - 2025-12-31 (18:30 PST)

### Fixed
- **Xcode images displaying wrong content**: Resolved corrupted Next.js image cache
  - **Symptom**: Images appeared wrong on page (e.g., glyphs showing instead of MacBook Pro)
  - **Root cause**: Next.js image optimization cache (`.next/cache/images`) was corrupted
  - **Verification**: Actual image files on disk were correct (MD5 checksums matched CDN)
  - **Fix**: `rm -rf .next && npm run dev` to clear cache and rebuild

### Key Learnings for Future Case Studies
1. **Checksum verification alone is insufficient**: Files on disk can be correct while cached optimized images are wrong
2. **Always visual verify**: Use Playwright to screenshot and compare actual rendered pages
3. **Next.js image cache can corrupt**: When images appear wrong despite correct files, clear `.next` folder
4. **Test optimized URLs directly**: Check `/_next/image?url=...` endpoints to verify what's being served
5. **Full workflow for image debugging**:
   ```bash
   # 1. Verify source file is correct
   curl -s "http://localhost:3000/images/projects/xcode/touch-bar-interface.jpg" | md5

   # 2. Check what Next.js optimized cache is serving
   curl -s "http://localhost:3000/_next/image?url=%2Fimages%2Fprojects%2Fxcode%2Ftouch-bar-interface.jpg&w=1920&q=75" -o test.webp

   # 3. If mismatch, clear cache
   rm -rf .next && npm run dev
   ```

### Technical Notes
- Next.js stores optimized images in `.next/cache/images/`
- Cache can become corrupted if images are renamed/replaced while server is running
- Always restart dev server after replacing image files
- Visual comparison with Playwright is the definitive test, not checksums

### Inline Label Verification Process
When adding a new case study, verify all inline labels match the original:

1. **Extract labels from original site** using Playwright:
   ```javascript
   // Find all elements with font-weight in style attribute
   document.querySelectorAll('[style*="font-weight"]')
   ```

2. **Distinguish section titles from inline labels** by font-size:
   - Section titles: ~28px, font-weight 500
   - Inline labels: ~21px (body size), font-weight 700

3. **Check our projects.ts** for each label:
   - Section titles → use `title:` property
   - Inline labels → use `**Label:**` markdown syntax in content

4. **Common inline labels** (should use `**text:**` not `title:`):
   - Why:, Goals:, Who:, Research:, Analysis:
   - Solution:, Challenges:, Outcome:
   - Production:, Analytics & Metrics:
   - Testing & Prototypes:, Idea #1, Idea #2, etc.

5. **Verify all labels are present** and marked with `**bold:**` syntax

---

## [0.9.1] - 2025-12-31 (18:03 PST)

### Added
- **Xcode case study structure**: Full content blocks with all 22 images positioned
  - Uses `layout: "content-first"` (no hero image, centered header)
  - `sections` with `blocks` array for interspersed text/images
  - App icon at top with 350px max-width, noLightbox
  - All section titles and content matched to original
- **22 Xcode case study images**: Downloaded from Adobe CDN
  - app-icon.jpg, touch-bar-interface.jpg, main-window.jpg, 6-contexts.jpg
  - mind-map.jpg, window-toolbar-navigator.jpg, and 16 more
  - All images verified via MD5 checksum match

### Technical Notes
- Used Playwright MCP to inspect element sizes on both sites
- App icon renders at 350x350px on both original and new site
- Image comparison done via MD5 checksums - all 22 match

---

## [0.9.0] - 2025-12-31 (15:40 PST)

### Added
- **Lightbox component**: Clickable images that open in full-screen modal
  - All case study images are now clickable for enlarged view
  - Dark overlay (90% opacity) with backdrop blur
  - Close via X button, click outside, or Escape key
  - Caption displayed at bottom of lightbox
  - Full-resolution images via `unoptimized` Next.js Image prop
  - Hover effect: subtle zoom (1.02x) + dark overlay + magnifying glass icon
- **Custom video player**: Simple play button overlay (replaces browser controls)
  - Large centered play button (80px white circle)
  - Click anywhere to play/pause
  - Native controls appear on hover while playing
  - Play button reappears when video ends
- **Global component styles**: Reusable CSS classes in `globals.css`
  - Video player: `.video-player`, `.video-player-overlay`, `.video-play-button`
  - Lightbox: `.lightbox-overlay`, `.lightbox-close`, `.lightbox-image-container`, `.lightbox-caption`
- **CSS custom properties for video player**:
  - `--video-play-button-size`: 5rem (80px)
  - `--video-play-icon-size`: 2rem (32px)
  - `--video-overlay-bg`: rgba(0, 0, 0, 0.3)
  - `--video-play-button-bg`: rgba(255, 255, 255, 0.9)

### Changed
- **ProjectContent**: Refactored to client component for lightbox state management
- **Project page**: Now uses `<ProjectContent>` component for case study sections
- **Image rendering**: All images wrapped in clickable containers with hover effects

### Technical Notes
- `Lightbox.tsx`: Client component with keyboard handling and body scroll lock
- `VideoPlayer.tsx`: Client component with play/pause state and hover controls
- `ProjectContent.tsx`: Manages lightbox state, renders clickable images/grids
- Components use global CSS classes for consistent styling across all case studies
- Lightbox works automatically for all projects (existing and future)

---

## [0.8.0] - 2025-12-31 (00:31 PST)

### Added
- **Project card hover overlay**: Slide-up gradient overlay on project thumbnails
  - Shows title, subtitle, date, description (3-line clamp), and skills
  - Transparent gradient from bottom (`from-black/90 via-black/70 to-transparent`)
  - Smooth slide-up animation (`duration-300 ease-out`)
- **Image zoom effect**: Gentle zoom on project card hover
  - Scale 110% with 700ms duration and ease-in-out timing
  - Wrapped Image in container div for Next.js Image compatibility
- **Nav hover indicator**: Yellow bar slides to hovered nav item
  - Shows indicator on both hover and active states
  - Prioritizes hover state, falls back to active link
  - Uses `data-nav-href` attribute for element selection
- **Color token system**: CSS custom properties for all brand colors
  - Brand: `--color-brand-yellow`, `--color-brand-brown`, `--color-brand-brown-dark`
  - Backgrounds: `--color-background-page`, `--color-background-card`
  - Tailwind integration via `@theme inline` directive
  - All components now use token classes (`bg-brand-yellow`, `dark:bg-background-page`, etc.)
- **Scroll indicator pill hover**: Interactive scroll button on hero
  - Pill-shaped hover effect with 10% opacity dark background
  - Clicking scrolls to projects section (same as Work nav link)

### Changed
- **Project card backgrounds**: Warm dark brown for image containers
  - Dark mode: `#160c08` (darker than page background `#201612`)
  - Creates depth and contrast for project thumbnails
- **Project card content**: Updated descriptions to match Adobe Portfolio
  - Humanics Calendar Sharing, Swap & Withdraw, Roblox NUX descriptions
  - Skills display: removed leading/trailing bullets, unified with `•` separator
- **Typography consistency**: Standardized hover overlay text
  - Date and skills: `text-sm text-white/60`
  - Body text: `text-sm text-white/80`

### Technical Notes
- Next.js Image with `fill` requires wrapper div for transform animations
- Hover state uses Tailwind `group-hover:` for coordinated animations
- Overlay uses `translate-y-full` → `translate-y-0` for slide effect
- Nav indicator tracks `hoveredHref` state, updates via `useEffect`
- Color tokens enable dark mode inheritance via CSS media queries

---

## [0.7.0] - 2025-12-30 (23:44 PST)

### Fixed
- **Dark strip bug**: Fixed dark strip appearing below nav on About page in dark mode
  - Root cause: Body background (`#000000`) showing through margin gap
  - Fix: Changed from `mt-[70px]` to `pt-[70px]` so background extends from top
- **Nav flash on Work click**: Fixed navigation flashing between light/dark when clicking Work from About page
  - Added `hasProjectsHash` state to keep nav solid during transition to `/#projects`

### Changed
- **Consistent page layout**: All pages now use unified spacing pattern
  - Outer div: `min-h-screen bg-white dark:bg-[#201612] pt-[70px]`
  - Inner div: `py-16` (64px padding)
  - Total: 134px from viewport top to content
- **Layout simplified**: Removed `pt-16` from `<main>` in layout.tsx (pages handle own nav clearance)
- **Contact page redesign**:
  - Centered header matching About page style
  - Title: `text-5xl md:text-6xl` (larger, consistent)
  - Added fade-in animation
- **Resume page**: Updated spacing to match About page
- **Project pages**: Updated spacing to match About page

### Technical Notes
- All pages now use same dark mode background: `#201612`
- Navigation uses `hasProjectsHash` state for smooth transitions
- Animation pattern: `mounted` state + `transition-all duration-500`

---

## [0.6.0] - 2025-12-30 (22:37 PST)

### Added
- **Work navigation scroll**: Clicking "Work" in nav scrolls to projects section
  - On home page: Smooth scroll to projects
  - From other pages: Navigates to home and scrolls to projects
- **Inline text formatting**: Support for `**bold**` and `_underline_` in content
- **Bold labels**: Labels like "Goals:", "Who:", "Why:" now render bold in case studies
- **Style constants**: Centralized color classes in `styles` object for DRY code
- **Grid helper**: `getGridCols()` function for dynamic image grid columns

### Changed
- **Dark theme**: Warm brown tones (stone palette) instead of gray
  - Background: `#201612` (dark chocolate brown)
  - Text colors: stone-100, stone-400, stone-500
- **Typography refinements**:
  - Title: `text-5xl md:text-6xl` (larger)
  - Content width: `max-w-3xl` (narrower, matches original)
  - Body text: `text-lg` via inheritance
  - Section titles: `text-xl` (matches subtitle)
  - Skills line: `text-lg` (matches subtitle)
- **Code refactoring**:
  - Style classes use inheritance instead of explicit sizing
  - Removed unnecessary prose wrapper
  - Helper functions for rendering images, videos, notices

### Technical Notes
- Navigation uses `scroll={!isWorkLink}` for proper anchor handling
- Home page has useEffect to handle hash scroll after navigation
- Bold labels use `**text**` markdown-style syntax in projects.ts
- Dark theme tested multiple shades: #1a1412, #1c1410, #201612, #150f0c

---

## [0.5.1] - 2025-12-30

### Changed
- **Typography**: Switched from system fonts to **Jost** (free alternative to Futura PT)
- **Font weights**: Matched to original Adobe Portfolio:
  - Body text: 400 weight
  - Bold labels (Why:, Goals:, etc.): 700 weight
  - Intro text: 500 weight (medium)
  - Section titles: 700 weight (bold)
- **Line height**: Changed from `leading-relaxed` (1.625) to `leading-normal` (1.5) to match original
- Updated font loading via Next.js Google Fonts (`next/font/google`)

### Technical Notes
- Original Adobe Portfolio uses Futura PT (`font-family: ftnk`)
- Jost font loaded with weights 400, 500, 700
- All pages updated for consistent line-height

---

## [0.5.0] - 2025-12-30

### Added
- Comprehensive design system in `globals.css` with CSS custom properties:
  - Color tokens (background, text hierarchy, accents, borders)
  - Typography tokens (font sizes, weights, line heights)
  - Spacing tokens matched to original Adobe Portfolio (10px/20px/40px pattern)
  - Layout tokens (container widths, image max-widths)
  - Animation tokens (durations, easing functions)
  - Shadow tokens
- Content block system for inline images in case studies
- `content-first` layout option for projects (centered header, no hero image)
- All 18 Jarvis case study images downloaded
- Jarvis prototype video (`/videos/jarvis-prototype.mp4`)
- Image grid layouts (2-col, 3-col, 5-col based on item count)
- Notice block type for confidential warnings

### Changed
- Removed rounded corners from all case study images (matches original)
- Updated paragraph spacing: `mb-5` (20px) to match original
- Updated image spacing: `mt-2.5 mb-5` (10px top, 20px bottom)
- Updated image grid spacing: `mb-10` (40px bottom)
- Confidential notice color changed to `#e01414` (original portfolio red)
- Simplified CLAUDE.md to reference globals.css as design system source of truth
- Jarvis project now uses `content-first` layout with centered header

### Technical Notes
- Design system uses CSS custom properties for easy theming
- Spacing values extracted from original Adobe Portfolio HTML via Firecrawl
- Content blocks support: text, image, images (grid), video, notice
- Dark mode support via `prefers-color-scheme` media query

---

## [0.4.0] - 2025-12-30

### Added
- Full-viewport welcome hero ("Hello, I'm Godwin")
- Scroll-reveal effect: projects slide over fixed hero with rounded top corners
- Hero text fades out as user scrolls (opacity tied to scroll position)
- Transparent navigation on hero, transitions to solid on scroll
- GitHub repository: https://github.com/godyj/godwin-portfolio
- Case study image URL reference file (`public/images/projects/image-urls.json`)
- Jarvis case study images folder with 8 images downloaded

### Changed
- Home page hero now takes full viewport height (`h-screen`)
- Hero section is now fixed, content slides over it
- Navigation background dynamically changes based on scroll position
- Scroll indicator moved to bottom of hero with "SCROLL" label

### Technical Notes
- Hero uses `position: fixed` with spacer div for scroll effect
- Scroll-based opacity calculated via `useEffect` and `scrollY` state
- Projects container uses `relative z-10` to slide over hero
- Navigation detects home page via `usePathname()` hook

---

## [0.3.0] - 2025-12-30

### Added
- All 5 project thumbnail images downloaded at full resolution
  - humanics-calendar.png (120 KB)
  - humanics-swap.png (166 KB)
  - roblox.png (143 KB)
  - jarvis.png (110 KB)
  - xcode.png (192 KB)
- Helmet logo image (logo.png, 21 KB)
- Logo added to Navigation header (replaces text "Godwin")

### Changed
- Navigation component updated with full dark mode support
- Header now uses logo image instead of text
- Home page redesigned to match Adobe Portfolio:
  - Yellow hero section with "Hello, I'm GODWIN"
  - Project grid with actual thumbnail images (square aspect ratio)
  - Centered project titles with dates
- Project detail pages updated:
  - Hero image at top of each project
  - "More of my work…" section with 4 thumbnail previews

### Technical Notes
- Used Firecrawl MCP to scrape image URLs with auth hashes from Adobe Portfolio
- Downloaded full-res images directly from Adobe CDN using extracted hash parameters
- Images are 1000x1000px thumbnails

---

## [0.2.0] - 2025-12-30

### Added
- Full verbatim case study content for all 5 projects (scraped via Firecrawl MCP)
- "About the Name" section added to Jarvis project
- Complete stakeholder lists with proper formatting
- Full research methodology descriptions
- Detailed design exploration narratives

### Changed
- Updated `projects.ts` with complete content from Adobe Portfolio
- Project descriptions now match Adobe Portfolio exactly
- All section content expanded from summaries to full verbatim text

### Verified
- About page bio matches Adobe Portfolio word-for-word
- All project section titles match original
- Contact page structure matches original

---

## [0.1.0] - 2025-12-30

### Added
- Initial Next.js 16.1.1 project setup with TypeScript
- Tailwind CSS configuration with dark mode support
- App Router structure (`/app` directory)
- Navigation component with responsive mobile menu
- Home page with project grid layout
- About page with bio and LinkedIn link
- Contact page with form (mailto: fallback)
- Dynamic project detail pages (`/projects/[id]`)
- Project data file (`src/data/projects.ts`)
- All 5 projects from Adobe Portfolio:
  - Humanics: Calendar Sharing (2019)
  - Humanics: Swap & Withdraw (2019)
  - Roblox: New User Experience (2018)
  - Jarvis: Connected Car App (2017)
  - Apple Xcode: Touch Bar (2016)

### Project Structure
```
src/
├── app/
│   ├── page.tsx              # Home - project grid
│   ├── about/page.tsx        # About page
│   ├── contact/page.tsx      # Contact form
│   ├── projects/[id]/page.tsx # Project detail pages
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   └── Navigation.tsx        # Header navigation
└── data/
    └── projects.ts           # Project content
```

### Technical Decisions
- **Next.js App Router**: Modern approach, better for static generation
- **No CMS**: Content rarely changes, data file is simpler
- **Tailwind CSS**: Rapid styling, built-in dark mode
- **Server Components**: Default for better performance

