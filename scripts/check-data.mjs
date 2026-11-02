import { readFile } from 'node:fs/promises';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import grayMatter from 'gray-matter';
import { z } from 'zod';

const CONTENT_DIR = join(process.cwd(), 'src/content');
const GHOSTS_DIR = join(CONTENT_DIR, 'ghosts');
const EVIDENCE_DIR = join(CONTENT_DIR, 'evidence');
const COMPARISONS_DIR = join(CONTENT_DIR, 'comparisons');

const GHOST_SCHEMA = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  number: z.number().int().min(1),
  aliases: z.array(z.string()),
  evidence: z.array(z.string()).length(3),
  extraEvidence: z.array(z.string()),
  guaranteedEvidence: z.string().nullable(),
  huntSanity: z.number().min(0).max(100),
  baseSpeed: z.number().min(0).max(3),
  speedNotes: z.string(),
  ability: z.string(),
  weakness: z.string(),
  tags: z.array(z.string()),
  idTests: z.array(z.object({ title: z.string(), detail: z.string() })),
  faq: z.array(z.object({ question: z.string(), answer: z.string() })),
  lastVerified: z.string().datetime(),
  sources: z.array(z.object({ label: z.string(), url: z.string().url() }))
});

const EVIDENCE_SCHEMA = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  summary: z.string(),
  howToTest: z.array(z.string()),
  falsePositives: z.array(z.string()),
  forcedBy: z.array(z.string()),
  lastVerified: z.string().datetime(),
  sources: z.array(z.object({ label: z.string(), url: z.string().url() }))
});

const COMPARISON_SCHEMA = z.object({
  ghostA: z.string(),
  ghostB: z.string(),
  title: z.string(),
  verdict: z.string(),
  lastVerified: z.string().datetime(),
  sources: z.array(z.object({ label: z.string(), url: z.string().url() }))
});

async function main() {
  let errors = 0;

  const files = await readdir(GHOSTS_DIR);
  const ghosts = [];
  for (const file of files) {
    const raw = await readFile(join(GHOSTS_DIR, file), 'utf8');
    const { data, content } = grayMatter(raw);
    try {
      const ghost = GHOST_SCHEMA.parse(data);
      ghost._content = content;
      ghosts.push(ghost);
    } catch (e) {
      console.error(`[fail] ${file}:`, e.errors || e.message);
      errors++;
    }
  }

  console.log(`Checked ${ghosts.length} ghost entries`);
  if (errors > 0) process.exit(1);
}

main().catch(e => { console.error(e); process.exit(1); });