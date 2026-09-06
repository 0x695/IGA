/**
 * Derive the site's web images from the originals in `design/images`.
 *
 * The originals are what the design was built with and are kept as supplied
 * (several are 3–4 MB PNGs, and one is a PNG named .jpeg). This site is
 * looked up on phones mid-game, so `public/images` carries WebP derivatives
 * instead — sized to what the layout actually renders.
 *
 * Run after changing or adding an original:  node scripts/optimize-images.mjs
 */
import { readdir, mkdir, stat } from 'node:fs/promises';
import { join, parse } from 'node:path';
import sharp from 'sharp';

const SOURCE = 'design/images';
const OUT = 'public/images';

/** Screenshots render at most 836px wide (900px measure, 32px gutters); the
 *  covers render at 64x96. Both get a 2x cap and nothing larger — upscaling a
 *  1600px source to chase a 3x phone would only add bytes. */
const WIDTHS = { screenshot: 1672, cover: 192 };

await mkdir(OUT, { recursive: true });

let before = 0;
let after = 0;

for (const file of await readdir(SOURCE)) {
  const { name } = parse(file);
  const kind = name.endsWith('-cover') ? 'cover' : 'screenshot';
  const src = join(SOURCE, file);
  const dest = join(OUT, `${name}.webp`);

  const { width } = await sharp(src).metadata();
  await sharp(src)
    .resize({ width: Math.min(WIDTHS[kind], width), withoutEnlargement: true })
    .webp({ quality: 82, effort: 6 })
    .toFile(dest);

  const from = (await stat(src)).size;
  const to = (await stat(dest)).size;
  before += from;
  after += to;

  console.log(
    `${file.padEnd(22)} ${(from / 1024).toFixed(0).padStart(5)}KB -> ${(to / 1024).toFixed(0).padStart(4)}KB  ${name}.webp`,
  );
}

console.log(`\ntotal ${(before / 1024 / 1024).toFixed(1)}MB -> ${(after / 1024 / 1024).toFixed(2)}MB`);
