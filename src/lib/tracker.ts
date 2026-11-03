// Tracker pure logic — NO runtime API calls, NO database fetches.
// All data comes from props; this is a unit-tested function.

import type { EvidenceId } from './schema';

/** The 7 canonical evidence IDs. */
export type EvidenceSet = Set<EvidenceId>;

/** A ghost's evidence configuration. */
export type GhostConfig = {
  /** The ghost's 3 main evidence IDs (always distinct). */
  evidence: EvidenceSet;
  /** Extra evidence — only The Mimic has ['ghost-orbs']. */
  extraEvidence: EvidenceSet;
  /** Ghosts that always keep this evidence on reduced difficulties
   * (Nightmare/Insanity/Custom 0-1-2). Null for all other ghosts. */
  guaranteedEvidence: EvidenceId | null;
};

/** Tracker state passed from the island. */
export type TrackerState = {
  /** The active mode. */
  mode: 'normal' | 'nightmare' | 'insanity' | 'custom';
  /** Number of main evidence pieces shown in the active mode.
   * 3 (normal), 2 (nightmare), 1 (insanity), or custom 0-3. */
  shown: number;
  /** Evidence the user has found (selected chips in "found" state). */
  found: EvidenceSet;
  /** Evidence the user has ruled out (selected chips in "ruled out" state).
   *  Only meaningful when shown === 3; ignored otherwise. */
  ruledOut: EvidenceSet;
};

/** A ghost is a candidate if its observable set can accommodate
 * the found evidence and does not conflict with ruled-out evidence. */
export type Candidate = {
  slug: string;
  name: string;
  /** How many of the user's found evidence are consistent with this ghost. */
  matchingFound: number;
};

/**
 * Returns the subset of ghosts that match the current tracker state.
 *
 * Algorithm (per spec §7):
 * 1. For each ghost, enumerate all possible observable sets O given:
 *    - mode's visibleCount (3/2/1 or custom shown)
 *    - the ghost's guaranteedEvidence (must be in O if present)
 *    - Mimic's orbs are always in O
 * 2. A ghost matches when found ⊆ O and ruledOut does not intersect O.
 *    In reduced modes (shown < 3), ruledOut is ignored (absence proves nothing).
 * 3. Return all matching ghosts, sorted alphabetically.
 */
export function getCandidates(
  ghosts: ReadonlyArray<{
    slug: string;
    name: string;
    config: GhostConfig;
  }>,
  state: TrackerState
): Candidate[] {
  const { mode, shown, found, ruledOut } = state;
  const foundSet = new Set(found);
  const ruledOutSet = new Set(ruledOut);

  // Number of MAIN evidence pieces shown per difficulty mode (capped at 3).
  const mainShown =
    mode === 'custom' ? Math.min(Math.max(shown, 0), 3) :
    mode === 'normal' ? 3 :
    mode === 'nightmare' ? 2 :
    mode === 'insanity' ? 1 : 0;

  // Helper: generate all subsets of `main` of exactly size k.
  function genSubsetsOfSize(main: EvidenceId[], k: number): EvidenceSet[] {
    const result: EvidenceSet[] = [];
    if (k === 0) {
      result.push(new Set());
      return result;
    }
    if (k > main.length) return result;

    function gen(elems: EvidenceId[], remaining: number, start: number, current: EvidenceId[]) {
      if (remaining === 0) {
        result.push(new Set(current));
        return;
      }
      for (let i = start; i < elems.length; i++) {
        const e = elems[i];
        current.push(e);
        gen(elems, remaining - 1, i + 1, current);
        current.pop();
      }
    }
    gen(main, k, 0, []);
    return result;
  }

  // Helper: observable subsets for a single ghost config
  function observableSubsets(config: GhostConfig): EvidenceSet[] {
    const mainArr = Array.from(config.evidence);
    const subsets: EvidenceSet[] = [];

    // How many main pieces this ghost shows
    const subCount = Math.min(mainShown, mainArr.length);
    const mainSubsets = genSubsetsOfSize(mainArr, subCount);

    // Guaranteed evidence must appear in every observable subset (if present)
    if (config.extraEvidence.size === 0) {
      // Non-Mimic: observable is just main subsets (guaranteed constrained)
      for (const s of mainSubsets) {
        if (config.guaranteedEvidence !== null && !s.has(config.guaranteedEvidence)) continue;
        subsets.push(s);
      }
    } else {
      // Mimic: extra evidence (Ghost Orbs) is ALWAYS observable,
      // plus each main subset. Even when mainShown = 0, Mimic shows orbs.
      for (const s of mainSubsets) {
        subsets.push(new Set([...config.extraEvidence, ...s]));
      }
    }

    return subsets;
  }

  // Collect candidates
  const candidates: Candidate[] = [];

  for (const ghost of ghosts) {
    const subsets = observableSubsets(ghost.config);
    let matches = false;

    for (const O of subsets) {
      // Check found ⊆ O
      let foundOK = true;
      for (const e of foundSet) {
        if (!O.has(e)) { foundOK = false; break; }
      }
      if (!foundOK) continue;

      // Check ruledOut ∩ O = ∅
      // In reduced modes (shown < 3), ruledOut is disabled — absence proves nothing
      const shownLt3 = mainShown < 3;
      if (!shownLt3) {
        let conflict = false;
        for (const e of ruledOutSet) {
          if (O.has(e)) { conflict = true; break; }
        }
        if (conflict) continue;
      }

      matches = true;
      break; // one valid O is enough
    }

    if (matches) {
      candidates.push({
        slug: ghost.slug,
        name: ghost.name,
        matchingFound: foundSet.size,
      });
    }
  }

  // Sort alphabetically by name
  candidates.sort((a, b) => a.name.localeCompare(b.name));

  return candidates;
}
