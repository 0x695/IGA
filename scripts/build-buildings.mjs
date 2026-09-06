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
 * PHARAOH comes from a different project and a different shape. Akhenaten
 * keeps its building definitions in JavaScript config blocks under
 * src/scripts/building/, so unlike Julius it carries cost and labourers in the
 * repository itself — which is why the Pharaoh table has columns the
 * Caesar III one cannot. Each cost is five numbers, one per difficulty level.
 *
 * Monuments are excluded from the Pharaoh table on purpose. Pyramids, the
 * sphinx, obelisks and the temple complexes carry an is_monument flag and are
 * built in phases by work camps; building_size reads 2 even for the grand
 * pyramid complex, so it is plainly not a footprint. Rather than publish a
 * number that cannot be stood behind they are left out, and the page says so.
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


// --- Pharaoh, from Akhenaten's src/scripts/building/*.js ---------------------
// name|building_size|cost (5 difficulty levels)|laborers|labor_category
const PHARAOH = `
stonemason_guild|2|30,50,80,100,150|12|INFRASTRUCTURE
bricklayers_guild|2|20,40,80,120,200|10|INFRASTRUCTURE
carpenters_guild|2|10,15,30,50,100|8|INFRASTRUCTURE
military_academy|4|240,300,500,1000,1500|25|MILITARY
military_academy_adv|4|300,500,1000,1500,2000|30|MILITARY
reed_gatherer|2|10,20,40,80,120|8|INDUSTRY_COMMERCE
wood_cutter|2|10,20,40,80,140|8|INDUSTRY_COMMERCE
artisans_guild|2|30,50,80,100,150|15|INFRASTRUCTURE
tax_collector|2|15,20,40,70,100|6|GOVERNMENT
tax_collector_up|2|15,24,40,80,100|8|GOVERNMENT
recruiter|3|30,50,100,200,300|10|MILITARY
festival_square|5|100,250,500,1000,1500||ENTERTAINMENT
roadblock|1|1,2,5,10,20||INFRASTRUCTURE
brick_tower|2|50,100,150,300,500|20|MILITARY
clay_tower|2|50,80,100,150,300|20|MILITARY
mud_tower|2|30,50,100,150,200|6|MILITARY
ferry|2|8,15,30,50,100|5|GOVERNMENT
shipyard|3|70,100,150,200,300|20|INDUSTRY_COMMERCE
plaza|1|3,5,10,15,20||INFRASTRUCTURE
garden|1|3,5,10,15,20||INFRASTRUCTURE
road|1|1,2,5,10,15||INFRASTRUCTURE
irrigation_ditch|1|2,4,7,10,15||INFRASTRUCTURE
sandstone_quarry|2|15,30,50,80,150|12|INDUSTRY_COMMERCE
stone_quarry|2|15,30,50,80,150|12|INDUSTRY_COMMERCE
granite_quarry|2|20,40,80,150,200|12|INDUSTRY_COMMERCE
limestone_quarry|2|15,30,50,80,150|12|INDUSTRY_COMMERCE
clay_gatehouse|1|60,90,150,250,300|9|MILITARY
brick_gatehouse|1|60,90,150,250,300|9|MILITARY
tower_gatehouse|2|200,300,400,500,600|6|MILITARY
mud_gatehouse|1|50,70,100,150,200|3|MILITARY
decorative_gatehouse|5|100,150,200,300,400|3|MILITARY
brick_wall|1|7,12,25,40,70|0|MILITARY
mud_wall|1|7,12,25,40,70||MILITARY
police_station|1|6,12,25,40,60|6|INFRASTRUCTURE
bazaar|2|8,15,30,50,100|5|INDUSTRY_COMMERCE
dock|3|20,40,70,100,150|12|INDUSTRY_COMMERCE
meadow_farm_grain|3|8,10,15,20,50|10|FOOD_PRODUCTION
farm_grain|3|8,10,15,20,50|10|FOOD_PRODUCTION
meadow_farm_chickpeas|3|8,10,15,20,50|10|FOOD_PRODUCTION
farm_chickpeas|3|8,10,15,20,50|10|FOOD_PRODUCTION
meadow_farm_lettuce|3|8,10,15,20,50|10|FOOD_PRODUCTION
farm_lettuce|3|8,10,15,20,50|10|FOOD_PRODUCTION
meadow_farm_pomegranates|3|8,10,15,20,50|10|FOOD_PRODUCTION
farm_pomegranates|3|8,10,15,20,50|12|FOOD_PRODUCTION
meadow_farm_barley|3|8,10,15,20,50|10|FOOD_PRODUCTION
farm_barley|3|8,10,15,20,50|10|FOOD_PRODUCTION
meadow_farm_flax|3|8,10,15,20,50|10|FOOD_PRODUCTION
farm_flax|3|8,10,15,20,50|10|FOOD_PRODUCTION
meadow_farm_henna|3|8,10,15,20,50|10|FOOD_PRODUCTION
farm_henna|3|8,10,15,20,50|10|FOOD_PRODUCTION
meadow_farm_figs|3|8,10,15,20,50|10|FOOD_PRODUCTION
farm_figs|3|8,10,15,20,50|10|FOOD_PRODUCTION
fort_charioteers|3|500,700,900,1300,2000||MILITARY
fort_infantry|3|200,300,500,800,1200||MILITARY
fort_archers|3|200,300,500,800,1200||MILITARY
library|3|90,140,200,300,400|20|EDUCATION
academy|2|200,250,300,400,500|20|EDUCATION
village_palace|4|100,200,300,400,500|20|GOVERNMENT
town_palace|5|200,300,400,500,800|30|GOVERNMENT
city_palace|6|300,400,500,800,1000||GOVERNMENT
temple_osiris|3|30,50,80,150,300|8|RELIGION
temple_ra|3|30,50,80,150,300|8|RELIGION
temple_ptah|3|30,50,80,150,300|8|RELIGION
temple_seth|3|30,50,80,150,300|8|RELIGION
temple_bast|3|30,50,80,150,300|8|RELIGION
shrine_osiris|1|20,30,50,80,120|0|RELIGION
shrine_ra|1|20,30,50,80,120|0|RELIGION
shrine_ptah|1|20,30,50,80,120|0|RELIGION
shrine_seth|1|20,30,50,80,120|0|RELIGION
shrine_bast|1|20,30,50,80,120|0|RELIGION
granary|4|50,70,100,200,300|20|INFRASTRUCTURE
small_statue|1|3,5,8,13,21||INFRASTRUCTURE
medium_statue|2|12,18,24,30,50||INFRASTRUCTURE
large_statue|3|30,45,60,90,150||INFRASTRUCTURE
personal_mansion|3|30,50,100,200,400|0|GOVERNMENT
village_mansion|4|80,100,150,200,400|0|GOVERNMENT
family_mansion|4|80,120,150,200,300|0|GOVERNMENT
dynasty_mansion|4|140,200,300,400,500|0|GOVERNMENT
brewery|2|15,25,50,80,120|12|INDUSTRY_COMMERCE
weaver|2|16,30,50,100,150|12|INDUSTRY_COMMERCE
jewels_workshop|2|18,30,50,100,200|12|INDUSTRY_COMMERCE
lamp_workshop|2|20,30,50,100,150|12|INDUSTRY_COMMERCE
paint_workshop|2|20,30,50,100,150|12|INDUSTRY_COMMERCE
juggler_school|2|10,20,50,100,200|5|ENTERTAINMENT
dancer_school|4|30,50,100,150,200|10|ENTERTAINMENT
pavilion|4|100,200,300,500,800|20|ENTERTAINMENT
bandstand|3|30,50,100,150,200|12|ENTERTAINMENT
senet_house|4|300,400,500,700,1000|25|ENTERTAINMENT
bullfight_school|2|50,80,100,150,200|15|ENTERTAINMENT
booth|2|10,20,40,80,150|8|ENTERTAINMENT
firehouse|1|6,12,25,40,60|6|INFRASTRUCTURE
apothecary|1|6,10,15,30,50|5|WATER_HEALTH
dentist|1|10,15,30,50,80|5|WATER_HEALTH
physician|2|10,15,30,50,100|8|WATER_HEALTH
storage_yard|3|14,30,50,100,150|6|INDUSTRY_COMMERCE
mortuary|2|20,30,50,100,200|8|WATER_HEALTH
architect_post|1|6,12,25,40,60|5|INFRASTRUCTURE
courthouse|3|30,50,100,200,400|10|INFRASTRUCTURE
work_camp|2|12,20,40,80,120|20|INDUSTRY_COMMERCE
food_mill|3|40,60,100,150,250|12|FOOD_PRODUCTION
industry_office|2|25,40,70,120,200|10|GOVERNMENT
well|1|1,2,5,10,20|0|WATER_HEALTH
water_lift|2|6,12,25,50,100|8|INFRASTRUCTURE
water_supply|2|10,20,40,80,140|5|WATER_HEALTH
conservatory|3|20,50,90,150,200|8|ENTERTAINMENT
bricks_workshop|2|12,20,30,40,50|12|INDUSTRY_COMMERCE
chariots_workshop|2|50,100,150,300,500|30|INDUSTRY_COMMERCE
cattle_ranch|3|15,20,30,50,80|12|FOOD_PRODUCTION
clay_pit|2|8,15,30,50,100|8|INDUSTRY_COMMERCE
hunting_lodge|2|5,10,25,40,60|6|FOOD_PRODUCTION
pottery|2|12,20,30,40,50|12|INDUSTRY_COMMERCE
papyrus_maker|2|20,30,50,100,200|12|INDUSTRY_COMMERCE
weaponsmith|2|24,40,80,120,150|12|MILITARY
mine_copper|2|50,75,100,150,300|10|INDUSTRY_COMMERCE
mine_gold|2|50,100,150,250,400|12|INDUSTRY_COMMERCE
mine_gems|2|50,75,100,150,300|8|INDUSTRY_COMMERCE
zoo|6|500,1500,2000,2200,2600|30|ENTERTAINMENT
scribal_school|2|30,50,70,100,150|10|EDUCATION
fishing_wharf|2|40,70,100,150,300|6|FOOD_PRODUCTION
transport_wharf|2|40,70,100,150,300|5|MILITARY
warship_wharf|3|120,150,200,300,400|15|MILITARY
low_bridge|1|8,32,40,48,60|0|INFRASTRUCTURE
ship_bridge|1|8,32,40,48,60||INFRASTRUCTURE
dike|1|3,6,10,15,25|0|INFRASTRUCTURE
`;

