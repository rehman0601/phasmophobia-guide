import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default {
  // Site URL from env; defaults to localhost for dev
  site: import.meta.env.SITE_URL || 'http://localhost:4321',
  // Astro integrations: React islands + sitemap
  integrations: [react(), sitemap()]
};