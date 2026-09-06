import type { APIRoute } from 'astro';

/**
 * Everything is crawlable except the routes with no standing content of their
 * own.
 *
 * Worth knowing while the site lives on a GitHub Pages *project* URL: robots
 * .txt is only read at a domain root, so crawlers fetch
 * 0x695.github.io/robots.txt and never this file at /IGA/robots.txt. The
 * disallow below is therefore inert today and becomes live the moment a custom
 * domain is attached. What actually keeps those pages out of an index either
 * way is their noindex meta tag, which is per-page and needs no domain root.
 *
 * The sitemap has the same caveat and a way around it: it can be submitted
 * directly in Search Console rather than discovered through robots.txt.
 */
export const GET: APIRoute = ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const sitemap = new URL(`${base}/sitemap.xml`, site).href;

  return new Response(
    [
      'User-agent: *',
      'Allow: /',
      `Disallow: ${base}/search/`,
      '',
      `Sitemap: ${sitemap}`,
      '',
    ].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
};
