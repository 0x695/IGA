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

for (const row of rows) if (!('tier' in row)) row.tier = null;

await writeFile(OUT, `${JSON.stringify(rows, null, 2)}\n`, 'utf8');

const counts = rows.reduce((acc, r) => ({ ...acc, [r.game]: (acc[r.game] ?? 0) + 1 }), {});
console.log('housing rungs written:', rows.length);
for (const [game, n] of Object.entries(counts)) console.log(`  ${game.padEnd(10)} ${n}`);
