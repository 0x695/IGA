# Impressions Games Archive — Build Brief

*For a Claude Code session. **Do not start until the design phase is complete** — this brief assumes an approved visual system exists. Bring `igda-masterdoc-v3.md` for research context and the design output for the visual system.*

> **Design phase is complete.** The delivered IA differs from §"Build order" below — see "What changed in design" at the bottom before scaffolding.

---

## What we're building

**Impressions Games Archive (IGA)** — a static reference site for the Impressions Games / Sierra *City Building* series (Caesar 1992, Caesar II, Caesar III, Pharaoh, Zeus, Emperor) and its open-source engine ecosystem.

Content-heavy, mostly static, technically-minded audience. v1 is the modding/technical layer; game hubs follow.

## Stack

**Proposed — confirm before scaffolding:**

- **Astro** — content-heavy and mostly static, with islands for the few interactive bits (comparison table filtering, format reference search). Alternatives if there's reason to reconsider: Eleventy (simpler, less capable), Docusaurus (if it should feel more like formal docs).
- **Content Collections** with typed frontmatter (Zod schemas). Game data, engine projects, and building data are **structured data**, never hand-written HTML tables. This is the single most important architectural decision — buildings alone will be ~100 entries per game across six games.
- **Markdown/MDX** for prose pages.
- **Pagefind** or equivalent static search. Prominent, not buried.
- **No CMS.** Git + Markdown. Revisit only if outside contributors materialize.
- **Hosting:** Cloudflare Pages or Netlify. Static, cheap, no ops.
- **Repo layout** should anticipate the site eventually sitting alongside or linking tightly to the IGDK toolchain work.

## Data models to define first

These drive everything. Get the schemas right before writing any pages.

**`engineProject`** — name, targetGame[], language, framework, status (active/dormant/dead), lastActivity, saveCompatibility, platforms[], repoUrl, docsUrl, notes, lineage (what it forked from).

**`game`** — title, releaseYear, releaseDates{}, setting, developer, publisher, credits{designer, programmer, artist, composer}, engineGeneration, expansions[], assetFormats[], storefrontLinks[].

**`fileFormat`** — name, extension, games[], documentationStatus (documented/partial/undocumented), sources[], spec (structured field tables with offsets/types/descriptions).

**`communityLink`** — title, url, category, games[], status, description.

**`building`** — v2, but define the shape now. Cross-game with per-game variation; needs to handle the fact that the same conceptual building differs across Caesar III / Pharaoh / Zeus / Emperor.

## Build order (as briefed — see note below)

**v1 — ships the differentiator first.** This is the part that can be written authoritatively today and where nothing comparable exists anywhere.
- Home
- Series timeline (1992→2023)
- Engine Reimplementation Hub — complete, all nine known projects
- File Format Reference — SG2/SG3/.555 section complete; honest "undocumented" markers elsewhere
- Community Directory
- Search

**v2**
- Caesar III and Pharaoh full game hubs
- Buildings data model implemented and populated for those two

**v3**
- Zeus, Emperor, Caesar I, Caesar II hubs
- Devlog

## Content constraints (enforce in code and review)

- ~~No game assets committed to the repo.~~ **Relaxed during design, by explicit request:** each game hub ships one gameplay screenshot and one box-art cover, credited inline ("Community screenshot/cover — [Game] © Activision"). Store these as versioned image assets per game; re-confirm this call against the Activision IP situation (§3.4 of the masterdoc) before a public launch — it is not a build-time decision to relitigate silently.
- Link out to storefronts and community-hosted material rather than mirroring it.
- Open-source repos may be described, linked, and briefly quoted with attribution.
- The homepage must state the site's scope plainly: an archive of knowledge and links, not of game files.

## What changed in design

The approved visual system replaced the centralized Engine Hub / File Format Reference / Community Directory pages with **six per-game hub pages** (Caesar, Caesar II, Caesar III, Pharaoh, Zeus, Emperor); each hub filters the same `engineProject` / `fileFormat` / `communityLink` data models down to that game rather than linking out to shared pages. The **`game`** model gains `image` and `imageCredit` (screenshot) plus a cover-art equivalent, both used on the hub and on the Home timeline. The Series timeline was folded into Home rather than shipping as its own route — adjust the router/content-collection layout accordingly. **Search was removed from the nav in the design pass**; it's still called out as non-negotiable in the design brief, so build it back in (Pagefind, per the stack section above) rather than treating its absence as final. Per-game accent color in the design system is a white→grey scale keyed to game order, not the civilization palette originally briefed — use the design output's tokens as source of truth over §5 of the masterdoc.

## Reference content for v1

The master doc §3 contains researched, ready-to-use content for the Engine Hub (nine projects with status, lineage, platforms, and build notes), the format documentation status table, and the community landscape. Pull from it directly rather than re-researching.

Known gaps to leave honestly marked rather than filled with guesses:
- No open-source engine exists for Emperor
- No open-source engine or format documentation exists for Caesar I or Caesar II
- `.map`, `.sav`, and `.eng` formats are only partially documented
