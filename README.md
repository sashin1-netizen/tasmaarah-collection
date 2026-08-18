# Tasmaarah Collection

Official website for Tasmaarah Collection, a Durban gifting and presentation business offering kunchas, trays, boxes, custom orders, hire, purchase and professional gift setting. Designed and developed by Prime Presence Atelier.

## Production architecture

The public site deliberately uses a small, stable stack:

- `site.css` — the core responsive design system
- `homepage-luxury.css` — homepage campaign art-direction layer used on the current redesign branch
- `atelier-luxury.css` — sitewide luxury presentation layer for image staging, editorial framing and premium surfaces on the current redesign branch
- `script.js` — progressive enhancement for filtering, WhatsApp quote composition, gallery lightbox, reveal effects, pointer-responsive lighting and loading of the sitewide luxury presentation layer
- semantic HTML pages for Home, About, Collection, Occasions, Custom Orders, Gallery, Contact and 404
- GitHub Pages for static hosting

The mobile menu is implemented with native HTML `details` / `summary`, so navigation remains operable even if JavaScript is delayed or unavailable.

## Production features

- responsive mobile-first layouts for phone, tablet and desktop
- Tasmaarah’s real logo and genuine client photography
- approved campaign artwork used as the homepage LCP image
- hire, purchase and professional gift setting positioning
- wood, Perspex and glass material options
- common sizes: 15×15cm, 20×20cm and 30×30cm
- custom sizing and quote-led ordering
- Weddings, Birthdays, Year-End Functions and Special Occasions journeys
- WhatsApp-first quote flow with a direct fallback link
- collection search/filter
- accessible gallery lightbox with keyboard controls
- visible focus states, skip links and native controls
- motion toggle plus reduced-motion handling
- animated champagne background, satin sweeps and restrained interactive lighting
- luxury image staging using layered frames, campaign crops, gallery matting and editorial depth while preserving genuine product imagery
- SEO metadata, Open Graph metadata, LocalBusiness structured data, sitemap and robots file
- lazy-loaded below-the-fold imagery
- Prime Presence Atelier credit

## Photography policy

The site uses genuine photographs supplied by Tasmaarah Collection. Product imagery must not be replaced with AI-generated representations or materially altered in a way that misrepresents actual products or completed work. Luxury presentation effects must frame, stage and light the genuine imagery rather than inventing replacement products.

## Contact details

- WhatsApp: 063 540 9729
- Call or WhatsApp: 074 378 8958
- Email: tasmaarahcollection@gmail.com
- Based in: Reservoir Hills, Durban
- Delivery wording: Courier services available

Do not change the delivery wording to nationwide delivery unless the client confirms it.

## Client details still required before a custom-domain launch

These items are deliberately not invented in the codebase:

- confirmed social-media profile URLs
- hire deposit, damage and return terms
- confirmed production lead times / turnaround wording
- final collection and courier terms
- production custom domain

## Quality gate

`.github/workflows/quality.yml` checks:

- required production files and real image assets
- core stylesheet architecture
- no legacy stylesheet references
- local links and assets
- duplicate IDs
- JavaScript syntax
- native mobile navigation contract
- animation and reduced-motion hooks
- WhatsApp form fallback
- sitemap coverage
- development placeholders

## Acceptance standard

Before client sign-off, verify the deployed GitHub Pages URL in real Chrome/Safari-class browsers on:

- narrow mobile around 360px
- common mobile around 390–430px
- tablet around 768–1024px
- laptop around 1366px
- large desktop around 1920px

Test navigation, all links and buttons, WhatsApp, phone/email actions, collection filter, gallery lightbox, contact form, focus/keyboard behaviour, image loading, horizontal overflow and motion controls.

## Local preview

```bash
python -m http.server 8080
```

Then visit `http://localhost:8080`.
