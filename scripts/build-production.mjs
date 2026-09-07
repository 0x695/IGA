/**
 * Generate src/data/production.json - what each industry building consumes and
 * produces, and how fast.
 *
 * OUTPUT. Edit this script and re-run it:
 *
 *   node scripts/build-production.mjs
 *
 * Only PHARAOH is here, and the reason is the point of the page. Akhenaten
 * keeps every building's input, output and production rate in its own config,
 * so these are the numbers the engine steps a workshop's progress bar with.
 *
 * The other five games have nothing comparable that can be published:
 *
 *  - CAESAR III's rates live in c3_model.txt, which mods rewrite - the same
 *    reason its buildings table has no cost column and its housing ladder no
 *    requirements.
 *  - EMPEROR's are only in a walkthrough, and are explicitly estimates there
 *    ("about 6-7 per year", "I assume the bump is like 15%"). A reference that
 *    reprints someone's assumption as a figure is worse than one that says
 *    nothing.
 *  - ZEUS, CAESAR and CAESAR II have no engine that carries them.
 */
import { writeFile } from 'node:fs/promises';

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

await writeFile(OUT, `${JSON.stringify(rows, null, 2)}\n`, 'utf8');

console.log(`producers written: ${rows.length}`);
for (const row of rows) {
  const inputs = row.inputs.length ? row.inputs.join(' + ') : '—';
  console.log(
    `  ${row.name.padEnd(22)} ${inputs.padEnd(20)} -> ${String(row.output).padEnd(10)}` +
      ` rate ${row.productionRate ?? '—'}/${row.progressMax ?? '—'}`,
  );
}
