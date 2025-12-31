# Changelog

All notable changes to the Godwin Portfolio migration project.

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

