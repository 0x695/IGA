# Impressions Games Archive

A reference site for the Impressions Games / Sierra *City Building* series —
**Caesar** (1992), **Caesar II**, **Caesar III**, **Pharaoh**, **Zeus** and
**Emperor** — and for the open-source engines and modding work around them.

**→ https://0x695.github.io/IGA/**

Players and nostalgics are welcome, but the reader this is built for is a
modder or developer who arrived from a search with one specific question and
wants the answer in one or two clicks.

## What makes it different

Fan sites for this series are good at strategy and thin on technical detail.
This one inverts that. Every table here was **read out of an open-source
engine** by a script that asserts its own output, and every page names the file
its figures came from.

The rule that follows matters more than any single table: **where something
could not be checked, the page says so** instead of rounding the gap up into
confidence.

- Caesar III has **no cost or labour column**, because those numbers live in
  `c3_model.txt` — a file that ships with the game and that any mod may
  rewrite. Publishing one installation's values would be right for one copy of
  the game and quietly wrong for every other.
- Emperor has **no production table**, because the only figures available are a
  walkthrough author's own estimates.
- `fire_proof` is parsed from the engine and **deliberately not emitted**: the
  column header and the struct field make opposite claims about the same byte,
  and no consuming code was found.
- Pharaoh's **peaceful/military branch labels are absent** — the choice pairs
  are real and visible in the engine, but which half is the military one is not
  recorded anywhere checkable.

Open-source projects carry a status — active, dormant or dead — with the date
and short SHA of their **last commit** beside it, so the claim has evidence
attached and a reader can see how stale the answer is.

## What is on it

Six self-contained game hubs. Each carries that game's engine projects, file
format status, community links, full development credits, and where to buy the
game today.

Hung off those hubs:

| | |
| --- | --- |
| **File formats** | Five written specs — SG/`.555`, `.eng`, `.map`, `.sav`, `c3_model.txt` |
| **Buildings** | Filterable references for Caesar III and Pharaoh |
| **Campaigns** | Every game, from mission configs where an engine has them |
| **Housing** | Ladders for Caesar III, Pharaoh, Zeus and Emperor |
| **Production** | Pharaoh's chains, with the rate the engine actually steps |
| **Mechanics** | The walker model, and why a city is not a spreadsheet |

Plus a [devlog](https://0x695.github.io/IGA/devlog/) covering how it was built —
including the mistakes — and Pagefind search across the lot.

## Running it

```
npm install
npm run dev      # http://localhost:4321/IGA/
npm run build    # astro build + pagefind, into dist/
npm run preview
```

Note the `/IGA/`. The site deploys as a GitHub Pages *project* site, so it
lives under a base path and the config defaults to the deployed values rather
than pretending the base is `/`. Serving `dist/` by hand needs it under a
matching directory, not at a server root.

Search is Pagefind and its index is built from the finished site, so under
`npm run dev` it does not exist — `/search` says so rather than looking broken.
Use `npm run build` to exercise it.

### Regenerating data

```
npm run buildings    # Caesar III from Julius, Pharaoh from Akhenaten
npm run housing      # housing ladders
npm run production   # Pharaoh's production chains
npm run engines      # each project's last commit date
npm run links        # check every outbound link
```

`src/data/buildings.json`, `housing.json` and `production.json` are **output**.
Edit the script and re-run it; hand edits are overwritten and, worse, are not
checked. Each script asserts its own work before writing — the buildings one
joins an enum to a properties table by numeric index, which is exactly the
operation that fails silently, so it verifies the row count and fourteen
independently known footprints first.

`npm run images` and `npm run social` need the original screenshots and box
art, which are not in this repository. The committed WebP derivatives under
`public/images` are what the site serves, so a clone builds without them.

## Layout

```
src/data/               the content, as typed JSON
src/content.config.ts   the Zod schemas it is validated against
src/pages/              Home, the six hubs and their sub-pages, formats,
                        mechanics, devlog, search
src/components/         nav, footer, cards, spec blocks
public/images/          screenshots and box art, as WebP
scripts/                the generators and the link checker
```

Content is data, not markup: adding an engine project or a file format means
adding an entry under `src/data/`, and every hub whose game it names picks it
up. Formats are stored **once** with a list of the games that use them —
`.sg3` is one format used by three titles, not three entries.

## Deploying

Pushes to `main` publish via `.github/workflows/deploy.yml`. Nothing hardcodes
a domain: the workflow reads the real origin and base path from
`actions/configure-pages` and passes them to the build, so the same code serves
a project site at `user.github.io/repo/` and a custom domain later without an
edit. The workflow enables Pages itself on first run.

One guard worth knowing about: the build fails if `dist/pagefind` is missing.
`astro build` alone produces a perfectly working site whose search box finds
nothing, and that failure is otherwise silent.

## Credits and scope

This archive holds knowledge and links, not game files. Screenshots and box art
illustrate the games they document and are credited inline. Open-source
projects are described, linked and briefly quoted with attribution; community
guides are linked and read, never republished — **facts can be sourced, prose
cannot be copied**.

Built on [Julius](https://github.com/bvschaik/julius),
[Augustus](https://github.com/Keriew/augustus),
[Akhenaten](https://github.com/dalerank/Akhenaten) and
[eZeus](https://github.com/MaurycyLiebner/eZeus), whose authors did the actual
reverse engineering. This site mostly reads what they wrote down.

Impressions Games Archive is a fan-run reference. Not affiliated with
Impressions Games, Activision, Sierra, or Tilted Mill.
