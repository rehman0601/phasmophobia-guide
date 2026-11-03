import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

export type EvidenceId = 'emf-5' | 'spirit-box' | 'ultraviolet' | 'ghost-orbs' | 'ghost-writing' | 'freezing-temperatures' | 'dots-projector';

export const EVIDENCE_IDS: readonly EvidenceId[] = [
  'emf-5', 'spirit-box', 'ultraviolet', 'ghost-orbs', 'ghost-writing', 'freezing-temperatures', 'dots-projector',
];

export const GhostSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  number: z.number().int().min(1),
  aliases: z.array(z.string()),
  evidence: z.array(z.string()).length(3),
  extraEvidence: z.array(z.string()),
  guaranteedEvidence: z.string().nullable(),
  huntSanity: z.number().min(0).max(100).optional(),
  baseSpeed: z.number().min(0).max(3).optional(),
  speedNotes: z.string(),
  ability: z.string(),
  weakness: z.string(),
  tags: z.array(z.string()),
  idTests: z.array(z.object({ title: z.string(), detail: z.string() })),
  faq: z.array(z.object({ question: z.string(), answer: z.string() })),
  lastVerified: z.string().datetime(),
  sources: z.array(z.object({ label: z.string(), url: z.string().url() })),
});

export const EvidenceSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  summary: z.string(),
  howToTest: z.array(z.string()),
  falsePositives: z.array(z.string()),
  forcedBy: z.array(z.string()),
  lastVerified: z.string().datetime(),
  sources: z.array(z.object({ label: z.string(), url: z.string().url() })),
});

export const ComparisonSchema = z.object({
  ghostA: z.string(),
  ghostB: z.string(),
  title: z.string(),
  verdict: z.string(),
  lastVerified: z.string().datetime(),
  sources: z.array(z.object({ label: z.string(), url: z.string().url() })),
});

const ghosts = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/ghosts' }),
  schema: GhostSchema,
});
const evidence = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/evidence' }),
  schema: EvidenceSchema,
});
const comparisons = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/comparisons' }),
  schema: ComparisonSchema,
});

export const collections = { ghosts, evidence, comparisons };
