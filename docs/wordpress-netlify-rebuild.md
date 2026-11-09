# WordPress → Netlify automatic rebuild

This integration is a standalone WordPress plugin for Nexora's headless CMS at `cms.lembayu.com`.

## What triggers a rebuild

The plugin queues **one HTTP POST per WordPress save request** after the request's other WordPress and ACF handlers finish.

A request is queued when:

- A `project` or `event` post is published or updated while published.
- A published item becomes draft, private, pending, or trash.
- A scheduled item becomes published.
- A published item is permanently deleted.

Draft-only edits, autosaves, unrelated post types, and revisions do **not** trigger rebuilds.

This uses WordPress's `wp_after_insert_post`, `acf/save_post`, status transition, deletion, and shutdown hooks. See [WordPress wp_after_insert_post](https://developer.wordpress.org/reference/hooks/wp_after_insert_post/) and [ACF save_post](https://www.advancedcustomfields.com/resources/acf-save_post/).

## Installation (no FTP required)

1. Download the installer ZIP from the `WordPress plugin ZIP` GitHub Actions artifact, or create a ZIP whose root contains the `nexora-netlify-rebuild/` folder with the PHP plugin.
2. In WordPress go to **Plugins → Add New Plugin → Upload Plugin** and upload `nexora-netlify-rebuild.zip`.
3. Click **Install Now → Activate Plugin**.
4. In Netlify open **Project configuration → Developer settings → Continuous deployment → Build hooks**. Create a hook named `WordPress Projects and Events`, selecting **the current Netlify production branch** (use `main` after migration).
5. **Keep the secret URL private.** Copy it directly to **WordPress → Settings → Nexora Rebuild**. The field is write-only; saving an empty field keeps the existing value.
6. Click **Send test rebuild** on the plugin settings screen. Check Netlify's Deploys tab for a new build.
7. Update the existing published demo Project or Event in WordPress and verify that a second build starts automatically. Check the live site after the build completes.

Important: Netlify's Build Hook URL is a credential. **Never commit it to GitHub, paste it into this chat, or put it into an Astro public environment variable.** If exposed, revoke and recreate the hook in Netlify.

## Production behavior

- The preview site originally used **feat/astro-v1**. After merging, switch Netlify's production branch to **main**, create a new build hook for **main**, and replace the URL in plugin settings. See [production handoff](production-handoff.md).
- One save request produces at most one rebuild request; separate successive saves can trigger separate builds. This simple prototype does not debounce across requests.
- The outbound request is HTTPS-only and can only target the official `api.netlify.com/build_hooks/…` endpoint. The plugin doesn't expose a public REST route.
- WordPress stores the hook in a normal WordPress option (not encrypted at rest). Secure the WordPress admin, database and backups.
- HTTP status 2xx means the request was accepted, **not** that the build or deploy succeeded.
- A WordPress request can take up to ~8 additional seconds if Netlify is unreachable, because the plugin waits for an HTTP response at shutdown.
- WordPress and Netlify must both be reachable. Netlify publishes only content available from the CMS during the build.
- Gallery edits and featured image changes follow the normal WordPress/ACF save process.

## Uninstall and disable

Deactivate the plugin to stop new rebuild requests. To revoke the secret fully, remove the saved hook in **Settings → Nexora Rebuild** and delete the build hook in Netlify.

## Files

- `wordpress/nexora-netlify-rebuild/nexora-netlify-rebuild.php`: plugin source
- `.github/workflows/package-wordpress-plugin.yml`: package ZIP and lint
