/**
 * Fill in each engine project's most recent commit, from the GitHub API.
 *
 * The site says plainly whether a project is active, dormant or dead, and that
 * claim is worth nothing without a date behind it. This writes `lastCommit`
 * into src/data/engine-projects.json - sha, ISO date, and the branch it was
 * read from - plus `activityCheckedAt`, so a reader can see how stale the
 * answer is rather than trusting a word written once and never revisited.
 *
 * `status` is NOT touched. It is a judgement (a project can be finished rather
 * than abandoned), and overwriting it from a date would turn a considered call
 * into a heuristic. Where the two disagree the script says so and leaves the
 * decision to a person.
 *
 *   node scripts/update-engine-activity.mjs
 *
 * Unauthenticated calls are rate limited to 60/hour, which is ample for nine
 * repositories. Set GITHUB_TOKEN to raise it.
 */
import { readFile, writeFile } from 'node:fs/promises';

const DATA = new URL('../src/data/engine-projects.json', import.meta.url);

/** How long since the last commit before "active" looks doubtful. */
const STALE_DAYS = 365;

const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'iga-engine-activity',
  'X-GitHub-Api-Version': '2022-11-28',
};
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

/** owner/repo out of a github.com URL, or null for anything else. */
function repoSlug(url) {
  const m = /^https:\/\/github\.com\/([^/]+)\/([^/#?]+)/.exec(url ?? '');
  return m ? `${m[1]}/${m[2].replace(/\.git$/, '')}` : null;
}

async function api(path) {
  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${path}`);
  return res.json();
}

const projects = JSON.parse(await readFile(DATA, 'utf8'));
const now = new Date();
const notes = [];

for (const project of projects) {
  const slug = repoSlug(project.repoUrl);
  if (!slug) {
    notes.push(`${project.id}: not a GitHub URL, left alone`);
    continue;
  }

  try {
    const repo = await api(`/repos/${slug}`);
    const branch = repo.default_branch;
    const [commit] = await api(`/repos/${slug}/commits?sha=${branch}&per_page=1`);
    const date = commit.commit.committer.date;

    project.lastCommit = { sha: commit.sha.slice(0, 7), date, branch };

    const days = Math.floor((now - new Date(date)) / 86400000);
    const stale = days > STALE_DAYS;
    if (stale && project.status === 'active') {
      notes.push(`${project.id}: marked active, last commit ${days} days ago`);
    }
    if (!stale && project.status !== 'active') {
      notes.push(`${project.id}: marked ${project.status}, but committed ${days} days ago`);
    }
    console.log(`${project.id.padEnd(20)} ${date.slice(0, 10)}  ${project.lastCommit.sha}  (${days}d)`);
  } catch (error) {
    // A repository that has been deleted or renamed is itself a finding.
    notes.push(`${project.id}: ${error.message}`);
    project.lastCommit = null;
  }
}

for (const project of projects) project.activityCheckedAt = now.toISOString().slice(0, 10);

await writeFile(DATA, `${JSON.stringify(projects, null, 2)}\n`, 'utf8');

if (notes.length) {
  console.log('\nWorth a human look:');
  for (const note of notes) console.log(`  - ${note}`);
}
