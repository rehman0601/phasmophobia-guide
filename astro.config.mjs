import preact from '@astrojs/preact';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default {
  // Site URL from env; defaults to localhost for dev
  site: process.env.SITE_URL || 'https://deadair.pages.dev',
  // Astro integrations: Preact islands + sitemap
  integrations: [preact(), mdx(), sitemap()]
};