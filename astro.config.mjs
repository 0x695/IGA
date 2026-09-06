// @ts-check
import { defineConfig } from 'astro/config';

/*
 * The domain is still an open decision (masterdoc §8), so nothing is
 * hardcoded here. CI sets SITE_URL and BASE_PATH from what GitHub Pages
 * actually reports for the repository — which is why moving to a custom
 * domain later is a Pages setting rather than an edit to this file.
 *
 * Unset, as in local development, `site` stays undefined and `base` is "/".
 * That is correct for `npm run dev` and for serving dist/ locally; it only
 * means absolute URLs (canonical tags, sitemap) aren't generated, and nothing
 * generates them yet.
 */
export default defineConfig({
  output: 'static',
  build: { format: 'directory' },
  site: process.env.SITE_URL || undefined,
  base: process.env.BASE_PATH || '/',
});
