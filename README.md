# Godwin Johnson Portfolio

Personal portfolio site for Godwin Johnson, Product Designer (UI+UX).

**Live site**: [designed.cloud](https://designed.cloud) (currently on Adobe Portfolio, migrating to this)

## Tech Stack

- **Framework**: Next.js 16.1.1 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Hosting**: Vercel (planned)
- **Domain**: designed.cloud (GoDaddy)

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) (or 3001 if 3000 is in use).

## Project Structure

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

## Features

- Responsive design with mobile navigation
- Dark mode support (follows system preference)
- SEO optimized with meta tags
- Fast page loads with Next.js static generation
- Clean, minimal design aesthetic

## Projects Showcased

1. **Humanics: Calendar Sharing** (2019) - Workforce management calendar feature
2. **Humanics: Swap & Withdraw** (2019) - Shift swap improvements
3. **Roblox: New User Experience** (2018) - Player onboarding redesign
4. **Jarvis** (2017) - Connected car iOS app concept
5. **Apple Xcode: Touch Bar** (2016) - Touch Bar interface design

## Adding Images

Place project images in `/public/images/projects/`:
- `humanics-calendar.png`
- `humanics-swap.png`
- `roblox.png`
- `jarvis.png`
- `xcode.png`

Profile image: `/public/images/profile.png`

## Deployment

This site is configured for Vercel deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## License

Private - All rights reserved.
