#!/usr/bin/env node
// Generate enriched ghost MDX files from verified facts.
import { writeFileSync, mkdirSync } from 'node:fs';
import { GHOSTS } from './ghost-data.mjs';

const labels = {
  'emf-5': 'EMF Level 5',
  'spirit-box': 'Spirit Box',
  ultraviolet: 'Ultraviolet',
  'ghost-orbs': 'Ghost Orbs',
  'ghost-writing': 'Ghost Writing',
  'freezing-temperatures': 'Freezing Temperatures',
  'dots-projector': 'D.O.T.S. Projector',
};

const label = (id) => labels[id] ?? id;
const list = (ids) => ids.map(label).join(', ');
const q = JSON.stringify;

const dir = 'src/content/ghosts';
mkdirSync(dir, { recursive: true });

const TODAY = new Date().toISOString();

for (const g of GHOSTS) {
  const forced = g.forced ? label(g.forced) : null;
  const extra = g.extra ? label(g.extra) : null;
  const aliases = g.name.startsWith('The ') ? [g.name.slice(4).toLowerCase()] : [];
  const tags = [
    ...(forced ? ['forced-evidence'] : []),
    ...(extra ? ['extra-evidence'] : []),
  ];
  const wikiName = g.name.replace(/ /g, '_');

  const evidenceSentence = `${g.name} can leave ${list(g.evidence)}.`;
  const forcedSentence = forced ? ` On reduced-evidence difficulties, ${forced} is guaranteed to remain.` : '';
  const extraSentence = extra ? ` It also always shows ${extra}, on top of its main evidence.` : '';

  const tests = [
    {
      title: 'Confirm the evidence set',
      detail: `Use the standard tools to verify each of ${list(g.evidence)}. Only a positive reading counts; a missing reading matters on normal difficulty.`,
    },
    {
      title: 'Watch for the ability',
      detail: g.ability,
    },
    {
      title: 'Use the weakness',
      detail: g.weakness,
    },
  ];

  const faq = [
    {
      question: `What evidence does ${g.name} leave?`,
      answer: `${evidenceSentence}${forcedSentence}${extraSentence}`.trim(),
    },
    {
      question: `How do I identify ${g.name}?`,
      answer: `Confirm ${list(g.evidence)}, then use behavior to separate it from ghosts that share that evidence. Its ability: ${g.ability} Its weakness: ${g.weakness}`,
    },
    {
      question: `How fast is ${g.name}?`,
      answer: `${g.speedNotes}${typeof g.huntSanity === 'number' ? ` Its hunt sanity threshold is ${g.huntSanity}%.` : ''}`,
    },
  ];

  const frontmatter = `---
name: ${q(g.name)}
slug: ${q(g.slug)}
number: ${g.number}
aliases: [${aliases.map(q).join(', ')}]
evidence: [${g.evidence.map(q).join(', ')}]
extraEvidence: [${g.extra ? q(g.extra) : ''}]
guaranteedEvidence: ${g.forced ? q(g.forced) : 'null'}
${typeof g.huntSanity === 'number' ? `huntSanity: ${g.huntSanity}\n` : ''}${typeof g.baseSpeed === 'number' ? `baseSpeed: ${g.baseSpeed}\n` : ''}speedNotes: ${q(g.speedNotes)}
ability: ${q(g.ability)}
weakness: ${q(g.weakness)}
tags: [${tags.map(q).join(', ')}]
idTests:
${tests.map((test) => `  - title: ${q(test.title)}\n    detail: ${q(test.detail)}`).join('\n')}
faq:
${faq.map((item) => `  - question: ${q(item.question)}\n    answer: ${q(item.answer)}`).join('\n')}
lastVerified: ${q(TODAY)}
sources:
  - label: ${q(`Phasmophobia Wiki (Fandom) — ${g.name}`)}
    url: ${q(`https://phasmophobia.fandom.com/wiki/${wikiName}`)}
  - label: "Phasmophobia Wiki (Fextralife) — Evidence Cheat Sheet"
    url: "https://phasmophobia.wiki.fextralife.com/Evidence_Cheat_Sheet"
---

## Evidence

${evidenceSentence}${forcedSentence}${extraSentence}

## Tests that separate it

${tests.map((test) => `**${test.title}.** ${test.detail}`).join('\n\n')}

## Behavior

${g.ability} ${g.weakness}

## Speed and hunt threshold

${g.speedNotes}${typeof g.huntSanity === 'number' ? ` The base hunt sanity threshold is ${g.huntSanity}%.` : ''}

## Strategy

Treat the evidence set as the first filter, not the answer. Many ghosts share two or three evidence types, so confirm the full set before you commit. Once the evidence is locked in, use the ability and weakness above to separate the remaining candidates.

On reduced-evidence difficulties, keep the guaranteed evidence in view and use the [evidence tracker](/tools/evidence-tracker/) to apply the difficulty rules automatically.

## Related

Compare this entry with the [ghost cheat sheet](/ghost-cheat-sheet/) or open the [evidence tracker](/tools/evidence-tracker/) to narrow the hunt.
`;

  writeFileSync(`${dir}/${g.slug}.mdx`, frontmatter);
  console.log(`Created ${g.slug}.mdx`);
}

console.log(`Generated ${GHOSTS.length} ghost MDX files.`);
