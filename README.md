# NEXORA Energy

A premium, fictional oil & gas corporate website built with **Astro** and **headless WordPress**, developed as a portfolio concept for Lembayu Studio.

## Stack
- Astro 5, static site generation
- Plain CSS with responsive layouts
- WordPress REST API for Projects and Events
- No runtime CMS dependency: content is fetched during build

## Local development
```bash
npm install
npm run dev
npm run build
```

## CMS integration
By default, the build fetches:
- `https://cms.lembayu.com/wp-json/wp/v2/projects?_embed&per_page=30`
- `https://cms.lembayu.com/wp-json/wp/v2/events?_embed&per_page=30`

Override the endpoint with `WP_API_URL` (base URL ending in `/wp-json/wp/v2`).

If WordPress is unavailable, the build continues with empty listing pages and sample homepage visuals. Dynamic detail pages are only generated for entries returned at build time.

## Deployment
Build with `npm run build`, then publish the `dist/` directory to a static host or cPanel public directory. Configure an authenticated deployment pipeline and a WordPress publish webhook to trigger a new build when content changes. No webhook or deployment credentials are included in this repository.

## Notes
- NEXORA Energy is **not a real company**. Metrics and imagery are conceptual.
- Replace remote stock imagery with appropriately licensed, optimized assets before production.
- WordPress HTML is rendered from a trusted CMS; restrict editorial access and sanitize untrusted content.
- Update `site` in `astro.config.mjs` when the deployment domain is chosen.
