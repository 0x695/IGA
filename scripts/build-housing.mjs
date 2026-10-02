/**
 * Generate src/data/housing.json - the housing ladder, per game.
 *
 * Like the buildings table, this is OUTPUT. Edit this script and re-run it;
 * hand edits to the JSON will be overwritten and, worse, will not be checked.
 *
 *   node scripts/build-housing.mjs
 *
 * PHARAOH is read out of Akhenaten's src/scripts/houses.js, which carries a
 * `model` block per house level. Every value there is an array of five, one per
 * difficulty, exactly like building cost - so nothing here is rendered as a
 * single number unless all five agree.
 *
 * CAESAR III is names only, and that is deliberate. Its ladder's requirements
 * live in c3_model.txt, which ships with the game and which mods rewrite, so
 * publishing one installation's numbers would be right for one copy and quietly
 * wrong for others - the same reason the buildings table has no cost column.
 *
 * EMPEROR is transcribed from a community walkthrough, because no open-source
 * Emperor engine exists to read. Its requirements are observed rather than read
 * from code, and the page says so.
 *
 * ZEUS is absent: the walkthrough that documents its adventures has only prose
 * on housing, and its data appendix is not in the copy available here. An empty
 * ladder is better than a guessed one.
 *
 * CAESAR II is transcribed from two independent sources that turned out to
 * corroborate each other exactly. The reconstruction's src/data.c defines
 * `house_gfxdat[128]`, 32 {gfx, size, 0, 0} entries (read verbatim on
 * 14 September 2026); the manual's Appendix ("HOUSING:", p.83) separately
 * lists 31 named development levels, One Hut to Small Palace, with no sizes
 * at all. Lined up, they match perfectly: the manual's 31 names map onto
 * code indices 1-31 in order, and the size the code assigns each index (1
 * for 1-25, 2 for 26-29, 3 for 30-31) never disagrees with which named tier
 * it lands on. Code index 0 - the only one the manual doesn't name - is the
 * pre-occupancy plot. Neither source alone would have been enough to
 * publish with confidence: the code has no English names, the manual has no
 * sizes. Together they read as one nearly-certain table.
 */
import { readFile, writeFile } from 'node:fs/promises';

const OUT = new URL('../src/data/housing.json', import.meta.url);
const AKHENATEN =
  'https://raw.githubusercontent.com/dalerank/Akhenaten/master/src/scripts/houses.js';

