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

Not features. These gate publishing at all, and none of them is mine to
decide.

- [ ] **Rights review on the game images.** The design brief's hard constraint
      was "no game assets"; it was relaxed by explicit request during design,
      and masterdoc §10, the design brief and the build brief each flag it
      separately as needing a real look before launch. Six screenshots and six
      covers, all © Activision, credited inline. This is the one item that
      can't be deferred by shipping quietly — publishing *is* the thing it
      gates.
- [ ] **Domain.** Still open from masterdoc §8. Blocks canonical URLs and Open
      Graph tags, so it wants deciding before Phase 1's metadata work rather
      than after.
- [ ] **Hosting and deploy.** GitHub Pages was the stated intent. Needs a repo
      and remote (there is none yet), `site` and possibly `base` in
      `astro.config.mjs`, and a build action that runs `astro build` *and*
      `pagefind` — search silently ships empty if the second step is missed.
- [ ] **Two community entries that currently ship unresolved.** The Augustus
      Discord card has no invite URL and renders unlinked; the
      caesaralan.co.uk card says in as many words that we haven't checked
      whether it's live. Both are honest, both are from masterdoc §7's
      leftover verification list, and both are a few minutes of work. Do them
      before strangers read them.

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
- [ ] **Decide whether "how to play it today" belongs on the hub.** Masterdoc
      §4 lists it as part of the per-game hub — storefront links, patches,
      compat notes, the PCGamingWiki/WSGF material from §3.3. The delivered
      design has no such section, so it isn't in the build. It is genuinely
      useful to the *player* audience and genuinely absent; adding it is a
      design change and should be an explicit call, not a drift.
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

1. **The image rights question.** Phase 0. Blocks going public.
2. **Domain**, then hosting. Phase 0.
3. **Cover credits** — render them, or accept the artboard. Phase 1.
4. **"How to play it today"** — add the section the design dropped, or don't.
   Phase 1.
5. **Where a full format spec lives** — per-format pages, or expanded in the
   hub. Phase 2.

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
