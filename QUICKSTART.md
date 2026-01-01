# Godwin Portfolio - Quick Start

> Last updated: 2025-12-31 19:39 PST

## TL;DR

Portfolio site migration from Adobe Portfolio → Next.js + Vercel

```bash
cd /Users/godwinjohnson/Development/godwin-portfolio
npm run dev
# → http://localhost:3000 (or 3002 if 3000 is in use)
```

## Current State: 97% Complete

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
| **Remaining case studies (2)** | ❌ Humanics x2 |
| **Vercel deployment** | ❌ Pending |
| **Domain config** | ❌ Pending |

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

## Next Session Priority

### 1. Download Remaining Case Study Images
2 projects still need images downloaded:
- Humanics Calendar Sharing
- Humanics Swap & Withdraw

### 2. Deploy to Vercel
```bash
npm i -g vercel
vercel
```

### 3. Configure Domain
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
    ├── xcode/                  # 22 case study images (verified)
    └── roblox/                 # 12 case study images (verified)
```

## Projects in Portfolio

| ID | Title | Year | Images |
|----|-------|------|--------|
| `humanics-calendar-sharing` | Humanics (Calendar Sharing) | July 2019 | ❌ Pending |
| `humanics-swap-withdraw` | Humanics (Swap & Withdraw) | May 2019 | ❌ Pending |
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

## Links
- Live (current): https://designed.cloud (Adobe Portfolio)
- Live (new): TBD after Vercel deployment
- Domain registrar: GoDaddy
