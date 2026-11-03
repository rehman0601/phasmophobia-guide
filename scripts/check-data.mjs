import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import grayMatter from 'gray-matter';

const CONTENT_DIR = join(process.cwd(), 'src/content');
const EVIDENCE_IDS = [
  'emf-5',
  'spirit-box',
  'ultraviolet',
  'ghost-orbs',
  'ghost-writing',
  'freezing-temperatures',
  'dots-projector',
];
const GHOST_NAMES = [
  'Aswang', 'Banshee', 'Dayan', 'Deildegast', 'Demon', 'Deogen',
  'Gallu', 'Goryo', 'Hantu', 'Jinn', 'Kormos', 'Mare', 'Moroi',
  'Myling', 'Obake', 'Obambo', 'Oni', 'Onryo', 'Phantom', 'Poltergeist',
  'Raiju', 'Revenant', 'Shade', 'Spirit', 'Thaye', 'The Mimic',
  'The Twins', 'Wraith', 'Yokai', 'Yurei',
];
const FORCED = {
  Hantu: 'freezing-temperatures',
  Goryo: 'dots-projector',
  Obake: 'ultraviolet',
  Moroi: 'spirit-box',
  Deogen: 'spirit-box',
};

const errors = [];
const fail = (message) => errors.push(message);
const isDate = (value) => typeof value === 'string' && !Number.isNaN(Date.parse(value));

async function readCollection(name) {
  const dir = join(CONTENT_DIR, name);
  const files = (await readdir(dir)).filter((file) => file.endsWith('.mdx'));
  const entries = [];
  for (const file of files) {
    const { data, content } = grayMatter(await readFile(join(dir, file), 'utf8'));
    entries.push({ file, data, content });
  }
  return entries;
}

const ghosts = await readCollection('ghosts');
const evidence = await readCollection('evidence');
const comparisons = await readCollection('comparisons');

if (ghosts.length !== 30) fail(`expected 30 ghosts, found ${ghosts.length}`);
if (evidence.length !== 7) fail(`expected 7 evidence pages, found ${evidence.length}`);
if (comparisons.length !== 12) fail(`expected 12 comparisons, found ${comparisons.length}`);

const ghostNames = new Set(ghosts.map((entry) => entry.data.name));
for (const name of GHOST_NAMES) if (!ghostNames.has(name)) fail(`missing ghost: ${name}`);
for (const name of ghostNames) if (!GHOST_NAMES.includes(name)) fail(`unexpected ghost: ${name}`);

