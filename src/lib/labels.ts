import type { EvidenceId } from './schema';

export const EVIDENCE_LABELS: Record<EvidenceId, string> = {
  'emf-5': 'EMF Level 5',
  'spirit-box': 'Spirit Box',
  ultraviolet: 'Ultraviolet',
  'ghost-orbs': 'Ghost Orbs',
  'ghost-writing': 'Ghost Writing',
  'freezing-temperatures': 'Freezing Temperatures',
  'dots-projector': 'D.O.T.S. Projector',
};

export const EVIDENCE_SHORT: Record<EvidenceId, string> = {
  'emf-5': 'EMF 5',
  'spirit-box': 'Spirit Box',
  ultraviolet: 'UV',
  'ghost-orbs': 'Orbs',
  'ghost-writing': 'Writing',
  'freezing-temperatures': 'Freezing',
  'dots-projector': 'D.O.T.S.',
};

export function evidenceLabel(id: string): string {
  return EVIDENCE_LABELS[id as EvidenceId] ?? id;
}

export function evidenceShort(id: string): string {
  return EVIDENCE_SHORT[id as EvidenceId] ?? id;
}

export function ghostPath(slug: string): string {
  return `/ghosts/${slug}/`;
}

export function evidencePath(slug: string): string {
  return `/evidence/${slug}/`;
}

export function comparisonPath(slug: string): string {
  return `/compare/${slug}/`;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(iso));
}