const PH_CATEGORY = {
  FOOD_PRODUCTION: 'Farming',
  INDUSTRY_COMMERCE: 'Industry',
  INFRASTRUCTURE: 'Infrastructure',
  GOVERNMENT: 'Government',
  MILITARY: 'Military',
  RELIGION: 'Religion',
  EDUCATION: 'Education',
  ENTERTAINMENT: 'Entertainment',
  WATER_HEALTH: 'Health',
};

const GOD = { osiris: 'Osiris', ra: 'Ra', ptah: 'Ptah', seth: 'Seth', bast: 'Bast' };

function pharaohName(id) {
  const titled = (v) => v.split('_').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
  const special = {
    tax_collector_up: 'Tax Collector (upgraded)',
    military_academy_adv: 'Military Academy (advanced)',
  };
  if (special[id]) return special[id];
  let m;
  if ((m = id.match(/^meadow_farm_(.+)$/))) return titled(m[1]) + ' Farm (meadow)';
  if ((m = id.match(/^farm_(.+)$/))) return titled(m[1]) + ' Farm';
  if ((m = id.match(/^temple_(.+)$/))) return 'Temple of ' + (GOD[m[1]] || titled(m[1]));
  if ((m = id.match(/^shrine_(.+)$/))) return 'Shrine to ' + (GOD[m[1]] || titled(m[1]));
  if ((m = id.match(/^fort_(.+)$/))) return 'Fort — ' + titled(m[1]);
  if ((m = id.match(/^mine_(.+)$/))) return titled(m[1]) + ' Mine';
  return titled(id);
}

