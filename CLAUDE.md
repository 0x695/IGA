# IGA — Impressions Games Archive

## Mission

A static reference site for the Impressions Games / Sierra **City Building**
series — Caesar (1992), Caesar II, Caesar III, Pharaoh, Zeus, Emperor — and
for the open-source engine and modding ecosystem around it.

The differentiator is the **technical layer**: file formats, engine
reimplementations, and honest status on what is and isn't documented. No
existing site does this. Players and nostalgics are a real audience but the
primary reader for v1 is a modder or developer who arrived from a search with
one specific question and wants the answer in one or two clicks.

Not a HeavenGames competitor, not a fan shrine. A modern index that links out
generously and adds the layer nobody has built.

## Source of truth, in order

1. **`docs/masterdoc-v3.md` §10** — the resolved IA and visual system. Where
   §10 contradicts §4/§5 of the same document, **§10 wins**; §4/§5 are the
   pre-design draft and are kept only for the reasoning trail.
2. **`design/`** — the approved Claude Design canvas export, unmodified. The
   artboards are the visual specification. `design/content-data.js` is the
   researched per-game content, not filler.
3. **`docs/build-brief.md`** and **`docs/design-brief.md`** — scope, data
   models, and the record of what changed during design.
4. **`docs/ROADMAP.md`** — what is next and what it is blocked on.
   Supersedes masterdoc §7 and the build brief's v1/v2/v3 order, both
   of which the design pass invalidated.
5. **`docs/masterdoc-v3.md` §3** — the research. Pull content from it rather
   than re-researching.

## The IA is settled: Home + six per-game hubs

There is **no** standalone Engine Hub, File Format Reference, or Community
Directory page. Design tried the centralized structure and rejected it —
it fragmented attention away from the game a visitor actually came for. Each
game hub is self-contained and filters the shared `engineProject`,
`fileFormat` and `communityLink` data down to that one game. The series
timeline lives on Home, not its own route.

This was a deliberate reversal, recorded in masterdoc §10. Do not
re-centralize it on a hunch. The one thing worth revisiting later is a
cross-game comparison view *layered on top of* the per-game framing, once all
six hubs are live — and only if the loss is actually felt.

## Design fidelity

**The design is built and approved. Build it as designed — do not redesign
it.** The artboards in `design/` carry the exact tokens: the dark shell
(`--color-bg: oklch(15% 0.004 60)`), Cormorant Garamond over Lora with
JetBrains Mono for figures, the 3-tier radius and shadow scale.

- **Take every colour, size and radius from a token.** The artboards hold
  them as inline custom properties on each page's root div; the build lifts
  that block into one global stylesheet. A literal hex or a bare `14px` in a
  component is drift.
- **Per-game accent is a white → grey scale in release order** — Caesar,
  Caesar II and Caesar III white, Pharaoh light grey, Zeus dark grey, Emperor
  darkest grey. It is on nav dots, timeline dots, and each hub's hero rule.
  The civilization palette (`--accent-rome`, `--accent-egypt`,
  `--accent-greece`, `--accent-china`) is still declared in the artboards but
  the design pass **replaced** it with the monochrome scale by request. Only
  `--accent-rome` survives in use, as the Caesar III "the archetype" badge
  and as `--color-accent`. Don't revive the other three.
- **Status is a three-value vocabulary** — active / dormant / dead, a small
  dot plus a label, green / grey / red. It means one thing and it is used on
  both engine projects and community links. Saying plainly that a project is
  abandoned is a core value of the site, not a decoration.
- **Caesar I and II read as archive entries**, with the explicit "Archive
  entry" badge. They are cruder, top-down, pre-isometric games and their
  pages should not strain to match the later ones' polish.

## Content rules

- **Structured data, never hand-written tables.** Games, engine projects,
  file formats and community links are typed content collections. Buildings
  (v2) will be ~100 entries per game across six games — the schema shape is
  defined before any of it is written.
- **Mark gaps honestly rather than filling them.** No open-source engine
  exists for Emperor; none exists for Caesar I or II, and neither has any
  public format documentation; `.map`, `.sav` and `.eng` are only partially
  documented. These are stated as facts on the page, and Emperor's is framed
  as a wanted board — it is the most credible open target in the series.
- **Link out, don't mirror.** Storefronts and community-hosted material are
  linked. Open-source repos may be described, linked, and briefly quoted with
  attribution.
- **The homepage states the scope plainly**: an archive of knowledge and
  links, not of game files.

## The images: decided, with the reasoning kept

