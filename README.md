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

Six self-contained game hubs. Each always shows the same twelve sections, empty
or not: credits, file formats, buildings, housing, mechanics, production,
campaign, cheats, open-source engines, how to play it today, tools and mods,
manual and community. An empty section says so rather than disappearing.

The hubs track eleven open-source engine projects (eight active, two dormant,
one dead), each with its author, status, and last commit pulled from GitHub, and
a link to a browser build where one exists (Augustus, Akhenaten, the Caesar II
port and Gaius). They also list fan tools and mods, such as the widescreen
patchers for Zeus and Emperor, and where to buy each game today.

Hung off those hubs:

| | |
| --- | --- |
| **File formats** | Sixteen written specs — SG/`.555`, `.eng`, Caesar III's `.map`, `.sav` and `c3_model.txt`, Caesar's eight asset and save formats, Caesar II's `.SAV` and text, Zeus's `.sav` container |
| **Buildings** | Filterable references for Caesar, Caesar II, Caesar III, Pharaoh and Zeus |
| **Campaigns** | Every game, from mission configs where an engine has them |
| **Housing** | Ladders for every game; Caesar II's has land-value thresholds and per-house capacity |
| **Production** | Chains for Caesar, Caesar II, Caesar III, Pharaoh and Zeus, with a rate only where the source states one |
| **Mechanics** | The walker model, Caesar's city growth and taxes, Caesar II's growth tiers and what holds a house back, Zeus's city limits, and how the original Emperor runs |

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
npm run buildings    # Caesar III from Julius, Pharaoh from Akhenaten, plus Zeus, Caesar and Caesar II
npm run housing      # housing ladders, all six games
npm run production   # production chains, five games
npm run engines      # last commit date of every engine project and tool
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
[Akhenaten](https://github.com/dalerank/Akhenaten),
[eZeus](https://github.com/MaurycyLiebner/eZeus), the
[Caesar II reconstruction](https://github.com/second-impressions/caesar2-reconstruction)
and [Gaius](https://github.com/0x695/Gaius), whose authors did the actual
reverse engineering. This site mostly reads what they wrote down.

Impressions Games Archive is a fan-run reference. Not affiliated with
Impressions Games, Activision, Sierra, or Tilted Mill.
