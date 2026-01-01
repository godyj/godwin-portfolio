# Godwin Portfolio - Quick Start

> Last updated: 2025-12-31 18:03 PST

## TL;DR

Portfolio site migration from Adobe Portfolio → Next.js + Vercel

```bash
cd /Users/godwinjohnson/Development/godwin-portfolio
npm run dev
# → http://localhost:3000
```

## Current State: 95% Complete

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
| **Xcode case study structure** | ✅ Done |
| **Xcode images (22 images)** | ⚠️ Images wrong - see below |
| **Remaining case studies (3)** | ❌ Pending |
| **Vercel deployment** | ❌ Pending |
| **Domain config** | ❌ Pending |

## URGENT: Xcode Image Issue

### Problem
The 22 Xcode case study images in `/public/images/projects/xcode/` do NOT match the original site visually, even though:
- MD5 checksums match the downloaded originals
- File sizes match
- Images were downloaded directly from Adobe CDN

### What Was Tried
1. Downloaded images using Firecrawl extracted URLs with auth hashes
2. Renamed files based on captions
3. Re-downloaded all 22 images directly from CDN full-resolution URLs
4. Verified MD5 checksums match between local and CDN files
5. All checksums pass but **images still appear wrong on the page**

### Possible Causes to Investigate
1. **Wrong image order in projects.ts** - The HTML extraction order may differ from visual content order
2. **Image naming mismatch** - Local filenames may not correspond to correct images
3. **CDN serving different content** - Hash URLs might resolve differently
4. **Visual comparison needed** - Side-by-side screenshot comparison of each section

### How to Debug (Next Session)
1. Use Playwright to take screenshots of both sites section by section
2. Compare each image visually, not by checksum
3. Map original site image order by visually inspecting each one
4. Re-map local files to correct positions in projects.ts

### Xcode Image Files
Located at: `/public/images/projects/xcode/`
- `app-icon.jpg` - macOS App Icon (350px max-width, noLightbox)
- `touch-bar-interface.jpg` - First image in "Exciting New Hardware" section
- `main-window.jpg` - Second image in "Exciting New Hardware" section
- Plus 19 more images...

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

## Next Session Priority

### 1. Fix Xcode Images (URGENT)
See "Xcode Image Issue" section above. Need visual comparison, not checksum comparison.

### 2. Download Remaining Case Study Images
3 projects still need images downloaded:
- Humanics Calendar Sharing
- Humanics Swap & Withdraw
- Roblox NUX

### 3. Deploy to Vercel
```bash
npm i -g vercel
vercel
```

### 4. Configure Domain
1. Add `designed.cloud` in Vercel dashboard
2. Update GoDaddy DNS:
   - Type: CNAME
   - Name: @
   - Value: cname.vercel-dns.com

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
    ├── jarvis/                 # 18 case study images
    └── xcode/                  # 22 case study images (NEED FIXING)
```

## Projects in Portfolio

| ID | Title | Year | Images |
|----|-------|------|--------|
| `humanics-calendar-sharing` | Humanics (Calendar Sharing) | July 2019 | ❌ Pending |
| `humanics-swap-withdraw` | Humanics (Swap & Withdraw) | May 2019 | ❌ Pending |
| `roblox-nux` | Roblox (NUX) | Aug 2018 | ❌ Pending |
| `jarvis` | Jarvis | June 2017 | ✅ Done |
| `xcode-touch-bar` | Apple Xcode (Touch Bar) | Aug 2016 | ⚠️ Wrong images |

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
- **Session 6 (2025-12-31)**: Lightbox component, custom video player, Xcode case study structure added, 22 Xcode images downloaded but NOT matching original - needs visual debugging

## Links
- Live (current): https://designed.cloud (Adobe Portfolio)
- Live (new): TBD after Vercel deployment
- Domain registrar: GoDaddy