const slugs = new Set();
for (const { file, data, content } of ghosts) {
  const label = data.name ?? file;
  if (typeof data.name !== 'string' || !data.name) fail(`${file}: missing name`);
  if (!/^[a-z0-9-]+$/.test(data.slug ?? '')) fail(`${file}: invalid slug`);
  if (slugs.has(data.slug)) fail(`${file}: duplicate slug ${data.slug}`);
  slugs.add(data.slug);
  if (!Number.isInteger(data.number) || data.number < 1 || data.number > 30) fail(`${file}: invalid number`);

  if (!Array.isArray(data.evidence) || data.evidence.length !== 3) {
    fail(`${file}: expected exactly 3 evidence types`);
  } else {
    if (new Set(data.evidence).size !== 3) fail(`${file}: duplicate evidence types`);
    for (const id of data.evidence) {
      if (!EVIDENCE_IDS.includes(id)) fail(`${file}: unknown evidence ${id}`);
    }
  }

  const extra = data.extraEvidence ?? [];
  if (label === 'The Mimic') {
    if (extra.length !== 1 || extra[0] !== 'ghost-orbs') fail(`${file}: The Mimic must have only extra Ghost Orbs`);
  } else if (extra.length > 0) {
    fail(`${file}: only The Mimic may have extra evidence`);
  }

  const forced = data.guaranteedEvidence ?? null;
  if (label in FORCED) {
    if (forced !== FORCED[label]) fail(`${file}: guaranteed evidence should be ${FORCED[label]}`);
    if (!data.evidence?.includes(forced)) fail(`${file}: guaranteed evidence is not in the evidence set`);
  } else if (forced !== null) {
    fail(`${file}: unexpected guaranteed evidence`);
  }

  if (data.huntSanity !== undefined && (data.huntSanity < 0 || data.huntSanity > 100)) {
    fail(`${file}: huntSanity out of range`);
  }
  if (data.baseSpeed !== undefined && (data.baseSpeed < 0 || data.baseSpeed > 3)) {
    fail(`${file}: baseSpeed out of range`);
  }

  for (const field of ['ability', 'weakness', 'speedNotes']) {
    if (typeof data[field] !== 'string' || !data[field].trim()) fail(`${file}: missing ${field}`);
  }
  for (const field of ['idTests', 'faq']) {
    if (!Array.isArray(data[field]) || data[field].length === 0) fail(`${file}: missing ${field}`);
  }
  if (!isDate(data.lastVerified)) fail(`${file}: invalid lastVerified`);
  if (!Array.isArray(data.sources) || data.sources.length === 0) fail(`${file}: missing sources`);
  if (content.match(/^# /m)) fail(`${file}: duplicate H1 in MDX body`);
}

const usedEvidence = new Set();
for (const { file, data } of evidence) {
  if (!EVIDENCE_IDS.includes(data.slug)) fail(`${file}: unknown evidence slug ${data.slug}`);
  if (!isDate(data.lastVerified)) fail(`${file}: invalid lastVerified`);
  if (!Array.isArray(data.sources) || data.sources.length === 0) fail(`${file}: missing sources`);
  for (const slug of data.forcedBy ?? []) {
    const ghost = ghosts.find((entry) => entry.data.slug === slug);
    if (!ghost) fail(`${file}: forcedBy unknown ghost ${slug}`);
    else if (ghost.data.guaranteedEvidence !== data.slug) {
      fail(`${file}: forcedBy ${slug} but ghost does not guarantee ${data.slug}`);
    }
  }
}
for (const ghost of ghosts) {
  for (const id of ghost.data.evidence ?? []) usedEvidence.add(id);
  for (const id of ghost.data.extraEvidence ?? []) usedEvidence.add(id);
}
for (const id of EVIDENCE_IDS) {
  if (!usedEvidence.has(id)) fail(`evidence ${id} is not used by any ghost`);
  if (!evidence.some((entry) => entry.data.slug === id)) fail(`missing evidence page for ${id}`);
}
for (const { file, data } of evidence) {
  if (!data.forcedBy?.length) continue;
  const expected = ghosts.filter((entry) => entry.data.guaranteedEvidence === data.slug).map((entry) => entry.data.slug);
  if (JSON.stringify([...data.forcedBy].sort()) !== JSON.stringify(expected.sort())) {
    fail(`${file}: forcedBy does not match ghost data`);
  }
}

const pairs = new Set();
for (const { file, data } of comparisons) {
  const pair = [data.ghostA, data.ghostB].sort().join('|');
  if (data.ghostA === data.ghostB) fail(`${file}: ghostA and ghostB are identical`);
  if (!slugs.has(data.ghostA)) fail(`${file}: unknown ghostA ${data.ghostA}`);
  if (!slugs.has(data.ghostB)) fail(`${file}: unknown ghostB ${data.ghostB}`);
  if (pairs.has(pair)) fail(`${file}: duplicate comparison pair`);
  pairs.add(pair);
  if (!isDate(data.lastVerified)) fail(`${file}: invalid lastVerified`);
  if (!Array.isArray(data.sources) || data.sources.length === 0) fail(`${file}: missing sources`);
}

if (errors.length) {
  console.error(`Data check failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(`Data check passed: ${ghosts.length} ghosts, ${evidence.length} evidence pages, ${comparisons.length} comparisons.`);
