// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import embeds from 'astro-embed/integration';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://batlogg.com',
  integrations: [embeds(), mdx(), sitemap()],

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@astro-community/astro-embed-bluesky': '/src/compat/astro-embed-bluesky-stub.ts',
        '@astro-community/astro-embed-bluesky/matcher': '/src/compat/astro-embed-bluesky-matcher-stub.ts',
      },
    },
  },
});
