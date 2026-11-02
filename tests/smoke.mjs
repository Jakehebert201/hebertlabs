// Run against `npm run preview` after a build. Optional first argument: base URL.
import assert from 'node:assert/strict';
import { calculators } from '../src/data/calculators.js';

const base = process.argv[2] || 'http://127.0.0.1:4321';
async function get(path) {
  const response = await fetch(new URL(path, base), { signal: AbortSignal.timeout(10000) });
  assert.equal(response.status, 200, `${path} must load`);
  return response.text();
}
const route = '/calculators/moles-osmoles-equivalents/';
const [home, index, page, old, sheet, sitemap] = await Promise.all([
  get('/'), get('/calculators/'), get(route), get('/calculators/molarity-osmolarity/'), get('/notes/formula-sheet/'), get('/sitemap.xml'),
]);
assert.ok(home.includes(`href="${route}"`), 'Home links to replacement');
const dosing = index.match(/<section[^>]*>\s*<h2>Dosing<\/h2>([\s\S]*?)<\/section>/);
assert.ok(dosing?.[1].includes(`href="${route}"`), 'New calculator is under Dosing');
assert.ok(!index.includes('href="/calculators/molarity-osmolarity/"'), 'Old calculator removed from index');
assert.ok(old.includes('http-equiv="refresh"') && old.includes(route), 'Static redirect preserves old bookmarks');
assert.ok(sheet.includes(`href="${route}"`), 'Formula sheet links to replacement');
assert.ok(sitemap.includes(route), 'New page is discoverable in sitemap');
for (const name of ['compoundPreset', 'compound', 'mw', 'i', 'ion', 'valence', 'ionCount', 'amount', 'from', 'to']) {
  assert.ok(page.includes(`name="${name}"`), `Form contains ${name}`);
}
assert.equal([...page.matchAll(/data-example=/g)].length, 5, 'Five worked examples');
for (const attr of ['data-solution', 'data-steps', 'data-extra', 'data-error']) assert.ok(page.includes(attr), `Shared renderer has ${attr}`);
const assets = [...page.matchAll(/(?:src|href)="([^"#]+\.(?:js|css))"/g)].map((m) => m[1]);
assert.ok(assets.some((path) => path.endsWith('.js')), 'Calculator includes browser script');
await Promise.all(assets.map(get));
await Promise.all(calculators.map(async (calc) => {
  const html = await get(calc.href);
  assert.ok(html.includes('data-calc'), `${calc.href} still renders its calculator`);
}));
console.log(`Smoke test passed: ${calculators.length} calculators, Dosing listing, homepage, formula sheet, sitemap, legacy redirect and ${assets.length} page assets.`);
