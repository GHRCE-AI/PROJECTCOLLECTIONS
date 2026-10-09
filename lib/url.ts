/**
 * URL safety helpers.
 *
 * User-supplied URLs (githubUrl, youtubeUrl) are rendered as anchor `href`s.
 * React does NOT neutralise `javascript:` / `data:` / `vbscript:` hrefs, so any
 * such value would execute script on click (stored XSS). These helpers ensure
 * only http(s) URLs are ever used as hrefs, and the Zod schemas reject the rest
 * at write time.
 */

export function isSafeHttpUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Returns the URL only if it is a safe http(s) URL, otherwise undefined. */
export function safeHttpUrl(url: string | undefined | null): string | undefined {
  return isSafeHttpUrl(url) ? (url as string) : undefined;
}

// Zod refinements (shared by the standard and bulk schemas).

/** Empty, or an http(s) URL on github.com. */
export const isGithubUrl = (v: string) =>
  v === '' || /^https?:\/\/(www\.)?github\.com\/.+/i.test(v);

/** Empty, or any safe http(s) URL (blocks javascript:/data:/etc.). */
export const isHttpUrlOrEmpty = (v: string) => v === '' || isSafeHttpUrl(v);
