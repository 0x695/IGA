# Impressions Games Archive (IGA)

A static reference site for the Impressions Games / Sierra *City Building*
series — Caesar (1992), Caesar II, Caesar III, Pharaoh, Zeus, Emperor — and
for the open-source engine and modding ecosystem around it.

The point of it is the technical layer: which engine reimplementations exist,
what state they are in, and what is actually documented about the file
formats. Where nothing exists — no engine for Emperor, no engine *or* format
documentation for Caesar I and II — the site says so.

It archives knowledge and links, not game files.

## Running it

```
npm install
npm run dev      # http://localhost:4321
npm run build    # astro build + pagefind, into dist/
npm run preview
```

Search is Pagefind, and its index is generated from the built site. Under
`npm run dev` the index does not exist and `/search` says so rather than
looking broken — use `npm run build` to exercise search.

`npm run images` regenerates `public/images` from the originals in
`design/images`. Run it after adding or replacing an original.

## Layout

```
docs/          the planning and design briefs — masterdoc §10 is the IA
design/        the approved Claude Design canvas, exactly as exported
src/data/      the content: games, engine projects, file formats, community
src/content.config.ts   the schemas those files are validated against
src/pages/     index (Home + timeline), [game] (the six hubs), search
public/images/ WebP derivatives of design/images, at render size
scripts/       one-off tooling
```

Content is data, not markup: adding an engine project or a format means
adding an entry to `src/data/`, and the hub for each game it names picks it
up. See `CLAUDE.md` for the decisions behind the structure.

## Status

v1 is built: Home and all six game hubs, with search. What comes next,
and the decisions it is waiting on, is in [docs/ROADMAP.md](docs/ROADMAP.md).

Not built yet, and deliberately: the buildings reference (the schema is
defined and the data file is empty), a devlog, and a cross-game engine
comparison view. The domain and hosting are not chosen — the site builds to
static output and assumes nothing about where it lands.
