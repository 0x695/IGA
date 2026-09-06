# IGA — Roadmap

*Supersedes masterdoc §7 (which ran Phase 0 research → Phase 4 build, all now
done) and the v1/v2/v3 build order in the build brief.*

---

## Where this stands

v1 is **live at https://0x695.github.io/IGA/**: Home with the series
timeline, six self-contained game hubs, Pagefind search, a 404, and the
metadata a page needs to be found, five written file-format specs, and a
filterable reference of all 100 Caesar III buildings. Phases 0, 1 and 2 are
complete; Phase 3 is half done.

**The build brief's version plan is already spent, and not in the way it
expected.** It ordered the work as *v1 = the centralized Engine Hub / Format
Reference / Community Directory, v2 = Caesar III and Pharaoh hubs, v3 = the
other four*. The design pass replaced that IA with six per-game hubs, so all
six shipped at once and the centralized pages were never built. Every game in
the series now has a page.

What is left is therefore **depth, not breadth**. No game is missing. What is
missing is the content that would make someone bookmark one of these pages
rather than read it once.

---

## The gap that matters most — now filled

Masterdoc §3.2 identified the thing no existing site does: *"there is no
single consolidated format reference across all six games."* The design brief
called that page *"likely the most-linked page"* on the site.

For v1 the site had eleven format entries, each a name, a one-line note and a
status dot, with `spec` null on every one — it *indexed* the format situation
and documented none of it.

Phase 2 closed that. There are now four written specs — SG, ENG, and Caesar
III's scenario and savegame formats — each with field tables, each naming its
sources, and each marking where the knowledge stops rather than smoothing over
it. **What remains is not a gap in coverage but a gap in knowledge**, and the
pages say which is which.

---

## Phase 0 — Before this is public

**Done.** All four resolved, 7 September 2026.

- [x] **Game images — keep both, as designed.** Six gameplay screenshots and
      six box-art covers stay, with their inline credits, the footer
      disclaimer, and the homepage line stating the site archives knowledge
      and links rather than game files.

      This was a judgement call taken with the facts on the table, **not a
      legal clearance**: the IP is live and actively licensed (Sierra →
      Vivendi → Activision, a Microsoft subsidiary since October 2023; Dotemu
      had to license Pharaoh from Activision for the 2023 remake). The
      reasoning was that the realistic failure mode for a non-commercial fan
      reference is a DMCA notice to the host rather than litigation, that
      gameplay screenshots illustrating commentary sit on firmer ground than
      box art, and that the design leans on the covers for timeline
      wayfinding. If a notice ever arrives, the remedy is minutes of work:
      the images are data-driven, `coverCredit`/`imageCredit` already exist,
      and both the hub figure and the timeline row degrade to type.

      Three documents flagged this as needing a look before launch. It has
      had one. It does not need re-litigating on every subsequent change —
      but a *change of use* (larger images, more of them, anything that reads
      as a gallery rather than illustration) is a new question.
- [x] **Domain — deferred deliberately, not left open.** The site ships first
      as a GitHub Pages *project* site, so no purchase gates launch. Because
      the build takes its origin and base path from what Pages reports, a
      custom domain later is a Pages setting plus a CNAME, not a code change.
- [x] **Hosting and deploy — built and tested.** `.github/workflows/deploy.yml`
      builds and publishes to Pages, and fails the build if `dist/pagefind` is
      missing, because `astro build` without the pagefind step ships a site
      whose search silently finds nothing. Verified against a real
      `BASE_PATH=/iga` build served from that path.

      This turned up a bug worth remembering: Astro rewrites the URLs it
      generates itself when `base` is set, but **not** paths written by hand
      in markup or held in the data files. Every internal link and image on
      this site was one of those, so a project-page deploy would have 404'd on
      all of them while looking perfectly correct locally. They go through
      `withBase` now. Search needed the opposite treatment — the Pagefind
      runtime must be loaded from the base, but its result URLs must *not* be
      prefixed, since it derives the site root from where it was loaded.
- [x] **The two unresolved community entries.** The Augustus Discord carries
      the invite its own README links. caesaralan.co.uk turned out to be dead
      rather than dormant — the domain no longer resolves and the Wayback
      Machine's last capture is August 2013 — so it is marked dead and links
      to the archived copy rather than being deleted.

**The one step left is not code:** the GitHub repository does not exist yet,
and `gh` is not installed on this machine. Create it, then the remote and the
first push wire it up and Pages takes over.

---

## Phase 1 — Finish the shell

**Done.** 7 September 2026.

- [x] **Metadata.** Canonical URLs, Open Graph and Twitter tags, favicons, a
      hand-rolled sitemap and a robots.txt. The social card is typographic and
      carries no game art — a preview image is a different *use* of that art
      than illustrating the game it documents, which Phase 0 said would be a
      new question rather than a free extension.

      The sitemap is hand-rolled rather than `@astrojs/sitemap` because the
      decision worth making is *which* routes belong in an index:
      auto-discovery would have listed `/search` and `/404`, both real pages
      with no standing content. Both are `noindex` instead, and neither
      declares a canonical — the 404 in particular is served at every unknown
      URL, so claiming one would be a lie.

      **One honest limitation:** robots.txt is inert while the site lives at a
      Pages *project* URL. Crawlers read it only at a domain root, so they
      fetch `0x695.github.io/robots.txt` and never `/IGA/robots.txt`. It goes
      live with a custom domain; until then the `noindex` tags are what
      actually work, and the sitemap can be submitted directly in Search
      Console rather than discovered.
