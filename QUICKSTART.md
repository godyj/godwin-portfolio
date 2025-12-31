# Godwin Portfolio - Quick Start

> Last updated: 2025-12-30 19:30 PST

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
| Project images (all 5) | ✅ Done |
| Helmet logo | ✅ Done |
| Yellow hero section | ✅ Done |
| **CSS polish & animations** | ⚠️ Next session |
| **Vercel deployment** | ❌ Pending |
| **Domain config** | ❌ Pending |

## Next Session Priority

### 1. Replicate CSS Styling & Animations
Match the original Adobe Portfolio site styling:

- [ ] **Typography**: Match font family, weights, sizes
- [ ] **Navigation**: Transparent on hero, solid on scroll
- [ ] **Hero section**: Smooth scroll behavior, chevron animation
- [ ] **Project cards**: Hover effects, image zoom transitions
- [ ] **Page transitions**: Fade in/out between pages
- [ ] **Spacing**: Match padding/margins exactly
- [ ] **Colors**: Fine-tune yellow (#F5B800), grays
- [ ] **Mobile**: Responsive breakpoints, touch interactions

Use Firecrawl to scrape original CSS:
```
firecrawl_scrape("https://designed.cloud", formats: ["branding"])
```

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

## Session History
- **Session 1 (2025-12-30)**: Initial setup, content extraction, all pages created
- **Session 2 (2025-12-30)**: Full verbatim content via Firecrawl, images downloaded, layout matched

## Links
- Live (current): https://designed.cloud (Adobe Portfolio)
- Live (new): TBD after Vercel deployment
- Domain registrar: GoDaddy
