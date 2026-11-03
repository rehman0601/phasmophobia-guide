import { readFile, readdir, access } from 'node:fs/promises';
import { join, relative } from 'node:path';

const DIST = join(process.cwd(), 'dist');
const SITE = (process.env.SITE_URL || 'https://deadair.pages.dev').replace(/\/$/, '');
const errors = [];
const warnings = [];

const decode = (value) =>
  value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

const one = (html, re, label, file) => {
  const matches = [...html.matchAll(re)];
  if (matches.length !== 1) {
    errors.push(`${file}: expected 1 ${label}, found ${matches.length}`);
    return null;
  }
  return decode(matches[0][1]);
};

const pathForFile = (file) => {
  const rel = relative(DIST, file).replaceAll('\\', '/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return `/${rel.slice(0, -'index.html'.length)}`;
  return `/${rel}`;
};

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

const htmlFiles = (await walk(DIST)).filter((file) => file.endsWith('.html'));
const indexable = htmlFiles.filter((file) => !file.endsWith('/404.html'));

const titles = new Map();
const descriptions = new Map();

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const page = pathForFile(file);
  const is404 = file.endsWith('/404.html');

  const title = one(html, /<title>([\s\S]*?)<\/title>/g, 'title', page);
  const description = one(html, /<meta name="description" content="([^"]*)"\s*\/?>/g, 'meta description', page);
  const canonicalMatches = [...html.matchAll(/<link rel="canonical" href="([^"]*)"\s*\/?>/g)];
  const h1 = one(html, /<h1[^>]*>([\s\S]*?)<\/h1>/g, 'H1', page);

  if (!h1) errors.push(`${page}: missing H1`);

  if (is404) {
    if (canonicalMatches.length !== 0) errors.push(`${page}: 404 must not declare a canonical`);
    if (!/<meta name="robots" content="noindex"/.test(html)) errors.push(`${page}: 404 must be noindex`);
  } else {
    if (canonicalMatches.length !== 1) {
      errors.push(`${page}: expected 1 canonical, found ${canonicalMatches.length}`);
    } else {
      const expected = new URL(page, SITE).href;
      if (canonicalMatches[0][1] !== expected) {
        errors.push(`${page}: canonical ${canonicalMatches[0][1]} != ${expected}`);
      }
    }
  }

  if (title) {
    if (title.length > 70) warnings.push(`${page}: title is ${title.length} chars`);
    const previous = titles.get(title);
    if (previous) errors.push(`${page}: duplicate title also used by ${previous}`);
    else titles.set(title, page);
  }

  if (description) {
    if (is404) {
      if (description.length < 100 || description.length > 200) {
        errors.push(`${page}: 404 description is ${description.length} chars`);
      }
    } else if (description.length < 140 || description.length > 160) {
      errors.push(`${page}: description is ${description.length} chars (need 140-160)`);
    }
    const previous = descriptions.get(description);
    if (previous) errors.push(`${page}: duplicate description also used by ${previous}`);
    else descriptions.set(description, page);
  }

  if (!is404) {
    for (const tag of ['og:title', 'og:description', 'og:url', 'og:image']) {
      if (!new RegExp(`<meta property="${tag}" content="[^"]+"`).test(html)) {
        errors.push(`${page}: missing ${tag}`);
      }
    }
    if (!/<meta name="twitter:card" content="summary_large_image"/.test(html)) {
      errors.push(`${page}: missing large twitter card`);
    }
    if (!/<meta name="twitter:image" content="[^"]+"/.test(html)) {
      errors.push(`${page}: missing twitter:image`);
    }

    const ogImage = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
    if (ogImage) {
      const assetPath = new URL(ogImage, SITE).pathname;
      try {
        await access(join(DIST, assetPath));
      } catch {
        errors.push(`${page}: og:image file not found: ${assetPath}`);
      }
    }
  }

  const ldBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  const types = [];
  for (const [, raw] of ldBlocks) {
    try {
      const parsed = JSON.parse(raw);
      const blocks = Array.isArray(parsed) ? parsed : [parsed];
      for (const block of blocks) {
        if (!block['@context']) errors.push(`${page}: JSON-LD missing @context`);
        if (block['@type']) types.push(block['@type']);
      }
    } catch (error) {
      errors.push(`${page}: invalid JSON-LD (${error.message})`);
    }
  }

  if (!is404 && !types.includes('FAQPage') && page !== '/') {
    if (!types.includes('BreadcrumbList')) errors.push(`${page}: missing BreadcrumbList JSON-LD`);
  }
  if (types.includes('FAQPage')) errors.push(`${page}: FAQPage JSON-LD is not allowed`);

  const needsArticle = /^\/(ghosts|evidence|compare)\/[^/]+\/$/.test(page) || page === '/ghost-cheat-sheet/';
  if (needsArticle && !types.includes('Article')) errors.push(`${page}: missing Article JSON-LD`);

  if (page === '/') {
    for (const type of ['WebSite', 'VideoGame']) {
      if (!types.includes(type)) errors.push(`${page}: missing ${type} JSON-LD`);
    }
  }
  if (page === '/tools/evidence-tracker/' && !types.includes('WebApplication')) {
    errors.push(`${page}: missing WebApplication JSON-LD`);
  }
}

const sitemapIndex = await readFile(join(DIST, 'sitemap-index.xml'), 'utf8');
const childSitemaps = [...sitemapIndex.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const sitemapPaths = new Set();
for (const sitemapUrl of childSitemaps) {
  const file = join(DIST, new URL(sitemapUrl).pathname);
  const xml = await readFile(file, 'utf8');
  for (const [, loc] of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    sitemapPaths.add(new URL(loc).pathname);
  }
}

const expectedPaths = new Set(indexable.map((file) => pathForFile(file)));
for (const path of expectedPaths) {
  if (!sitemapPaths.has(path)) errors.push(`sitemap: missing ${path}`);
}
for (const path of sitemapPaths) {
  if (!expectedPaths.has(path)) errors.push(`sitemap: unexpected ${path}`);
}

if (warnings.length) {
  console.log('Warnings:');
  for (const warning of warnings) console.log(`  - ${warning}`);
}

if (errors.length) {
  console.error(`SEO check failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(
  `SEO check passed: ${indexable.length} indexable pages, ${titles.size} unique titles, ${descriptions.size} unique descriptions, sitemap complete.`
);
