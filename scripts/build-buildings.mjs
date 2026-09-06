/**
 * Generate src/data/buildings.json from Julius's own source of truth.
 *
 * Why a script rather than a hand-written data file: the two inputs below are
 * transcribed verbatim from Julius, and the join between them is by numeric
 * index. Doing that by hand across ~90 buildings is exactly the kind of silent
 * off-by-one that would give every building after it the wrong size, with
 * nothing to catch it. Here the join is mechanical, the assertions below fail
 * loudly, and anyone can re-run this and diff the result.
 *
 * Sources, both read verbatim on 7 September 2026:
 *   src/building/type.h        — the building_type enum, with explicit indices
 *   src/building/properties.c  — properties[140], anonymous rows keyed by index
 *   src/building/properties.h  — the struct: { size, fire_proof, image_group,
 *                                image_offset }
 *
 * The second column, fire_proof, is deliberately NOT published. The struct
 * names it fire_proof, and the data is consistent with "does not burn" for
 * plazas, gardens, statues and forts — but the warehouse is flagged 1, which
 * contradicts how the game plays, and no consuming code could be found in
 * building.c, construction.c or map/building_tiles.c. A reader would take
 * "fireproof: yes" as a statement about gameplay, and that statement cannot be
 * stood behind. Size can: it is verified by the spot checks below.
 *
 * Cost and labourers are deliberately absent. They are not in the engine at
 * all — they are read at runtime from c3_model.txt, which ships with the game
 * and which mods edit, so there is no single correct value to publish. The
 * site documents that file instead: /formats/c3-model/.
 *
 *   node scripts/build-buildings.mjs
 */
import { writeFile } from 'node:fs/promises';

