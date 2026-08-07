// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { rehypeAddBase } from './src/lib/rehypeAddBase.ts';

const site = process.env.SITE_URL ?? 'http://localhost:4321';
const base = process.env.BASE_PATH ?? '/';

// https://astro.build/config
export default defineConfig({
  site,
  base,
  integrations: [react(), sitemap()],
  markdown: {
    rehypePlugins: [[rehypeAddBase, { base }]],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
