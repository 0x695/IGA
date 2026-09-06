# Impressions Games Archive — Design Brief

*For a Claude Design session. Paste this in whole. Bring `igda-masterdoc-v3.md` alongside it for full research context.*

> **Status: Design phase complete.** See "Design phase — what was actually built" at the bottom for the resolved IA, visual system, and the points where the build diverged from this brief (nav structure, screenshots/box art, search). Read that section before starting the Claude Code build.

---

## The project

**Impressions Games Archive (IGA)** — a reference site for the Impressions Games / Sierra *City Building* series and its open-source engine ecosystem.

Six games in scope:

| Game | Year | Setting | Visual character |
|---|---|---|---|
| Caesar | 1992 | Rome | Top-down VGA, pre-isometric, crude |
| Caesar II | 1995 | Rome | Transitional |
| Caesar III | 1998 | Rome | Isometric 2D sprite — the archetype |
| Pharaoh (+Cleopatra) | 1999 | Egypt | Same engine as C3 |
| Zeus (+Poseidon) | 2000 | Greece | Engine revamp |
| Emperor | 2002 | China | Last on the 2D engine |

## What the site is for

Reference and wayfinding. Not marketing, not a fan shrine.

People arrive from a search with a specific question — a file format byte offset, which open-source engine supports Zeus, how to run Emperor on Windows 11 — and should reach the answer in one or two clicks. Success is a page someone bookmarks and returns to, or links to in a forum reply.

## Audiences

**Modders and developers — primary for v1.** File formats, engine repos, build instructions, contribution paths. Technically literate, impatient with fluff, will judge credibility by whether the format tables are readable.

**Players and nostalgics — v2.** Mechanics, buildings reference, campaign guides, "how do I run this today."

Navigation must make the split legible immediately without fragmenting the site into two disconnected halves.

## Pages to design (v1) — as briefed

1. **Home** — what the series is, what the site covers, fast entry points. Must state plainly that this archives knowledge and links, not game files.
2. **Series timeline** — 1992→2023, studio history (Impressions → BreakAway → Tilted Mill), engine generations.
3. **Engine Reimplementation Hub** — *the flagship page.* Every open-source engine project across the series, compared.
4. **File Format Reference** — *likely the most-linked page.* SG2/SG3/.555 specs, plus honest "undocumented" markers where nothing exists.
5. **Community Directory** — annotated links to HeavenGames, Discords, ModDB, wikis, single-author sites.

> **Superseded — see the resolved IA at the bottom.** In the delivered design, #3–#5 are not standalone pages: that content is distributed into six per-game hub pages instead, and the timeline lives on Home rather than its own page.

## Components needed

- **Engine comparison table** — columns: project, target game, language/framework, status, save compatibility, platforms, activity, links. Many columns, must survive mobile. This is the hardest component; start here.
- **Format spec blocks** — byte offsets, field tables, hex and code samples. Must be genuinely readable, not a wall of monospace.
- **Status indicator** — a small, consistent marker for active / dormant / dead, used on both engine projects and community links. Several of these projects are abandoned and saying so clearly is a core value of the site.
- **Annotated link card** — for the Community Directory.
- **Timeline component** — series history.
- **Building reference card / grid** — repeats ~100× per game. Ships in v2, but design the pattern now so the underlying data model is right from the start.
- **Per-game hub landing template** — v2, but sketch it.

## Aesthetic direction

Documentation-site quality. Modern, dense but calm, high readability. The bar is a good technical reference, not a fan page.

**Per-game accent theming.** The series covers four civilizations with genuinely distinct palettes. Explore a neutral base shell with accent colour and section headers themed per game:

- Rome — terracotta, marble, warm stone
- Egypt — ochre, lapis
- Greece — white, aegean blue
- China — vermilion, jade

Enough to orient a reader instantly. Not enough to fragment the site into four sites.

**Caesar I and II are visually cruder** than the rest — top-down VGA, pre-isometric. Their pages should read as archive/historical entries rather than straining to match the later games' polish. This is an opportunity, not a problem.

**Avoid:** papyrus textures, faux stone, serif-Roman pastiche, hieroglyph borders, anything that reads as theme-park antiquity. The audience is technical; restraint reads as credible.

## Hard constraints

- **No game assets.** The IP is actively held by Activision — Dotemu had to license Pharaoh from them for the 2023 remake. No sprites, screenshots, box art, or music. Design must work with typography, colour, and layout alone.
- **Static site**, Markdown-driven content. Astro is the likely stack.
- **Mobile matters a lot.** Much of this traffic is someone looking something up mid-game on a phone.
- **Search must be prominent** — non-negotiable for a reference site.

> **Overridden during design, by explicit request:** each game hub now carries its own screenshot and box-art cover (small, credited "Community screenshot — [Game] © Activision" / cover art, linked to the hub) — revisit this with legal/rights judgment before shipping publicly. The nav search box was also removed in the delivered design; if search stays non-negotiable, it needs to be re-added (Pagefind at build time is the natural fit).

## Where to start

Overall visual direction, then the **Engine Reimplementation Hub**. It carries the most structural complexity and it's the page that has to prove the site is worth trusting.

> Superseded — see below. The build actually started with the visual system + a centralized Engine Hub, then was restructured mid-session into per-game hubs.

---

## Design phase — what was actually built

**Navigation & IA (changed from this brief).** The modder/player nav split was tried first, then replaced: the top bar is six game-hub links (Caesar, Caesar II, Caesar III, Pharaoh, Zeus, Emperor), centered between the wordmark and a spacer. There are no more standalone Engine Hub / File Format Reference / Community Directory pages — each game hub is self-contained and shows only the engine projects, format status, and community links relevant to *that* game. Home carries the hero, the full series timeline (1992→2023, with studio bar and per-game cover art), and a one-line "related, not core" mention of Caesar IV / Children of the Nile / Pharaoh: A New Era / Nebuchadnezzar.

**Visual system (changed from the brief's civilization-color direction).** Dark shell throughout (the brief's neutral base is a near-black warm neutral, not a light ground). Per-game accent was redirected from civilization colors (terracotta/ochre-lapis/aegean/vermilion-jade) to a monochrome white→grey scale by request: Caesar I/II/III are white, Pharaoh light grey, Zeus dark grey, Emperor darkest grey — used on nav dots, timeline dots, and each hub's hero accent. Typography is Cormorant Garamond (headings) over Lora (body), adapted dark from the project's bound "Classical" design system.

**Assets (overridden hard constraint).** Per explicit approval, each game hub now includes one gameplay screenshot and the Home timeline includes one box-art cover per game, all user-supplied, each with a small credit line. The "no game assets" rule in this brief was a deliberate call to relax, not an oversight — re-confirm it before a public launch given the Activision IP situation in §3.4 of the masterdoc.

**Search.** Removed from the nav in the final pass. Still needed before ship per this brief's "non-negotiable" line — flag to the build session.

**Carried through unchanged:** the status-indicator vocabulary (active/dormant/dead), the wanted-board framing for Emperor and Caesar I/II, and the archive/historical treatment for Caesar I/II hubs.
