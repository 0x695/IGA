# IGA — Roadmap

*Supersedes masterdoc §7 (which ran Phase 0 research → Phase 4 build, all now
done) and the v1/v2/v3 build order in the build brief.*

---

## Where this stands

v1 is built and runs locally: Home with the series timeline, six
self-contained game hubs, Pagefind search, 3.2 MB of static output.

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

## The gap that matters most

Masterdoc §3.2 identified the thing no existing site does: *"there is no
single consolidated format reference across all six games."* The design brief
called that page *"likely the most-linked page"* on the site.

Today the site has **eleven format entries, each a name, a one-line note and a
status dot.** The `spec` field — structured byte offsets and field tables —
exists on every one of them in the schema and is `null` on all eleven.

So IGA currently *indexes* the format situation accurately and *documents*
none of it. It tells you `.sg2` is documented and points at someone else's
wiki. That is a useful index and a fair v1, but it is not the differentiator
the whole project was justified by. **Phase 2 below is the real work of this
site**, and everything before it is clearing the runway.

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

Small, unglamorous, and all of it is the difference between a site that
*works* and one that behaves like a real reference.

- [ ] **Metadata.** The built pages carry a title, a description and nothing
      else: no canonical, no Open Graph or Twitter card, no sitemap, no
      `robots.txt`, no favicon. For a site whose entire traffic model is
      "someone arrives from a search", this is the highest-leverage hour on
      the list.
- [ ] **A 404 page** in the site's own voice, pointing at the six hubs.
- [ ] **Decide the cover credits.** Masterdoc §10 says both the screenshots
      and the box art are credited inline. The hub screenshots are; the Home
      timeline covers are not, because the artboard has no credit line there.
      The string is in the data (`coverCredit`) and rides on the image's
      `title` today. Either render it or accept the artboard — but decide it
      alongside the Phase 0 rights review, since it's the same question.
- [x] **"How to play it today" — decided, and built.** Masterdoc §4 lists it
      as part of the per-game hub and the design pass dropped it; it is back,
      sitting under the engines because it answers the question they raise.
      Every storefront URL was checked against the live store page rather than
      guessed from a slug: Caesar, Caesar II and Emperor are GOG-only, the
      other three are on GOG and Steam, and the note on each hub says why a
      store is missing rather than leaving a gap.
- [ ] **The rest of §4's "how to play" material.** The section ships
      storefronts only. Patches and compat notes — PCGamingWiki per game, the
      WSGF and Jackfuste resolution work for Emperor, the official Caesar III
      map editor on ModDB — are researched in §3.3 and not yet on any page.
      They want a `patches`/`compat` shape in the data rather than prose.
- [ ] **Accessibility and performance pass.** Keyboard path through the nav
      and search, focus visibility on the cards, colour contrast on
      `--color-text-dim` at 12.5px (the smallest text on the site sits on a
      near-black ground and wants measuring, not assuming), and a real look at
      the render-blocking Google Fonts link.

---

## Phase 2 — Make the format reference real

**This is the point of the site.** Everything above is setup.

- [ ] **Build the format spec component.** The design brief listed it as a
      required component — *"byte offsets, field tables, hex and code samples;
      must be genuinely readable, not a wall of monospace"* — and the
      delivered design does not contain one. It is the hardest component in
      the project and the one the site's credibility rests on. Design it
      against the tokens that already exist.
- [ ] **Decide where a full spec lives.** Masterdoc §10 removed the standalone
      File Format Reference page, and that decision should hold. But a
      *per-format detail page* linked from each hub is not the centralized
      reference §10 rejected — the hub keeps the framing and the per-format
      page carries the depth. Alternatively the spec expands in place on the
      hub. Decide before writing, because it changes how the writing is
      chunked.
- [ ] **Write up SG2/SG3 + .555 properly.** The sources are known: the
      citybuilding-tools wiki, Julius issue #513 (first-hand notes on SG2/SG3
      internals — the kind of thing that vanishes, so summarize rather than
      link), and OpenPharaoh's `SG3.bt` 010 Editor template plus its C#
      `ContainerSG3` parser. The facts to anchor it: the 600-byte index of 300
      `uint16` entries mapping stable group IDs to image indices, so artists
      could reorder without breaking code; 16-bit little-endian 5-5-5 RGB
      pixel data with `0xF81F` as the transparency sentinel; external images
      in sibling `.555` files named for the bitmap entry.
- [ ] **Write `.map`, `.sav` and `.eng` as honestly partial.** Julius and
      Augustus source is the real `.map`/`.sav` spec and nobody has written it
      down; eZeus ships a working `.eng` converter against a format never
      formally documented. Read the source, write what is *confirmed*, and
      mark the rest unknown rather than inferring. A reference that guesses is
      worth less than one that says it doesn't know.
- [ ] **Leave Caesar I and II undocumented, loudly.** No engine, no format
      documentation, nothing to write up. The wanted callout is already the
      correct content. Reverse-engineering them is a different project — it is
      the *reason* this site exists, not a task on it.

---

## Phase 3 — The player layer

The audience the briefs put second, addressed once the technical layer is
actually good.

- [ ] **Populate the buildings collection.** The schema is already fixed — one
      cross-game concept with per-game variants, because the same conceptual
      building genuinely differs across Caesar III, Pharaoh, Zeus and Emperor.
      `src/data/buildings.json` is deliberately empty. Start with Caesar III
      and Pharaoh, as the build brief ordered.
- [ ] **Build the buildings card/grid.** The design brief sketched it as a
      pattern repeating ~100× per game. It needs search and filtering within a
      hub, and it is the first component on this site with real interaction.
- [ ] **Mechanics deep-dives and campaign/mission lists**, per masterdoc §4.
      Prose, so MDX rather than data.

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

1. **Cover credits** — render them, or accept the artboard. Phase 1.
2. **Where a full format spec lives** — per-format pages, or expanded in the
   hub. Phase 2.

*Resolved since this was written: "how to play it today" is in, storefronts
first; the images stay as designed; the site ships on GitHub Pages with a
custom domain left as a later setting.*

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
