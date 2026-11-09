import { defineConfig } from 'astro/config';

// Netlify exposes the actual deploy URL at build time. Use it for canonical URLs
// once the site is connected, without hardcoding a guessed *.netlify.app domain.
const site = process.env.DEPLOY_PRIME_URL || process.env.URL || 'https://nexora.example';

export default defineConfig({
  output: 'static',
  site
});
