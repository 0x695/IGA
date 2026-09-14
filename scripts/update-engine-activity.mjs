/**
 * Fill in the most recent commit for every engine project, tool and mod that
 * has a GitHub repo behind it, from the GitHub API.
 *
 * The site says plainly whether a project is active, dormant or dead, and that
 * claim is worth nothing without a date behind it. This writes `lastCommit`
 * into src/data/engine-projects.json - sha, ISO date, and the branch it was
 * read from - plus `activityCheckedAt`, so a reader can see how stale the
 * answer is rather than trusting a word written once and never revisited. It
 * does the same for every `tools` entry in src/data/games.json that carries a
 * `repoUrl` (some tools link to a docs/download page rather than their repo,
 * so `repoUrl` is checked separately from the user-facing `url`).
 *
 * These are the *fallback* values - what a no-JS visitor sees, and what
 * paints before src/scripts/live-commits.ts overwrites them in the browser
 * with whatever the GitHub API reports right now. Re-running this keeps that
 * fallback from drifting far behind the live number.
 *
 * `status` is NOT touched. It is a judgement (a project can be finished rather
 * than abandoned), and overwriting it from a date would turn a considered call
 * into a heuristic. Where the two disagree the script says so and leaves the
 * decision to a person.
 *
 *   node scripts/update-engine-activity.mjs
 *
 * Unauthenticated calls are rate limited to 60/hour, which is ample for this
 * repo count. Set GITHUB_TOKEN to raise it.
 */
import { readFile, writeFile } from 'node:fs/promises';

const ENGINES = new URL('../src/data/engine-projects.json', import.meta.url);
const GAMES = new URL('../src/data/games.json', import.meta.url);

/** How long since the last commit before "active" looks doubtful. */
const STALE_DAYS = 365;

const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'iga-engine-activity',
  'X-GitHub-Api-Version': '2022-11-28',
};
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

/** owner/repo out of a github.com URL, or null for anything else — kept in
 *  sync by hand with src/lib/github.ts, which the client-side live check
 *  uses; this script runs under plain Node, without a TS loader. */
function repoSlug(url) {
  const m = /^https:\/\/github\.com\/([^/]+)\/([^/#?]+)/.exec(url ?? '');
  return m ? `${m[1]}/${m[2].replace(/\.git$/, '')}` : null;
}

async function api(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${path}`);
  return res.json();
}

/** Fetches the latest commit for a repo, or throws. */
async function latestCommit(slug) {
  const repo = await api(`/repos/${slug}`);
  const branch = repo.default_branch;
  const [commit] = await api(`/repos/${slug}/commits?sha=${branch}&per_page=1`);
  return { sha: commit.sha.slice(0, 7), date: commit.commit.committer.date, branch };
}

const now = new Date();
const today = now.toISOString().slice(0, 10);
const notes = [];

// --- Engine projects -------------------------------------------------------

const projects = JSON.parse(await readFile(ENGINES, 'utf8'));

for (const project of projects) {
  const slug = repoSlug(project.repoUrl);
  if (!slug) {
    notes.push(`${project.id}: not a GitHub URL, left alone`);
    continue;
  }

  try {
    project.lastCommit = await latestCommit(slug);
    const days = Math.floor((now - new Date(project.lastCommit.date)) / 86400000);
    const stale = days > STALE_DAYS;
    if (stale && project.status === 'active') {
      notes.push(`${project.id}: marked active, last commit ${days} days ago`);
    }
    if (!stale && project.status !== 'active') {
      notes.push(`${project.id}: marked ${project.status}, but committed ${days} days ago`);
    }
    console.log(`${project.id.padEnd(28)} ${project.lastCommit.date.slice(0, 10)}  ${project.lastCommit.sha}  (${days}d)`);
  } catch (error) {
    // A repository that has been deleted or renamed is itself a finding.
    notes.push(`${project.id}: ${error.message}`);
    project.lastCommit = null;
  }
  project.activityCheckedAt = today;
}

await writeFile(ENGINES, `${JSON.stringify(projects, null, 2)}\n`, 'utf8');

// --- Tools & mods (per game) ------------------------------------------------

const games = JSON.parse(await readFile(GAMES, 'utf8'));

for (const game of games) {
  for (const tool of game.tools ?? []) {
    const slug = repoSlug(tool.repoUrl);
    if (!slug) continue; // no repo to check - not every tool has one

    const label = `${game.id}/${tool.title}`;
    try {
      tool.lastCommit = await latestCommit(slug);
      console.log(`${label.padEnd(28)} ${tool.lastCommit.date.slice(0, 10)}  ${tool.lastCommit.sha}`);
    } catch (error) {
      notes.push(`${label}: ${error.message}`);
      tool.lastCommit = null;
    }
    tool.activityCheckedAt = today;
  }
}

await writeFile(GAMES, `${JSON.stringify(games, null, 2)}\n`, 'utf8');

if (notes.length) {
  console.log('\nWorth a human look:');
  for (const note of notes) console.log(`  - ${note}`);
}
