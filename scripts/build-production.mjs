/**
 * Generate src/data/production.json - what each industry building consumes and
 * produces, and how fast.
 *
 * OUTPUT. Edit this script and re-run it:
 *
 *   node scripts/build-production.mjs
 *
 * PHARAOH, ZEUS and now CAESAR III are here, for the same underlying reason:
 * an open-source reimplementation keeps a building's input, output and (in
 * some shape) its pacing in its own source, so these are read out rather
 * than invented. The other three games have nothing comparable:
 *
 *  - EMPEROR's are only in a walkthrough, and are explicitly estimates there
 *    ("about 6-7 per year", "I assume the bump is like 15%"). A reference that
 *    reprints someone's assumption as a figure is worse than one that says
 *    nothing.
 *  - CAESAR and CAESAR II have no engine that carries them.
 *
 * The three that are here are not the same shape, and productionRate /
 * progressMax / rateByDifficulty are filled in only as far as each source
 * actually supports, never forced to match Pharaoh's columns just because
 * they exist:
 *
 *  - AKHENATEN (Pharaoh) steps a literal progress bar - add `rate` each
 *    tick, finish a load at `full` - and states both per building, plus a
 *    five-value difficulty curve. All three columns are filled in.
 *  - eZEUS's processing buildings consume a fixed amount of raw material
 *    every fixed number of ticks, with no per-step increment at all - a
 *    different model, not a subset of Akhenaten's - and eZeus is explicitly
 *    not byte-exact against the original besides, so even its own tuned
 *    constants would be the reimplementation's approximation rather than a
 *    verified figure. All three columns stay null for every Zeus row.
 *  - JULIUS (Caesar III) turns out to sit in between. `progress += number of
 *    employed workers each day` (half that for the marble quarry - a real,
 *    single special case, not a rounding choice) until progress reaches a
 *    fixed threshold - literal `#define MAX_PROGRESS_RAW 200` /
 *    `MAX_PROGRESS_WORKSHOP 400` constants in src/building/industry.c, not
 *    something c3_model.txt can move. That threshold is progressMax, filled
 *    in with real confidence. productionRate is a different matter: it is
 *    not a fixed number the way Pharaoh's is, it *is* however many workers
 *    are currently employed at that building, up to the cap c3_model.txt
 *    sets - a genuinely variable quantity this static site has no one true
 *    value for, so it stays null rather than publish a number that would
 *    only be true at full staffing. rateByDifficulty: no evidence in this
 *    part of the source that difficulty touches production speed at all, so
 *    null rather than guessed.
 */
import { readFile, writeFile } from 'node:fs/promises';

const OUT = new URL('../src/data/production.json', import.meta.url);
const RAW = 'https://raw.githubusercontent.com/dalerank/Akhenaten/master/src/scripts/building';
const API = 'https://api.github.com/repos/dalerank/Akhenaten/contents/src/scripts/building';

const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'iga-production' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

/** RESOURCE_CLAY -> Clay. */
function resourceName(constant) {
  return constant
    .replace(/^RESOURCE_/, '')
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/^./, (c) => c.toUpperCase());
}

