import { getCollection } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';
import { evidenceLabel } from '../../lib/labels';
import { comparisonDescription, evidenceDescription, ghostDescription, ogImageKey } from '../../lib/seo';

interface OgPage {
  title: string;
  description: string;
}

const [ghosts, evidence, comparisons] = await Promise.all([
  getCollection('ghosts'),
  getCollection('evidence'),
  getCollection('comparisons'),
]);

const pages: Record<string, OgPage> = {
  [ogImageKey('/')]: {
    title: 'DEAD AIR — Phasmophobia Field Guide',
    description:
      'Identify every ghost by evidence, speed, and hunt behavior. Track evidence, compare lookalikes, and narrow the hunt.',
  },
  [ogImageKey('/ghosts/')]: {
    title: 'All Phasmophobia Ghosts',
    description: 'Every ghost with evidence types, forced evidence, and identification notes.',
  },
  [ogImageKey('/evidence/')]: {
    title: 'Phasmophobia Evidence Types',
    description: 'How to test all seven evidence types and which ghosts force them.',
  },
  [ogImageKey('/compare/')]: {
    title: 'Phasmophobia Ghost Comparisons',
    description: 'Side-by-side guides for commonly confused ghosts.',
  },
  [ogImageKey('/tools/evidence-tracker/')]: {
    title: 'Phasmophobia Evidence Tracker',
    description: 'Select confirmed and ruled-out evidence to see which ghosts remain.',
  },
  [ogImageKey('/ghost-cheat-sheet/')]: {
    title: 'Phasmophobia Ghost Cheat Sheet',
    description: 'All 30 ghosts and seven evidence types in one matrix.',
  },
  [ogImageKey('/about/')]: {
    title: 'About DEAD AIR',
    description: 'Sources, editorial method, and correction policy for the DEAD AIR field guide.',
  },
  [ogImageKey('/changelog/')]: {
    title: 'DEAD AIR Changelog',
    description: 'Data corrections and site updates for the DEAD AIR Phasmophobia field guide.',
  },
};

for (const ghost of ghosts) {
  const name = ghost.data.name;
  pages[ogImageKey(`/ghosts/${ghost.data.slug}/`)] = {
    title: name,
    description: ghostDescription(name, ghost.data.evidence.map(evidenceLabel)),
  };
}

for (const item of evidence) {
  const name = evidenceLabel(item.data.slug);
  pages[ogImageKey(`/evidence/${item.data.slug}/`)] = {
    title: name,
    description: evidenceDescription(name),
  };
}

for (const item of comparisons) {
  pages[ogImageKey(`/compare/${item.id}/`)] = {
    title: item.data.title,
    description: comparisonDescription(
      pages[ogImageKey(`/ghosts/${item.data.ghostA}/`)]?.title ?? item.data.ghostA,
      pages[ogImageKey(`/ghosts/${item.data.ghostB}/`)]?.title ?? item.data.ghostB
    ),
  };
}

export const { getStaticPaths, GET } = await OGImageRoute({
  pages,
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    bgGradient: [
      [7, 9, 7],
      [14, 19, 13],
    ],
    border: { color: [163, 201, 121], width: 12, side: 'inline-start' },
    padding: 72,
    fonts: ['./src/assets/fonts/SpaceMono-Bold.ttf', './src/assets/fonts/SpaceMono-Regular.ttf'],
    font: {
      title: { color: [223, 229, 212], size: 68, weight: 'Bold', families: ['Space Mono'] },
      description: { color: [162, 174, 148], size: 30, weight: 'Normal', families: ['Space Mono'] },
    },
  }),
});
