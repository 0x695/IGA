# Impressions Games Archive — Master Planning Doc (v3)

*A knowledge hub for the Impressions Games / Sierra **City Building** series — Caesar (1992) through Emperor (2002), plus the modern open-source engine ecosystem.*

**Status:** Design phase complete. See §10 for the resolved IA and visual system, and where the build diverged from §4/§5.
**Next:** Claude Code build, using §10 (not §4/§5) as the source of truth for structure and visuals.

---

## 1. Vision

One modern, well-organized reference site for the whole City Building lineage that:

- Consolidates knowledge scattered across 20+-year-old fan sites, dead forums, wikis, and GitHub repos.
- Documents the games themselves (history, mechanics, buildings, campaigns).
- Documents the **engine reimplementation and modding ecosystem** — file formats, open-source engines, tools. *This is the differentiator; no existing site does this well.*
- Serves as reconnaissance and public-facing home for your longer-term reverse-engineering / IGDK work.

Not a HeavenGames competitor. A modern index that links out generously, preserves what's at risk of vanishing, and adds the technical layer nobody has built.

---

## 2. Full series scope (now including Caesar I)

The series spans **twelve titles including expansions**, first release Caesar (1992), latest Pharaoh: A New Era (2023). Developed across Impressions Games, BreakAway Games, and Tilted Mill; published by Sierra.

### Tier 1 — Core coverage (the classic 2D isometric engine era)

| # | Game | Year | Setting | Engine notes |
|---|---|---|---|---|
| 1 | **Caesar** | 1992 (Amiga Oct 12; DOS/Atari ST/Mac 1993) | Roman Empire | Top-down, not isometric. Designer David Lester, programmer Simon Bradbury. Pre-dates the SG/.555 asset pipeline entirely — **its own format problem**. |
| 2 | **Caesar II** | 1995 | Roman Empire | Same core team (Lester/Bradbury); Chris Beatrice on art. Transitional generation. |
| 3 | **Caesar III** | 1998 | Roman Empire | The archetype. `.sg2` + `.555` assets, `.map` scenarios, `.sav` saves. Official map editor shipped/patched in at v1.1. |
| 4 | **Pharaoh** + *Cleopatra* (2000) | 1999 | Ancient Egypt | Same engine as C3, `.sg3`. Bundled as **Pharaoh Gold** (2001). |
| 5 | **Zeus: Master of Olympus** + *Poseidon* (2001) | 2000 | Ancient Greece | Engine revamp: global labor pool, no labor walkers, no forts, elite housing built directly. Same designer/programmer team as Pharaoh (Beatrice/Gingerich). |
| 6 | **Emperor: Rise of the Middle Kingdom** | 2002 | Ancient China, Xia→Song-Jin (2033 BC–1234 AD) | Built on Zeus engine. BreakAway Games. **Last title on the 2D sprite engine**, and first with multiplayer. |

### Tier 2 — Adjacent / contextual (light pages, clearly marked)

- **Caesar IV** (2006, Tilted Mill) — full 3D, different engine, arguably a different series in feel.
- **Children of the Nile** (2004, Tilted Mill) — spiritual successor, not officially City Building.
- **Pharaoh: A New Era** (2023, Triskell Interactive / Dotemu) — official HD remake of Pharaoh + Cleopatra. Licensed from **Activision**. Not open source. Deserves a page mostly for disambiguation — people searching "Pharaoh remake" land in the wrong places constantly.

**Caesar I is a genuinely valuable addition** to this project, not just completionism: it's the only title in the series that predates the shared SG/.555 asset architecture, so it represents a completely separate reverse-engineering problem. It's also the least documented — nobody has done a serious open-source treatment of it. Its manual is already in the project files.

---

## 3. Research findings

### 3.1 Open-source engine reimplementations

This is the most important layer for the site and for your later work. There's a clear lineage here.

