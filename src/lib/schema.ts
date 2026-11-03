export type EvidenceId = 'emf-5' | 'spirit-box' | 'ultraviolet' | 'ghost-orbs' | 'ghost-writing' | 'freezing-temperatures' | 'dots-projector';

export const EVIDENCE_IDS: readonly EvidenceId[] = [
  'emf-5',
  'spirit-box',
  'ultraviolet',
  'ghost-orbs',
  'ghost-writing',
  'freezing-temperatures',
  'dots-projector',
];

export type GhostConfig = {
  evidence: Set<EvidenceId>;
  extraEvidence: Set<EvidenceId>;
  guaranteedEvidence: EvidenceId | null;
};

export type TrackerState = {
  mode: 'normal' | 'nightmare' | 'insanity' | 'custom';
  shown: number;
  found: Set<EvidenceId>;
  ruledOut: Set<EvidenceId>;
};

export type Candidate = {
  slug: string;
  name: string;
  matchingFound: number;
};
