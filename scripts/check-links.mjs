/**
 * Check every outbound link the site publishes, and say which are at risk.
 *
 *   node scripts/check-links.mjs            # check and report
 *   node scripts/check-links.mjs --write    # also record results in the data
 *
 * Masterdoc §7 asked how much of what this archive links to is at genuine risk
 * of vanishing. Everything here is twenty-odd years old and hosted by people
 * who may stop paying for it, so "link and hope" is not a preservation
 * strategy - but neither is guessing. This reads the actual status codes.
 *
 * It reports rather than deletes. A 403 usually means a bot check, not a dead
 * page, and quietly dropping a good link because a CDN dislikes scripts would
 * lose more than it saves. Anything it flags is for a person to look at.
 */
import { readFile, writeFile } from 'node:fs/promises';

const DATA = new URL('../src/data/', import.meta.url);
const WRITE = process.argv.includes('--write');

/** Files to read, and where URLs hide inside each. */
const SOURCES = [
  'games.json',
  'engine-projects.json',
  'file-formats.json',
  'community-links.json',
  'campaigns.json',
  'mechanics.json',
  'housing.json',
  'production.json',
  'devlog.json',
];

/** Pull every http(s) string out of arbitrary JSON, with a path for context. */
function collect(node, path, out) {
  if (typeof node === 'string') {
    if (/^https?:\/\//.test(node)) out.push({ url: node, where: path });
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((item, i) => collect(item, `${path}[${i}]`, out));
    return;
  }
  if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) collect(value, `${path}.${key}`, out);
  }
}

const found = [];
for (const file of SOURCES) {
  let raw;
  try {
    raw = await readFile(new URL(file, DATA), 'utf8');
  } catch {
    continue; // a collection that does not exist yet is not an error
  }
  collect(JSON.parse(raw), file.replace('.json', ''), found);
}

/* One entry per distinct URL, remembering everywhere it appears. */
const byUrl = new Map();
for (const { url, where } of found) {
  if (!byUrl.has(url)) byUrl.set(url, { url, places: [] });
  byUrl.get(url).places.push(where);
}
const links = [...byUrl.values()];

console.log(`${links.length} distinct outbound links, from ${found.length} references\n`);

/* A real browser UA: several of these hosts refuse anything that looks like a
   script, and a refusal is not the same finding as a dead page. */
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';

async function check(url) {
  const attempt = async (method) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch(url, {
        method,
        redirect: 'follow',
        headers: { 'User-Agent': UA, Accept: '*/*' },
        signal: controller.signal,
      });
      return { status: res.status, finalUrl: res.url };
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    let result = await attempt('HEAD');
    // Plenty of old servers mishandle HEAD; retry properly before judging.
    if (result.status >= 400) result = await attempt('GET');
    return result;
  } catch (error) {
    return { status: null, error: String(error.message ?? error).slice(0, 60) };
  }
}

const results = [];
for (const link of links) {
  const result = await check(link.url);
  results.push({ ...link, ...result });
  const code = result.status ?? `ERR ${result.error}`;
  const flag = result.status === 200 ? '  ' : '->';
  console.log(`${flag} ${String(code).padEnd(16)} ${link.url}`);
}

const ok = results.filter((r) => r.status === 200);
const blocked = results.filter((r) => [401, 403, 429].includes(r.status));
const gone = results.filter((r) => r.status && r.status >= 400 && !blocked.includes(r));
const unreachable = results.filter((r) => r.status === null);
const redirected = ok.filter((r) => r.finalUrl && r.finalUrl !== r.url);

console.log('\n--- summary ---');
console.log(`  ok           ${ok.length}`);
console.log(`  bot-blocked  ${blocked.length}   (403/401/429 - a refusal, not a dead page)`);
console.log(`  dead         ${gone.length}`);
console.log(`  unreachable  ${unreachable.length}   (DNS, TLS or timeout)`);
console.log(`  redirected   ${redirected.length}   (still fine, but the URL has moved)`);

for (const group of [
  ['DEAD', gone],
  ['UNREACHABLE', unreachable],
  ['REDIRECTED', redirected],
]) {
  if (!group[1].length) continue;
  console.log(`\n${group[0]}:`);
  for (const r of group[1]) {
    console.log(`  ${r.url}`);
    console.log(`    seen in: ${r.places.join(', ')}`);
    if (r.finalUrl && r.finalUrl !== r.url) console.log(`    now at:  ${r.finalUrl}`);
    if (r.error) console.log(`    error:   ${r.error}`);
  }
}

if (WRITE) {
  const out = new URL('../docs/link-check.json', import.meta.url);
  await writeFile(
    out,
    `${JSON.stringify(
      {
        checkedAt: new Date().toISOString().slice(0, 10),
        total: results.length,
        results: results.map(({ url, status, finalUrl, error, places }) => ({
          url,
          status,
          finalUrl: finalUrl && finalUrl !== url ? finalUrl : null,
          error: error ?? null,
          places,
        })),
      },
      null,
      2,
    )}\n`,
    'utf8',
  );
  console.log('\nwritten to docs/link-check.json');
}

/* Dead links should fail a CI run; a bot check should not. */
if (gone.length) process.exitCode = 1;