**Caesar III**
- **Julius** — `bvschaik/julius`. The foundational project. Goal is byte-identical game logic and look/feel; saves 100% compatible with original C3, original bugs deliberately preserved. Multi-platform (Windows, Linux, macOS, Android, Vita, Switch). First release Nov 2018. Has a [wiki](https://github.com/bvschaik/julius/wiki) covering configuration and the editor.
- **Augustus** — `Keriew/augustus`. Fork of Julius adding gameplay changes: roadblocks, market special orders, global labour pool, partial warehouse storage, raised game limits, zoom. Saves are one-way (can load C3/Julius saves, not vice versa). Browser-playable build exists. **Has a Discord (hosted by GamerZakh)** — the most active dev community found.

**Pharaoh**
- **Ozymandias** — `Banderi/Ozymandias_Julius` (Julius fork), later ported to **Godot 3.6** as `Banderi/Ozymandias`. First commit late 2020. Dormant since ~Sept 2022.
- **Akhenaten** — `dalerank/Akhenaten`. Fork of Ozymandias, first commit late 2023, **the currently living Pharaoh project**. Modern CMake presets (3.30+), FetchContent deps, builds on Win 10/11, major Linux distros, macOS arm64 + x86_64. Requires Pharaoh patched to 1.3 + Cleopatra; demo explicitly unsupported.
- **OpenPharaoh** — `gaddas/OpenPharaoh`. Older .NET/Mono + XNA attempt targeting Pharaoh/Caesar3/Zeus. Inactive, but contains a **010 Editor binary template for SG3** (`SG3.bt`) and a `ContainerSG3` C# parser — directly useful format artifacts.

**Zeus / Poseidon**
- **eZeus** — `MaurycyLiebner/eZeus`. Qt-based, supports original adventures. Explicitly *not* a byte-exact clone — has intentional divergences and additions (new walker implementation, dual-city play). English/Polish only due to font glyph limits. Requires converting `Zeus_Text.eng` → XML via a bundled `engconverter` tool.
- **Olympus** — `gitTerebi/Olympus`. Built **on** eZeus, newer packaged Windows releases (0.1.0-rc.1), simple `build.bat`.
- **CityBuilderEngine** — `Vinorcola/CityBuilderEngine`. C++14/Qt5, from-scratch engine *inspired by* Zeus rather than a reimplementation. Server/client split (Engine vs. Viewer). Early stage, map engine only.

**Emperor: Rise of the Middle Kingdom**
- **No open-source engine reimplementation exists.** Confirmed across two research passes. Community energy goes into binary patches instead (building-limit remover, resolution patches by Jackfuste, Emperor Resolution Customiser via WSGF).
- Emperor shares the Zeus engine generation and the `.sg3`/`.555` asset format, so an eZeus- or Julius-lineage fork is technically plausible. **This is the flagship "wanted" entry for the site** — and a credible target for your own future work.

**Caesar I & II**
- **No open-source reimplementations, no format documentation found.** Caesar I is playable via DOSBox and is on Internet Archive / My Abandonware; Impressions themselves at one point released it free. Completely virgin territory for reverse engineering.

### 3.2 File formats — current state of documentation

| Format | Games | Documentation status |
|---|---|---|
| `.sg2` + `.555` | Caesar III | **Good** — `bvschaik/citybuilding-tools` wiki |
| `.sg3` + `.555` | Pharaoh, Zeus, Emperor | **Good** — same wiki; plus OpenPharaoh's `SG3.bt` template |
| `.map` (scenarios) | Caesar III+ | Partial — Julius/Augustus source is the real spec |
| `.sav` (saves) | Caesar III+ | Partial — fan hex-editing knowledge on HeavenGames forums, mostly tacit |
| `.eng` (text) | Zeus, Emperor | Partial — eZeus ships a converter, format not formally documented |
| Caesar I/II assets | Caesar, Caesar II | **Undocumented** |

Key detail from the citybuilding-tools wiki: the SG index is 600 bytes = 300 uint16 entries mapping stable "group IDs" to actual image indices, so artists could reorder images without breaking code. Pixel data is 16-bit little-endian 5-5-5 RGB with `0xf81f` as the transparency sentinel. External images live in sibling `.555` files named after the corresponding bitmap entry.

Julius issue #513 has good first-hand notes from someone working through SG2/SG3 internals live — worth summarizing rather than just linking, since GitHub issues are the kind of thing that gets lost.

**Gap worth filling on the site:** there is no single consolidated format reference across all six games. The wiki covers SG/.555 well; everything else is scattered in source code and forum posts. A clean "File Format Reference" section could be the site's single most-linked page.

### 3.3 Community landscape

**HeavenGames** — still the beating heart. Per-game subdomains, all live:
- `caesar3.heavengames.com` (also hosts the shared "City Builders Forums", which cover *all* games — Caesar III, Pharaoh, Zeus, Emperor, Caesar IV, Children of the Nile — plus a Pharaoh: A New Era section)
- `pharaoh.heavengames.com`, `zeus.heavengames.com`, `emperor.heavengames.com`
- Downloads sections (campaigns, maps, completed cities), news archives back to 2002, FAQ pages
- Emperor Heaven notably documents bugs Impressions never fixed before going under

**Other**
- **Augustus Discord** (via GamerZakh) — the main live dev/modding community.
- `impressionsgames.fandom.com` — cross-game Fandom wiki. Uneven, ad-heavy. A cleaner alternative has real value.
- **ModDB** — per-game pages; hosts the official C3 map editor download, Emperor patches, mod listings.
- **PCGamingWiki** — per-game technical/compat pages (patches, resolution fixes, VirtualStore gotchas on modern Windows).
- **WSGF** — widescreen/resolution utilities.
- **GOG forums** — community "useful links" roundup threads per game.
- **caesaralan.co.uk** — repeatedly cited by C3 veterans as the best single-author resource. **Still unverified — check whether it's live.**
- Individual creators worth preserving: Gweilo's Emperor Campaign Compilation, the Century of Palaces Club and population-record challenge communities.
- **Nebuchadnezzar** (2021) — indie spiritual successor, frequently recommended to fans of the series. Worth a "if you loved these, play this" page.

### 3.4 IP and legal

- Impressions was acquired by Sierra On-Line in 1995; Sierra → Vivendi → **Activision Blizzard**, who hold the IP today. Dotemu licensed Pharaoh from Activision for the 2023 remake, and rights acquisition from legacy holders was reportedly a real hurdle.
- Practical implication: the IP is **actively owned and actively licensed**, so play it straight.
  - **Don't** rehost game assets, sprites, music, or manual scans.
  - **Do** write original summaries, link to official storefronts (GOG/Steam), link to community-hosted material rather than mirroring it.
  - Manuals in the project files are for our reference while writing — not for republication.
  - Open-source repos are fine to describe, link, and quote briefly with attribution.
- Existing engine reimplementations all follow the same model: ship code, require the user to supply original game assets. The site should explain this model clearly, since it's the thing newcomers most often misunderstand.

---

## 4. Site architecture (draft)

1. **Home** — what the series is, why this hub exists, entry points to each game.
2. **The Series** — timeline 1992→2023, studio history (Impressions → BreakAway → Tilted Mill), engine generations, who made what.
3. **Per-game hubs** ×6 (Caesar, Caesar II, Caesar III, Pharaoh, Zeus, Emperor):
   - Overview, credits, release history
   - Mechanics deep-dive
   - Buildings/resources reference (structured data — design for a real data model, not hand-written HTML)
   - Campaign/mission list
   - How to play it today (storefront links, patches, compat notes)
   - Which open-source engine, if any, covers it
4. **Engine Reimplementation Hub** ← *the differentiator*
   - Comparison table: project, target game, language/framework, status, save compatibility, platforms, activity, links
   - Per-project pages with build instructions and "how to contribute"
   - **Wanted board** — Emperor engine, Caesar I/II format work
5. **File Format Reference** ← *likely the most-linked page*
   - SG2/SG3/.555 (consolidated and rewritten, not just linked)
   - Map, save, and text formats per game
   - Honest "undocumented" markers where things are unknown
6. **Community Directory** — annotated links: HeavenGames per game, Discord, ModDB, Fandom, PCGamingWiki, GOG threads, single-author sites.
7. **Downloads Index** — link-out only. Campaigns, editors, patches, resolution fixes.
8. **Blog / Devlog** — your own research and reverse-engineering progress. Ties the site to the IGDK work.

---

## 5. Design brief (for the Claude Design session)

**Bring this section into Claude Design as the prompt.**

**Job of the site:** reference and wayfinding, not marketing. People arrive from a search with a specific question and should reach the answer in one or two clicks.

**Two audiences, one site:**
- *Players/nostalgics* — want mechanics, guides, "how do I run this in 2026", campaign help.
- *Modders/devs* — want formats, engine repos, build instructions, contribution paths.
Navigation must make the split obvious immediately without fragmenting the site into two.

**Aesthetic direction to explore:**
- Modern, readable, dense-but-calm reference design. Think documentation site quality, not fan-shrine.
- The series' visual identity is **isometric 2D pixel art** across four distinct civilizations. Consider a neutral base shell with **per-game accent theming** (Roman terracotta/marble, Egyptian ochre/lapis, Greek white/aegean blue, Chinese vermilion/jade) applied as accent colour and section headers only — enough to orient, not enough to fragment.
- Caesar I and II are visually much cruder (top-down VGA); their pages should feel like archive/historical entries rather than trying to match the later games' polish.
- Avoid stock "ancient" clichés — no papyrus textures, no faux-stone. Restraint reads as credible.

**Components that need designing:**
- Comparison table (engine projects) — many columns, must survive mobile.
- Format spec blocks — byte offsets, field tables, code/hex samples.
- Building reference cards/grid — repeats ~100× per game, needs to be data-driven.
- Annotated link cards (community directory) — with status indicators for live/dormant/dead.
- Timeline component (series history).
- Per-game hub landing page template.

**Constraints:** no game assets, so design must work with typography, colour, and layout alone. Assume a static site. Mobile matters — a lot of this traffic is people looking something up mid-game on a phone.

---

## 6. Build brief (for the Claude Code session — after design)

**Do not start this until design is approved.**

**Suggested shape (to confirm):**
- **Static site generator** — Astro is the strong default here: content-heavy, mostly static, islands for the few interactive bits (comparison table filtering, building search). Alternatives worth a quick look: Eleventy (simpler), Docusaurus (if it should feel more like docs).
- **Content in Markdown/MDX** with typed frontmatter, so game/building/project data is a real schema, not prose. Buildings and engine projects should be **content collections or JSON data files**, never hand-written tables.
- **No CMS initially.** Git + Markdown. Revisit only if outside contributors materialize.
- **Hosting:** static host (Cloudflare Pages / Netlify / GitHub Pages). Cheap, fast, no ops.
- **Search:** Pagefind or similar static search — non-negotiable for a reference site.
- **Repo layout** should anticipate the site eventually living alongside or linking tightly to the IGDK work.

**Build order (v1 → v3):**
- **v1:** Home, Series timeline, Engine Reimplementation Hub (complete), File Format Reference (SG2/SG3/.555 section complete), Community Directory. *Ships the differentiator first, and it's the part you can write authoritatively today.*
- **v2:** Caesar III + Pharaoh full game hubs, including buildings data model.
- **v3:** Zeus, Emperor, Caesar I, Caesar II hubs. Devlog.

---

## 7. Roadmap

> **Superseded by `docs/ROADMAP.md`.** Phases 0-4 below are all done — the site is built. Kept as the record of how it got here; the live plan is the new file.

**Phase 0 — Research** ✅ *complete (2 passes)*

**Phase 1 — Remaining verification** *(small, can run in parallel with design)*
- [ ] Check whether `caesaralan.co.uk` is still live and assess depth
- [ ] Find the Augustus Discord invite; check for Akhenaten/eZeus community channels
- [ ] Check Reddit presence (r/citybuilders, game-specific subs)
- [ ] Assess how much HeavenGames content is at genuine risk of link rot (archive priority list)
- [ ] Skim Julius/Augustus source for undocumented `.map`/`.sav` structure worth writing up

**Phase 2 — Content plan**
- [ ] Full site map, finalized from §4
- [ ] Data model for buildings and engine projects (fields, per-game variation)
- [ ] Voice/tone guide
- [ ] Write 2 pilot pages as content tests: the Engine Hub, and one game hub

**Phase 3 — Design** → *Claude Design, brief in §5*

**Phase 4 — Build** → *Claude Code, brief in §6*

---

## 8. Open decisions

**Settled:**
- ✅ **Name** — *Impressions Games Archive* (IGA). Short form "IGA" for the logotype and repo.
- ✅ **Content priority** — modding/technical first. v1 ships the Engine Hub, File Format Reference, and Community Directory; game hubs follow in v2/v3.

**Still open:**
1. **Tier 2 scope** — ~~do Caesar IV, Children of the Nile, and Nebuchadnezzar get real pages, or just a "related games" section?~~ **Settled in design:** related-games section only — a single italic line on Home, no dedicated pages.
2. **Stack** — confirm Astro, or flag a preference.
3. **Domain** — not yet chosen.

**Note on the name:**
- "Archive" sets an expectation of hosted files. Since the IP is actively held by Activision and §3.4 rules out rehosting assets, the site should state its scope plainly on the homepage: an archive of *knowledge and links*, not of game files. This avoids both user disappointment and unwanted attention.

---

## 9. Resource index

**Engine projects**
- Julius (C3): https://github.com/bvschaik/julius · wiki: https://github.com/bvschaik/julius/wiki
- Augustus (C3): https://github.com/Keriew/augustus
- Akhenaten (Pharaoh, active): https://github.com/dalerank/Akhenaten
- Ozymandias (Pharaoh, Godot, dormant): https://github.com/Banderi/Ozymandias
- Ozymandias_Julius (Pharaoh, original fork): https://github.com/Banderi/Ozymandias_Julius
- eZeus (Zeus): https://github.com/MaurycyLiebner/eZeus
- Olympus (Zeus, eZeus-based): https://github.com/gitTerebi/Olympus
- CityBuilderEngine (Zeus-inspired): https://github.com/Vinorcola/CityBuilderEngine
- OpenPharaoh (.NET/XNA, inactive, has SG3 template): https://github.com/gaddas/OpenPharaoh

**Formats & tools**
- SG file format wiki: https://github.com/bvschaik/citybuilding-tools/wiki/SG-file-format
- SG2/SG3 internals discussion: https://github.com/bvschaik/julius/issues/513
- OpenPharaoh SG3 010 template: `trunk/Help/File Templates/SG3.bt`

**Community**
- HeavenGames: caesar3 / pharaoh / zeus / emperor `.heavengames.com`
- City Builders Forums: https://caesar3.heavengames.com/cgi-bin/forums/index.cgi
- Fandom: https://impressionsgames.fandom.com
- PCGamingWiki, ModDB, WSGF — per-game pages
- Augustus Discord (hosted by GamerZakh) — invite link TBC

**Reference / archive**
- Wikipedia: City Building (series), and per-title articles
- Internet Archive: `msdos_Caesar_1992`, `pharaoh_202104`
- MobyGames, My Abandonware, OldGames.sk — for Caesar I/II metadata and screenshots

---

## 10. Design phase output (resolved — supersedes §4/§5 where noted)

**Resolved site architecture, v1:**
1. **Home** — hero, series timeline (1992→2023) with studio bar and per-game cover art, one-line related-games mention.
2. **Six per-game hubs** (Caesar, Caesar II, Caesar III, Pharaoh, Zeus, Emperor) — each self-contained: overview/credits/setting, one gameplay screenshot, its file-format status, its open-source engine projects (or a "wanted" callout when none exist), and its community links. No separate Engine Hub, File Format Reference, or Community Directory pages — that content lives inside each hub, filtered to the game.

This is a deliberate change from §4/§5: centralizing engine/format/community content read as fragmenting attention away from the game the visitor actually came for. Modders comparing engines *across* games lose a side-by-side table — worth watching in v2 whether that's missed enough to bring back as a cross-reference view layered on top of the per-game pages, without removing the per-game framing.

**Visual system:** Dark shell (near-black warm neutral), Cormorant Garamond over Lora. Per-game accent is a white→grey monochrome scale in release order (Caesar/Caesar II/Caesar III white, Pharaoh light grey, Zeus dark grey, Emperor darkest grey) rather than the four civilization palettes originally briefed in §5 — chosen over the multi-hue direction during design. Status indicator (active/dormant/dead, small dot + label) shipped as designed. Caesar I/II hubs keep the "archive entry" framing from §5.

**Assets — constraint relaxed by explicit request.** Each hub carries one gameplay screenshot and Home carries one box-art cover per game, both user-supplied and each credited inline ("Community screenshot/cover — [Game] © Activision"). This overrides §3.4 and the "no game assets" line in §5/§6 — flagged here deliberately so it gets a real legal/rights look before public launch rather than being carried forward silently.

**Search — open again.** Removed from the nav during design for a cleaner header. §5/§6 both call search non-negotiable for a reference site; the build should reintroduce it (Pagefind, per §6) rather than treat the design's omission as final.

**Unresolved, deferred to build or v2:** whether a cross-game engine/format comparison view is worth adding back once all six hubs are live; the search UI/placement; buildings data model (still v2, per §4).

---

*Next step: hand §10 + the design output files to Claude Code for the build.*
