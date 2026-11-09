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

If WordPress is unavailable, the build continues with empty listing pages and sample homepage visuals. To require a live CMS connection, set `CMS_STRICT=true` during the build. Dynamic detail pages are only generated for entries returned at build time.

The project detail pages also render ACF project metadata and image galleries; event pages use the ACF event date and location rather than the WordPress publish date.

## Build validation
The GitHub Actions workflow checks `npm run build` on pull requests. A passing build does **not** prove CMS connectivity; use `CMS_STRICT=true npm run build` when an external network can reach WordPress.

## Deployment
Build with `npm run build`, then publish the `dist/` directory to a static host or cPanel public directory. Configure an authenticated deployment pipeline and a WordPress publish webhook to trigger a new build when content changes. No webhook or deployment credentials are included in this repository.

## Notes
- NEXORA Energy is **not a real company**. Metrics and imagery are conceptual.
- Replace remote stock imagery with appropriately licensed, optimized assets before production.
- WordPress HTML is rendered from a trusted CMS; restrict editorial access and sanitize untrusted content.
- Update `site` in `astro.config.mjs` when the deployment domain is chosen.
