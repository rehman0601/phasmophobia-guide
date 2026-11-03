#!/usr/bin/env node
// Generate comparison MDX files (12 curated matchups)
import { writeFileSync, mkdirSync } from 'node:fs';

const COMPARISONS = [
  { slug: 'deogen-vs-revenant', ghostA: 'deogen', ghostB: 'revenant', title: 'Deogen vs Revenant', verdict: 'Deogen moves at 0.4 m/s when close — Revenant slows to 1.0 m/s only while hunting. Both share Ghost Writing and Freezing Temperatures.' },
  { slug: 'demon-vs-shade', ghostA: 'demon', ghostB: 'shade', title: 'Demon vs Shade', verdict: 'Demon hunts at 70% sanity (highest) — Shade hunts at 35% (lowest) and shies from groups. Both have Ghost Writing and Freezing Temperatures.' },
  { slug: 'the-twins-vs-the-mimic', ghostA: 'the-twins', ghostB: 'the-mimic', title: 'The Twins vs The Mimic', verdict: 'The Twins hunt at 1.5 m/s — The Mimic is faster at 1.7 m/s and always shows Ghost Orbs. Both have EMF Level 5, Spirit Box, Freezing Temperatures.' },
  { slug: 'banshee-vs-moroi', ghostA: 'banshee', ghostB: 'moroi', title: 'Banshee vs Moroi', verdict: 'Banshee targets one player and hunts from D.O.T.S. — Moroi speeds up as sanity drops and is guaranteed Spirit Box. Both have Spirit Box and Ghost Orbs.' },
  { slug: 'phantom-vs-onryo', ghostA: 'phantom', ghostB: 'onryo', title: 'Phantom vs Onryo', verdict: 'Phantom disappears when photographed — Onryo blows out candles and hunts at 60% sanity. Both have Spirit Box and Ultraviolet.' },
  { slug: 'goryo-vs-obake', ghostA: 'goryo', ghostB: 'obake', title: 'Goryo vs Obake', verdict: 'Goryo only shows on D.O.T.S. via camera — Obake leaves six-fingered prints and changes form. Both have EMF Level 5 and Ultraviolet.' },
  { slug: 'hantu-vs-thaye', ghostA: 'hantu', ghostB: 'thaye', title: 'Hantu vs Thaye', verdict: 'Hantu is slower in warm areas and guaranteed Freezing — Thaye slows down over time and has Ghost Orbs. Both have Ghost Orbs and Freezing Temperatures.' },
  { slug: 'mare-vs-yurei', ghostA: 'mare', ghostB: 'yurei', title: 'Mare vs Yurei', verdict: 'Mare hunts more in the dark — Yurei makes players lose sanity faster and both have Ghost Orbs. Both have Spirit Box and Ghost Writing.' },
  { slug: 'jinn-vs-raiju', ghostA: 'jinn', ghostB: 'raiju', title: 'Jinn vs Raiju', verdict: 'Jinn travels faster when far from players — Raiju speeds up near electronics. Both have EMF Level 5 and Ghost Orbs.' },
  { slug: 'oni-vs-yokai', ghostA: 'oni', ghostB: 'yokai', title: 'Oni vs Yokai', verdict: 'Oni is more active when players are together — Yokai hunts sooner when players talk. Both have EMF Level 5 and D.O.T.S.' },
  { slug: 'deildegast-vs-deogen', ghostA: 'deildegast', ghostB: 'deogen', title: 'Deildegast vs Deogen', verdict: 'Both move at 0.4 m/s and share Spirit Box and D.O.T.S. — Deildegast also has EMF Level 5, Deogen also has Ghost Writing.' },
  { slug: 'dayan-vs-kormos', ghostA: 'dayan', ghostB: 'kormos', title: 'Dayan vs Kormos', verdict: 'Dayan is always female — Kormos is not guaranteed either way. Both share Spirit Box and Ghost Orbs.' },
];

const dir = 'src/content/comparisons';
mkdirSync(dir, { recursive: true });

const TODAY = new Date().toISOString();

for (const c of COMPARISONS) {
  const frontmatter = `---
ghostA: "${c.ghostA}"
ghostB: "${c.ghostB}"
title: "${c.title}"
verdict: "${c.verdict}"
lastVerified: "${TODAY}"
sources:
  - label: "Phasmophobia Wiki (Fandom) — Ghost"
    url: "https://phasmophobia.fandom.com/wiki/Ghost"
  - label: "Phasmophobia Wiki (Fextralife) — Ghosts"
    url: "https://phasmophobia.wiki.fextralife.com/Ghosts"
---

# ${c.title}

${c.verdict}

## Shared Evidence

Both ghosts share evidence types that can make identification difficult on reduced-evidence difficulties.

## Differences

Review each ghost's individual page for detailed abilities, weaknesses, and hunt behavior.

## When to Suspect Each

Use the [Evidence Tracker](/tools/evidence-tracker/) to narrow down candidates based on evidence you've confirmed.

## Related

View both ghost pages and the [Evidence Cheat Sheet](/ghost-cheat-sheet/) for side-by-side comparison.
`;

  writeFileSync(`${dir}/${c.slug}.mdx`, frontmatter);
  console.log(`Created ${c.slug}.mdx`);
}

console.log(`Generated ${COMPARISONS.length} comparison MDX files.`);
