import preact from '@astrojs/preact';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default {
  // Site URL from env; defaults to localhost for dev
  site: process.env.SITE_URL || 'https://deadair.pages.dev',
  // Astro integrations: Preact islands + sitemap
  integrations: [preact(), mdx(), sitemap()],
  sitemap: {
    // Priorities per page type (0.0 - 1.0)
    defaults: {
      priority: 0.7,
      changefreq: 'weekly',
    },
    // Override priorities per path pattern
    paths: {
      '/': { priority: 1.0, changefreq: 'daily' },
      '/ghosts/': { priority: 0.9, changefreq: 'weekly' },
      '/evidence/': { priority: 0.8, changefreq: 'weekly' },
      '/compare/': { priority: 0.8, changefreq: 'weekly' },
      '/tools/evidence-tracker/': { priority: 0.6, changefreq: 'monthly' },
      '/about/': { priority: 0.5, changefreq: 'monthly' },
      '/changelog/': { priority: 0.5, changefreq: 'monthly' },
      '/ghost-cheat-sheet/': { priority: 0.5, changefreq: 'monthly' },
    },
  },
};