# NEXORA Energy — editorial layout V3

A design-only iteration based on four screenshots supplied by the portfolio owner.

## Translation, not reproduction

| Reference characteristic | NEXORA adaptation |
| --- | --- |
| ExxonMobil multi-panel cinematic hero | Four-column full-bleed mosaic using existing licensed NEXORA photographs, grounded headline and useful section links. No mock carousel controls. |
| Petrova white editorial bento | Three cards highlighting the *process*, the *working principle*, and illustrative infrastructure photography. No fictional client names or fake KPIs. |
| Petrova modular technology layout | A custom editorial engineering section with three horizontal capability rows and a photographic systems-thinking panel. We retain the modular engineering visual language without copying the drilling illustration or 2×2 card grid. Accent colors use NEXORA’s original warm copper, not the reference’s neon lime. |
| Petrova oversized dark footer | Reinterpreted as a restrained, corporate footer: standard brand on the left with a tagline below, navigation on the right, and centered brand on mobile; the concept disclaimer stays visible. |

## Explicitly preserved

- NEXORA brand name, WordPress Projects and Events APIs, detail pages, site route architecture, and global navigation.
- Existing curated photos and image credits.
- Typography families, accessible focus/keyboard navigation, reduced-motion behavior, and fallback CMS image strategy.
- No contact form backend or fabricated social proof.

## Review workflow / Netlify credits

This work lives on `feat/editorial-layout-v3` as a PR into `main`. Do **not merge or publish to the Netlify production branch** until the owner has reviewed browser screenshot artifacts and Netlify credits are available. The GitHub Actions visual QA workflow runs on pull requests and uploads the screenshots without spending Netlify production-deploy credits.

The photographic systems panel is illustrative art direction, not a technical engineering specification or claim about actual assets.

## Brand color refinement

V3 uses the original NEXORA signature copper `#D9A16C` on dark and light components. Neon-lime accents were removed from hero CTAs, section labels, icons, cards, focus styling, diagram highlights, and footer. The existing navy/charcoal neutrals and layout are intentionally retained.

## Approved corporate footer refinement

The oversized NEXORA wordmark was removed after review because it competed with the rest of the website and reduced the corporate impression. Desktop now uses a standard-sized NEXORA Energy brand aligned left, with the tagline **“Built on engineering. Focused on delivery.”** and concise contextual copy. Navigation is grouped on the right. Mobile centers the logo and tagline, with accessible link columns below. All existing routes remain functional; no fake addresses, phone numbers, or client claims are added.