// --- verbatim: src/building/type.h, the building_type enum ------------------
const TYPE_H = `
BUILDING_NONE = 0,
BUILDING_MENU_FARMS = 2,
BUILDING_MENU_RAW_MATERIALS = 3,
BUILDING_MENU_WORKSHOPS = 4,
BUILDING_ROAD = 5,
BUILDING_WALL = 6,
BUILDING_DRAGGABLE_RESERVOIR = 7,
BUILDING_AQUEDUCT = 8,
BUILDING_CLEAR_LAND = 9,
BUILDING_HOUSE_VACANT_LOT = 10,
BUILDING_HOUSE_SMALL_TENT = 10,
BUILDING_HOUSE_LARGE_TENT = 11,
BUILDING_HOUSE_SMALL_SHACK = 12,
BUILDING_HOUSE_LARGE_SHACK = 13,
BUILDING_HOUSE_SMALL_HOVEL = 14,
BUILDING_HOUSE_LARGE_HOVEL = 15,
BUILDING_HOUSE_SMALL_CASA = 16,
BUILDING_HOUSE_LARGE_CASA = 17,
BUILDING_HOUSE_SMALL_INSULA = 18,
BUILDING_HOUSE_MEDIUM_INSULA = 19,
BUILDING_HOUSE_LARGE_INSULA = 20,
BUILDING_HOUSE_GRAND_INSULA = 21,
BUILDING_HOUSE_SMALL_VILLA = 22,
BUILDING_HOUSE_MEDIUM_VILLA = 23,
BUILDING_HOUSE_LARGE_VILLA = 24,
BUILDING_HOUSE_GRAND_VILLA = 25,
BUILDING_HOUSE_SMALL_PALACE = 26,
BUILDING_HOUSE_MEDIUM_PALACE = 27,
BUILDING_HOUSE_LARGE_PALACE = 28,
BUILDING_HOUSE_LUXURY_PALACE = 29,
BUILDING_AMPHITHEATER = 30,
BUILDING_THEATER = 31,
BUILDING_HIPPODROME = 32,
BUILDING_COLOSSEUM = 33,
BUILDING_GLADIATOR_SCHOOL = 34,
BUILDING_LION_HOUSE = 35,
BUILDING_ACTOR_COLONY = 36,
BUILDING_CHARIOT_MAKER = 37,
BUILDING_PLAZA = 38,
BUILDING_GARDENS = 39,
BUILDING_FORT_LEGIONARIES = 40,
BUILDING_SMALL_STATUE = 41,
BUILDING_MEDIUM_STATUE = 42,
BUILDING_LARGE_STATUE = 43,
BUILDING_FORT_JAVELIN = 44,
BUILDING_FORT_MOUNTED = 45,
BUILDING_DOCTOR = 46,
BUILDING_HOSPITAL = 47,
BUILDING_BATHHOUSE = 48,
BUILDING_BARBER = 49,
BUILDING_DISTRIBUTION_CENTER_UNUSED = 50,
BUILDING_SCHOOL = 51,
BUILDING_ACADEMY = 52,
BUILDING_LIBRARY = 53,
BUILDING_FORT_GROUND = 54,
BUILDING_PREFECTURE = 55,
BUILDING_TRIUMPHAL_ARCH = 56,
BUILDING_FORT = 57,
BUILDING_GATEHOUSE = 58,
BUILDING_TOWER = 59,
BUILDING_SMALL_TEMPLE_CERES = 60,
BUILDING_SMALL_TEMPLE_NEPTUNE = 61,
BUILDING_SMALL_TEMPLE_MERCURY = 62,
BUILDING_SMALL_TEMPLE_MARS = 63,
BUILDING_SMALL_TEMPLE_VENUS = 64,
BUILDING_LARGE_TEMPLE_CERES = 65,
BUILDING_LARGE_TEMPLE_NEPTUNE = 66,
BUILDING_LARGE_TEMPLE_MERCURY = 67,
BUILDING_LARGE_TEMPLE_MARS = 68,
BUILDING_LARGE_TEMPLE_VENUS = 69,
BUILDING_MARKET = 70,
BUILDING_GRANARY = 71,
BUILDING_WAREHOUSE = 72,
BUILDING_WAREHOUSE_SPACE = 73,
BUILDING_SHIPYARD = 74,
BUILDING_DOCK = 75,
BUILDING_WHARF = 76,
BUILDING_GOVERNORS_HOUSE = 77,
BUILDING_GOVERNORS_VILLA = 78,
BUILDING_GOVERNORS_PALACE = 79,
BUILDING_MISSION_POST = 80,
BUILDING_ENGINEERS_POST = 81,
BUILDING_LOW_BRIDGE = 82,
BUILDING_SHIP_BRIDGE = 83,
BUILDING_SENATE_1_UNUSED = 84,
BUILDING_SENATE = 85,
BUILDING_FORUM = 86,
BUILDING_FORUM_2_UNUSED = 87,
BUILDING_NATIVE_HUT = 88,
BUILDING_NATIVE_MEETING = 89,
BUILDING_RESERVOIR = 90,
BUILDING_FOUNTAIN = 91,
BUILDING_WELL = 92,
BUILDING_NATIVE_CROPS = 93,
BUILDING_MILITARY_ACADEMY = 94,
BUILDING_BARRACKS = 95,
BUILDING_MENU_SMALL_TEMPLES = 96,
BUILDING_MENU_LARGE_TEMPLES = 97,
BUILDING_ORACLE = 98,
BUILDING_BURNING_RUIN = 99,
BUILDING_WHEAT_FARM = 100,
BUILDING_VEGETABLE_FARM = 101,
BUILDING_FRUIT_FARM = 102,
BUILDING_OLIVE_FARM = 103,
BUILDING_VINES_FARM = 104,
BUILDING_PIG_FARM = 105,
BUILDING_MARBLE_QUARRY = 106,
BUILDING_IRON_MINE = 107,
BUILDING_TIMBER_YARD = 108,
BUILDING_CLAY_PIT = 109,
BUILDING_WINE_WORKSHOP = 110,
BUILDING_OIL_WORKSHOP = 111,
BUILDING_WEAPONS_WORKSHOP = 112,
BUILDING_FURNITURE_WORKSHOP = 113,
BUILDING_POTTERY_WORKSHOP = 114,
BUILDING_TYPE_MAX = 115
`;

