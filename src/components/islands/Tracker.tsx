import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { getCandidates } from '../../lib/tracker';
import type { EvidenceId } from '../../lib/schema';

const EVIDENCE: { id: EvidenceId; label: string }[] = [
  { id: 'emf-5', label: 'EMF Level 5' },
  { id: 'spirit-box', label: 'Spirit Box' },
  { id: 'ultraviolet', label: 'Ultraviolet' },
  { id: 'ghost-orbs', label: 'Ghost Orbs' },
  { id: 'ghost-writing', label: 'Ghost Writing' },
  { id: 'freezing-temperatures', label: 'Freezing Temperatures' },
  { id: 'dots-projector', label: 'D.O.T.S. Projector' },
];

const STORAGE_KEY = 'deadair.tracker.v1';

export interface GhostInput {
  slug: string;
  name: string;
  number: number;
  evidence: string[];
  extraEvidence: string[];
  guaranteedEvidence: string | null;
}

interface Props {
  ghosts: GhostInput[];
}

type Mode = 'normal' | 'nightmare' | 'insanity' | 'custom';
type ChipState = 'neutral' | 'found' | 'ruled';

const MODES: { id: Mode; label: string; shown: number }[] = [
  { id: 'normal', label: 'Normal', shown: 3 },
  { id: 'nightmare', label: 'Nightmare', shown: 2 },
  { id: 'insanity', label: 'Insanity', shown: 1 },
  { id: 'custom', label: 'Custom', shown: 2 },
];

function parseIds(value: string | null): Set<EvidenceId> {
  if (!value) return new Set();
  return new Set(
    value
      .split(',')
      .map((id) => id.trim())
      .filter((id): id is EvidenceId => EVIDENCE.some((item) => item.id === id))
  );
}