const NEWLINE = String.fromCharCode(10);
const pharaohRows = PHARAOH.trim()
  .split(NEWLINE)
  .map((line) => line.split('|'))
  .map(([id, size, cost, lab, cat]) => ({
    id,
    name: pharaohName(id),
    size: Number(size) || null,
    cost: cost ? cost.split(',').map(Number) : null,
    employees: lab === '' ? null : Number(lab),
    category: PH_CATEGORY[cat] || 'Infrastructure',
  }));

if (pharaohRows.length < 100) {
  throw new Error('Only ' + pharaohRows.length + ' Pharaoh rows - the block was truncated');
}
for (const row of pharaohRows) {
  if (!row.size) throw new Error(row.id + ' has no size');
  if (row.cost && row.cost.length !== 5) {
    throw new Error(row.id + ' has ' + row.cost.length + ' costs, expected 5');
  }
}

// Merge into the cross-game model: where a Pharaoh building carries the same
// name as a Caesar III one it becomes a second variant of the same concept,
// rather than a separate entry. That is what the variants array exists for.
const byName = new Map(buildings.map((b) => [b.name, b]));
let merged = 0;

for (const row of pharaohRows) {
  const variant = {
    game: 'pharaoh',
    name: row.name,
    engineType: 'building_' + row.id,
    size: row.size,
    cost: row.cost,
    employees: row.employees,
    requires: [],
    produces: [],
    notes: null,
  };

  const existing = byName.get(row.name);
  if (existing) {
    existing.variants.push(variant);
    merged += 1;
  } else {
    buildings.push({
      id: 'pharaoh-' + row.id.replace(/_/g, '-'),
      name: row.name,
      category: row.category,
      description: null,
      variants: [variant],
    });
  }
}

console.log(pharaohRows.length + ' Pharaoh buildings, ' + merged + ' merged into existing concepts');

buildings.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

await writeFile('src/data/buildings.json', JSON.stringify(buildings, null, 2) + '\n');

const byCategory = buildings.reduce((acc, b) => ({ ...acc, [b.category]: (acc[b.category] ?? 0) + 1 }), {});
console.log(`${buildings.length} entries written, all spot checks passed`);
for (const [name, count] of Object.entries(byCategory).sort()) {
  console.log(`  ${name.padEnd(16)} ${count}`);
}