// --- verbatim: src/building/properties.c, properties[140] -------------------
// Columns: SZ FIRE GRP OFF. Row N is building type N.
const PROPERTIES_C = `
{0,0,0,0},{0,0,0,0},{0,0,0,0},{0,0,0,0},{0,0,0,0},{1,0,112,0},{1,0,24,26},
{1,0,0,0},{1,0,19,2},{0,0,0,0},{1,0,0,0},{1,0,0,0},{1,0,0,0},{1,0,0,0},
{1,0,0,0},{1,0,0,0},{1,0,0,0},{1,0,0,0},{1,0,0,0},{1,0,0,0},{2,0,0,0},
{2,0,0,0},{2,0,0,0},{2,0,0,0},{3,0,0,0},{3,0,0,0},{3,0,0,0},{3,0,0,0},
{4,0,0,0},{4,0,0,0},{3,0,45,0},{2,0,46,0},{5,0,213,0},{5,0,48,0},{3,0,49,0},
{3,0,50,0},{3,0,51,0},{3,0,52,0},{1,1,58,0},{1,1,59,0},{3,1,66,0},{1,1,61,0},
{2,1,61,1},{3,1,61,2},{3,1,66,0},{3,1,66,0},{1,0,68,0},{3,0,70,0},{2,0,185,0},
{1,0,67,0},{3,0,66,0},{2,0,41,0},{3,0,43,0},{2,0,42,0},{4,1,66,1},{1,0,64,0},
{3,1,205,0},{3,1,66,0},{2,1,17,1},{2,1,17,0},{2,0,71,0},{2,0,72,0},{2,0,73,0},
{2,0,74,0},{2,0,75,0},{3,0,71,1},{3,0,72,1},{3,0,73,1},{3,0,74,1},{3,0,75,1},
{2,0,22,0},{3,0,99,0},{1,1,82,0},{1,1,82,0},{2,0,77,0},{3,0,78,0},{2,0,79,0},
{3,0,85,0},{4,0,86,0},{5,0,87,0},{2,1,184,0},{1,1,81,0},{1,1,0,0},{1,1,0,0},
{0,0,0,0},{5,0,62,0},{2,0,63,0},{0,0,0,0},{1,1,183,0},{2,1,183,2},{3,1,25,0},
{1,1,54,0},{1,1,23,0},{1,1,100,0},{3,0,201,0},{3,0,166,0},{0,0,0,0},{0,0,0,0},
{2,0,76,0},{1,1,0,0},{3,0,37,0},{3,0,37,0},{3,0,37,0},{3,0,37,0},{3,0,37,0},
{3,0,37,0},{2,0,38,0},{2,0,39,0},{2,0,65,0},{2,0,40,0},{2,0,44,0},{2,0,122,0},
{2,0,123,0},{2,0,124,0},{2,0,125,0},{0,0,0,0},{1,1,0,0},{1,1,0,0},{1,1,0,0},
{1,1,0,0},{1,1,0,0},{1,1,0,0},{1,1,0,0},{1,1,0,0},{1,1,0,0},{1,1,0,0},
{1,1,0,0},{1,1,0,0},{1,1,0,0},{2,1,216,0},{1,1,0,0},{1,1,0,0},{1,1,0,0},
{1,1,0,0},{0,0,0,0},{0,0,0,0},{0,0,0,0},{0,0,0,0},{0,0,0,0},{0,0,0,0}
`;

// Not buildings: menu placeholders, drag tools, engine bookkeeping, and the
// entries Julius itself marks unused.
const EXCLUDE = new Set([
  'BUILDING_NONE',
  'BUILDING_MENU_FARMS',
  'BUILDING_MENU_RAW_MATERIALS',
  'BUILDING_MENU_WORKSHOPS',
  'BUILDING_MENU_SMALL_TEMPLES',
  'BUILDING_MENU_LARGE_TEMPLES',
  'BUILDING_CLEAR_LAND',
  'BUILDING_DRAGGABLE_RESERVOIR',
  'BUILDING_HOUSE_VACANT_LOT', // shares index 10 with the small tent
  'BUILDING_DISTRIBUTION_CENTER_UNUSED',
  'BUILDING_SENATE_1_UNUSED',
  'BUILDING_FORUM_2_UNUSED',
  'BUILDING_WAREHOUSE_SPACE', // a tile of a warehouse, not a building
  'BUILDING_FORT_GROUND', // the parade ground attached to a fort
  'BUILDING_BURNING_RUIN',
  'BUILDING_TYPE_MAX',
]);

const CATEGORY = [
  [/^BUILDING_HOUSE_/, 'Housing'],
  [/^BUILDING_(SMALL|LARGE)_TEMPLE_|^BUILDING_ORACLE/, 'Religion'],
  [/^BUILDING_(AMPHITHEATER|THEATER|HIPPODROME|COLOSSEUM|GLADIATOR_SCHOOL|LION_HOUSE|ACTOR_COLONY|CHARIOT_MAKER)/, 'Entertainment'],
  [/^BUILDING_(DOCTOR|HOSPITAL|BATHHOUSE|BARBER)/, 'Health'],
  [/^BUILDING_(SCHOOL|ACADEMY|LIBRARY)$/, 'Education'],
  [/^BUILDING_(FORT|GATEHOUSE|TOWER|WALL|MILITARY_ACADEMY|BARRACKS|TRIUMPHAL_ARCH)/, 'Military'],
  [/^BUILDING_(SENATE|FORUM|GOVERNORS_|MISSION_POST)/, 'Government'],
  [/^BUILDING_(WHEAT|VEGETABLE|FRUIT|OLIVE|VINES|PIG)_FARM/, 'Farming'],
  [/^BUILDING_(MARBLE_QUARRY|IRON_MINE|TIMBER_YARD|CLAY_PIT)/, 'Raw materials'],
  [/_WORKSHOP$/, 'Workshops'],
  [/^BUILDING_(MARKET|GRANARY|WAREHOUSE|SHIPYARD|DOCK|WHARF)/, 'Distribution'],
  [/^BUILDING_NATIVE_/, 'Native'],
  [/^BUILDING_(ROAD|AQUEDUCT|RESERVOIR|FOUNTAIN|WELL|PLAZA|GARDENS|ENGINEERS_POST|PREFECTURE|LOW_BRIDGE|SHIP_BRIDGE)$/, 'Infrastructure'],
  [/_STATUE$/, 'Infrastructure'],
];