function titleise(slug) {
  const words = slug.replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

const listing = await fetch(API, { headers });
if (!listing.ok) throw new Error(`Akhenaten building listing: ${listing.status}`);
const files = (await listing.json())
  .filter((f) => f.name.endsWith('.js'))
  .map((f) => f.name);

const rows = [];
for (const file of files) {
  const res = await fetch(`${RAW}/${file}`);
  if (!res.ok) throw new Error(`${file}: ${res.status}`);
  const text = await res.text();

  /* One config file can define more than one building (farm.js defines a
     dozen), so work per `building_<name> = {` / `building_<name> {` block.
     The leading whitespace in this pattern matters: farm.js and workshop.js
     indent their nested definitions, and anchoring hard to column zero
     silently merged each of them into the block above - which is how a fig
     farm ended up holding a grain farm's numbers. */
  const blocks = [...text.matchAll(/^[ \t]*(building_(\w+))\s*=?\s*\{/gm)];
  blocks.forEach((block, index) => {
    const start = block.index;
    const end = index + 1 < blocks.length ? blocks[index + 1].index : text.length;
    const body = text.slice(start, end);

    const output = /output\s*:?\s*\{[^}]*?\bresource\s*:\s*(RESOURCE_\w+)/s.exec(body);
    if (!output) return; // not a producer

    const inputs = [];
    const inputBlock = /input\s*:?\s*\{([^}]*)\}/s.exec(body);
    if (inputBlock) {
      for (const m of inputBlock[1].matchAll(/resource(?:_second)?\s*:\s*(RESOURCE_\w+)/g)) {
        inputs.push(resourceName(m[1]));
      }
    }

    const rate = /production_rate\s*:\s*(\d+)/.exec(body);
    const curve = /production_rate_dcy\s*:\s*\[([^\]]*)\]/.exec(body);
    const progress = /progress_max\s*:\s*(\d+)/.exec(body);
    const laborers = /laborers\s*:?\s*\[?\s*(\d+)/.exec(body);
    const size = /building_size\s*:\s*(\d+)/.exec(body);

    rows.push({
      id: `pharaoh-${block[2]}`,
      game: 'pharaoh',
      name: titleise(block[2]),
      engineType: block[1],
      size: size ? Number(size[1]) : null,
      laborers: laborers ? Number(laborers[1]) : null,
      inputs,
      output: resourceName(output[1]),
      /** Progress added per production step. */
      productionRate: rate ? Number(rate[1]) : null,
      /** Progress needed for one finished load. */
      progressMax: progress ? Number(progress[1]) : null,
      /** Percentage of the rate applied at each of the five difficulties. */
      rateByDifficulty: curve
        ? curve[1].split(',').map((v) => Number(v.trim())).filter(Number.isFinite)
        : null,
    });
  });
}

rows.sort((a, b) => a.name.localeCompare(b.name));

/* Spot checks against values read by hand out of the configs. */
const byId = new Map(rows.map((r) => [r.id, r]));
const bricks = byId.get('pharaoh-bricks_workshop');
if (!bricks) throw new Error('the brickworks is missing');
if (bricks.output !== 'Bricks') throw new Error(`brickworks outputs ${bricks.output}`);
if (bricks.inputs.join() !== 'Clay,Straw') throw new Error(`brickworks takes ${bricks.inputs}`);
if (bricks.productionRate !== 20 || bricks.progressMax !== 400) {
  throw new Error(`brickworks rate ${bricks.productionRate}/${bricks.progressMax}`);
}
if (rows.length < 8) throw new Error(`only ${rows.length} producers found`);
if (rows.some((r) => !r.output)) throw new Error('a row has no output');

// --- ZEUS, from eZeus's own buildings/*.cpp -----------------------------------
//
// Read the same way src/data/buildings.json's Zeus rows were: each row below
// is a literal transcription of a constructor call, verbatim on 14 September
// 2026. Raw-material buildings (a resource-gathering "miner" character
// roaming out from the building, no input) are eResourceCollectBuilding /
// eResourceCollectBuildingBase subclasses whose `eResourceType` argument
// names what they bring back; processing buildings
// (eProcessingBuilding subclasses) additionally name a raw material, a
// product and how much raw material one production cycle consumes.
//
// id | name | engineType | size | laborers | inputs (comma-sep, blank = none) | output
const ZEUS_PRODUCERS = `
wheat-farm|Wheat Farm|eWheatFarm|3|10||Wheat
carrots-farm|Carrots Farm|eCarrotFarm|3|10||Carrots
onions-farm|Onions Farm|eOnionFarm|3|10||Onions
fishery|Fishery|eFishery|2|10||Fish
urchin-quay|Urchin Quay|eUrchinQuay|2|10||Urchin
hunting-lodge|Hunting Lodge|eHuntingLodge|2|8||Meat
dairy|Dairy|eDairy|2|8||Cheese
carding-shed|Carding Shed|eCardingShed|2|8||Fleece
corral|Corral|eCorral|4|25||Meat
timber-mill|Timber Mill|eTimberMill|2|12||Wood
masonry-shop|Masonry Shop|eMasonryShop|2|15||Marble
black-marble-workshop|Black Marble Workshop|eBlackMarbleWorkshop|2|15||Black Marble
mint|Mint|eMint|2|15||Silver
foundry|Foundry|eFoundry|2|15||Bronze
refinery|Refinery|eRefinery|2|16||Orichalc
armory|Armory|eArmory|2|18|Bronze|Armor
olive-press|Olive Press|eOlivePress|2|12|Olives|Olive Oil
sculpture-studio|Sculpture Studio|eSculptureStudio|2|12|Bronze|Sculpture
winery|Winery|eWinery|2|12|Grapes|Wine
`;

const zeusRows = ZEUS_PRODUCERS.trim()
  .split('\n')
  .map((line) => line.split('|'))
  .map(([id, name, engineType, size, laborers, inputs, output]) => ({
    id: `zeus-${id}`,
    game: 'zeus',
    name,
    engineType,
    size: Number(size),
    laborers: laborers === '' ? null : Number(laborers),
    inputs: inputs ? inputs.split(',').filter(Boolean) : [],
    output,
    // eZeus's own pacing model doesn't map onto these three columns - see the
    // file-level comment above.
    productionRate: null,
    progressMax: null,
    rateByDifficulty: null,
  }));

if (zeusRows.length < 15) throw new Error(`only ${zeusRows.length} Zeus producers found`);

const zeusArmory = zeusRows.find((r) => r.id === 'zeus-armory');
if (zeusArmory.inputs.join() !== 'Bronze' || zeusArmory.output !== 'Armor') {
  throw new Error(`zeus armory: takes ${zeusArmory.inputs}, makes ${zeusArmory.output}`);
}

/* Same cross-check src/data/buildings.json's Zeus section uses: its Wheat
   Farm row and this one should agree on size and staff, having been
   transcribed from the same source line independently. */
const buildings = JSON.parse(await readFile('src/data/buildings.json', 'utf8'));
const wheatFarmBuilding = buildings
  .flatMap((b) => b.variants)
  .find((v) => v.game === 'zeus' && v.engineType === 'eBuildingType::wheatFarm');
const wheatFarmProduction = zeusRows.find((r) => r.id === 'zeus-wheat-farm');
if (!wheatFarmBuilding || wheatFarmBuilding.size !== wheatFarmProduction.size) {
  throw new Error('Zeus Wheat Farm size disagrees between buildings.json and production.json');
}
if (wheatFarmBuilding.employees !== wheatFarmProduction.laborers) {
  throw new Error('Zeus Wheat Farm employees disagrees between buildings.json and production.json');
}

rows.push(...zeusRows);

console.log(`${zeusRows.length} Zeus producers added`);

// --- CAESAR III, from Julius's own building.c / industry.c / resource.c ---------
//
// Every raw producer's output and every workshop's input+output is a literal
// switch statement in src/building/building.c (`b->output_resource_id = ...`,
// `b->subtype.workshop_type = ...`) plus game/resource.c's
// `resource_to_workshop_type()`, read verbatim on 14 September 2026. Sizes
// come from src/data/buildings.json's own Caesar III entries (already
// generated from the same repository, by build-buildings.mjs) rather than
// being retyped - cross-checked below, not just assumed to match.
//
// progressMax is one of two literal engine constants
// (MAX_PROGRESS_RAW = 200, MAX_PROGRESS_WORKSHOP = 400, in industry.c) - not
// a c3_model.txt value, and not moddable the way cost and labour caps are.
// The marble quarry is the one exception: it accrues progress at half the
// rate of every other raw producer (`progress += num_workers / 2`, a literal
// special case in the same file), which the production page's caveat states
// rather than silently matching every other row's number.
//
// productionRate has no fixed figure to publish: it equals however many
// workers are currently employed at a building, up to the cap c3_model.txt
// sets, which is why it stays null - see the file-level comment above.
//
// id | name | engineType | inputs (comma-sep, blank = none) | output
const CAESAR3_PRODUCERS = `
wheat-farm|Wheat Farm|BUILDING_WHEAT_FARM||Wheat
vegetable-farm|Vegetable Farm|BUILDING_VEGETABLE_FARM||Vegetables
fruit-farm|Fruit Farm|BUILDING_FRUIT_FARM||Fruit
olive-farm|Olive Farm|BUILDING_OLIVE_FARM||Olives
vines-farm|Vines Farm|BUILDING_VINES_FARM||Vines
pig-farm|Pig Farm|BUILDING_PIG_FARM||Meat
marble-quarry|Marble Quarry|BUILDING_MARBLE_QUARRY||Marble
iron-mine|Iron Mine|BUILDING_IRON_MINE||Iron
timber-yard|Timber Yard|BUILDING_TIMBER_YARD||Timber
clay-pit|Clay Pit|BUILDING_CLAY_PIT||Clay
wine-workshop|Wine Workshop|BUILDING_WINE_WORKSHOP|Vines|Wine
oil-workshop|Oil Workshop|BUILDING_OIL_WORKSHOP|Olives|Oil
weapons-workshop|Weapons Workshop|BUILDING_WEAPONS_WORKSHOP|Iron|Weapons
furniture-workshop|Furniture Workshop|BUILDING_FURNITURE_WORKSHOP|Timber|Furniture
pottery-workshop|Pottery Workshop|BUILDING_POTTERY_WORKSHOP|Clay|Pottery
`;

const MAX_PROGRESS_RAW = 200;
const MAX_PROGRESS_WORKSHOP = 400;

const buildingsByName = new Map(
  buildings.map((b) => [b.name, b.variants.find((v) => v.game === 'caesar3')]),
);

const caesar3Rows = CAESAR3_PRODUCERS.trim()
  .split('\n')
  .map((line) => line.split('|'))
  .map(([id, name, engineType, inputs, output]) => {
    const variant = buildingsByName.get(name);
    if (!variant) throw new Error(`caesar3 ${name}: no matching entry in buildings.json`);
    if (variant.engineType !== engineType) {
      throw new Error(`caesar3 ${name}: engineType ${variant.engineType} in buildings.json, ${engineType} here`);
    }
    return {
      id: `caesar3-${id}`,
      game: 'caesar3',
      name,
      engineType,
      size: variant.size,
      // Not in the engine, same as buildings.json's own Caesar III rows.
      laborers: null,
      inputs: inputs ? inputs.split(',').filter(Boolean) : [],
      output,
      productionRate: null,
      progressMax: inputs ? MAX_PROGRESS_WORKSHOP : MAX_PROGRESS_RAW,
      rateByDifficulty: null,
    };
  });

if (caesar3Rows.length !== 15) throw new Error(`expected 15 Caesar III producers, got ${caesar3Rows.length}`);

const wineWorkshop = caesar3Rows.find((r) => r.id === 'caesar3-wine-workshop');
if (wineWorkshop.inputs.join() !== 'Vines' || wineWorkshop.output !== 'Wine') {
  throw new Error(`caesar3 wine workshop: takes ${wineWorkshop.inputs}, makes ${wineWorkshop.output}`);
}
if (wineWorkshop.progressMax !== 400) throw new Error('caesar3 wine workshop: expected progressMax 400');

const wheatFarmC3 = caesar3Rows.find((r) => r.id === 'caesar3-wheat-farm');
if (wheatFarmC3.progressMax !== 200) throw new Error('caesar3 wheat farm: expected progressMax 200');

rows.push(...caesar3Rows);

console.log(`${caesar3Rows.length} Caesar III producers added`);

// --- CAESAR II, from the manual's own Appendix (no engine table to read) --------
//
// Caesar II's decompilation names businesses only by a raw-material index
// (`placing_type`, checked against `house_gfxdat`-style tables in
// src/action.c) - there is no BUSINESS_* enum with English names anywhere in
// the reconstruction, because those names were never compiled into the
// binary: they live in the .ENG text resource, which this site does not
// reproduce (see /formats/caesar2-text/). The manual's own Appendix ("CITY
// BUSINESS TYPES", p.85) is the primary source instead: sixteen businesses,
// each with the raw material it needs.
//
// Only five are rows here. For those five the finished good is the business
// name read as plain English - a Bakery makes Bread, a Winery makes Wine, a
// Butcher makes Meat, Pottery Works makes Pottery, Glass Works makes Glass -
// not a game-specific claim, just what those words mean. The other eleven
// (Lumber Mill, Jeweler, Lead/Iron/Copper/Marble/Stone Works, Silk/Spice/
// Ivory Dealer, Fish Monger) are exactly as real, and their raw material is
// exactly as certain, but the manual never names their finished good
// separately from the business itself, and "Works"/"Dealer"/"Monger" don't
// resolve that on their own - a dealer might resell the same good unchanged,
// a works might rename it entirely. Guessing would read as sourced when it
// isn't, so those eleven are named in the production page's caveat instead
// of turned into rows with an invented output column.
//
// No size, laborers or rate figures are published for any of the five: nothing
// in the manual or the decompilation states them, only that "the maximum
// output of a business is seven jars" (p.31) - a storage cap, not a rate,
// and not tied to any one business by name.
//
// id | name | input | output
const CAESAR2_PRODUCERS = `
bakery|Bakery|Wheat|Bread
winery|Winery|Grapes|Wine
butcher|Butcher|Cattle|Meat
pottery-works|Pottery Works|Clay|Pottery
glass-works|Glass Works|Sand|Glass
`;

const caesar2Rows = CAESAR2_PRODUCERS.trim()
  .split('\n')
  .map((line) => line.split('|'))
  .map(([id, name, input, output]) => ({
    id: `caesar2-${id}`,
    game: 'caesar2',
    name,
    // No engine symbol exists to cite - see the file-level comment above.
    // Named for what it is: a manual entry, not a decompiled constant.
    engineType: 'manual: CITY BUSINESS TYPES',
    size: null,
    laborers: null,
    inputs: [input],
    output,
    productionRate: null,
    progressMax: null,
    rateByDifficulty: null,
  }));

if (caesar2Rows.length !== 5) throw new Error(`expected 5 Caesar II producers, got ${caesar2Rows.length}`);
const bakery = caesar2Rows.find((r) => r.id === 'caesar2-bakery');
if (bakery.inputs.join() !== 'Wheat' || bakery.output !== 'Bread') {
  throw new Error(`caesar2 bakery: takes ${bakery.inputs}, makes ${bakery.output}`);
}

rows.push(...caesar2Rows);

console.log(`${caesar2Rows.length} Caesar II producers added`);

rows.sort((a, b) => a.game.localeCompare(b.game) || a.name.localeCompare(b.name));

await writeFile(OUT, `${JSON.stringify(rows, null, 2)}\n`, 'utf8');

console.log(`producers written: ${rows.length}`);
for (const row of rows) {
  const inputs = row.inputs.length ? row.inputs.join(' + ') : '—';
  console.log(
    `  ${row.name.padEnd(22)} ${inputs.padEnd(20)} -> ${String(row.output).padEnd(10)}` +
      ` rate ${row.productionRate ?? '—'}/${row.progressMax ?? '—'}`,
  );
}
