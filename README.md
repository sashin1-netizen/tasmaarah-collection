# Tasmaarah Collection

Official website for Tasmaarah Collection, a Durban gifting and presentation business offering kunchas, gift trays, presentation boxes, custom pieces and professional gift setting.

## Production architecture

The public site deliberately uses a small, stable stack:

- `site.css` — the core responsive design system
- `atelier-client-ready.css` — compact branch art-direction layer used during visual acceptance
- `script.js` — progressive enhancement for filtering, product quick view, product-specific WhatsApp enquiry composition, live quote brief, gallery lightbox and swipe gestures, reveal effects and pointer-responsive lighting
- semantic HTML pages for Home, About, Collection, Occasions, Custom Orders, Gallery, Contact and 404
- GitHub Pages for static hosting

## Experience

The website is designed as a premium digital showroom rather than a fixed-price ecommerce store. Visitors can browse real Tasmaarah work, explore presentation categories, open collection quick views, build a quote brief and continue into WhatsApp with relevant context already prepared.

The experience includes:

- responsive desktop, tablet and mobile layouts
- native no-JavaScript mobile navigation
- collection search
- collection quick view with product-specific WhatsApp enquiry
- live quote brief on the contact form
- keyboard-accessible gallery lightbox with mobile swipe gestures
- visible focus states, skip links and native controls
- motion toggle plus reduced-motion handling
- animated champagne background, satin sweeps and restrained interactive lighting
- luxury image staging while preserving genuine product imagery
- SEO metadata, Open Graph metadata, LocalBusiness structured data, sitemap and robots file
- lazy-loaded below-the-fold imagery
- Prime Presence Atelier credit

## Photography policy

The site uses genuine photographs supplied by Tasmaarah Collection. Product imagery must not be replaced with AI-generated representations or materially altered in a way that misrepresents actual products or completed work. Luxury presentation effects may frame, stage and light the genuine imagery without inventing replacement products.

## Contact details

- Primary WhatsApp: 063 540 9729
- Call or WhatsApp: 074 378 8958
- Email: tasmaarahcollection@gmail.com
- Based in: Reservoir Hills, Durban
- Courier services are available; the site does not claim nationwide delivery without client confirmation.

## Business rules

Pricing is quote-led because it varies by size, material, hire or purchase, custom requirements and professional gift setting. The primary conversion path is browse → get inspired → choose a direction → request a personalised quote on WhatsApp.

## Client dependencies

These items are deliberately not invented in the codebase:

- final social media URLs
- hire deposit / damage / return policies
- production lead times
- final collection / courier wording
- production custom domain

## Quality assurance

`.github/workflows/quality.yml` checks required production files and genuine image assets, design-system architecture, local links and assets, duplicate IDs, JavaScript syntax, navigation and interaction contracts, placeholders, sitemap coverage and responsive browser acceptance.