export default function Tracker({ ghosts }: Props) {
  const [mode, setMode] = useState<Mode>('normal');
  const [customShown, setCustomShown] = useState(2);
  const [found, setFound] = useState<Set<EvidenceId>>(new Set());
  const [ruledOut, setRuledOut] = useState<Set<EvidenceId>>(new Set());
  const [copied, setCopied] = useState(false);
  const hydrated = useRef(false);

  const shown = mode === 'custom' ? customShown : MODES.find((item) => item.id === mode)?.shown ?? 3;
  const ruledEnabled = shown >= 3;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextMode = (params.get('mode') as Mode | null) ?? 'normal';
    const validMode = MODES.some((item) => item.id === nextMode) ? nextMode : 'normal';
    const nextShown = Number(params.get('shown'));
    const has = parseIds(params.get('has'));
    const not = parseIds(params.get('not'));

    if (has.size > 0 || not.size > 0 || params.has('mode')) {
      setMode(validMode);
      if (Number.isInteger(nextShown) && nextShown >= 0 && nextShown <= 3) setCustomShown(nextShown);
      setFound(has);
      setRuledOut(validMode === 'normal' || (validMode === 'custom' && (Number.isInteger(nextShown) && nextShown >= 3)) ? not : new Set());
    } else {
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as
          | { mode?: Mode; shown?: number; found?: string[]; ruledOut?: string[] }
          | null;
        if (stored) {
          if (stored.mode && MODES.some((item) => item.id === stored.mode)) setMode(stored.mode);
          if (typeof stored.shown === 'number' && stored.shown >= 0 && stored.shown <= 3) setCustomShown(stored.shown);
          setFound(parseIds((stored.found ?? []).join(',')));
          setRuledOut(parseIds((stored.ruledOut ?? []).join(',')));
        }
      } catch {
        // Ignore malformed storage.
      }
    }
    hydrated.current = true;
  }, []);

  const candidates = useMemo(() => {
    const configs = ghosts.map((ghost) => ({
      slug: ghost.slug,
      name: ghost.name,
      config: {
        evidence: new Set(ghost.evidence as EvidenceId[]),
        extraEvidence: new Set(ghost.extraEvidence as EvidenceId[]),
        guaranteedEvidence: (ghost.guaranteedEvidence as EvidenceId | null) ?? null,
      },
    }));
    return getCandidates(configs, { mode, shown, found, ruledOut });
  }, [ghosts, mode, shown, found, ruledOut]);

  useEffect(() => {
    if (!hydrated.current) return;
    const params = new URLSearchParams();
    if (mode !== 'normal') params.set('mode', mode);
    if (mode === 'custom') params.set('shown', String(customShown));
    if (found.size > 0) params.set('has', Array.from(found).join(','));
    if (ruledEnabled && ruledOut.size > 0) params.set('not', Array.from(ruledOut).join(','));
    const query = params.toString();
    const url = `${window.location.pathname}${query ? `?${query}` : ''}`;
    window.history.replaceState(null, '', url);

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ mode, shown: customShown, found: Array.from(found), ruledOut: Array.from(ruledOut) })
      );
    } catch {
      // Storage can be unavailable in private mode.
    }
  }, [mode, customShown, found, ruledOut, ruledEnabled]);

  function changeMode(next: Mode) {
    setMode(next);
    if (next !== 'normal' && next !== 'custom') {
      setRuledOut(new Set());
    }
    if (next === 'custom' && customShown < 3) {
      setRuledOut(new Set());
    }
  }

  function changeCustomShown(value: number) {
    setCustomShown(value);
    if (value < 3) setRuledOut(new Set());
  }

  function cycleChip(id: EvidenceId) {
    const state: ChipState = found.has(id) ? 'found' : ruledOut.has(id) ? 'ruled' : 'neutral';

    if (state === 'neutral') {
      setFound((prev) => new Set(prev).add(id));
      setRuledOut((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      return;
    }

    if (state === 'found') {
      const next = new Set(found);
      next.delete(id);
      setFound(next);
      if (ruledEnabled) setRuledOut((prev) => new Set(prev).add(id));
      return;
    }

    const next = new Set(ruledOut);
    next.delete(id);
    setRuledOut(next);
  }

  function reset() {
    setFound(new Set());
    setRuledOut(new Set());
    setMode('normal');
    setCustomShown(2);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="tracker">
      <div className="tracker-panel">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h2 className="mb-0">Difficulty</h2>
          <div className="mode-tabs" role="group" aria-label="Difficulty mode">
            {MODES.map((item) => (
              <button
                type="button"
                key={item.id}
                className="mode-tab"
                aria-pressed={mode === item.id}
                onClick={() => changeMode(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {mode === 'custom' && (
          <div className="field mt-2">
            <label htmlFor="custom-shown">Evidence shown: {customShown}</label>
            <input
              id="custom-shown"
              type="range"
              min={0}
              max={3}
              step={1}
              value={customShown}
              onChange={(event) => changeCustomShown(Number((event.currentTarget as HTMLInputElement).value))}
            />
          </div>
        )}

        <p className="tracker-hint mt-2">
          {ruledEnabled
            ? 'Click once for found, twice to rule out. Absence counts as evidence at three shown.'
            : 'Ruled-out evidence is disabled below three shown — a missing evidence type proves nothing on reduced difficulties.'}
        </p>
      </div>

      <div className="tracker-panel">
        <h2>Evidence</h2>
        <div className="evidence-grid">
          {EVIDENCE.map((item) => {
            const state: ChipState = found.has(item.id) ? 'found' : ruledOut.has(item.id) ? 'ruled' : 'neutral';
            return (
              <button
                type="button"
                key={item.id}
                className="evidence-toggle"
                data-state={state}
                aria-pressed={state === 'found'}
                aria-label={`${item.label}: ${state}`}
                disabled={state === 'ruled' ? !ruledEnabled : false}
                onClick={() => cycleChip(item.id)}
              >
                <span>{item.label}</span>
                <span aria-hidden="true">
                  {state === 'found' ? 'FOUND' : state === 'ruled' ? 'RULED OUT' : '—'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="tracker-panel">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <h2 className="mb-0">
            {candidates.length} {candidates.length === 1 ? 'candidate' : 'candidates'}
          </h2>
          <div className="tracker-actions">
            <button type="button" className="btn" onClick={copyLink}>
              {copied ? 'Link copied' : 'Copy share link'}
            </button>
            <button type="button" className="btn" onClick={reset}>
              Reset
            </button>
          </div>
        </div>

        {found.size === 0 && candidates.length === ghosts.length ? (
          <p className="muted">
            Select the evidence you have confirmed to narrow the list. Every ghost is still a
            candidate.
          </p>
        ) : candidates.length === 0 ? (
          <div className="callout callout-alarm">
            <strong>No match</strong>
            <p className="mb-0">
              That combination does not belong to any ghost. Recheck a ruled-out reading or switch
              difficulty.
            </p>
          </div>
        ) : (
          <ul className="candidate-list">
            {candidates.map((candidate) => (
              <li key={candidate.slug}>
                <span>
                  <a href={`/ghosts/${candidate.slug}/`}>{candidate.name}</a>
                </span>
                <a className="text-sm" href={`/ghosts/${candidate.slug}/`}>
                  Open entry
                </a>
              </li>
            ))}
          </ul>
        )}

        <p className="url-state mt-2">
          State is written to the URL and saved on this device.
        </p>
      </div>
    </div>
  );
}
