#!/usr/bin/env node
// Generate ghost MDX files from evidence matrix data (Appendix B of spec).
import { writeFileSync, mkdirSync } from 'node:fs';

const GHOSTS = [
  { name: 'Aswang', slug: 'aswang', number: 1, evidence: ['ghost-writing', 'freezing-temperatures', 'dots-projector'], forced: null },
  { name: 'Banshee', slug: 'banshee', number: 2, evidence: ['dots-projector', 'ghost-orbs', 'ultraviolet'], forced: null },
  { name: 'Dayan', slug: 'dayan', number: 3, evidence: ['emf-5', 'ghost-orbs', 'spirit-box'], forced: null },
  { name: 'Deildegast', slug: 'deildegast', number: 4, evidence: ['emf-5', 'ghost-writing', 'dots-projector'], forced: null },
  { name: 'Demon', slug: 'demon', number: 5, evidence: ['ultraviolet', 'ghost-writing', 'freezing-temperatures'], forced: null },
  { name: 'Deogen', slug: 'deogen', number: 6, evidence: ['spirit-box', 'ghost-writing', 'dots-projector'], forced: 'spirit-box' },
  { name: 'Gallu', slug: 'gallu', number: 7, evidence: ['emf-5', 'spirit-box', 'ultraviolet'], forced: null },
  { name: 'Goryo', slug: 'goryo', number: 8, evidence: ['emf-5', 'ultraviolet', 'dots-projector'], forced: 'dots-projector' },
  { name: 'Hantu', slug: 'hantu', number: 9, evidence: ['ultraviolet', 'ghost-orbs', 'freezing-temperatures'], forced: 'freezing-temperatures' },
  { name: 'Jinn', slug: 'jinn', number: 10, evidence: ['emf-5', 'ultraviolet', 'freezing-temperatures'], forced: null },
  { name: 'Kormos', slug: 'kormos', number: 11, evidence: ['ghost-orbs', 'spirit-box', 'ultraviolet'], forced: null },
  { name: 'Mare', slug: 'mare', number: 12, evidence: ['spirit-box', 'ghost-orbs', 'ghost-writing'], forced: null },
  { name: 'Moroi', slug: 'moroi', number: 13, evidence: ['spirit-box', 'ghost-writing', 'freezing-temperatures'], forced: 'spirit-box' },
  { name: 'Myling', slug: 'myling', number: 14, evidence: ['emf-5', 'ultraviolet', 'ghost-writing'], forced: null },
  { name: 'Obake', slug: 'obake', number: 15, evidence: ['emf-5', 'ultraviolet', 'ghost-orbs'], forced: 'ultraviolet' },
  { name: 'Obambo', slug: 'obambo', number: 16, evidence: ['ultraviolet', 'ghost-writing', 'dots-projector'], forced: null },
  { name: 'Oni', slug: 'oni', number: 17, evidence: ['emf-5', 'freezing-temperatures', 'dots-projector'], forced: null },
  { name: 'Onryo', slug: 'onryo', number: 18, evidence: ['spirit-box', 'ghost-orbs', 'freezing-temperatures'], forced: null },
  { name: 'Phantom', slug: 'phantom', number: 19, evidence: ['spirit-box', 'ultraviolet', 'dots-projector'], forced: null },
  { name: 'Poltergeist', slug: 'poltergeist', number: 20, evidence: ['spirit-box', 'ultraviolet', 'ghost-writing'], forced: null },
  { name: 'Raiju', slug: 'raiju', number: 21, evidence: ['emf-5', 'ghost-orbs', 'dots-projector'], forced: null },
  { name: 'Revenant', slug: 'revenant', number: 22, evidence: ['ghost-orbs', 'ghost-writing', 'freezing-temperatures'], forced: null },
  { name: 'Shade', slug: 'shade', number: 23, evidence: ['emf-5', 'ghost-writing', 'freezing-temperatures'], forced: null },
  { name: 'Spirit', slug: 'spirit', number: 24, evidence: ['emf-5', 'spirit-box', 'ghost-writing'], forced: null },
  { name: 'Thaye', slug: 'thaye', number: 25, evidence: ['ghost-orbs', 'ghost-writing', 'dots-projector'], forced: null },
  { name: 'The Mimic', slug: 'the-mimic', number: 26, evidence: ['spirit-box', 'ultraviolet', 'freezing-temperatures'], forced: null, extra: ['ghost-orbs'] },
  { name: 'The Twins', slug: 'the-twins', number: 27, evidence: ['emf-5', 'spirit-box', 'freezing-temperatures'], forced: null },
  { name: 'Wraith', slug: 'wraith', number: 28, evidence: ['emf-5', 'spirit-box', 'dots-projector'], forced: null },
  { name: 'Yokai', slug: 'yokai', number: 29, evidence: ['spirit-box', 'ghost-orbs', 'dots-projector'], forced: null },
  { name: 'Yurei', slug: 'yurei', number: 30, evidence: ['ghost-orbs', 'freezing-temperatures', 'dots-projector'], forced: null },
];