/** Turn `crude_hut` into `Crude hut`. */
function titleise(slug) {
  const words = slug.replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * Pull one `name[a,b,c,d,e]` row out of a model block.
 * Returns the five values, or null when the field is absent.
 */
function modelRow(block, field) {
  const m = new RegExp(`\\b${field}\\s*\\[([^\\]]*)\\]`).exec(block);
  if (!m) return null;
  const values = m[1]
    .split(',')
    .map((v) => Number(v.trim()))
    .filter((v) => Number.isFinite(v));
  return values.length ? values : null;
}

/** Five identical values are one value; anything else stays a range. */
function flatten(values) {
  if (!values) return null;
  return values.every((v) => v === values[0]) ? values[0] : values;
}

const source = await fetch(AKHENATEN);
if (!source.ok) throw new Error(`Akhenaten houses.js: ${source.status}`);
const js = await source.text();

/* Each block is `building_house_<name> { ... }`; take the text from one header
   to the next rather than trying to balance braces. */
const headers = [...js.matchAll(/^(building_house_(\w+))\s*\{/gm)];
if (headers.length !== 20) {
  throw new Error(`expected 20 Pharaoh house levels, found ${headers.length}`);
}

const rows = [];
headers.forEach((header, index) => {
  const start = header.index;
  const end = index + 1 < headers.length ? headers[index + 1].index : js.length;
  const block = js.slice(start, end);
  const model = /model\s*\{([\s\S]*?)\n\s*\}/.exec(block);
  if (!model) throw new Error(`no model block for ${header[1]}`);
  const body = model[1];

  rows.push({
    id: `pharaoh-${String(index).padStart(2, '0')}`,
    game: 'pharaoh',
    level: index,
    name: titleise(header[2]),
    engineType: header[1],
    /** Tiles. Pharaoh's houses merge, so this is the unmerged footprint. */
    size: Number(/building_size\s*:\s*(\d+)/.exec(block)?.[1] ?? 1),
    maxPeople: flatten(modelRow(body, 'max_people')),
    prosperity: flatten(modelRow(body, 'prosperity')),
    evolveDesirability: flatten(modelRow(body, 'evolve_desirability')),
    devolveDesirability: flatten(modelRow(body, 'devolve_desirability')),
    needs: {
      water: flatten(modelRow(body, 'water')),
      religion: flatten(modelRow(body, 'religion')),
      education: flatten(modelRow(body, 'education')),
      entertainment: flatten(modelRow(body, 'entertainment')),
      health: flatten(modelRow(body, 'health')),
      foodTypes: flatten(modelRow(body, 'food_types')),
      pottery: flatten(modelRow(body, 'pottery')),
      linen: flatten(modelRow(body, 'linen')),
      jewelry: flatten(modelRow(body, 'jewelry')),
      beer: flatten(modelRow(body, 'beer')),
    },
    requirements: null,
    note: null,
  });
});

/* Spot checks. The ladder is read by position, which is exactly the operation
   that fails silently, so the two ends and the shape are asserted. */
const first = rows[0];
const last = rows[rows.length - 1];
if (first.name !== 'Crude hut') throw new Error(`first rung is ${first.name}`);
if (last.name !== 'Palatial estate') throw new Error(`last rung is ${last.name}`);
if (first.needs.water !== 0) throw new Error('a crude hut should need no water');
if (!last.needs.jewelry) throw new Error('a palatial estate should want jewelry');
if (rows.some((r) => r.maxPeople === null)) throw new Error('a rung has no capacity');

/* CAESAR III: the twenty rungs, in the order Julius's enum gives them - which
   is the ladder order, and is not the alphabetical order the buildings table
   happens to store. Sizes are joined from that table, which was read from the
   same engine. The requirements behind each rung are NOT here: they live in
   c3_model.txt, which ships with the game and which mods rewrite. */
const typeHeader = await fetch(
  'https://raw.githubusercontent.com/bvschaik/julius/master/src/building/type.h',
);
if (!typeHeader.ok) throw new Error(`Julius type.h: ${typeHeader.status}`);
const header = await typeHeader.text();

const caesar3 = [...header.matchAll(/BUILDING_HOUSE_(\w+)\s*=\s*(\d+)/g)]
  // The vacant lot shares its value with the small tent; it is the empty plot,
  // not a rung, and listing both would make the ladder twenty-one long.
  .filter(([, name]) => name !== 'VACANT_LOT')
  .map(([, name, value]) => ({ name, value: Number(value) }))
  .sort((a, b) => a.value - b.value);

if (caesar3.length !== 20) {
  throw new Error(`expected 20 Caesar III house levels, found ${caesar3.length}`);
}
if (caesar3[0].name !== 'SMALL_TENT' || caesar3[19].name !== 'LUXURY_PALACE') {
  throw new Error(`Caesar III ladder runs ${caesar3[0].name}..${caesar3[19].name}`);
}

const buildings = JSON.parse(
  await readFile(new URL('../src/data/buildings.json', import.meta.url), 'utf8'),
);
const sizeByType = new Map();
for (const building of buildings) {
  for (const variant of building.variants) {
    if (variant.game === 'caesar3') sizeByType.set(variant.engineType, variant.size);
  }
}

caesar3.forEach((house, index) => {
  const engineType = `BUILDING_HOUSE_${house.name}`;
  rows.push({
    id: `caesar3-${String(index).padStart(2, '0')}`,
    game: 'caesar3',
    level: index,
    name: titleise(house.name.toLowerCase()),
    engineType,
    size: sizeByType.get(engineType) ?? null,
    maxPeople: null,
    prosperity: null,
    evolveDesirability: null,
    devolveDesirability: null,
    needs: null,
    requirements: null,
    note: null,
  });
});

/* EMPEROR: two separate ladders, common and elite, and a citizen never moves
   between them - so they are numbered separately rather than run together. */
const EMPEROR_COMMON = [
  ['Shelter', 7, 'Safety inspections, and nothing else.', null],
  ['Hut', 14, 'Water.', null],
  ['Plain cottage', 22, 'Bland food, ancestral religion, some appeal.', 5],
  ['Attractive cottage', 31, 'Plain food and hemp.', 7],
  ['Spacious dwelling', 41, 'Music and a herbalist.', 10],
  ['Elegant dwelling', 52, 'Ceramics and appetizing food.', 13],
  ['Ornate apartment', 63, 'Acrobats and acupuncture.', 15],
  ['Luxurious apartment', 74, 'A second religion (not Confucian), and tea.', 18],
];
const EMPEROR_ELITE = [
  ['Modest siheyuan', 5, 'Hemp, ceramics and food. Only in attractive areas.', 1],
  ['Lavish siheyuan', 10, 'Ancestral religion, herbalists, music, acrobats, silk, appetizing food.', 2],
  ['Humble compound', 15, 'Tasty food, acupuncture, and bronzeware or lacquerware.', 3],
  ['Impressive compound', 20, 'Confucian Academy access, and a second religion.', 4],
  ['Heavenly compound', 25, 'Tea and drama.', 5],
];

function emperorRows(list, tier, offset) {
  return list.map(([name, people, requirements, food], index) => ({
    id: `emperor-${tier}-${String(index).padStart(2, '0')}`,
    game: 'emperor',
    tier,
    level: offset + index,
    name,
    engineType: null,
    size: null,
    maxPeople: people,
    prosperity: null,
    evolveDesirability: null,
    devolveDesirability: null,
    needs: null,
    requirements,
    /* Every level also needs everything the level below it needed. */
    note: food === null ? null : `Consumes ${food} food per month.`,
  }));
}
rows.push(...emperorRows(EMPEROR_COMMON, 'common', 0));
rows.push(...emperorRows(EMPEROR_ELITE, 'elite', 0));

/*
 * ZEUS: names from Zeus Heaven, thresholds from eZeus.
 *
 * Neither source is sufficient alone and together they check each other. The
 * fansite names the rungs and gives each one's population but describes the
 * requirements qualitatively ("oil + appeal"); eZeus carries the exact
 * conditions in eSmallHouse::updateLevel and eEliteHousing::updateLevel but
 * takes its NAMES from the game's own language file, which is not in the
 * repository. The capacity arrays are the join: if they ever stop matching the
 * fansite's populations, the pairing below is wrong and the build fails.
 *
 * "Venues" are the four culture walkers the engine counts - philosophers,
 * actors, athletes and competitors - which is what the fansite means by
 * "culture/science".
 */
const ZEUS_COMMON = [
  ['Hut', 'Nothing. An empty plot with people on it.'],
  ['Shack', 'Food.'],
  ['Hovel', 'Water, and one kind of venue.'],
  ['Homestead', 'Fleece, and appeal above 2.'],
  ['Tenement', 'A second kind of venue.'],
  ['Apartment', 'Olive oil, and appeal above 5.'],
  ['Townhouse', 'A third kind of venue, and appeal above 8.'],
];
const ZEUS_ELITE = [
  ['Residence', 'Food, fleece, oil, three kinds of venue, and appeal above 5.'],
  ['Mansion', 'Armour, and appeal above 7.'],
  ['Manor', 'Wine, and appeal above 9.'],
  ['Estate', 'Horses, a fourth kind of venue, and appeal above 10.'],
];

async function eZeusCapacities(file) {
  const res = await fetch(
    `https://raw.githubusercontent.com/MaurycyLiebner/eZeus/main/buildings/${file}`,
  );
  if (!res.ok) throw new Error(`eZeus ${file}: ${res.status}`);
  const text = await res.text();
  const m = /eHouseBase\([\s\S]*?\{([\d,\s]+)\}/.exec(text);
  if (!m) throw new Error(`no capacity array in ${file}`);
  return m[1].split(',').map((v) => Number(v.trim()));
}

const zeusCommonCap = await eZeusCapacities('esmallhouse.cpp');
const zeusEliteCap = await eZeusCapacities('eelitehousing.cpp');

if (zeusCommonCap.join() !== '8,16,24,32,40,48,60') {
  throw new Error(`eZeus common capacities changed: ${zeusCommonCap.join()}`);
}
/* The first entry is the unevolved plot, not a rung - the same shape as
   Caesar III's vacant lot sharing a value with the small tent. The four rungs
   the fansite names are the remaining four. */
if (zeusEliteCap.join() !== '6,6,10,16,20') {
  throw new Error(`eZeus elite capacities changed: ${zeusEliteCap.join()}`);
}
const zeusEliteRungs = zeusEliteCap.slice(1);

ZEUS_COMMON.forEach(([name, requirements], index) => {
  rows.push({
    id: `zeus-common-${String(index).padStart(2, '0')}`,
    game: 'zeus',
    tier: 'common',
    level: index,
    name,
    engineType: null,
    size: 2,
    maxPeople: zeusCommonCap[index],
    prosperity: null,
    evolveDesirability: null,
    devolveDesirability: null,
    needs: null,
    requirements,
    note: null,
  });
});

ZEUS_ELITE.forEach(([name, requirements], index) => {
  rows.push({
    id: `zeus-elite-${String(index).padStart(2, '0')}`,
    game: 'zeus',
    tier: 'elite',
    level: index,
    name,
    engineType: null,
    size: 4,
    maxPeople: zeusEliteRungs[index],
    prosperity: null,
    evolveDesirability: null,
    devolveDesirability: null,
    needs: null,
    requirements,
    note: null,
  });
});

/* CAESAR II: 31 named levels (manual) mapped onto code indices 1-31
   (src/data.c's house_gfxdat), plus the unnamed pre-occupancy plot at index 0.
   Sizes are the code's; names and order are the manual's - see the file-level
   comment above for how the two were cross-checked against each other. */
const CAESAR2_NAMES = [
  'Vacant Lot',
  'One Hut', 'Two Huts', 'Three Huts', 'Communal Huts', 'Large Communal Hut',
  'Primitive House', 'Simple House', 'Small House', 'Average House', 'Improved House',
  'Large House', 'Grand House',
  'Primitive Insula', 'Simple Insula', 'Small Insula', 'Average Insula', 'Improved Insula',
  'Large Insula', 'Grand Insula', 'Imperial Insula',
  'Simple Domus', 'Small Domus', 'Average Domus', 'Improved Domus', 'Large Domus', 'Grand Domus',
  'Simple Villa', 'Small Villa', 'Improved Villa', 'Grand Villa',
  'Small Palace',
];
if (CAESAR2_NAMES.length !== 32) throw new Error(`expected 32 Caesar II levels, got ${CAESAR2_NAMES.length}`);

/* house_gfxdat[128] = 32 * {gfx, size, 0, 0}, read verbatim from
   https://github.com/second-impressions/caesar2-reconstruction/blob/main/src/data.c */
const CAESAR2_SIZES = [
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  2, 2, 2, 2,
  3, 3,
];
if (CAESAR2_SIZES.length !== 32) throw new Error(`expected 32 Caesar II sizes, got ${CAESAR2_SIZES.length}`);

CAESAR2_NAMES.forEach((name, index) => {
  rows.push({
    id: `caesar2-${String(index).padStart(2, '0')}`,
    game: 'caesar2',
    tier: null,
    level: index,
    name,
    engineType: `house_gfxdat[${index}]`,
    size: CAESAR2_SIZES[index],
    maxPeople: null,
    prosperity: null,
    evolveDesirability: null,
    devolveDesirability: null,
    needs: null,
    requirements: null,
    note:
      index === 0
        ? "Not named in the manual's appendix - the pre-occupancy plot, distinct from the 31 named development levels above it."
        : null,
  });
});

/* Spot checks: the cross-referencing claim above is exactly the kind of thing
   that goes stale silently if either literal array is ever edited alone. */
const c2First = rows.find((r) => r.id === 'caesar2-01');
const c2Last = rows.find((r) => r.id === 'caesar2-31');
if (c2First.name !== 'One Hut' || c2First.size !== 1) throw new Error('caesar2 level 1 should be One Hut, size 1');
if (c2Last.name !== 'Small Palace' || c2Last.size !== 3) throw new Error('caesar2 level 31 should be Small Palace, size 3');
const c2SizeBreak = rows.find((r) => r.game === 'caesar2' && r.level === 26);
if (c2SizeBreak.name !== 'Grand Domus' || c2SizeBreak.size !== 2) {
  throw new Error('caesar2 level 26 (the 1->2 size break) should be Grand Domus, size 2');
}

/* --- CAESAR (1992), from the original executable, as Gaius transcribed it ----
 *
 * Caesar has no engine to read. This is the disassembled US-build CSR.EXE as the
 * Gaius project (github.com/0x695/Gaius) has transcribed it, read on 2 October
 * 2026, and the manual agrees on every point it states: "sixteen grades of
 * housing"; the needs, "in order of importance: water supply, road access to a
 * forum, nearby baths, nearby markets, nearby schools or hospitals, and sources
 * of entertainment"; and "the fanciest houses actually have a slight drop in
 * density". Sources inside the executable:
 *
 *  - the development handlers at DS:1212, one per tile id 0xC8-0xD7 (findings
 *    section 16.5), which say for each grade what it climbs on and falls on;
 *  - the population table at 3496:007E and the tax table at 3496:008E, sixteen
 *    bytes each, read straight out of the decompressed executable.
 *
 * Tiles 0xC8-0xD7 are the grades, in tile order. They are not quite a ladder:
 * a grade-4 house (0xCB) climbs to a pair (0xCC) where the cell to its right is
 * free, and to a one-tile house (0xCF, 0xD0) where it is not, and both routes
 * meet again at 0xD1. The rungs here follow tile order, and the notes say where
 * a rung branches.
 *
 * The manual names no grade, and neither does the executable's text, so they
 * are numbered. The land-value figures are the layer the Maps panel calls "land
 * value" (A2C4 in the save; the Gaius code calls that layer `coverage`, for
 * how it is built). A house climbs when land value at its anchor is above the
 * first figure and falls when it is below the second. The city-size figure is in
 * population units, four people each, and is the whole city's, not the house's.
 *
 * Needs are bits the monthly service pass sets on a house's cell:
 *   water W (0x01), road access to a forum N (0x02, a strong inference), baths B
 *   (0x04), market M (0x08), a school or hospital S (0x40), entertainment E (0x80).
 * A house that lacks a bit it needs falls a grade whatever its land value.
 */
const C1_POP = [1, 1, 2, 3, 3, 5, 6, 5, 6, 4, 4, 3, 3, 2, 2, 1]; // 3496:007E
const C1_TAX = [1, 2, 4, 6, 7, 10, 14, 9, 13, 15, 16, 17, 18, 20, 22, 25]; // 3496:008E
// tile | w | h | climbs above | falls below | keeps | to climb | note
const CAESAR1_HOUSING = `
C8|1|1|0|0|-|nothing beyond land value|Falls to bare ground below 0. Collapses to rubble, and a rioter appears, if unrest at its cell passes 20.
C9|1|1|1|1|-|water|Collapses if unrest passes 30.
CA|1|1|2|2|W|nothing beyond land value|Collapses if unrest passes 40.
CB|1|1|4|3|W|forum road, a city of 100 people|Collapses if unrest passes 48. Climbs to a pair (0xCC) if the cell to its right is free or a small house, otherwise to the one-tile 0xCF.
CC|2|1|5|5|W N|a city of 200 people|A pair: two tiles, the right one swallowed from the neighbour.
CD|2|1|6|6|W N|a market in reach, a city of 300 people|
CE|2|1|7|7|W N M|baths in reach, a city of 400 people|Climbs to the pair 0xD1.
CF|1|1|6|5|W N|a market in reach, a city of 300 people|The one-tile branch, where a pair could not form. Falls back to 0xCB.
D0|1|1|7|7|W N M|baths in reach, a city of 400 people, and a free or small neighbour to its right|Becomes the pair 0xD1.
D1|2|1|10|8|W N M B|a city of 500 people|Both branches meet here.
D2|2|1|13|11|W N M B|a school or hospital, a city of 600 people|
D3|2|1|16|14|W N M B S|a city of 700 people|
D4|2|1|18|17|W N M B S|entertainment, a city of 800 people, and room for a 2×2|
D5|2|2|20|19|W N M B S E|a city of 900 people|Falls back to two 0xD4 pairs.
D6|2|2|22|21|W N M B S E|a city of 1000 people and room for a 3×3|
D7|3|3||23|W N M B S E|nothing: the top grade|Falls back to a 2×2, a pair and three one-tile houses.
`;

const c1Rows = CAESAR1_HOUSING.trim()
  .split('\n')
  .map((line) => line.split('|'));
if (c1Rows.length !== 16) throw new Error(`expected 16 Caesar housing grades, got ${c1Rows.length}`);

const NEEDS_WORDS = { W: 'water', N: 'a forum road', M: 'a market', B: 'baths', S: 'a school or hospital', E: 'entertainment' };
c1Rows.forEach(([tile, w, h, up, down, keeps, climb, note], index) => {
  if (parseInt(tile, 16) !== 0xc8 + index) throw new Error(`caesar1 grade ${index} should be tile ${(0xc8 + index).toString(16)}, got ${tile}`);
  const cells = Number(w) * Number(h);
  const needs = keeps === '-' ? [] : keeps.split(' ').map((k) => NEEDS_WORDS[k]);
  const requirements =
    (needs.length ? `Keeps: ${needs.join(', ')}. ` : 'Keeps: nothing. ') + `To climb: ${climb}.`;
  rows.push({
    id: `caesar1-${String(index).padStart(2, '0')}`,
    game: 'caesar1',
    tier: null,
    level: index + 1,
    name: `Grade ${index + 1}`,
    engineType: `tile 0x${tile}`,
    size: w === h ? Number(w) : [Number(w), Number(h)],
    // people = four per population unit, per tile, over the grade's footprint
    maxPeople: 4 * C1_POP[index] * cells,
    prosperity: null,
    evolveDesirability: up === '' ? null : Number(up),
    devolveDesirability: Number(down),
    needs: null,
    requirements,
    note: `Tax units a tile: ${C1_TAX[index]}.${note ? " " + note : ""}`,
  });
});

/* Spot checks. The population table peaks at the fifth-largest house and falls
   at the top, as the manual says; the total for a full 3x3 is nine tiles of
   one unit each. The sizes are the exact rectangles Gaius found for each grade
   in real saves. */
const c1Grades = rows.filter((r) => r.game === 'caesar1');
if (c1Grades[0].maxPeople !== 4 || c1Grades[15].maxPeople !== 36) throw new Error('caesar1 first and last grades should hold 4 and 36');
if (JSON.stringify(c1Grades[15].size) !== '3') throw new Error('caesar1 top grade is 3x3');
if (c1Grades.filter((r) => Array.isArray(r.size)).length !== 7) throw new Error('caesar1 has seven pair grades');
if (C1_POP.length !== 16 || C1_TAX.length !== 16) throw new Error('caesar1 population and tax tables are sixteen bytes each');

for (const row of rows) if (!('tier' in row)) row.tier = null;

await writeFile(OUT, `${JSON.stringify(rows, null, 2)}\n`, 'utf8');

const counts = rows.reduce((acc, r) => ({ ...acc, [r.game]: (acc[r.game] ?? 0) + 1 }), {});
console.log('housing rungs written:', rows.length);
for (const [game, n] of Object.entries(counts)) console.log(`  ${game.padEnd(10)} ${n}`);
