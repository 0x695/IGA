// @ts-check
import { defineConfig } from 'astro/config';

// `site` is deliberately unset: the domain is still an open decision
// (masterdoc §8) and hosting is "GitHub Pages, later". Set it — and `base`
// if the site lives under a repo path — when that call is made. Nothing in
// the build assumes a deploy target beyond static output.
export default defineConfig({
  output: 'static',
  build: { format: 'directory' },
});
