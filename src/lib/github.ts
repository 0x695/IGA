/** owner/repo out of a github.com URL, or null for anything else — shared
 *  between the build-time activity script and the client-side live check. */
export function repoSlug(url: string | null | undefined): string | null {
  const m = /^https:\/\/github\.com\/([^/]+)\/([^/#?]+)/.exec(url ?? '');
  return m ? `${m[1]}/${m[2].replace(/\.git$/, '')}` : null;
}
