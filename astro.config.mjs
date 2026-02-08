// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import embeds from 'astro-embed/integration';

// https://astro.build/config
export default defineConfig({
	site: 'https://batlogg.com',
	integrations: [embeds(), mdx(), sitemap()],
});