- [x] **A 404 page** in the site's own voice. Most dead inbound links here
      will be old forum and wiki links, which means the reader wanted
      something specific — so it lists the six hubs and points at search
      instead of apologising.
- [x] **Cover credits — decided.** The artboard gives the timeline covers
      none, and a credit under each of six 64px thumbnails would be louder
      than the covers themselves. One line closes the section and credits all
      six, keeping masterdoc §10 without touching the rows.
- [x] **The rest of §4's "how to play" material.** PCGamingWiki for all six
      games, plus the resolution customiser for Zeus and Emperor. Every URL
      was opened and confirmed — PCGamingWiki blocks plain fetches, and the
      guessed URL for a Zeus customiser page turned out to 404, so it links
      the project's repository instead.

      Kept deliberately narrow: this is patches and compatibility, **not** a
      downloads index. §4 listed that separately, the design dropped it, and
      growing one inside this section would be a different page hiding in a
      subsection.
- [x] **Accessibility and performance pass.** The contrast question was
      measured rather than assumed, and the answer was that nothing needed
      changing: the smallest dim text is 6.32:1 on the ground and 5.93:1 on
      cards, and every status colour clears AA on both. What the pass did add
      is a skip link — seven links and a search box stand between the top of
      every page and its content.

---

## Phase 2 — Make the format reference real

**Done.** 7 September 2026. Four written specs at `/formats/<id>/`, linked
from the hubs of every game that uses them.

- [x] **Where a full spec lives — decided: per-format pages hung off each
      hub.** There is deliberately **no `/formats/` index**; that would
      rebuild the centralised File Format Reference the design pass rejected
      (masterdoc §10). The hub stays the only way in, and carries the
      one-liner; the format page carries the depth.

      A format gets a page **if and only if it has a written spec**. A page
      whose whole content is "nobody has documented this" is worse than a hub
      row saying so in one line, so undocumented formats stay as rows and link
      nowhere — the arrow is a promise that the click is worth making.
- [x] **The format spec component.** Blocks, not prose: field tables,
      enumerations, prose, and callouts. The brief asked for byte offsets that
      are "genuinely readable, not a wall of monospace", so mono is used only
      where a value is compared character by character — offsets, sizes, types,
      field names — and every description is set in the body face.
- [x] **SG2/SG3 + .555, written up properly.** Header, index, bitmap record
      and image record field-by-field, the three version codes, the image
      types, all three storage modes, and the 5-5-5 colour format with its
      0xF81F transparency key.
- [x] **`.map`, `.sav` and `.eng`, honestly.** Read off Julius's loader and
      the citybuilding-tools wiki rather than inferred, and each says plainly
      where the knowledge stops.

**The data had to change shape first.** Formats were stored per game, so
`.sg3` existed three times over — which would have produced three identical
pages. They are now canonical entries with a `games` array, which is what the
schema always allowed and what makes a deferred cross-game view possible.

### Four things the research corrected

Worth recording, because two of them contradict the masterdoc and one costs
real hours:

- **`.eng` is documented**, and well. Masterdoc §3.2 has it as "Partial —
  eZeus ships a converter, format not formally documented". There is a
  complete ENG page on the citybuilding-tools wiki covering both the text
  files and the message files.
- **`.eng` is not just Zeus and Emperor.** Caesar III uses it too — its files
  identify themselves as "C3 textfile." — so the format spans the whole
  isometric era, and the Caesar III hub now says so.
- **Caesar III's save compression is not ZIP.** Julius calls the functions
  `zip_compress` and `zip_decompress` and the file is `core/zip.c`, but the
  implementation is `pk_implode`/`pk_explode` — the PKWARE Data Compression
  Library, not DEFLATE. A zlib call on that data fails. The naming has misled
  people and the page says so in a callout.
- **A Caesar III `.map` is exactly 211,692 bytes.** Ten uncompressed chunks in
  a fixed order, and every per-tile chunk is 26,244 bytes or twice it —
  26,244 being 162², with `GRID_SIZE = 162` in Julius. That makes the file
  size a one-line integrity check, which is the sort of thing a reference
  exists to hand you.

### Left undone, deliberately

- **Caesar I and Caesar II stay undocumented, loudly.** No engine, no
  documentation, nothing to write up. The wanted callout is the correct
  content. Reverse-engineering them is the *reason* this site exists, not a
  task on it.
- **The later titles' `.map`/`.sav`.** Julius is Caesar III only. Pharaoh,
  Zeus and Emperor have their own scenario and save formats and nobody has
  written them up; the hub row says that and points at Akhenaten and
  Ozymandias.
