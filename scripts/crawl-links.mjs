import { readFile, readdir, access } from 'node:fs/promises';
import { join, relative } from 'node:path';

const DIST = join(process.cwd(), 'dist');
const SITE = (process.env.SITE_URL || 'https://deadair.pages.dev').replace(/\/$/, '');

const errors = [];
const warnings = [];

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

const pathForFile = (file) => {
  const rel = relative(DIST, file).replaceAll('\\', '/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return `/${rel.slice(0, -'index.html'.length)}`;
  return `/${rel}`;
};

const exists = async (path) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

const htmlFiles = (await walk(DIST)).filter((file) => file.endsWith('.html'));
const pageFiles = new Map(htmlFiles.map((file) => [pathForFile(file), file]));

const normalize = (href, page) => {
  if (!href || href.startsWith('#') || /^(mailto:|tel:|javascript:|data:)/i.test(href)) return null;
  let url;
  try {
    url = new URL(href, new URL(page, SITE));
  } catch {
    return { href, external: true };
  }
  if (url.origin !== new URL(SITE).origin && url.hostname !== 'localhost') return { href, external: true };
  return { href, path: url.pathname, hash: url.hash };
};

const targetForPath = async (path) => {
  if (path.endsWith('/')) {
    return { file: join(DIST, path, 'index.html'), page: path };
  }
  if (/\.[a-z0-9]+$/i.test(path)) {
    return { file: join(DIST, path), page: null };
  }
  return { file: join(DIST, path, 'index.html'), page: `${path}/` };
};

const edges = new Map();
const seenAssets = new Set();

for (const [page, file] of pageFiles) {
  const html = await readFile(file, 'utf8');
  const links = new Set();
  for (const [, href] of html.matchAll(/<a\b[^>]*\bhref="([^"]*)"/g)) {
    const resolved = normalize(href, page);
    if (!resolved || resolved.external) continue;
    const target = await targetForPath(resolved.path);
    if (!(await exists(target.file))) {
      errors.push(`${page}: broken link ${href}`);
      continue;
    }
    if (target.page) {
      links.add(target.page);
      if (resolved.path !== resolved.path.replace(/\/?$/, '/')) {
        warnings.push(`${page}: internal link without trailing slash ${href}`);
      }
      if (!pageFiles.has(target.page)) {
        errors.push(`${page}: link points outside the built pages: ${href}`);
      }
    }
  }
  edges.set(page, links);

  for (const [, src] of html.matchAll(/<(?:script|img)\b[^>]*\bsrc="([^"]*)"/g)) {
    const resolved = normalize(src, page);
    if (!resolved || resolved.external || resolved.path === '/') continue;
    seenAssets.add(resolved.path);
    if (!(await exists(join(DIST, resolved.path)))) errors.push(`${page}: missing asset ${src}`);
  }
  for (const [tag] of html.matchAll(/<link\b[^>]*>/g)) {
    if (!/rel="(stylesheet|preload|icon)"/.test(tag)) continue;
    const href = tag.match(/href="([^"]*)"/)?.[1];
    if (!href) continue;
    const resolved = normalize(href, page);
    if (!resolved || resolved.external) continue;
    seenAssets.add(resolved.path);
    if (!(await exists(join(DIST, resolved.path)))) errors.push(`${page}: missing asset ${href}`);
  }
}

const indexable = [...pageFiles.keys()].filter((page) => page !== '/404.html');
const depth = new Map([['/', 0]]);
const queue = ['/'];
while (queue.length) {
  const page = queue.shift();
  for (const next of edges.get(page) ?? []) {
    if (!depth.has(next)) {
      depth.set(next, depth.get(page) + 1);
      queue.push(next);
    }
  }
}

for (const page of indexable) {
  if (!depth.has(page)) {
    errors.push(`${page}: not reachable from home`);
  } else if (depth.get(page) > 3) {
    errors.push(`${page}: ${depth.get(page)} clicks from home (max 3)`);
  }
}

if (warnings.length) {
  console.log(`Warnings (${warnings.length}):`);
  for (const warning of warnings.slice(0, 10)) console.log(`  - ${warning}`);
  if (warnings.length > 10) console.log(`  ... ${warnings.length - 10} more`);
}

if (errors.length) {
  console.error(`Link check failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(`Link check passed: ${indexable.length} pages reachable, ${seenAssets.size} assets checked.`);
