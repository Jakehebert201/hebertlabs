/**
 * The sitemap and the canonical tags in BaseLayout both describe pages in
 * their directory form (`/notes/foo/`). Anything that links to a page has to
 * agree, or the link costs a redirect hop and splits the SEO signal in two.
 */
export function withTrailingSlash(path) {
  if (typeof path !== 'string' || path === '') return path;
  return path.endsWith('/') ? path : `${path}/`;
}
