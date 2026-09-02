import { calculators } from '../data/calculators.js';
import { withTrailingSlash } from '../utils/url.js';

const noteModules = Object.values(import.meta.glob('./notes/*.md', { eager: true }));

export function GET(context) {
  const origin = (context.site?.href ?? 'https://hebertlabs.com/').replace(/\/$/, '');

  const paths = [
    '/',
    '/calculators/',
    '/notes/',
    '/about/',
    ...calculators.map((calc) => calc.href),
    ...noteModules
      .filter((note) => !note.frontmatter?.draft)
      .map((note) => withTrailingSlash(note.url)),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((path) => `  <url><loc>${origin}${path}</loc></url>`).join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
