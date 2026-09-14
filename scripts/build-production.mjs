/**
 * Generate src/data/production.json - what each industry building consumes and
 * produces, and how fast.
 *
 * OUTPUT. Edit this script and re-run it:
 *
 *   node scripts/build-production.mjs
 *
 * PHARAOH and ZEUS are here, for the same underlying reason: both open-source
 * reimplementations keep a building's input, output, staff and pacing in
 * their own source, so these are read out rather than invented. The other
 * four games have nothing comparable that can be published:
 *
 *  - CAESAR III's rates live in c3_model.txt, which mods rewrite - the same
 *    reason its buildings table has no cost column and its housing ladder no
 *    requirements.
 *  - EMPEROR's are only in a walkthrough, and are explicitly estimates there
 *    ("about 6-7 per year", "I assume the bump is like 15%"). A reference that
 *    reprints someone's assumption as a figure is worse than one that says
 *    nothing.
 *  - CAESAR and CAESAR II have no engine that carries them.
 *
 * PHARAOH and ZEUS are not the same shape, though, and productionRate /
 * progressMax / rateByDifficulty stay null for every Zeus row rather than
 * force one model onto the other's columns. Akhenaten steps a literal
 * progress bar - add `rate` each tick, finish a load at `full` - and states
 * it per difficulty. eZeus's processing buildings consume a fixed amount of
 * raw material every fixed number of ticks with no per-step increment at
 * all, and eZeus - unlike Akhenaten - is explicitly not byte-exact against
 * the original, so its own tuned constants (`eNumbers::sOlivePressProcessingPeriod`
 * and siblings, in enumbers.cpp) are the reimplementation's approximation of
 * the original's pacing, not a verified reproduction of it. Publishing them
 * under Pharaoh's "rate/full" headers would claim a precision this site
 * cannot stand behind; what inputs a Zeus building takes, what it makes, its
 * footprint and its staff are read the same way and carry the same
 * confidence as Pharaoh's, so those columns are filled in as usual.
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
rows.sort((a, b) => a.game.localeCompare(b.game) || a.name.localeCompare(b.name));

console.log(`${zeusRows.length} Zeus producers added`);

await writeFile(OUT, `${JSON.stringify(rows, null, 2)}\n`, 'utf8');

console.log(`producers written: ${rows.length}`);
for (const row of rows) {
  const inputs = row.inputs.length ? row.inputs.join(' + ') : '—';
  console.log(
    `  ${row.name.padEnd(22)} ${inputs.padEnd(20)} -> ${String(row.output).padEnd(10)}` +
      ` rate ${row.productionRate ?? '—'}/${row.progressMax ?? '—'}`,
  );
}
