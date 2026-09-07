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
npm run dev      # http://localhost:4321/IGA/
npm run build    # astro build + pagefind, into dist/
npm run preview
```

Note the `/IGA/` — the site is deployed as a GitHub Pages *project* site, so it
lives under a base path, and the config defaults to the deployed values rather
than pretending the base is `/`. Serving `dist/` by hand therefore needs it
under a matching directory, not at a server root. CI overrides both the origin
and the base with whatever Pages reports.

Search is Pagefind, and its index is generated from the built site. Under
`npm run dev` the index does not exist and `/search` says so rather than
looking broken — use `npm run build` to exercise search.

`npm run images` regenerates `public/images` from the original screenshots and
box art. Those originals are not in the repository — the committed WebP
derivatives under `public/images` are what the site serves, so a clone builds
without them.

`npm run social` regenerates the Open Graph card and the PNG favicons. They are
committed rather than built in CI, and only change when the wordmark or palette
does. The card is deliberately typographic: the game screenshots and box art
illustrate the games they document, and a social preview is a different use of
that art.

## Deploying

The site publishes to GitHub Pages via `.github/workflows/deploy.yml` on every
push to `main` or `master`. Nothing in the repo hardcodes a domain: the
workflow reads the real origin and base path from `actions/configure-pages`
and passes them to the build as `SITE_URL` and `BASE_PATH`, so the same code
serves a project site at `user.github.io/repo/` and a custom domain later
without an edit. Attaching a domain is a Pages setting plus a `CNAME`.

First-time setup, once the repository exists:

```
git remote add origin git@github.com:<user>/<repo>.git
git push -u origin master
```

The workflow enables Pages itself on its first run (`configure-pages` with
`enablement: true`), so there is no manual setup step. If that is ever
blocked — an organisation policy, say — the fallback is **Settings → Pages**,
**Source: GitHub Actions**.

One guard worth knowing about: the build step fails if `dist/pagefind` is
missing. `astro build` on its own produces a perfectly working site whose
search box finds nothing, and that failure is silent otherwise.

## Layout

```
src/data/      the content: games, engines, formats, buildings, campaigns,
               housing, production, mechanics, community links, devlog
src/content.config.ts   the schemas those files are validated against
src/pages/     Home, the six hubs and their sub-pages, formats, mechanics,
               devlog, search
public/images/ the screenshots and box art the site serves, as WebP
scripts/       the generators — buildings, housing, production, engine
               activity, images, social cards, and the link checker
```

Content is data, not markup: adding an engine project or a format means adding
an entry to `src/data/`, and the hub for each game it names picks it up.

Several of those files are **generated and should not be hand-edited** —
`buildings.json`, `housing.json` and `production.json` are written by the
scripts of the same name, which read the open-source engines directly and
assert their own output before writing. Edit the script and re-run it.

## What is on it

**v1.0.** Home with the series timeline and six self-contained game hubs, each
carrying that game's engines, file formats, community links, full credits and
where to buy it now. Hung off the hubs: five written file-format specs, a
filterable buildings reference for Caesar III and Pharaoh, a campaign page for
every game, housing ladders for four of them, Pharaoh's production chains, and
a mechanics essay on the walker model. Plus a devlog, and Pagefind search.

The principle throughout is that a figure should be checkable. Where something
was read out of an engine the page says which file; where it could not be, the
page says that instead of rounding the gap up into confidence — Caesar III has
no cost column because those numbers live in a file that mods rewrite, and
Emperor has no production table because the only figures available are a
walkthrough author's estimates.

Two things are deliberately absent rather than pending: `fire_proof` in the
buildings table, whose meaning could not be confirmed, and Pharaoh's
peaceful/military branch labels, which the engine does not record.
