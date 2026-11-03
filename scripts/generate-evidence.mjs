#!/usr/bin/env node
// Generate evidence MDX files (7 types)
import { writeFileSync, mkdirSync } from 'node:fs';

const GHOSTS = [
  { slug: 'deogen', name: 'Deogen' },
  { slug: 'moroi', name: 'Moroi' },
  { slug: 'obake', name: 'Obake' },
  { slug: 'hantu', name: 'Hantu' },
  { slug: 'goryo', name: 'Goryo' },
];

const EVIDENCE = [
  {
    slug: 'emf-5',
    name: 'EMF Level 5',
    summary: 'Detect electromagnetic energy spikes. Only a reading of 5 counts as evidence; levels 2–4 come from every ghost.',
    howToTest: ['Use the EMF Reader in the ghost room or near the ghost.', 'Watch for the red light and sound cue when the reader hits level 5.', 'Levels 2–4 are not evidence — only 5 counts.'],
    falsePositives: ['EMF readings of 2–4 occur with any ghost and are not evidence.', 'Electronics malfunction during hunts can spike readings.'],
    forcedBy: [],
  },
  {
    slug: 'spirit-box',
    name: 'Spirit Box',
    summary: 'Ask questions and listen for ghost responses through the Spirit Box.',
    howToTest: ['Turn off the lights in the room (optional but helps).', 'Hold the Spirit Box and ask questions like "Are you here?" or "Show yourself."', 'Listen for a voice response through the device.'],
    falsePositives: ['The ghost may not respond if multiple people are nearby.', 'Silence is not evidence of absence — try again or try alone.'],
    forcedBy: ['deogen', 'moroi'],
  },
  {
    slug: 'ultraviolet',
    name: 'Ultraviolet',
    summary: 'Reveal fingerprints, handprints, or footprints left by the ghost with a UV Light.',
    howToTest: ['Turn off lights for best visibility.', 'Shine the UV Light on doors, light switches, windows, and objects the ghost touched.', 'Look for glowing fingerprints or handprints.'],
    falsePositives: ["Obake may leave six-fingered handprints - still counts as Ultraviolet evidence.", "Some surfaces don't show prints clearly."],
    forcedBy: ['obake'],
  },
  {
    slug: 'ghost-orbs',
    name: 'Ghost Orbs',
    summary: 'See glowing orbs floating in the ghost\'s favorite room on video.',
    howToTest: ['Place a Video Camera in the ghost room and check the Truck monitor.', 'Use Head Gear with night vision for portable orb detection.', 'Orbs move with the ghost if the favorite room changes.'],
    falsePositives: ['Dust or insects can look like orbs — look for floating, glowing movement patterns.', 'Orbs only appear in the ghost room.'],
    forcedBy: [],
  },
  {
    slug: 'ghost-writing',
    name: 'Ghost Writing',
    summary: 'Find writing left in a Ghost Writing Book placed in a room.',
    howToTest: ['Place Ghost Writing Books in multiple rooms.', 'Check books periodically for writing appearing on pages.', 'Writing can appear even when no one is in the room.'],
    falsePositives: ['Writing may take time to appear — be patient.', 'Some ghosts write more frequently than others.'],
    forcedBy: [],
  },
  {
    slug: 'freezing-temperatures',
    name: 'Freezing Temperatures',
    summary: 'Detect temperatures below 0°C (32°F) with a Thermometer.',
    howToTest: ['Use the Thermometer in various rooms to find cold spots.', 'Watch your breath — visible breath appears at 5°C or colder, but only below 0°C counts as evidence.', 'The ghost room is typically the coldest.'],
    falsePositives: ['Any ghost cools its current room to 1°C — this is not freezing.', 'Visible breath starts at 5°C but is not evidence.'],
    forcedBy: ['hantu'],
  },
  {
    slug: 'dots-projector',
    name: 'D.O.T.S. Projector',
    summary: 'See the ghost\'s silhouette as it walks through the D.O.T.S. grid.',
    howToTest: ['Place the D.O.T.S. Projector where the ghost is active.', 'Watch through the projector grid or a Video Camera for a human silhouette walking.', 'Ghost turns walks into a 6-second silhouette.'],
    falsePositives: ['Some ghosts (Phantom, Oni, Deogen, Shade, Goryo) don\'t show silhouettes through D.O.T.S. even if it\'s their evidence.', 'Silhouette must be a full human shape walking through the grid.'],
    forcedBy: ['goryo'],
  },
];

const dir = 'src/content/evidence';
mkdirSync(dir, { recursive: true });

const TODAY = new Date().toISOString();

for (const e of EVIDENCE) {
  const q = JSON.stringify;
  const forced = e.forcedBy.length > 0 ? `Guaranteed visible for: ${e.forcedBy.map(s => { const g = GHOSTS.find(x => x.slug === s); return g ? g.name : s; }).join(', ')}.` : '';
  const forcedSlugs = e.forcedBy.map(s => `"${s}"`).join(', ');

  const frontmatter = `---
name: ${q(e.name)}
slug: ${q(e.slug)}
summary: ${q(e.summary)}
howToTest: [${e.howToTest.map(q).join(', ')}]
falsePositives: [${e.falsePositives.map(q).join(', ')}]
forcedBy: [${forcedSlugs}]
lastVerified: "${TODAY}"
sources:
  - label: "Phasmophobia Wiki (Fandom) — Evidence"
    url: "https://phasmophobia.fandom.com/wiki/Evidence"
  - label: "Phasmophobia Wiki (Fextralife) — Evidence Cheat Sheet"
    url: "https://phasmophobia.wiki.fextralife.com/Evidence_Cheat_Sheet"
---

${e.summary}

## How to Test

${e.howToTest.map(t => `- ${t}`).join('\n')}

## False Positives

${e.falsePositives.map(t => `- ${t}`).join('\n')}

${forced ? `## Guaranteed Evidence\n${forced}\n` : ''}

## Related Ghosts

Ghosts that can leave ${e.name} as evidence: see the [Evidence Cheat Sheet](/ghost-cheat-sheet/).
`;

  writeFileSync(`${dir}/${e.slug}.mdx`, frontmatter);
  console.log(`Created ${e.slug}.mdx`);
}

console.log(`Generated ${EVIDENCE.length} evidence MDX files.`);
