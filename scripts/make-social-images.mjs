/**
 * Render the Open Graph card and the PNG favicon fallbacks.
 *
 * These are committed, not built on the fly: they change only when the
 * wordmark or palette does, and generating them in CI would drag a font
 * dependency into the deploy for no benefit.
 *
 * The card is deliberately typographic. Game screenshots and box art are used
 * on the site to illustrate the games they document, and a social preview is a
 * different use of that art — a change of use is exactly what the Phase 0
 * rights decision said it would not quietly extend to.
 *
 *   node scripts/make-social-images.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const BG = '#0c0b09';
const TEXT = '#edeae8';
const DIM = '#95918f';
const ACCENT = '#d19853';
const DIVIDER = '#2a2725';

const SERIF = "Georgia, 'Times New Roman', serif";
const MONO = "Consolas, 'Courier New', monospace";

const card = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="${BG}"/>
  <g transform="translate(96 96)">
    <path d="M14 0 L28 14 L14 28 L0 14 Z" fill="none" stroke="${ACCENT}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M14 8 L20 14 L14 20 L8 14 Z" fill="${ACCENT}"/>
  </g>
  <text x="140" y="119" font-family="${MONO}" font-size="20" letter-spacing="3" fill="${ACCENT}">A REFERENCE &amp; MODDING ARCHIVE</text>
  <text x="96" y="290" font-family="${SERIF}" font-size="96" font-weight="700" fill="${TEXT}">Impressions Games</text>
  <text x="96" y="390" font-family="${SERIF}" font-size="96" font-weight="700" fill="${TEXT}">Archive</text>
  <line x1="96" y1="452" x2="1104" y2="452" stroke="${DIVIDER}" stroke-width="1"/>
  <text x="96" y="502" font-family="${SERIF}" font-size="27" fill="${DIM}">Caesar · Caesar II · Caesar III · Pharaoh · Zeus · Emperor</text>
  <text x="96" y="546" font-family="${SERIF}" font-size="27" fill="${DIM}">The games, their file formats, and the open-source engines running them.</text>
</svg>`;

await sharp(Buffer.from(card)).png().toFile('public/og.png');
console.log('public/og.png            1200x630');

const favicon = await readFile('public/favicon.svg');
for (const [size, name] of [
  [32, 'public/favicon-32.png'],
  [180, 'public/apple-touch-icon.png'],
]) {
  await sharp(favicon, { density: 384 }).resize(size, size).png().toFile(name);
  console.log(`${name.padEnd(24)} ${size}x${size}`);
}
