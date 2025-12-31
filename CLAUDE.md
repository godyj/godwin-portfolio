# Project: Godwin Portfolio

> Last updated: 2025-12-30 19:35 PST
>
> **Quick Start**: See [QUICKSTART.md](QUICKSTART.md) for fast session onboarding

## Role & Communication Style

Claude acts as the **expert web developer** on this project and must:

1. **Carefully follow instructions** - Read requirements thoroughly, execute precisely as requested
2. **Thoroughly check work for correctness and quality** - Verify outputs, test assumptions, validate against requirements before marking complete
3. **Make expert recommendations** - When presenting options, always include a clear technical recommendation with reasoning; don't just list choices - guide toward the best solution

## Project Overview
- **Goal**: Migrate from Adobe Portfolio (designed.cloud) to self-hosted Next.js site
- **Domain**: designed.cloud (registered with GoDaddy, currently pointing to Adobe Portfolio)
- **Hosting**: Vercel (planned)
- **Framework**: Next.js 16.1.1 with TypeScript and Tailwind CSS
- **Owner**: Godwin Johnson - Product Designer (UI+UX)

## Current Status (as of 2025-12-30)

### Completed
- [x] Next.js project setup with TypeScript + Tailwind
- [x] Extracted all content from Adobe Portfolio (full verbatim via Firecrawl)
- [x] Created all pages: Home, About, Contact, Project details
- [x] Added all 5 projects with **FULL case study content** (10-15 sections each)
- [x] About page bio matches Adobe Portfolio exactly
- [x] Navigation with responsive mobile menu + helmet logo
- [x] Dark mode support
- [x] Project pages render all sections with proper formatting
- [x] **All project images downloaded** (via Firecrawl hash extraction)
- [x] **Helmet logo downloaded and added to nav**
- [x] **Yellow hero section matching original**
- [x] **Project thumbnails displaying on home and detail pages**

### Pending - Next Session
- [ ] **Replicate CSS styling & animations** (typography, transitions, hover effects)
- [ ] Deploy to Vercel
- [ ] Configure designed.cloud domain in Vercel
- [ ] Update GoDaddy DNS to point to Vercel

## Project Structure
```
/src
  /app
    /page.tsx           # Home page - yellow hero + project grid
    /about/page.tsx     # About page with exact bio
    /contact/page.tsx   # Contact form
    /projects/[id]/page.tsx  # Dynamic project pages with hero image
    /layout.tsx         # Root layout with Navigation
    /globals.css        # Global styles
  /components
    /Navigation.tsx     # Header nav with helmet logo
  /data
    /projects.ts        # All project content data (full verbatim)
/public
  /images
    /logo.png           # Helmet logo (21 KB)
    /projects/
      /humanics-calendar.png  # 120 KB
      /humanics-swap.png      # 166 KB
      /roblox.png             # 143 KB
      /jarvis.png             # 110 KB
      /xcode.png              # 192 KB
```

## Projects Data
5 projects extracted from Adobe Portfolio:

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

## Next Session: CSS & Animations

### Tasks
1. **Scrape original CSS/branding**:
   ```
   firecrawl_scrape("https://designed.cloud", formats: ["branding"])
   ```

2. **Typography**: Match font family (ftnk from Adobe Typekit), weights, sizes

3. **Navigation**:
   - Transparent background on yellow hero
   - Solid background on scroll
   - Smooth transition

4. **Animations**:
   - Hero chevron bounce animation
   - Project card hover effects
   - Image zoom on hover
   - Page transitions (fade in/out)

5. **Spacing**: Match padding/margins exactly

6. **Colors**: Fine-tune yellow (#F5B800), text grays

7. **Mobile**: Responsive breakpoints, touch interactions

## Deployment Steps (After CSS)
1. Push to GitHub repository
2. Connect repo to Vercel
3. Deploy to Vercel
4. Add custom domain `designed.cloud` in Vercel
5. Update GoDaddy DNS:
   - Remove Adobe Portfolio records
   - Add Vercel DNS records (CNAME or A records)
6. Wait for DNS propagation
7. Verify SSL certificate

## Technical Notes
- Using Next.js App Router (not Pages Router)
- Server Components by default
- Images downloaded via Firecrawl hash extraction (bypassed CDN auth)
- Contact form uses mailto: fallback (can integrate Formspree/EmailJS later)

## Content Verification
All content verified against Adobe Portfolio on 2025-12-30:
- About bio: ✅ Exact match (word-for-word)
- Project content: ✅ Full verbatim (scraped via Firecrawl)
- Project titles/dates: ✅ All 5 match
- Images: ✅ All downloaded at full resolution
- LinkedIn: ✅ linkedin.com/in/godwinjohnson/

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

### Session History
- **2025-12-30 (Session 1)**: Initial migration session
  - Set up Next.js project
  - Extracted all content via WebFetch
  - Created all pages with abbreviated case study content
  - Images blocked by CDN auth

- **2025-12-30 (Session 2)**: Content & images complete
  - Used Firecrawl MCP to scrape full verbatim content
  - Updated all project sections with complete text
  - Downloaded all 5 project thumbnails via hash URL extraction
  - Downloaded helmet logo
  - Updated home page with yellow hero + image grid
  - Updated project pages with hero images + "More work" section
  - Added CSS/animations task for next session
