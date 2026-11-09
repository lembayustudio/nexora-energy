# NEXORA Energy — production branch handoff

This project was developed on `feat/astro-v1`, which is currently the Netlify production branch. The WordPress plugin and Build Hook have been verified working on that branch.

The GitHub repo's default branch is `main`. We merge the reviewed PR to `main` first, then switch Netlify settings **manually**. Merging in GitHub **does not automatically change** the production branch or the saved build-hook target in Netlify.

## Existing known-good state

- Site: https://nexora-energy-lembayu.netlify.app
- CMS: https://cms.lembayu.com
- Astro build: `npm run build`, publish directory: `dist`
- WordPress plugin: `Nexora Netlify Rebuild`, with a private build hook stored only in WordPress.
- Current Netlify production branch before migration: `feat/astro-v1`.
- Site remains a fictional portfolio case study. Keep the disclaimer and `noindex` header until separate public-indexing approval.

## Safe migration sequence

1. **Merge PR #1** into `main` after all checks pass. Do not delete `feat/astro-v1` yet.
2. **Leave the old hook in place** until the new `main` deployment is verified.
3. Open Netlify **Project configuration → Developer settings → Continuous deployment → Branches and deploy contexts → Configure**. Set the production branch to **main** and save.
4. Go to **Deploys** and confirm that a production build from `main` is **Published**. If a build doesn't appear, use Netlify's **Trigger deploy → Deploy project** action. Check the live site's Projects and Events listing.
5. In Netlify **Project configuration → Developer settings → Continuous deployment → Build hooks**, create a new hook named `WordPress Projects & Events — main`, selecting branch **main**. If `main` is not in the list, ensure step 4 deployed it first.
6. In WordPress **Settings → Nexora Rebuild**, paste the **new hook URL** and click **Save build hook**. The URL is confidential: do not share it in chat, screenshots, GitHub, or public environment variables.
7. Click **Send test rebuild**. Verify the new deployment says `triggered by hook`, is built from **main**, and reaches **Published**.
8. Update a published dummy Project or Event (ordinary **Edit**, not Quick Edit). Verify a fresh Netlify deployment from **main** and confirm the content is visible on the live website.
9. **Only after end-to-end verification**, delete the old `feat/astro-v1` build hook from Netlify. Keep the branch temporarily as rollback/reference. No need to reinstall the WordPress plugin just to change its saved URL.

## Rollback

If the switch to `main` fails, change the Netlify production branch back to `feat/astro-v1` and restore its still-existing hook URL in WordPress until the failure is fixed. Do not delete either hook prematurely. The previously published Netlify deploy can also be republished from Deploys.

## Unresolved / deferred

- Quick Edit previously returned HTTP 403 for `admin-ajax.php` while Gutenberg Edit/Update succeeded with ModSecurity ON. This may need hosting investigation if Quick Edit is required; do not disable ModSecurity to work around it.
- `noindex` remains enabled intentionally until portfolio publication is explicitly approved.
- Visual layout polishing is deferred until external design references are reviewed.
- Do not change the code or WordPress plugin's build-hook secret to simulate the migration. Netlify and WordPress settings require an authorized account owner.
