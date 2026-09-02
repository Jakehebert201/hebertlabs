import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://hebertlabs.com',
  // Collapses inter-element whitespace in the built HTML. Anything whose own
  // whitespace is load-bearing (the ASCII fraction layouts) is authored as
  // <pre>, which compression leaves untouched.
  compressHTML: true,
});
