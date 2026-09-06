/**
 * Prefix a site-root path with the deployment's base path.
 *
 * Astro rewrites the URLs it generates itself (bundled CSS, JS) when `base` is
 * set, but not paths written by hand in markup or held in the data files. On a
 * GitHub Pages *project* site the base is `/<repo>/`, so a bare `/caesar3/`
 * 404s while looking perfectly correct in local development, where the base is
 * `/`. Every internal link and asset path goes through here.
 */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL; // always ends in "/"
  return base.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
}
