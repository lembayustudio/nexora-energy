# Netlify preview setup (no merge required)

This portfolio concept lives on GitHub in a draft PR on `feat/astro-v1`. Keep `main` unchanged during design review.

## Connect the existing repository

1. Sign in to [Netlify](https://app.netlify.com/).
2. Choose **Add new project → Import an existing project → GitHub**.
3. Grant Netlify access to **lembayustudio/nexora-energy** and select the existing repository. Do **not** use "Deploy to Netlify" template cloning, which may create a second repository.
4. In build settings, **select `feat/astro-v1` as the production branch for this temporary review site**. This publishes the code under a Netlify-provided preview site URL without changing the GitHub `main` branch.
5. Confirm the build settings populated from `netlify.toml`: **Build command `npm run build`**, **Publish directory `dist`**, **Node 22**.
6. Deploy. The site should fetch published Projects and Events from `https://cms.lembayu.com/wp-json/wp/v2` during the build. If CMS requests fail, deployment stops rather than publishing empty dynamic content.
7. Send the **actual Netlify site URL**, not a guessed URL, for visual QA and content review.

### After design approval

- Merge the reviewed PR to `main` and change Netlify's production branch to `main` (or connect a dedicated production Netlify site).
- Replace prototype images with properly licensed, optimized assets.
- Once the portfolio is ready to be indexed, remove the `X-Robots-Tag: noindex` header in `public/_headers`.
- Update the portfolio disclaimer and other metadata as needed.

### Automatic rebuild when WordPress content changes

Netlify automatically rebuilds on **Git pushes** after the repo is connected.
For **WordPress publish/update events**, create a Netlify build hook in **Project configuration → Build & deploy → Continuous deployment → Build hooks**, then connect WordPress publishing to this hook via a trusted webhook solution. This is a separate step from initial preview and has **not** been configured. Keep the build-hook URL private and never commit it to GitHub.

### Current scope

- The frontend has no contact form backend.
- The site is a fictional design case study, not a real energy services company.
- WordPress data must be public/published to appear in builds.
