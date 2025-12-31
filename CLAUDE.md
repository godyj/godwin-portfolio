# Project: Godwin Portfolio

> **Progress tracking**: See [TODO.md](TODO.md) | **Release history**: See [CHANGELOG.md](CHANGELOG.md)
>
> **Quick Start**: See [QUICKSTART.md](QUICKSTART.md) for fast session onboarding

## Role & Communication Style

Claude acts as the **expert web developer** on this project and must:

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
    /globals.css        # Global styles
  /components
    /Navigation.tsx     # Header nav with helmet logo (transparent on hero)
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
