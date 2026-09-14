/**
 * Refreshes "last commit" against the GitHub API in the visitor's own
 * browser, so the date on the page is live rather than only as fresh as the
 * last build. The server-rendered value (from
 * scripts/update-engine-activity.mjs) stays as the fallback for no-JS
 * visitors and for when this fetch fails or GitHub's unauthenticated rate
 * limit is exhausted — it is never removed, only overwritten in place.
 *
 * GitHub's REST API sends Access-Control-Allow-Origin: * on unauthenticated
 * GETs, so this works with no proxy and no token; each visitor spends their
 * own 60-requests/hour allowance, never a shared one.
 */
const blocks = document.querySelectorAll<HTMLElement>('[data-commit-block][data-repo]');

for (const block of blocks) {
  const slug = block.dataset.repo;
  if (!slug) continue;
  refresh(block, slug);
}

async function refresh(block: HTMLElement, slug: string) {
  try {
    const res = await fetch(`https://api.github.com/repos/${slug}/commits?per_page=1`, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (!res.ok) return;
    const [commit] = (await res.json()) as [
      { sha: string; commit: { committer: { date: string } } },
    ];
    if (!commit) return;

    const sha = commit.sha.slice(0, 7);
    const date = commit.commit.committer.date;
    const formatted = new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    block.innerHTML = '';
    block.append('Last commit ');
    const time = document.createElement('time');
    time.dateTime = date;
    time.textContent = formatted;
    block.append(time, ' ');
    const code = document.createElement('code');
    code.textContent = sha;
    block.append(code, ' ');
    const live = document.createElement('span');
    live.className = 'commit-live';
    live.textContent = '· checked live just now';
    block.append(live);
  } catch {
    // Offline, blocked, or rate-limited — the statically rendered value
    // already on the page is left exactly as it was.
  }
}