/** Title-case the enum tail, then fix the handful English disagrees with. */
const RENAME = {
  BUILDING_GOVERNORS_HOUSE: "Governor's House",
  BUILDING_GOVERNORS_VILLA: "Governor's Villa",
  BUILDING_GOVERNORS_PALACE: "Governor's Palace",
  BUILDING_ENGINEERS_POST: "Engineer's Post",
  BUILDING_FORT_LEGIONARIES: 'Fort — Legionaries',
  BUILDING_FORT_JAVELIN: 'Fort — Javelin',
  BUILDING_FORT_MOUNTED: 'Fort — Mounted',
  BUILDING_LOW_BRIDGE: 'Low Bridge',
  BUILDING_SHIP_BRIDGE: 'Ship Bridge',
};

function humanName(symbol) {
  if (RENAME[symbol]) return RENAME[symbol];
  return symbol
    .replace(/^BUILDING_/, '')
    .toLowerCase()
    .split('_')
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

function categoryFor(symbol) {
  for (const [pattern, name] of CATEGORY) if (pattern.test(symbol)) return name;
  throw new Error(`No category rule matches ${symbol}`);
}

// --- parse ------------------------------------------------------------------
const enumEntries = [...TYPE_H.matchAll(/(BUILDING_[A-Z0-9_]+)\s*=\s*(\d+)/g)].map((m) => ({
  symbol: m[1],
  index: Number(m[2]),
}));

const rows = [...PROPERTIES_C.matchAll(/\{(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\}/g)].map((m) => ({
  size: Number(m[1]),
  fireProof: Number(m[2]) === 1,
}));

// --- assertions: fail loudly rather than emitting quietly wrong data --------
if (rows.length !== 140) throw new Error(`Expected 140 property rows, parsed ${rows.length}`);
const max = enumEntries.find((e) => e.symbol === 'BUILDING_TYPE_MAX');
if (!max || max.index !== 115) throw new Error('BUILDING_TYPE_MAX is not 115 — the enum changed');

/*
 * Spot checks against facts known independently of this join. If the index
 * mapping ever slips, these are what catch it: a fort's parade ground is 4x4,
 * the hippodrome and colosseum are 5x5, gatehouses and towers are 2x2, and the
 * governor's three residences step 3, 4, 5.
 */
const EXPECT = {
  BUILDING_ROAD: 1,
  BUILDING_AMPHITHEATER: 3,
  BUILDING_THEATER: 2,
  BUILDING_HIPPODROME: 5,
  BUILDING_COLOSSEUM: 5,
  BUILDING_FORT_GROUND: 4,
  BUILDING_GATEHOUSE: 2,
  BUILDING_TOWER: 2,
  BUILDING_SENATE: 5,
  BUILDING_FORUM: 2,
  BUILDING_GOVERNORS_HOUSE: 3,
  BUILDING_GOVERNORS_VILLA: 4,
  BUILDING_GOVERNORS_PALACE: 5,
  BUILDING_WELL: 1,
};
for (const [symbol, expected] of Object.entries(EXPECT)) {
  const entry = enumEntries.find((e) => e.symbol === symbol);
  const actual = rows[entry.index].size;
  if (actual !== expected) {
    throw new Error(`${symbol} (index ${entry.index}): expected size ${expected}, joined ${actual}`);
  }
}

// --- emit -------------------------------------------------------------------
const seen = new Set();
const buildings = [];

for (const { symbol, index } of enumEntries) {
  if (EXCLUDE.has(symbol) || seen.has(symbol)) continue;
  seen.add(symbol);

  const row = rows[index];
  buildings.push({
    id: symbol.replace(/^BUILDING_/, '').toLowerCase().replace(/_/g, '-'),
    name: humanName(symbol),
    category: categoryFor(symbol),
    description: null,
    variants: [
      {
        game: 'caesar3',
        name: humanName(symbol),
        engineType: symbol,
        size: row.size || null,
        cost: null,
        employees: null,
        requires: [],
        produces: [],
        notes: null,
      },
    ],
  });
}

buildings.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

await writeFile('src/data/buildings.json', JSON.stringify(buildings, null, 2) + '\n');

const byCategory = buildings.reduce((acc, b) => ({ ...acc, [b.category]: (acc[b.category] ?? 0) + 1 }), {});
console.log(`${buildings.length} buildings written, all spot checks passed`);
for (const [name, count] of Object.entries(byCategory).sort()) {
  console.log(`  ${name.padEnd(16)} ${count}`);
}
