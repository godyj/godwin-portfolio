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

### Phase 1: Core Styling (Current)
- [x] Analyze original Adobe Portfolio styling patterns
- [x] Document web design standards in CLAUDE.md
- [x] Remove rounded corners from case study images
- [ ] Fine-tune intro text sizing and spacing
- [ ] Verify all Jarvis sections match original layout

### Phase 2: Typography Refinements
- [ ] Match font family closer to original (Adobe Clean / Helvetica Neue)
- [ ] Audit heading hierarchy across all pages
- [ ] Ensure consistent text colors (foreground, muted, captions)
- [ ] Review line-height and letter-spacing

### Phase 3: Spacing & Layout
- [ ] Audit section spacing (currently 48px via `space-y-12`)
- [ ] Verify image margin consistency (32px via `my-8`)
- [ ] Match paragraph spacing to original (20px bottom padding)
- [ ] Responsive adjustments for mobile

### Phase 4: Interactive Elements
- [ ] Project cards: Hover effects, image zoom transitions
- [ ] Page transitions: Smooth fade between pages
- [ ] Back to top button (like original)
- [ ] Lightbox for images (optional enhancement)

## Pending - Other Case Studies

### Humanics Calendar Sharing
- [ ] Download case study images
- [ ] Structure sections with content blocks
- [ ] Match layout to original

### Humanics Swap & Withdraw
- [ ] Download case study images
- [ ] Structure sections with content blocks
- [ ] Match layout to original

### Roblox NUX
- [ ] Download case study images
- [ ] Structure sections with content blocks
- [ ] Match layout to original

### Apple Xcode Touch Bar
- [ ] Download case study images
- [ ] Structure sections with content blocks
- [ ] Match layout to original

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
