import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

/**
 * Hand-rolled rather than @astrojs/sitemap, because this site has seven routes
 * and the decision worth making is *which* of them belong in an index — an
 * auto-discovered sitemap would list /search and /404 too. Both are real pages
 * and neither has standing content, so both would be indexed as thin results.
 */
export const GET: APIRoute = async ({ site }) => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const games = (await getCollection('games')).sort((a, b) => a.data.order - b.data.order);

  const paths = ['/', ...games.map((game) => `/${game.id}/`)];

  const urls = paths
    .map((path) => {
      const loc = new URL(base + path, site).href;
      // Home changes whenever any hub does; the hubs change independently.
      const priority = path === '/' ? '1.0' : '0.8';
      return `  <url>\n    <loc>${loc}</loc>\n    <priority>${priority}</priority>\n  </url>`;
    })
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
