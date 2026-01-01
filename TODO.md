# TODO

> Active tasks and pending work for the Godwin Portfolio migration.

## Completed - Jarvis Case Study

- [x] Scraped all 5 project pages for image URLs via Firecrawl
- [x] Created image URL reference: `public/images/projects/image-urls.json`
- [x] Downloaded all 18 Jarvis images
- [x] Downloaded Jarvis prototype video (jarvis-prototype.mp4)
- [x] Implemented content blocks system for inline images
- [x] Matched image max-widths from original site
- [x] Added content-first layout for Jarvis page header
- [x] Added large intro text styling (24px, medium weight)
- [x] Removed rounded corners from images (matching original)

## In Progress - Styling & Layout

### Phase 1: Core Styling (Complete)
- [x] Analyze original Adobe Portfolio styling patterns
- [x] Document web design standards in CLAUDE.md
- [x] Remove rounded corners from case study images
- [x] Fine-tune intro text sizing and spacing
- [x] Verify all Jarvis sections match original layout
- [x] Add bold labels (Goals:, Who:, etc.) to case studies
- [x] Implement inline formatting (**bold**, _underline_)

### Phase 2: Typography Refinements (Complete)
- [x] Match font family closer to original (Jost - Futura PT alternative)
- [x] Audit heading hierarchy across all pages
- [x] Ensure consistent text colors (foreground, muted, captions)
- [x] Review line-height and letter-spacing
- [x] Refactor styles using inheritance and constants

### Phase 3: Dark Theme & Colors (Complete)
- [x] Implement warm brown dark theme (stone palette)
- [x] Custom dark background (#201612)
- [x] Consistent dark mode borders (stone-800)

### Phase 4: Navigation & Interactions (Complete)
- [x] Work link scrolls to projects section
- [x] Smooth scroll on home page
- [x] Hash navigation from other pages
- [ ] Project cards: Hover effects, image zoom transitions (done)
- [ ] Page transitions: Smooth fade between pages (optional)
- [ ] Back to top button (optional)
- [ ] Lightbox for images (optional enhancement)

## Completed - Xcode Case Study

- [x] Downloaded all 22 Xcode images
- [x] Structure sections with content blocks
- [x] Match layout to original
- [x] Fixed inline labels (removed incorrect **Analysis:**)
- [x] Added bold numbered goals (**1.**, **2.**, **3.**)
- [x] Updated title to "Apple Xcode (Touch Bar)"
- [x] Verified via Playwright

## Completed - Roblox Case Study

- [x] Downloaded all 12 Roblox images via Playwright
- [x] Structure sections with content blocks
- [x] Match layout to original
- [x] Added inline labels (Discovery and Acquisition, Signup, D0 Cycle, Challenge, Goal, Solution, Risks)
- [x] Matched image max-widths (600px, 800px, 768px, 400px, 450px)
- [x] Updated title to "Roblox (NUX)"
- [x] All 21 inline labels verified via Playwright comparison

## Pending - Other Case Studies

### Humanics Calendar Sharing
- [ ] Download case study images
- [ ] Structure sections with content blocks
- [ ] Match layout to original
- [ ] Verify inline labels via Playwright

### Humanics Swap & Withdraw
- [ ] Download case study images
- [ ] Structure sections with content blocks
- [ ] Match layout to original
- [ ] Verify inline labels via Playwright

## Deployment

### Pre-deployment
- [ ] All case study images saved to `/public/images/projects/`
- [ ] Run `npm run build` successfully
- [ ] Test all pages locally
- [ ] Test dark mode on all pages
- [ ] Test mobile responsiveness

### Vercel Setup
- [ ] Push code to GitHub
- [ ] Connect repository to Vercel
- [ ] Deploy to Vercel
- [ ] Note Vercel deployment URL

### Domain Configuration
- [ ] Add `designed.cloud` as custom domain in Vercel
- [ ] Get DNS records from Vercel
- [ ] Log in to GoDaddy
- [ ] Remove Adobe Portfolio DNS records
- [ ] Add Vercel DNS records (A or CNAME)
- [ ] Wait for DNS propagation (up to 48 hours)

### Post-deployment
- [ ] Verify site loads at `designed.cloud`
- [ ] Verify SSL certificate is active
- [ ] Test all pages and navigation
- [ ] Test on mobile devices
- [ ] Verify dark mode works