- **The 1,720-byte scenario block** inside a Caesar III `.map`, and the record
  layouts inside the savegame chunks. Both are named but not described —
  the largest genuinely open gap in the Caesar III lineage, and the obvious
  next piece of original research this site could contribute.

---

## Phase 3 — The player layer

**Partly done.** 7 September 2026. Buildings shipped for Caesar III; the prose
half did not, for reasons worth writing down.

- [x] **Buildings, populated for Caesar III — 100 of them.** Name, category,
      footprint in tiles, and the engine constant that names each one.
      Generated by `scripts/build-buildings.mjs` rather than hand-written,
      because the two inputs join by numeric index and doing that by hand is a
      silent off-by-one waiting to happen. The script asserts the row count and
      checks fourteen sizes known independently — a fort's parade ground is
      4×4, the hippodrome and colosseum 5×5, the governor's three residences
      step 3, 4, 5 — so a slipped index fails the build instead of publishing
      wrong sizes.
- [x] **The buildings grid.** Filter by name or engine constant, filter by
      category. The site's first component with real interaction, and
      deliberately the least interactive thing that works: every card is in the
      HTML at build time, so the list is complete without JavaScript and
      Pagefind indexes it. The script only hides rows.
- [x] **`c3_model.txt` documented** as a fifth format page, because the
      buildings work kept running into it.

### Two fields are missing, and that is the finding

**Cost and labourers are not in the engine.** They are read at startup from
`c3_model.txt`, which ships with the game and which any mod may rewrite — so
there is no single correct value to publish, and a table of costs frozen on
this site would be right for one copy of the game and quietly wrong for
others. Documenting that file's columns is the durable answer, and it is what
the buildings page points at.

**`fire_proof` was dropped rather than published.** The properties table has a
second column, the struct names it `fire_proof`, and the data agrees for
plazas, gardens, statues and forts. But the warehouse is flagged 1, which
contradicts how the game plays, and no consuming code could be found in
`building.c`, `construction.c` or `map/building_tiles.c`. A reader would take
"fireproof: yes" as a claim about gameplay, and that claim cannot be stood
behind. Size can, so size shipped and the flag did not.

### Not done

- [ ] **Pharaoh's buildings.** Julius is Caesar III only, so the source that
      made the Caesar III table verifiable does not cover Pharaoh. The
      equivalent would be Akhenaten or Ozymandias, and it is a separate
      reading job rather than a re-run of the same script. The data model
      already handles it: a building is one concept with per-game variants.
- [ ] **Mechanics deep-dives and campaign/mission lists.** Prose, and blocked
      on the same problem as always — a source that can be checked. One
      structural fact *is* confirmed and is a good starting point for whoever
      picks this up: `src/game/mission.c` shows the Caesar III campaign as
      twelve ranks, each offering a peaceful and a military scenario — 22 in
      all — with the choice unlocking from rank 2. The mission *names* are not
      in the engine; they live in the game's own text files, which is a
      `.eng` problem and therefore already documented.

---

## Phase 4 — The long game

- [ ] **The devlog.** The masterdoc's stated reason for the site existing:
      a public-facing home for the reverse-engineering work. Worth starting
      the moment Phase 2 turns up anything not already written down — a format
      note that didn't exist before is exactly the content that earns links.
- [ ] **Revisit the cross-game comparison view.** Masterdoc §10 deferred this
      explicitly: modders comparing engines *across* games lost a side-by-side
      table when the IA went per-game. The data model was kept cross-game on
      purpose, so this is a new route over existing collections, not a
      migration. **Only build it if the loss is actually felt** — that was the
      condition, and "it would be easy now" is not the same as "it is missed".
- [ ] **Link-rot triage.** Masterdoc §7 asked how much HeavenGames content is
      at genuine risk. Everything this site links to is 20+ years old and
      hosted by people who may stop paying for it. Deciding what to summarize
      in place — rather than link and hope — is the "preserves what's at risk
      of vanishing" half of the mission, and it is currently unstarted.

---

## Decisions this roadmap is waiting on

Nothing. Every decision this roadmap was blocked on has been made.

*Everything else that was on this list has been decided: "how to play it
today" is in, storefronts first and patches alongside; the images stay as
designed and the timeline covers carry one closing credit line; the site ships
on GitHub Pages with a custom domain left as a later setting.*

---

## Not doing

- **A CMS.** Git and Markdown, per the build brief. Revisit only if outside
  contributors actually materialize.
- **Hosting game files.** Not ever — it is the line the whole scope statement
  is drawn around.
- **Tier-2 game pages.** Caesar IV, Children of the Nile, Pharaoh: A New Era
  and Nebuchadnezzar get the one italic line on Home. Settled in design.
- **Reviving the civilization colour palette.** The monochrome white→grey
  scale replaced it by request during design.
- **Re-centralizing the Engine Hub / Format Reference / Community Directory as
  top-level pages.** Tried and rejected during design for fragmenting
  attention away from the game the visitor came for. Phase 2's per-format
  pages are a different thing, hung off the hubs.
