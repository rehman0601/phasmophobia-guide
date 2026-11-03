import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative, resolve, dirname } from 'node:path';
import { gzipSync } from 'node:zlib';

const DIST = join(process.cwd(), 'dist');
const KB = 1024;
const CONTENT_JS_BUDGET = 10 * KB;
const TRACKER_JS_BUDGET = 50 * KB;
const FONT_BUDGET = 90 * KB;
const CSS_BUDGET = 20 * KB;

const errors = [];
const gz = async (file) => gzipSync(await readFile(file)).length;

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

const files = await walk(DIST);
const htmlFiles = files.filter((file) => file.endsWith('.html'));

const jsCache = new Map();
const transitiveJs = async (entry) => {
  const seen = new Set();
  const queue = [entry];
  while (queue.length) {
    const file = queue.shift();
    if (seen.has(file)) continue;
    seen.add(file);
    if (!jsCache.has(file)) jsCache.set(file, await readFile(file, 'utf8'));
    const source = jsCache.get(file);
    for (const [, specifier] of source.matchAll(/(?:from\s*|import\s*\()\s*["']([^"']+)["']/g)) {
      if (!specifier.startsWith('.') && !specifier.startsWith('/')) continue;
      const target = specifier.startsWith('/')
        ? join(DIST, specifier)
        : resolve(dirname(file), specifier);
      try {
        await stat(target);
        queue.push(target);
      } catch {
        errors.push(`${relative(DIST, file)}: missing imported module ${specifier}`);
      }
    }
  }
  return [...seen];
};

const inlineJsSize = (html) => {
  let total = 0;
  for (const [, attrs = '', body = ''] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (/application\/ld\+json/.test(attrs) || /\bsrc=/.test(attrs)) continue;
    total += gzipSync(body).length;
  }
  return total;
};

const rows = [];
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const page = '/' + relative(DIST, file).replaceAll('\\', '/').replace(/index\.html$/, '');
  const external = new Set();
  const entryPoints = [
    ...[...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map((match) => match[1]),
    ...[...html.matchAll(/(?:component-url|renderer-url)="([^"]+)"/g)].map((match) => match[1]),
  ];
  for (const src of entryPoints) {
    const target = src.startsWith('/') ? join(DIST, src) : resolve(dirname(file), src);
    for (const dependency of await transitiveJs(target)) external.add(dependency);
  }
  let externalSize = 0;
  for (const dependency of external) externalSize += await gz(dependency);
  const inline = inlineJsSize(html);
  rows.push({ page, external: externalSize, inline, total: externalSize + inline });
}

const tracker = rows.find((row) => row.page === '/tools/evidence-tracker/');
if (!tracker) {
  errors.push('tracker page not found');
} else if (tracker.total > TRACKER_JS_BUDGET) {
  errors.push(`tracker JS ${(tracker.total / KB).toFixed(1)}KB exceeds ${TRACKER_JS_BUDGET / KB}KB`);
}

for (const row of rows) {
  if (row.page === '/tools/evidence-tracker/' || row.page === '/404.html') continue;
  if (row.total > CONTENT_JS_BUDGET) {
    errors.push(`${row.page}: JS ${(row.total / KB).toFixed(1)}KB exceeds ${CONTENT_JS_BUDGET / KB}KB`);
  }
}

const fontFiles = files.filter((file) => /\.woff2?$/.test(file));
const woff = fontFiles.filter((file) => file.endsWith('.woff'));
const woff2 = fontFiles.filter((file) => file.endsWith('.woff2'));
let fontSize = 0;
for (const file of fontFiles) fontSize += await gz(file);
if (woff.length > 0) errors.push(`WOFF fallbacks shipped: ${woff.length} file(s)`);
if (woff2.length > 3) errors.push(`${woff2.length} WOFF2 files shipped (max 3)`);
if (fontSize > FONT_BUDGET) {
  errors.push(`font payload ${(fontSize / KB).toFixed(1)}KB exceeds ${FONT_BUDGET / KB}KB`);
}

const cssFiles = files.filter((file) => file.endsWith('.css'));
let cssSize = 0;
for (const file of cssFiles) cssSize += await gz(file);
if (cssFiles.length > 1) errors.push(`${cssFiles.length} CSS files shipped (expected one bundle)`);
if (cssSize > CSS_BUDGET) {
  errors.push(`CSS payload ${(cssSize / KB).toFixed(1)}KB exceeds ${CSS_BUDGET / KB}KB`);
}

const largest = [...rows].sort((a, b) => b.total - a.total).slice(0, 5);
for (const row of largest) {
  console.log(
    `  ${row.page} — ${(row.total / KB).toFixed(1)}KB JS (${(row.external / KB).toFixed(1)} external, ${(row.inline / KB).toFixed(1)} inline)`
  );
}
console.log(
  `  fonts ${(fontSize / KB).toFixed(1)}KB across ${woff2.length} WOFF2 files; CSS ${(cssSize / KB).toFixed(1)}KB`
);

if (errors.length) {
  console.error(`Budget check failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log('Budget check passed.');
