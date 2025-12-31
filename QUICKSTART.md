# Godwin Portfolio - Quick Start

> Last updated: 2025-12-31 00:31 PST

## TL;DR

Portfolio site migration from Adobe Portfolio → Next.js + Vercel

```bash
cd /Users/godwinjohnson/Development/godwin-portfolio
npm run dev
# → http://localhost:3000
```

## Current State: 98% Complete

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
| **Remaining case study images** | ⚠️ Next |
| **Vercel deployment** | ❌ Pending |
| **Domain config** | ❌ Pending |

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
4 projects still need images downloaded:
- Humanics Calendar Sharing
- Humanics Swap & Withdraw
- Roblox NUX
- Apple Xcode Touch Bar

Use image URLs from: `public/images/projects/image-urls.json`

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
| `src/app/globals.css` | Global styles |

## Images Location

```
/public/images/
├── logo.png                    # Helmet logo (21 KB)
└── projects/
    ├── humanics-calendar.png   # 120 KB
    ├── humanics-swap.png       # 166 KB
    ├── roblox.png              # 143 KB
    ├── jarvis.png              # 110 KB
    └── xcode.png               # 192 KB
```

## Projects in Portfolio

| ID | Title | Year |
|----|-------|------|
| `humanics-calendar-sharing` | Humanics (Calendar Sharing) | July 2019 |
| `humanics-swap-withdraw` | Humanics (Swap & Withdraw) | May 2019 |
| `roblox-nux` | Roblox (NUX) | Aug 2018 |
| `jarvis` | Jarvis | June 2017 |
| `xcode-touch-bar` | Apple Xcode (Touch Bar) | Aug 2016 |

## Common Tasks

### Add/Edit a Project
Edit `src/data/projects.ts` - each project has:
- `id`, `title`, `subtitle`, `description`
- `role`, `skills[]`, `results`
- `sections[]` - array of `{title, content}` for case study

### Change Styling
- Global: `src/app/globals.css`
- Tailwind config: `tailwind.config.ts`

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

## Links
- Live (current): https://designed.cloud (Adobe Portfolio)
- Live (new): TBD after Vercel deployment
- Domain registrar: GoDaddy
