# Changelog

All notable changes to the Godwin Portfolio migration project.

---

## [Unreleased]

### Pending - Next Session
- [ ] **Replicate CSS styling & animations from Adobe Portfolio**
  - [ ] Typography: Match font family (ftnk), weights, sizes
  - [ ] Navigation: Transparent on hero, solid on scroll
  - [ ] Hero section: Smooth scroll, chevron animation
  - [ ] Project cards: Hover effects, image zoom transitions
  - [ ] Page transitions: Fade in/out between pages
  - [ ] Spacing: Match padding/margins exactly
  - [ ] Colors: Fine-tune yellow (#F5B800), grays
  - [ ] Mobile: Responsive breakpoints, touch interactions
- [ ] Deploy to Vercel
- [ ] Configure `designed.cloud` domain in Vercel
- [ ] Update GoDaddy DNS to point to Vercel
- [ ] Verify SSL certificate after DNS propagation

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

---

## Migration Source

**Original site**: [designed.cloud](https://designed.cloud) (Adobe Portfolio)

### Content Extraction Methods
- WebFetch for initial content scrape
- Firecrawl MCP for full verbatim content verification
- Manual comparison against Adobe Portfolio

### What Couldn't Be Automated
- Image downloads (Adobe CDN requires `?h=` auth hash)
- Profile photo extraction

---

## Deployment Checklist

When ready to deploy:

1. **Pre-deployment**
   - [ ] All images saved to `/public/images/projects/`
   - [ ] Profile image saved to `/public/images/profile.png`
   - [ ] Run `npm run build` successfully
   - [ ] Test all pages locally

2. **Vercel Setup**
   - [ ] Push code to GitHub
   - [ ] Connect repository to Vercel
   - [ ] Deploy to Vercel
   - [ ] Note Vercel deployment URL

3. **Domain Configuration**
   - [ ] Add `designed.cloud` as custom domain in Vercel
   - [ ] Get DNS records from Vercel
   - [ ] Log in to GoDaddy
   - [ ] Remove Adobe Portfolio DNS records
   - [ ] Add Vercel DNS records (A or CNAME)
   - [ ] Wait for DNS propagation (up to 48 hours)

4. **Post-deployment**
   - [ ] Verify site loads at `designed.cloud`
   - [ ] Verify SSL certificate is active
   - [ ] Test all pages and navigation
   - [ ] Test on mobile devices
   - [ ] Verify dark mode works
