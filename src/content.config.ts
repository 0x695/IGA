import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';

/**
 * The site's data model.
 *
 * Everything a page renders comes from here. Game hubs *filter* these
 * collections down to one game rather than owning their own copies — the
 * per-game IA (masterdoc §10) is a presentation choice, not a data one, so a
 * cross-game comparison view stays possible later without a migration.
 */

/** active / dormant / dead — the site's one status vocabulary, used on both
 *  engine projects and community links. Saying plainly that a project is
 *  abandoned is a feature. */
const status = z.enum(['active', 'dormant', 'dead']);

const games = defineCollection({
  loader: file('src/data/games.json'),
  schema: z.object({
    title: z.string(),
    /** The nav label — full titles are too long for the header bar. */
    shortTitle: z.string(),
    /** Release order, 1–6. Drives the timeline and the white→grey accent scale. */
    order: z.number().int().min(1),
    years: z.string(),
    releaseYear: z.number().int(),
    civ: z.string(),
    setting: z.string(),
    developer: z.string(),
    publisher: z.string(),
    credits: z.string().nullable(),
    expansions: z.string().nullable(),
    /** Caesar I and II: cruder, pre-isometric, presented as archive entries. */
    archive: z.boolean(),
    badge: z.string(),
    badgeAccent: z.boolean().optional(),
    accent: z.string(),
    /** Longer framing, shown on the hub. */
    engineNote: z.string(),
    /** Shorter framing, shown on the Home timeline. */
    timelineNote: z.string(),
    /** Set only where no open-source engine exists — the wanted board. */
    wanted: z.string().nullable(),
    /**
     * Where to buy it now. Official storefronts only — masterdoc §3.4 is to
     * link storefronts and community-hosted material, never to mirror or to
     * point at a copy of the game itself. Every URL here was checked against
     * the live store page rather than pattern-guessed from a slug.
     */
    storefronts: z.array(
      z.object({
        store: z.string(),
        /** What that store actually sells — the bundles differ per store. */
        edition: z.string(),
        url: z.string().url(),
      }),
    ),
    /** One line of compat/availability truth, including why a store is absent. */
    playNote: z.string(),
    image: z.string(),
    imageCredit: z.string(),
    cover: z.string(),
    coverCredit: z.string(),
  }),
});

const engineProjects = defineCollection({
  loader: file('src/data/engine-projects.json'),
  schema: z.object({
    name: z.string(),
    games: z.array(z.string()),
    /** What it forked from, or "Independent". */
    lineage: z.string(),
    language: z.string(),
    status,
    saveCompat: z.string(),
    platforms: z.string(),
    activity: z.string(),
    repoUrl: z.string().url(),
    docsUrl: z.string().url().nullable(),
  }),
});

const fileFormats = defineCollection({
  loader: file('src/data/file-formats.json'),
  schema: z.object({
    name: z.string(),
    games: z.array(z.string()),
    /** Display vocabulary, shared with engine projects. */
    status,
    /** The semantic the status renders: what is actually known about it. */
    documentation: z.enum(['documented', 'partial', 'undocumented']),
    note: z.string(),
    sources: z.array(z.object({ title: z.string(), url: z.string().url() })),
    /** Structured field tables (offset/type/description). Nothing carries one
     *  yet — the consolidated spec write-up is later work, and an empty spec
     *  is an honest "not written" rather than a guess. */
    spec: z
      .array(
        z.object({
          section: z.string(),
          fields: z.array(
            z.object({
              offset: z.string(),
              type: z.string(),
              name: z.string(),
              description: z.string(),
            }),
          ),
        }),
      )
      .nullable(),
  }),
});

const communityLinks = defineCollection({
  loader: file('src/data/community-links.json'),
  schema: z.object({
    title: z.string(),
    /** Null where the destination is known to exist but the URL isn't — an
     *  invite we haven't got, say. Rendered as an un-linked card, not a
     *  dead link. */
    url: z.string().url().nullable(),
    /**
     * Where to still read something whose own host is gone. Half of what this
     * site points at is 20+ years old and privately hosted; "preserves what's
     * at risk of vanishing" is part of the mission, so a dead resource stays
     * on the page with a route to its archived copy rather than being deleted
     * as if it never mattered.
     */
    archivedUrl: z.string().url().optional(),
    category: z.string(),
    games: z.array(z.string()),
    status,
    note: z.string(),
  }),
});

/**
 * v2. The shape is fixed now so the data is right from the start: a building
 * is one cross-game concept with per-game variants, because the same
 * conceptual building genuinely differs between Caesar III, Pharaoh, Zeus and
 * Emperor. Nothing renders this yet and buildings.json is deliberately empty.
 */
const buildings = defineCollection({
  loader: file('src/data/buildings.json'),
  schema: z.object({
    name: z.string(),
    category: z.string(),
    description: z.string(),
    variants: z.array(
      z.object({
        game: z.string(),
        name: z.string(),
        cost: z.number().nullable(),
        employees: z.number().nullable(),
        size: z.string().nullable(),
        requires: z.array(z.string()),
        produces: z.array(z.string()),
        notes: z.string().nullable(),
      }),
    ),
  }),
});

export const collections = { games, engineProjects, fileFormats, communityLinks, buildings };
