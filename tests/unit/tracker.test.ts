import { describe, expect, it } from 'vitest';
import { getCandidates } from '../../src/lib/tracker';
import type { EvidenceId } from '../../src/lib/schema';
import { GHOSTS } from '../../scripts/ghost-data.mjs';

type GhostData = (typeof GHOSTS)[number];

const fixtures = GHOSTS.map((ghost: GhostData) => ({
  slug: ghost.slug,
  name: ghost.name,
  config: {
    evidence: new Set(ghost.evidence as EvidenceId[]),
    extraEvidence: new Set((ghost.extra ? [ghost.extra] : []) as EvidenceId[]),
    guaranteedEvidence: (ghost.forced as EvidenceId | undefined) ?? null,
  },
}));

const names = (state: Parameters<typeof getCandidates>[1]) =>
  getCandidates(fixtures, state).map((candidate) => candidate.name);

const found = (...ids: EvidenceId[]) => new Set(ids);
const ruled = (...ids: EvidenceId[]) => new Set(ids);

describe('getCandidates', () => {
  it('returns every ghost when nothing is selected on normal difficulty', () => {
    expect(names({ mode: 'normal', shown: 3, found: found(), ruledOut: ruled() })).toHaveLength(30);
  });

  it('keeps only ghosts with the confirmed evidence on normal difficulty', () => {
    const result = names({ mode: 'normal', shown: 3, found: found('spirit-box'), ruledOut: ruled() });
    expect(result).toHaveLength(14);
    expect(result).toContain('Deogen');
    expect(result).toContain('The Mimic');
    expect(result).not.toContain('Hantu');
  });

  it('intersects multiple confirmed evidence types', () => {
    const result = names({
      mode: 'normal',
      shown: 3,
      found: found('spirit-box', 'emf-5'),
      ruledOut: ruled(),
    });
    expect(result).toContain('Dayan');
    expect(result).toContain('Spirit');
    expect(result).toContain('The Twins');
    expect(result).not.toContain('Deogen');
  });

  it('removes ghosts that require ruled-out evidence on normal difficulty', () => {
    const result = names({
      mode: 'normal',
      shown: 3,
      found: found('spirit-box'),
      ruledOut: ruled('emf-5'),
    });
    expect(result).not.toContain('Dayan');
    expect(result).not.toContain('Spirit');
    expect(result).toContain('Deogen');
  });

  it('ignores ruled-out evidence on reduced difficulties', () => {
    const normal = names({ mode: 'normal', shown: 3, found: found(), ruledOut: ruled('emf-5') });
    const nightmare = names({ mode: 'nightmare', shown: 2, found: found(), ruledOut: ruled('emf-5') });
    expect(normal.length).toBeLessThan(nightmare.length);
    expect(nightmare).toHaveLength(30);
  });

  it('requires guaranteed evidence to appear in reduced-mode subsets', () => {
    const withOrbs = names({
      mode: 'nightmare',
      shown: 2,
      found: found('ghost-orbs'),
      ruledOut: ruled(),
    });
    expect(withOrbs).toContain('Hantu');

    const withOrbsAndUv = names({
      mode: 'nightmare',
      shown: 2,
      found: found('ghost-orbs', 'ultraviolet'),
      ruledOut: ruled(),
    });
    expect(withOrbsAndUv).not.toContain('Hantu');
  });

  it('always shows Ghost Orbs for The Mimic, even with zero evidence shown', () => {
    const result = names({
      mode: 'custom',
      shown: 0,
      found: found('ghost-orbs'),
      ruledOut: ruled(),
    });
    expect(result).toEqual(['The Mimic']);
  });

  it('returns all ghosts with zero shown and no selections', () => {
    expect(names({ mode: 'custom', shown: 0, found: found(), ruledOut: ruled() })).toHaveLength(30);
  });

  it('returns no candidates for an impossible combination', () => {
    expect(
      names({ mode: 'normal', shown: 3, found: found('spirit-box'), ruledOut: ruled('spirit-box') })
    ).toHaveLength(0);
  });

  it('sorts candidates alphabetically', () => {
    const result = names({ mode: 'normal', shown: 3, found: found(), ruledOut: ruled() });
    expect(result).toEqual([...result].sort((a, b) => a.localeCompare(b)));
  });
});
