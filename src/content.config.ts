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

/** One value, or one per difficulty level. Never collapse the five into one. */
const numberOrScale = z.union([z.number(), z.array(z.number())]).nullable();

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
    /**
     * The development team, role by role. Null where no credit list has been
     * found; the hub then falls back to the one-line `credits` above rather
     * than showing an empty section.
     *
     * `section` groups rows under a subheading and exists because a credit list
     * is not always one flat team: Emperor was built by two studios and lists
     * them separately, and an expansion ships its own credits which belong on
     * the base game's hub but not mixed into its roles.
     */
    fullCredits: z
      .array(
        z.object({
          section: z.string().nullable().optional(),
          role: z.string(),
          names: z.array(z.string()),
        }),
      )
      .nullable(),
    /**
     * Where the list came from - an array, because a game whose base credits
     * were read from its manual and whose expansion credits came from a credit
     * database has two, and naming only one of them would be wrong. `url` is
     * null where the source is nameable but has no link that was verified.
     */
    creditsSources: z
      .array(z.object({ title: z.string(), url: z.string().url().nullable() }))
      .nullable(),
    /** Anything the transcription deliberately leaves out. */
    creditsNote: z.string().nullable(),
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
    /**
     * Patches and compatibility, per masterdoc §4 — PCGamingWiki for every
     * game, plus the resolution work where it exists. Links out; this site
     * hosts no downloads. Deliberately *not* a downloads index: §4 listed
     * that separately and the design dropped it, and quietly growing one here
     * would be a different page hiding inside this section.
     */
    compat: z.array(
      z.object({ title: z.string(), url: z.string().url(), note: z.string() }),
    ),
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
    /**
     * The project's most recent commit, filled in by
     * scripts/update-engine-activity.mjs. Saying a project is dormant is only
     * worth something with a date behind it, and a date the reader can see is
     * also a date the reader can see going stale. Null where the repository
     * could not be read - which is itself a finding worth showing.
     */
    lastCommit: z
      .object({ sha: z.string(), date: z.string(), branch: z.string() })
      .nullable()
      .optional(),
    /** When the commit above was last looked up. */
    activityCheckedAt: z.string().optional(),
    repoUrl: z.string().url(),
    docsUrl: z.string().url().nullable(),
  }),
});

/**
 * A spec is a sequence of typed blocks rather than prose or a single table.
 * The design brief's requirement for this component was that byte offsets and
 * field tables be "genuinely readable, not a wall of monospace" — which means
 * the prose that explains a table, the enumerations a field refers to, and the
 * corrections worth shouting about all need somewhere structured to live.
 */
const specBlock = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('prose'),
    title: z.string().optional(),
    body: z.array(z.string()),
  }),
  z.object({
    kind: z.literal('fields'),
    title: z.string(),
    note: z.string().optional(),
    rows: z.array(
      z.object({
        offset: z.string(),
        size: z.string(),
        type: z.string(),
        name: z.string(),
        description: z.string(),
      }),
    ),
  }),
  z.object({
    kind: z.literal('list'),
    title: z.string(),
    note: z.string().optional(),
    items: z.array(z.object({ term: z.string(), description: z.string() })),
  }),
  z.object({
    kind: z.literal('callout'),
    title: z.string(),
    body: z.string(),
  }),
]);

