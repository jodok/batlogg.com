// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import embeds from 'astro-embed/integration';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://jodok.github.io',
  integrations: [embeds(), mdx(), sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },
});