Each hub carries one gameplay screenshot and Home carries one box-art cover
per game, all user-supplied, each credited inline ("Community screenshot —
[Game] © Activision"). The design brief's original **hard constraint was "no
game assets"** — the IP is live and actively licensed (Sierra → Vivendi →
Activision, a Microsoft subsidiary since October 2023; Dotemu had to license
Pharaoh from Activision for the 2023 remake).

That constraint was relaxed by request during design, and three documents
flagged it as needing a real look before launch. **It has had one, and the
answer was to keep both** — see `docs/ROADMAP.md`'s Phase 0 for the reasoning
and its limits. It was a judgement call, not a legal clearance.

What follows from that:

- **Keep the credit lines.** They are the thing the decision rests on.
- **Don't re-litigate it on every change**, and don't quietly drop the images
  because the rule reads strict.
- **A change of *use* is a new question.** Bigger images, more of them, or
  anything that reads as a gallery rather than illustration is not covered by
  the call that was made.
- **The remedy is cheap if it is ever needed.** The images are data-driven;
  both the hub figure and the timeline row can fall back to type.

## Search is not optional

Both briefs call static search non-negotiable for a reference site. The
design pass removed the search box from the nav for a cleaner header — that
is a *design* omission, not a decision to ship without search. Pagefind, per
the build brief. Prominent, not buried.

## Not in scope yet

Buildings reference (v2 — define the schema now, populate later), devlog,
cross-game comparison view, CMS. Tier-2 games (Caesar IV, Children of the
Nile, Pharaoh: A New Era, Nebuchadnezzar) get the single italic
"related, not core" line on Home and **no pages** — settled in design.

## Toolchain

Astro, static output, Content Collections with Zod schemas, Markdown/MDX for
prose, Pagefind for search. No CMS — git and Markdown.

Node was not installed on this machine before this project; it came from
`winget install OpenJS.NodeJS.LTS`. Python 3.12 is available and is the
easy way to serve `design/` for reference:

```
python -m http.server 8787 --directory design
```

Hosting is GitHub Pages, later — the site builds and runs locally for now,
and nothing should assume a deploy target beyond static output.

## What the build added, and why

Three things the design does not have are in the site, each because a brief
requires it. Each is small and each is easy to mistake for drift, so:

- **Search**, in the header's third column. The design's header is a
  three-column grid with an empty spacer on the right; search goes there, so
  no part of the design moved to make room.
- **The homepage scope line**, under the hero lede. Required by masterdoc §8
  and the build brief; the design's hero doesn't say it.
- **The "how to play it today" section** on each hub. Masterdoc §4 lists it as
  part of the per-game hub; the design dropped it. It sits under the engines
  on purpose — every one of them ships code and no assets, so a copy of the
  original is their prerequisite, and that is the sentence the section opens
  with wherever a game has engines.
- **WebP derivatives** in `public/images`. The originals in `design/images`
  are untouched and remain the supplied assets; they total 15.2 MB and the
  site is read on phones.

Two smaller judgement calls, in the same spirit:

- The Home "related, not core" line **wraps on narrow screens** instead of
  scrolling horizontally as the artboard does.
- The nav's current-page marker is an **underline under the whole link**. The
  artboard's version is a zero-width span inside a flex row, which renders as
  nothing; this is the intent, working.

**Storefront URLs are checked, never guessed.** Every entry in a game's
`storefronts` was opened and confirmed to sell that title before it went in
the data — Steam app ids in particular are unguessable, and a wrong one sends
a reader to another game entirely. Caesar, Caesar II and Emperor are GOG-only
and their `playNote` says so; an absent store is stated, not left blank.

**`coverCredit` exists in the data but is not displayed.** The design's Home
timeline shows the box art with no visible credit line, though masterdoc §10
says both images are credited inline. Rather than invent UI the design
doesn't have, the credit rides on the image's `title`. If the rights review
says it must be visible, it is one line to render — the string is already
there.

## Working on this

```
npm run dev        # localhost:4321
npm run build      # astro build + pagefind -> dist/
npm run images     # regenerate public/images from design/images
npx astro check    # 0 errors expected
```

`astro check` warns "No items found in src/data/buildings.json" — that is
the deliberately empty v2 collection, not a fault.

Two environment notes for this machine:

- **Node came from `winget` mid-session, so a shell that started before that
  will not see it.** In this session's Bash, prefix with
  `export PATH="/c/Program Files/nodejs:$PATH"`. A new session picks it up
  normally.
- **`astro preview` did not bind a port here.** `python -m http.server 8788
  --directory dist` serves the built site fine and is what the build was
  verified against, search included.