const labels = {
  'emf-5': 'EMF Level 5',
  'spirit-box': 'Spirit Box',
  'ultraviolet': 'Ultraviolet',
  'ghost-orbs': 'Ghost Orbs',
  'ghost-writing': 'Ghost Writing',
  'freezing-temperatures': 'Freezing Temperatures',
  'dots-projector': 'D.O.T.S. Projector',
};

const evidenceLabel = (id) => labels[id] ?? id;

const evidenceText = (ids) => ids.map(evidenceLabel).join(', ');

const dir = 'src/content/ghosts';
mkdirSync(dir, { recursive: true });

const TODAY = new Date().toISOString();

for (const g of GHOSTS) {
  const forced = g.forced ? `Guaranteed evidence on reduced difficulties: **${evidenceLabel(g.forced)}**. ` : '';
  const extra = g.extra ? `Extra evidence (always present): **${evidenceLabel(g.extra[0])}**. ` : '';
  const tags = g.forced ? ['forced-evidence', ...(g.extra ? ['extra-evidence'] : [])] : (g.extra ? ['extra-evidence'] : []);

  const aliases = [g.name.toLowerCase()];
  if (g.name.includes(' ')) {
    aliases.push(g.name.split(' ')[1].toLowerCase());
  }

  const frontmatter = `---
name: "${g.name}"
slug: "${g.slug}"
number: ${g.number}
aliases: [${aliases.map(a => `"${a}"`).join(', ')}]
evidence: [${g.evidence.map(id => `"${id}"`).join(', ')}]
extraEvidence: [${g.extra ? [`"${g.extra[0]}"`] : []}]
guaranteedEvidence: ${g.forced ? `"${g.forced}"` : 'null'}
speedNotes: ""
ability: ""
weakness: ""
tags: [${tags.map(t => `"${t}"`).join(', ')}]
idTests:
  - title: "Confirm all three evidence types"
    detail: "Use EMF Reader, Spirit Box, UV Light, Video Camera, Ghost Writing Book, Thermometer, and D.O.T.S. Projector to verify which of ${evidenceText(g.evidence)} appear."
faq:
  - question: "What evidence does ${g.name} leave?"
    answer: "${g.name} leaves ${evidenceText(g.evidence)}${extra}${forced}"
  - question: "How do I identify ${g.name}?"
    answer: "Gather ${evidenceText(g.evidence)} and compare against your journal. On reduced-evidence difficulties, ${forced || 'note which types are still visible'}."
lastVerified: "${TODAY}"
sources:
  - label: "Phasmophobia Wiki (Fandom) — Ghost"
    url: "https://phasmophobia.fandom.com/wiki/Ghost"
  - label: "Phasmophobia Wiki (Fextralife) — Evidence Cheat Sheet"
    url: "https://phasmophobia.wiki.fextralife.com/Evidence_Cheat_Sheet"
---

# ${g.name}

## Evidence

${g.name} leaves **${evidenceText(g.evidence)}**. ${extra}${forced}

## How to Identify

Test each of the evidence types above systematically. Check ${evidenceText(g.evidence)} first, then rule out ghosts that don't match.

## Hunt Behavior

Each ghost has unique hunt behavior, speed, and sanity thresholds. Specific data for ${g.name} should be verified against current game data and added to this section.

## Strategy

Focus on evidence collection rather than guessing. Use your journal to track which evidence types you've confirmed, then cross-reference against remaining candidates.

## Related

View the [Evidence Cheat Sheet](/ghost-cheat-sheet/) to compare all ghosts side by side.
`;

  writeFileSync(`${dir}/${g.slug}.mdx`, frontmatter);
  console.log(`Created ${g.slug}.mdx`);
}

console.log(`Generated ${GHOSTS.length} ghost MDX files.`);
