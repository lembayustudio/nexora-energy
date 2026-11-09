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
- `https://cms.lembayu.com/wp-json/wp/v2/projects?_embed&per_page=100`
- `https://cms.lembayu.com/wp-json/wp/v2/events?_embed&per_page=30`

Override the endpoint with `WP_API_URL` (base URL ending in `/wp-json/wp/v2`).

If WordPress is unavailable, the build continues with empty listing pages and sample homepage visuals. To require a live CMS connection, set `CMS_STRICT=true` during the build. Dynamic detail pages are only generated for entries returned at build time.

The project detail pages also render ACF project metadata and image galleries; event pages use the ACF event date and location rather than the WordPress publish date.

## Art direction & image provenance

V2 includes locally served photographic imagery with photographer credits in [docs/image-credits.md](docs/image-credits.md). A one-time image sync workflow downloads and commits optimized photographs to the development branch. The build also downloads missing files before compilation. Once present, images are served directly from the static site.

## WordPress → Netlify rebuild

A minimal standalone WordPress plugin triggers Netlify rebuilds when published Projects or Events change. Follow [the installation guide](docs/wordpress-netlify-rebuild.md). Configure the **secret build hook URL only in WordPress admin**, never in this public repo.

## Build validation
The GitHub Actions workflow runs Astro/TypeScript checks, a strict live-CMS build and static output smoke tests. It also uploads a downloadable site artifact for inspection.

## Deployment
Netlify settings are committed in `netlify.toml`. For the temporary live preview, follow [the Netlify setup guide](docs/netlify-preview.md) to connect the existing GitHub repo and deploy the `feat/astro-v1` branch without merging. WordPress-to-Netlify publish webhook is not yet configured.

## Notes
- NEXORA Energy is **not a real company**. Metrics and imagery are conceptual.
- Replace remote stock imagery with appropriately licensed, optimized assets before production.
- WordPress HTML is rendered from a trusted CMS; restrict editorial access and sanitize untrusted content.
- Astro picks up the actual Netlify deploy URL from `DEPLOY_PRIME_URL` during builds. The prototype includes a `noindex` response header until final review.
