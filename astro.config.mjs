// @ts-check
import { defineConfig } from 'astro/config';

/*
 * The site is deployed, so these now describe a real place rather than a
 * placeholder — canonical URLs, Open Graph tags and the sitemap all need an
 * absolute origin, and a build that guesses one is worse than no build.
 *
 * CI still overrides both from what GitHub Pages actually reports
 * (actions/configure-pages), which is what makes a custom domain later a
 * Pages setting rather than an edit here. Note the base is "/IGA" with the
 * repository's real capitalisation: Pages is case-sensitive, and a lowercase
 * guess would 404 every link on the site.
 */
const SITE = process.env.SITE_URL || 'https://0x695.github.io';
const BASE = process.env.BASE_PATH || '/IGA';

export default defineConfig({
  output: 'static',
  build: { format: 'directory' },
  site: SITE,
  base: BASE,
});