const fileFormats = defineCollection({
  loader: file('src/data/file-formats.json'),
  schema: z.object({
    name: z.string(),
    /** Compact label for the format's own page and links. Null where the entry
     *  is an honest placeholder rather than a documented format. */
    shortName: z.string().nullable(),
    /** Page heading. Null for entries with no page. */
    title: z.string().nullable(),
    games: z.array(z.string()),
    /**
     * What is actually known about this format. The status dot is derived from
     * it (see src/lib/formats.ts) rather than stored alongside it — when both
     * were data they disagreed, and a green dot appeared next to the words
     * "Partially documented".
     */
    documentation: z.enum(['documented', 'partial', 'undocumented']),
    /** The one-liner shown on a game hub. */
    note: z.string(),
    /** The standfirst on the format's own page. Null where there is no page. */
    summary: z.string().nullable(),
    sources: z.array(z.object({ title: z.string(), url: z.string().url() })),
    /**
     * The written spec. A format gets its own page if and only if this is
     * non-null: a page that only repeats "nobody has documented this" is worse
     * than a hub row saying the same thing in one line, so undocumented
     * formats stay as rows and link nowhere.
     */
    spec: z.array(specBlock).nullable(),
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
 * Buildings.
 *
 * One cross-game concept with per-game variants, because the same conceptual
 * building genuinely differs between Caesar III, Pharaoh, Zeus and Emperor.
 *
 * Generated by scripts/build-buildings.mjs from Julius's building_type enum
 * and its properties table, joined by numeric index and checked against
 * fourteen independently-known sizes. Edit the script, not this data.
 *
 * `cost` and `employees` are null throughout and that is not an omission: they
 * are not in the engine. They are read at runtime from c3_model.txt, which
 * ships with the game and which mods rewrite, so there is no single correct
 * value the site could publish. The format page for that file is where a
 * reader is sent instead.
 */
const buildings = defineCollection({
  loader: file('src/data/buildings.json'),
  schema: z.object({
    name: z.string(),
    category: z.string(),
    description: z.string().nullable(),
    variants: z.array(
      z.object({
        game: z.string(),
        name: z.string(),
        /** The engine's own constant — this audience builds tools. */
        engineType: z.string(),
        /** Footprint in tiles; buildings are square. Null where not applicable. */
        size: z.number().int().nullable(),
        /**
         * Pharaoh states cost as five numbers, one per difficulty level, so
         * this is an array rather than a scalar. Null for Caesar III, whose
         * costs are not in the engine at all.
         */
        cost: z.array(z.number()).nullable(),
        employees: z.number().nullable(),
        requires: z.array(z.string()),
        produces: z.array(z.string()),
        notes: z.string().nullable(),
      }),
    ),
  }),
});

/**
 * Campaign missions, in play order.
 *
 * Provenance differs by game, and the pages say so:
 *
 * - Pharaoh is read out of Akhenaten's per-mission config files, one per
 *   mission, so it carries the win criteria the engine actually checks. Goals
 *   with a value of zero are dropped - the engine marks some criteria enabled
 *   with a goal of 0, which is not a requirement.
 * - Caesar III and Emperor come from community documentation, because mission
 *   names are not in the engines at all: they live in the games' own text
 *   files. Caesar III's rank-and-branch pairing is agreed independently by
 *   Caesar 3 Heaven's walkthrough index and NamuWiki's scenario page, and the
 *   count reconciles with Julius, which uses 11 of the 12 rows in its mission
 *   table. Emperor's order is stated by the Impressions Games Wiki.
 *
 * Which means these lists carry no win criteria: nobody has published them and
 * this site will not invent them.
 */
const campaigns = defineCollection({
  loader: file('src/data/campaigns.json'),
  schema: z.object({
    game: z.string(),
    /** Position in the campaign, from 0. */
    order: z.number().int(),
    name: z.string(),
    /** Which release the mission shipped with. */
    campaign: z.string(),
    /** The rank the player holds, where the game has ranks. */
    rank: z.number().int().nullable(),
    /** The rank's name, where a source gives one. */
    rankName: z.string().nullable(),
    /**
     * Caesar III offers two provinces at most ranks: one peaceful, one under
     * military threat. Zeus offers a choice of colony twice, which is why a
     * played adventure is one episode shorter than the list - but the game
     * does not frame those two as peaceful and military, so they are marked
     * `choice` rather than given a label the source does not support. Null
     * where a mission has no choice, or the game has no such split.
     */
    branch: z.enum(['peaceful', 'military', 'choice']).nullable(),
    goals: z.array(
      z.object({
        type: z.string(),
        label: z.string(),
        value: z.number(),
      }),
    ),
  }),
});

/**
 * The housing ladder, per game - generated by scripts/build-housing.mjs.
 *
 * The three games here are documented to different depths and the schema does
 * not pretend otherwise. Pharaoh is read from Akhenaten and carries the whole
 * model; Caesar III is names and footprints only, because its requirements are
 * in c3_model.txt rather than in any engine; Emperor is transcribed from a
 * walkthrough, so its requirements are prose that was observed, not read.
 */
const housing = defineCollection({
  loader: file('src/data/housing.json'),
  schema: z.object({
    game: z.string(),
    /** Position on the ladder, from 0. */
    level: z.number().int(),
    name: z.string(),
    /** Emperor runs two ladders side by side and a citizen never crosses. */
    tier: z.enum(['common', 'elite']).nullable(),
    engineType: z.string().nullable(),
    size: z.number().int().nullable(),
    /**
     * A number where every difficulty agrees, five numbers where they do not -
     * the same shape as Pharaoh building cost, and for the same reason.
     */
    maxPeople: numberOrScale,
    prosperity: numberOrScale,
    evolveDesirability: numberOrScale,
    devolveDesirability: numberOrScale,
    /** Null for games whose requirements are not in an engine. */
    needs: z
      .object({
        water: numberOrScale,
        religion: numberOrScale,
        education: numberOrScale,
        entertainment: numberOrScale,
        health: numberOrScale,
        foodTypes: numberOrScale,
        pottery: numberOrScale,
        linen: numberOrScale,
        jewelry: numberOrScale,
        beer: numberOrScale,
      })
      .nullable(),
    /** What the rung asks for, where that is prose rather than a table. */
    requirements: z.string().nullable(),
    note: z.string().nullable(),
  }),
});

/**
 * What each industry building consumes and produces - generated by
 * scripts/build-production.mjs from Akhenaten's building configs.
 *
 * Pharaoh only, and the absence of the others is the finding: Caesar III keeps
 * its rates in c3_model.txt which mods rewrite, Emperor's exist only as a
 * walkthrough author's estimates, and the remaining three have no engine that
 * carries them.
 */
const production = defineCollection({
  loader: file('src/data/production.json'),
  schema: z.object({
    game: z.string(),
    name: z.string(),
    engineType: z.string(),
    size: z.number().int().nullable(),
    laborers: z.number().int().nullable(),
    /** Empty for a raw producer - a quarry takes nothing in. */
    inputs: z.array(z.string()),
    output: z.string(),
    /** Progress added per step, and the progress one finished load costs. */
    productionRate: z.number().int().nullable(),
    progressMax: z.number().int().nullable(),
    /** Percentage of that rate applied at each of the five difficulties. */
    rateByDifficulty: z.array(z.number()).nullable(),
  }),
});

/**
 * Mechanics deep-dives - the one part of the site that is argument rather than
 * table, and therefore the part that has to be most careful about sourcing.
 *
 * Blocks reuse the format spec's shape, so the prose/list/callout rendering is
 * the same component and a mechanics page cannot drift from a format page.
 * There is no index route, for the same reason there is no /formats/ index:
 * hubs are the way in.
 */
const mechanics = defineCollection({
  loader: file('src/data/mechanics.json'),
  schema: z.object({
    title: z.string(),
    /** The label a hub links with. */
    shortTitle: z.string(),
    /** Which hubs surface this. */
    games: z.array(z.string()),
    summary: z.string(),
    blocks: z.array(specBlock),
    sources: z.array(z.object({ title: z.string(), url: z.string().url() })),
  }),
});

export const collections = {
  games,
  engineProjects,
  fileFormats,
  communityLinks,
  buildings,
  campaigns,
  housing,
  production,
  mechanics,
};
