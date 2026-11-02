# DEAD AIR — Phasmophobia Field Guide

**Design spec**
**Date:** 2026-11-02
**Status:** Approved
**Working directory:** `/Users/rehman/phasmophobia-guide`

---

## 1. Summary

DEAD AIR is a public, SEO-first Phasmophobia ghost guide. It pairs a found-footage "cursed tape" visual identity with fast, factual reference pages and practical in-game tools. The site is fully static, built with Astro and TypeScript, and deployed to Cloudflare Pages.

V1 is a ghost database and evidence toolkit:

- 30 ghost pages
- 7 evidence explainers
- an interactive evidence tracker with difficulty modes
- a printable ghost cheat sheet
- 12 curated ghost comparisons
- supporting home, index, about, and changelog pages

The writing voice is an in-world frame around clear, practical content: atmospheric chrome (REC marks, timestamps, entity numbers) but plain, skimmable guide prose.

---

## 2. Goals and success criteria

### Goals

1. Rank for core Phasmophobia queries: ghost names, "phasmophobia ghost list", "phasmophobia evidence tracker", "phasmophobia cheat sheet", evidence types, and curated "X vs Y" matchups.
2. Be faster, clearer, and better designed than the established wikis.
3. Give players a genuinely useful mid-game tool (tracker) that earns return visits and shares.
4. Stay accurate as the game updates through a deliberate, auditable data workflow.
5. Ship as a maintainable solo project with no backend and near-zero running cost.

### Success criteria

- All 57 indexable routes build statically and appear in the sitemap.
- Every page has a unique title, meta description, canonical URL, and OG image.
- Tracker logic passes the full mode matrix, including forced evidence and The Mimic's extra orbs.
- Lighthouse mobile targets: Performance ≥ 95, SEO = 100, Accessibility ≥ 95, Best Practices ≥ 95 on home, a ghost page, and the tracker.
- Content pages ship ≤ 10KB gzipped JavaScript; the tracker island ≤ 50KB gzipped.
- No serious or critical axe violations on key pages.
- No verbatim wiki prose; every content page lists sources and a last-verified date.
- Responsive from 360px to 1440px; cheat sheet prints legibly in black on white.

---

## 3. Non-goals (v1)

- Maps, equipment, cursed objects, difficulty guides, or challenge guides
- User accounts, saved loadouts, comments, or community features
- Live game or wiki API calls at request time
- Internationalization (English only; content structured to allow it later)
- Ads, affiliate links, or sponsorships
- Mobile apps
- Auto-generated comparison pages beyond the 12 curated matchups

---

## 4. Product scope and routes

### 4.1 Route map

| Route | Count | Purpose |
|---|---|---|
| `/` | 1 | Home: hero, start-here actions, featured ghosts, latest intel |
| `/ghosts/` | 1 | All 30 ghosts with search, filters, and sort |
| `/ghosts/[slug]/` | 30 | Individual ghost guides |
| `/evidence/` | 1 | Evidence hub explaining all 7 types |
| `/evidence/[slug]/` | 7 | Evidence explainers |
| `/tools/evidence-tracker/` | 1 | Interactive evidence tracker |
| `/ghost-cheat-sheet/` | 1 | Printable 30 × 7 evidence matrix |
| `/compare/` | 1 | Comparison hub |
| `/compare/[matchup]/` | 12 | Curated ghost matchups |
| `/about/` | 1 | About, methodology, sources, disclaimer, privacy note |
| `/changelog/` | 1 | Game-data and site update history |
| `404` | 1 | Not found |

**Totals:** 57 indexable pages + 1 `404` page = 58 built pages.

### 4.2 Global chrome

**Header:** DEAD AIR wordmark with a slow-pulsing REC dot; nav links Ghosts, Evidence, Tracker, Cheat Sheet; search field that opens a lightweight overlay; mobile menu.

**Footer:** short site description; route links; sources (Fandom wiki, Fextralife, PhasmoHelper); "Data last verified" date; disclaimer: not affiliated with Kinetic Games; copyright.

**Search:** a small client-side overlay filters ghost names and aliases from a build-time JSON index. Selecting a result navigates to its page. No network request, no third-party search service.

### 4.3 Page templates

#### Home

1. Full-bleed cam-frame hero: "DO NOT TURN OFF THE LIGHTS." with subline, primary CTA (Start the tracker), secondary CTA (Open the cheat sheet), and a status strip (`30 ENTITIES · 7 EVIDENCE TYPES · LAST VERIFIED <date>`).
2. "Start here" three-step path: identify evidence → narrow the ghost → confirm behavior.
3. Featured ghost cards (3–4, editorially chosen).
4. Popular comparisons (4 links).
5. Latest intel: three most recent changelog entries.
6. Compact explainer of the site's method and sources.

#### Ghost index (`/ghosts/`)

- Heading, intro copy, and live result count.
- Search by name or alias.
- Filters: evidence (multi-select, "has all"), tags, speed range, sanity range.
- Sort: alphabetical, speed ascending/descending, sanity ascending/descending.
- Entity-log rows on desktop, cards on mobile. Each row shows entity number, name, evidence glyphs + labels, speed, hunt sanity, and tags.
- URL-synced filter state.
- Empty state with a reset action.

#### Ghost page (`/ghosts/[slug]/`)

- Breadcrumbs.
- H1: `{Name} — Evidence, Behavior & How to Identify`.
- Summary sidebar (sticky desktop, card on mobile): evidence badges, forced-evidence marker, extra orbs marker for The Mimic, hunt sanity, base speed, tags, copy-link button, last verified.
- Sections: Overview; Evidence; Ability & Weakness; How to Identify (numbered tests); Hunt Behavior; Strategy; FAQ (2–4 questions, visible, no FAQ rich-result dependency); Related (evidence pages, ghosts sharing ≥2 evidence, relevant comparisons); Sources.
- Prev/next ghost navigation in journal order.

#### Evidence hub and evidence pages

- Hub: short explanation of evidence, mode rules, and cards for all 7 types.
- Explainer: H1 `{Evidence} — How to Find It & Which Ghosts Have It`; what it looks like, how to test, common false positives/misreads, forced-evidence notes, full list of ghosts with the evidence (linked), practical tips, related evidence, sources.

#### Evidence tracker (`/tools/evidence-tracker/`)

- Console header with mode selector and mode rules.
- Evidence chips for all 7 types, cycling unknown → found → ruled out (ruled out disabled on reduced-evidence modes).
- Remaining count and candidate list; eliminated ghosts shown collapsed/greyed.
- Mimic callout whenever Ghost Orbs are involved.
- Sticky actions: copy share link, reset.
- Help panel explaining modes, forced evidence, and The Mimic.

#### Cheat sheet (`/ghost-cheat-sheet/`)

- Static matrix: 30 rows × 7 evidence columns; sticky header and first column on desktop.
- Markers for forced evidence and The Mimic's extra orbs.
- Links from every ghost name to its page.
- Short mode-rules summary.
- Print stylesheet: white background, black text, no chrome, avoids row splitting.

#### Comparison pages (`/compare/[matchup]/`)

- H1 `{A} vs {B} — Key Differences`.
- Verdict callout.
- Side-by-side summary cards.
- Difference table (evidence, speed, sanity, ability, weakness, tells).
- "When to suspect A" and "When to suspect B" sections with scenario language.
- Related ghosts and comparisons.
- Minimum 250 words of unique analytical prose per comparison; no boilerplate swapping.

#### About and changelog

- About: what the site is, who it is for, method, sources, correction policy, privacy note (cookieless analytics only), non-affiliation disclaimer.
- Changelog: dated entries for game patches, data corrections, and new pages.

---

## 5. Brand and visual design

### 5.1 Identity

**Name:** DEAD AIR
**Tagline:** A Phasmophobia field guide.
**Vibe:** Found-footage evidence tape. Technical, tense, archival, and legible. Not gore, not neon "gamer" UI, not clichéd dripping-blood horror.

### 5.2 Color tokens

| Token | Value | Use |
|---|---|---|
| `--bg-0` | `#070907` | Page background |
| `--bg-1` | `#0B0E0A` | Alternate sections |
| `--panel` | `#0E120D` | Cards, panels |
| `--panel-raised` | `#141A13` | Hover/raised panels |
| `--ink` | `#DFE5D4` | Primary text |
| `--muted` | `#93A085` | Secondary text |
| `--faint` | `#5D6657` | Decorative borders/large-only text |
| `--line` | `rgba(223,229,212,0.14)` | Default borders |
| `--line-strong` | `rgba(223,229,212,0.28)` | Emphasized borders |
| `--signal` | `#A3C979` | Primary accent, links, focus, success |
| `--signal-bright` | `#C7EFA0` | Hover, high-emphasis accent |
| `--alarm` | `#C2564A` | Danger fills and icons |
| `--alarm-text` | `#E08A7E` | Danger text (AA on dark) |
| `--tape` | `#B7A54E` | Warning tape, caution callouts |

Rules:

- `--faint` is never used for body text.
- Color is never the only carrier of meaning; every state has a label, icon, or pattern.
- Evidence badges use the same neutral surface with a phosphor icon; evidence identity comes from icon + label, not seven different colors.

### 5.3 Typography

- **Display/chrome:** Space Mono 400/700, uppercase for labels and short headlines, tracking `0.08em–0.16em`.
- **Body:** Inter 400/600, 17–18px, line-height 1.7, max measure 72ch.
- **Scale:** H1 `clamp(2.2rem, 5vw, 4rem)`; H2 `1.75rem`; H3 `1.25rem`; label `0.6875rem` uppercase; code/timestamps `0.75rem`.
- **Hosting:** `@fontsource/space-mono` (400, 700) and `@fontsource-variable/inter` (latin subsets only). Preload the two primary files; `font-display: swap`; total font weight budget ≤ 90KB gzipped.
- **Fallbacks:** `ui-monospace, SFMono-Regular, Menlo, monospace` and `system-ui, -apple-system, Segoe UI, sans-serif`.

### 5.4 Texture and motion

- Scanlines and 2–3% film grain overlay only on hero and section-header panels, never over body text.
- Vignette on full-bleed hero and tracker console.
- Chrome details: `REC`, timestamps, `CAM 04`, entity numbers, warning-tape dividers for critical callouts.
- Motion: 150–250ms ease transitions; hover lifts, border glow, subtle scanline shift. No perpetual flicker or glitch loops. One slow REC pulse (2s) on the home hero.
- All non-essential motion disabled under `prefers-reduced-motion: reduce`.

### 5.5 Layout and components

- Max content width 1180px; 8pt spacing scale; 12-column grid.
- Breakpoints: 640px, 900px, 1180px.
- Components: `EvidenceBadge`, `GhostCard`, `EntityRow`, `StatBar`, `SectionLabel`, `Callout` (info/caution/alarm), `Breadcrumbs`, `TOC`, `ModeSelector`, `TrackerConsole`, `ShareActions`.
- Icons: custom inline SVG, 1.5px stroke, 24px viewBox, no icon library dependency. Seven evidence glyphs: EMF meter, sound waves, UV handprint, orb, pen, snowflake, DOTS grid.
- No raster imagery. Atmosphere comes from CSS gradients, SVG noise, and typography. OG images are generated at build (see §10).
- The tracker console uses a raised panel, grid lines, and a results rail; it must not sacrifice clarity for atmosphere.

### 5.6 Accessibility

- WCAG 2.2 AA contrast for all text and essential UI.
- Visible focus ring: 2px `--signal-bright` with 2px offset.
- Minimum 44×44px interactive targets.
- Evidence chips are buttons with `aria-pressed` and a visible text state.
- Semantic landmarks, one H1 per page, ordered headings, skip link.
- Tables use `<caption>`, `<th scope>`, and responsive wrappers.
- Tracker results announce changes via a polite live region.
- Keyboard support for all controls; no keyboard traps.
- Reduced-motion support; no auto-playing audio/video.

---

## 6. Content model

Content lives in Astro content collections with Zod schemas in `src/content.config.ts`. Prose is MDX; structured facts are frontmatter. All content is original prose; facts are sourced and credited.

### 6.1 Canonical evidence IDs

`emf-5`, `spirit-box`, `ultraviolet`, `ghost-orbs`, `ghost-writing`, `freezing-temperatures`, `dots-projector`.

Display names: EMF Level 5; Spirit Box; Ultraviolet; Ghost Orbs; Ghost Writing; Freezing Temperatures; D.O.T.S. Projector.

### 6.2 Ghost frontmatter

```ts
{
  name: string;                 // "Deogen"
  slug: string;                 // "deogen"
  number: number;               // alphabetical journal position, 1-30
  aliases: string[];            // ["deogen", "the deogen"]
  evidence: EvidenceId[];       // exactly 3, distinct
  extraEvidence: EvidenceId[];  // only The Mimic: ["ghost-orbs"]
  guaranteedEvidence: EvidenceId | null; // forced on reduced evidence
  huntSanity: number;           // percent, 0-100
  baseSpeed: number;            // m/s
  speedNotes: string;
  ability: string;              // factual summary, 1-3 sentences
  weakness: string;             // factual summary, 1-3 sentences
  tags: string[];               // e.g. "fast", "line-of-sight", "sanity-drain"
  idTests: { title: string; detail: string }[];
  faq: { question: string; answer: string }[];
  lastVerified: string;         // ISO date
  sources: { label: string; url: string }[];
}
```

Body sections: Overview, Evidence, How to Identify, Hunt Behavior, Strategy. FAQs stay in frontmatter for reuse in the page template. At least one source is required.

### 6.3 Evidence frontmatter

```ts
{
  name: string;
  slug: string;
  summary: string;
  howToTest: string[];          // ordered steps
  falsePositives: string[];     // e.g. EMF 2-4, breath without freezing
  forcedBy: string[];           // ghost slugs guaranteed to show it on reduced evidence
  lastVerified: string;
  sources: { label: string; url: string }[];
}
```

The list of ghosts that use the evidence is derived from the ghost collection, not duplicated.

### 6.4 Comparison frontmatter

```ts
{
  ghostA: string;               // slug
  ghostB: string;               // slug
  title: string;
  verdict: string;
  lastVerified: string;
  sources: { label: string; url: string }[];
}
```

The slug format is `{ghostA}-vs-{ghostB}` in alphabetical order. Exactly 12 comparisons exist in v1.

### 6.5 Data invariants (build fails on violation)

1. Exactly 30 ghosts, matching the canonical list in Appendix A.
2. Every ghost has exactly 3 distinct evidence IDs; The Mimic additionally has `ghost-orbs` in `extraEvidence`.
3. Only The Mimic has `extraEvidence`.
4. `guaranteedEvidence` is non-null only for Hantu, Goryo, Obake, Moroi, and Deogen, and is always one of that ghost's three evidence.
5. Slugs are unique, lowercase, and URL-safe. Names are unique.
6. `huntSanity` is 0–100; `baseSpeed` is between 0 and 3 m/s.
7. Exactly 12 comparisons; ghosts are distinct, both slugs exist, no duplicate pairs.
8. Every content entry has `lastVerified` (ISO date) and at least one source.
9. Every evidence ID used by a ghost exists in the canonical evidence list.
10. Every evidence type is used by at least one ghost and has an evidence page.

### 6.6 Editorial rules

- Write original prose. Do not copy sentences from the wiki or other guides.
- Facts (evidence sets, speeds, thresholds, abilities) are extracted and verified; descriptions and strategy are ours.
- State uncertainty when sources disagree; prefer in-game values and current patch data.
- No invented statistics, tier lists, or "win rate" claims.
- Use consistent terminology: "hunt sanity threshold", "base speed", "forced evidence", "extra evidence".
- Every page carries `lastVerified` and sources; updates are recorded in `/changelog/`.

---

## 7. Evidence tracker

### 7.1 State

- `mode`: `normal` (3 evidence shown), `nightmare` (2), `insanity` (1), `custom` (0–3 via `shown`).
- `found`: set of evidence IDs.
- `ruledOut`: set of evidence IDs (only enabled when `shown === 3`).
- `shown`: 0–3, used only in custom mode.

URL format: `?mode=normal`, `?mode=nightmare`, `?mode=insanity`, `?mode=custom&shown=2`, optionally `&has=emf-5,dots-projector&not=ultraviolet`.

URL precedence over localStorage. Persist the latest state in `localStorage` under `deadair.tracker.v1`. Canonicalize IDs and sort them for stable links.

### 7.2 Matching model

The tracker reasons from possible observable sets rather than ad-hoc rules. This keeps forced evidence and The Mimic correct.

For each ghost, define its main evidence set `E` (exactly 3) and its extra evidence `X` (empty, except The Mimic where `X = {ghost-orbs}`).

Given a mode with `shown = n`:

- **Non-Mimic:** the possible observable sets are all subsets of `E` of size `n`. If `guaranteedEvidence` is non-null, only subsets containing it are possible. For `n = 0`, the only possible set is empty.
- **The Mimic:** the possible observable sets are `X ∪ M`, where `M` is any subset of its 3 main evidence of size `n`. The extra Ghost Orbs are always present, including at `n = 0`.

A ghost is a candidate when **both** hold:

1. `found` is a subset of at least one possible observable set.
2. `ruledOut` does not intersect any possible observable set. In reduced-evidence modes (`n < 3`), `ruledOut` is not offered in the UI and is ignored by matching, because absence does not prove a hidden evidence is missing.

This model automatically handles:

- Finding all 3 evidence in Normal mode.
- A guaranteed evidence being forced into the observable set (e.g. if two evidence are found on Nightmare and neither is Hantu's Freezing Temperatures, Hantu is eliminated).
- The Mimic showing 3 total evidence on Nightmare (orbs + 2 main) and 2 total on Insanity (orbs + 1 main).
- The Mimic at 0 evidence still producing orbs.
- Finding 4 evidence in Normal mode leaving only The Mimic.

Implementation may enumerate every possible observable set (at most 3 subsets per ghost) or use an equivalent rule set; exhaustive enumeration is preferred for clarity and testability. Performance is irrelevant at 30 ghosts.

### 7.3 UI behavior

- Evidence chips cycle unknown → found → ruled out when `shown === 3`; unknown ↔ found in reduced modes.
- The mode selector explains how many evidence are visible and turns ruled-out off.
- Results show the remaining count, candidate rows linking to ghost pages, and eliminated ghosts collapsed.
- Ghost Orbs involvement shows a persistent Mimic callout: orbs always accompany The Mimic, and four evidence in Normal mode means The Mimic.
- Zero candidates shows a contradiction explainer listing the conflicting selections and a reset action; it never silently empties.
- Copy-link encodes the exact state; reset clears URL, localStorage, and UI.
- A help panel explains modes, forced evidence, and extra evidence.
- No accounts; state is device-local plus shareable URL.

### 7.4 URL and invalid input handling

- Unknown evidence IDs are ignored.
- Unknown modes fall back to `normal`.
- `shown` is clamped to 0–3 and only honored for custom mode.
- If `found` and `ruledOut` overlap, `found` wins and the overlap is removed from `ruledOut` with a visible notice.
- Impossible states (e.g. 3 main evidence found on Nightmare) are allowed as input and explained by the zero-result state rather than blocked.

---

## 8. Ghost index search and filters

- **Search:** case-insensitive substring match on name and aliases. No fuzzy matching in v1.
- **Evidence filter:** multi-select; ghost must contain all selected evidence. Optionally match "exactly these" via a toggle if it does not complicate the UI; v1 ships "has all" only.
- **Tag filter:** multi-select; any selected tag matches (OR).
- **Speed filter:** range slider, 0.4–1.7 m/s.
- **Sanity filter:** range slider, 35–75%.
- **Sort:** alphabetical (default), speed ascending/descending, sanity ascending/descending.
- URL params: `q`, `evidence`, `tag`, `speed-min`, `speed-max`, `sanity-min`, `sanity-max`, `sort`.
- All filtering is client-side over a build-time array of 30 ghosts. No network calls.
- Empty state: explains which filters are active and offers reset.

---

## 9. Data pipeline and update workflow

### 9.1 Source of truth

The committed MDX content is the source of truth. The wiki and third-party guides are verification sources, not runtime dependencies.

### 9.2 Sync script

`scripts/sync-wiki.mjs`:

- Queries the Fandom MediaWiki API (`https://phasmophobia.fandom.com/api.php`) for the 30 ghost pages and the Evidence and The Mimic pages.
- Uses a descriptive User-Agent, throttles to at most one request per second, and honors rate-limit responses.
- Caches raw responses in `.cache/wiki/` (gitignored).
- Extracts candidate facts (evidence sets, ability/weakness text, speed and sanity where present) and writes `.cache/wiki/proposal.json`.
- Never writes to `src/content/`.
- Prints a diff summary: added/removed ghosts, evidence changes, changed stats, and pages with missing fields.

`npm run data:check`:

- Validates all §6.5 invariants against committed content.
- Compares committed facts with the latest cached proposal when available.
- Reports source disagreements (e.g. Fandom's Evidence table omitted Deildegast at time of writing; Fextralife and PhasmoHelper both list EMF Level 5 / Ghost Writing / D.O.T.S. Projector).
- Exits non-zero on invariant failures; data drift is reported but does not fail CI unless invariants are broken.

### 9.3 Manual update workflow

1. Run `npm run data:sync` after a game patch.
2. Review the proposal diff and cross-check Fextralife and in-game values.
3. Update the relevant MDX files and `lastVerified` dates.
4. Update forced evidence, The Mimic rules, and speeds if the patch changed them.
5. Add a changelog entry with the game version/date.
6. Run tests and deploy.

### 9.4 Licensing and attribution

- Only facts are extracted. All explanatory prose is original.
- Sources are linked from each page and the about page.
- The site states it is unofficial and not affiliated with Kinetic Games.

---

## 10. SEO strategy

### 10.1 URLs

Static, keyword-led, no dates in URLs:

- `/ghosts/deogen/`
- `/evidence/emf-5/`
- `/tools/evidence-tracker/`
- `/ghost-cheat-sheet/`
- `/compare/deogen-vs-revenant/`

Trailing slashes are canonical. Apex/`www` and protocol redirects are handled at the host.

### 10.2 Titles and descriptions

All titles use the template `%s | DEAD AIR` and stay under ~60 characters.

| Page | Title pattern |
|---|---|
| Ghost | `{Name} — Evidence, Behavior & How to Identify` |
| Evidence | `{Evidence} — How to Find It & Ghosts` |
| Tracker | `Phasmophobia Evidence Tracker — All 30 Ghosts` |
| Cheat sheet | `Phasmophobia Ghost Cheat Sheet 2026` |
| Comparison | `{A} vs {B} — Key Differences` |

Every page has a hand-written meta description of 140–160 characters that states the page's specific value. Descriptions are required frontmatter and validated at build.

### 10.3 Canonicals and social

- Canonical base URL from the `SITE_URL` environment variable; defaults to the Cloudflare-assigned `*.pages.dev` URL in production and `http://localhost:4321` in development.
- One canonical per page; no pagination or duplicate paths.
- Open Graph and Twitter card tags on every page.
- Per-page 1200×630 OG image generated at build with `astro-og-canvas` (Satori) using the Cursed Tape template: entity number/name, evidence, last-verified date, DEAD AIR wordmark, scanlines. Fallback: a single branded default image if generation fails, with CI reporting the failure.

### 10.4 Structured data

- Home: `WebSite` + `VideoGame`.
- Ghost, evidence, comparison, cheat sheet: `Article` with `headline`, `description`, `dateModified`, `author` (DEAD AIR editorial), and `isAccessibleForFree: true`.
- Tracker: `WebApplication`.
- All content pages: `BreadcrumbList`.
- No `FAQPage` markup; FAQs are visible content, not a rich-result scheme.

### 10.5 Internal linking and crawlability

- Every ghost page links to its 3 evidence pages, 3 related ghosts sharing at least 2 evidence types, and a relevant comparison when one exists.
- Every evidence page lists all ghosts that use it.
- Cheat sheet links all 30 ghosts and 7 evidence types.
- Tracker results link to ghost pages.
- Every indexable page is reachable from home within 3 clicks.
- `@astrojs/sitemap` generates `/sitemap-index.xml`; `robots.txt` allows all and references the sitemap.
- No orphan pages; the SEO check script verifies internal links and sitemap coverage.

### 10.6 Freshness and trust

- Visible "Last verified" dates on every content page.
- `/changelog/` records data updates and corrections.
- `/about/` describes methodology, sources, and correction policy.
- No fake author bios; the site speaks as an editorial project.
- No ads in v1. Cookieless Cloudflare Web Analytics only, loaded when `PUBLIC_CF_ANALYTICS_TOKEN` is set, with a privacy note in `/about/`.

---

## 11. Performance

- Fully static output from Astro 7.x; no SSR adapter.
- Content pages: ≤ 10KB gzipped JS (search overlay + tiny enhancements only).
- Tracker island: ≤ 50KB gzipped.
- One CSS bundle, critical tokens inlined by Astro; no CSS framework.
- Fonts: three WOFF2 files max via Fontsource latin subsets, preloaded, `font-display: swap`.
- No raster images; all decoration is CSS/SVG.
- Islands hydrate on `client:visible` or `client:idle`; the tracker hydrates on `client:load`.
- Targets: LCP < 1.5s on mobile 4G, CLS < 0.05, INP < 200ms.
- CI checks bundle budgets; a failure blocks deploy.

---

## 12. Architecture and file structure

**Stack:** Astro 7.4.x (pin at scaffold time), TypeScript strict, React 19 islands via `@astrojs/react`, `@astrojs/sitemap`, `astro-og-canvas`, Fontsource, Vitest, Playwright, `gray-matter` (scripts/tests only). Package manager: npm. Node 24.

**Styling:** global token/base CSS, Astro scoped styles for static components, CSS Modules for React islands. No Tailwind.

**Data flow:** MDX frontmatter → content collections (Zod) → static pages and serializable props → tracker/filter islands. No runtime fetching.

```
phasmophobia-guide/
├── .github/workflows/ci.yml
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── .gitignore
├── public/
│   ├── robots.txt
│   ├── _headers
│   └── favicon.svg
├── scripts/
│   ├── sync-wiki.mjs
│   ├── check-data.mjs
│   ├── check-seo.mjs
│   └── crawl-links.mjs
├── src/
│   ├── components/
│   │   ├── astro/        # Header, Footer, GhostCard, EvidenceBadge, ...
│   │   └── islands/      # Tracker.tsx, GhostFilters.tsx, SearchOverlay.tsx
│   ├── content/
│   │   ├── ghosts/       # 30 .mdx
│   │   ├── evidence/     # 7 .mdx
│   │   └── comparisons/  # 12 .mdx
│   ├── data/
│   │   ├── evidence.ts   # canonical evidence metadata
│   │   └── tags.ts
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   └── ContentLayout.astro
│   ├── lib/
│   │   ├── tracker.ts    # pure matching logic
│   │   ├── filter.ts     # search/filter logic
│   │   ├── seo.ts        # JSON-LD builders
│   │   └── schema.ts     # shared Zod schemas
│   ├── pages/
│   │   ├── index.astro
│   │   ├── ghosts/index.astro
│   │   ├── ghosts/[slug].astro
│   │   ├── evidence/index.astro
│   │   ├── evidence/[slug].astro
│   │   ├── tools/evidence-tracker.astro
│   │   ├── ghost-cheat-sheet.astro
│   │   ├── compare/index.astro
│   │   ├── compare/[matchup].astro
│   │   ├── about.astro
│   │   ├── changelog.astro
│   │   └── 404.astro
│   ├── styles/
│   │   ├── tokens.css
│   │   └── base.css
│   └── content.config.ts
├── tests/
│   ├── unit/
│   └── e2e/
└── docs/superpowers/specs/2026-11-02-dead-air-design.md
```

---

## 13. Testing and verification

### Unit (Vitest)

- Tracker matching across all modes:
  - Normal with 0–3 found evidence; negative evidence.
  - Nightmare and Insanity, including forced evidence (Hantu, Goryo, Obake, Moroi, Deogen).
  - Custom 0–3.
  - The Mimic: extra orbs always present; 4 evidence in Normal; 3 total in Nightmare; 2 total in Insanity; orbs at 0 evidence.
  - Contradictory and impossible inputs.
- URL serialization/parsing and canonical ID ordering.
- Search/filter logic, including aliases and combined filters.
- Data invariants from §6.5, reading frontmatter with `gray-matter`.

### End-to-end (Playwright, Chromium)

- Home → ghost page → evidence page navigation.
- Ghost index search and filter flows, including URL round-trip.
- Tracker: select evidence in Normal; switch modes; forced-evidence scenario; Mimic scenario; copy link; reset; zero-result state.
- Mobile menu and sticky actions at 390px.
- Cheat sheet print media (no clipped columns, black on white).
- 404 page.

### Accessibility

- `@axe-core/playwright` on home, ghost page, tracker, and cheat sheet; fail on serious/critical issues.
- Keyboard-only passes for navigation, filters, tracker chips, and mode selector.

### SEO and links

- `scripts/check-seo.mjs` asserts on every built page: one title, one meta description, one canonical, one H1, OG tags, valid JSON-LD, and description length.
- Sitemap coverage equals the indexable route list.
- `scripts/crawl-links.mjs` verifies no broken internal links and every indexable page is within 3 clicks of home.
- Bundle-size assertions for content pages and the tracker island.

### CI (GitHub Actions)

On pull requests and pushes:

1. `npm ci`
2. `npm run check` (`astro check`)
3. `npm run test:unit`
4. `npm run build`
5. `npm run test:e2e` (Playwright Chromium)
6. `npm run check:seo`
7. `npm run check:links`
8. `npm run check:budgets`

`main` deploys to Cloudflare Pages after checks pass.

---

## 14. Deployment and operations

- **Host:** Cloudflare Pages, static `dist/`, project name `dead-air`.
- **CI deploy:** `wrangler pages deploy dist --project-name dead-air`; secrets `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
- **Previews:** PR branches deploy preview URLs for review.
- **Configuration:** `SITE_URL` repository variable; production value is the assigned `*.pages.dev` URL until a custom domain is purchased, then updated to the custom domain.
- **Headers:** `public/_headers` sets `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (no camera, microphone, geolocation), and `X-Frame-Options: DENY`. A CSP is added after verifying Astro's emitted scripts, not in the initial launch.
- **Rollback:** Cloudflare Pages deployment history; redeploy the previous build.
- **Monitoring:** Cloudflare Web Analytics when enabled; uptime handled by the platform.

---

## 15. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Game updates add/change ghosts or evidence | Sync + diff workflow, data invariants, changelog, last-verified dates |
| Fandom API changes, rate-limits, or blocks | Respectful UA/throttling, cached raw data, committed source of truth, Fextralife/manual cross-check |
| Source disagreement (e.g. Deildegast missing from Fandom's Evidence table) | Explicit cross-check requirement; two-source rule for disputed facts; document in changelog |
| Copyright/licensing | Facts only; original prose; attribution; no verbatim excerpts |
| Established wikis outrank a new site | Better UX, tools, curated comparisons, and fresher verified data; no thin auto-generated pages |
| Dark theme harms readability | Restricted texture, AA contrast tokens, readability review, print stylesheet |
| Scope creep | Explicit non-goals; 12-comparison cap; no maps/equipment in v1 |
| Tracker edge cases mislead players | Exhaustive mode-matrix tests; conservative negative-evidence handling; contradiction messaging |
| Brand/domain collision ("DEAD AIR") | Working brand; verify domain and trademark availability before launch; name is centralized in `src/data/site.ts` |
| Analytics/privacy concerns | Cookieless provider, off by default without token, privacy note |

---

## 16. Acceptance criteria

1. All 57 indexable routes build; sitemap lists exactly those routes and excludes the 404 page.
2. 30 ghost pages, 7 evidence pages, 12 comparison pages, cheat sheet, and tracker are complete and linked.
3. Tracker passes the full unit mode matrix, including forced evidence and Mimic extra orbs; share URLs round-trip exactly.
4. Ghost index search and all filters work, sync to the URL, and handle empty states.
5. Every page has a unique title, description, canonical, OG image, and valid structured data where applicable.
6. Lighthouse mobile meets the targets in §2; bundle budgets pass in CI.
7. Axe reports no serious or critical issues on the four key pages.
8. Every content page has `lastVerified` and at least one source; no verbatim wiki prose.
9. Responsive at 360px, 768px, 1024px, and 1440px; cheat sheet prints black-on-white without clipping.
10. CI is green and `main` deploys to Cloudflare Pages.

---

## Appendix A — Canonical ghost list (30)

Entity numbers follow alphabetical journal order and are used cosmetically in the UI.

| # | Ghost | Slug |
|---|---|---|
| 1 | Aswang | `aswang` |
| 2 | Banshee | `banshee` |
| 3 | Dayan | `dayan` |
| 4 | Deildegast | `deildegast` |
| 5 | Demon | `demon` |
| 6 | Deogen | `deogen` |
| 7 | Gallu | `gallu` |
| 8 | Goryo | `goryo` |
| 9 | Hantu | `hantu` |
| 10 | Jinn | `jinn` |
| 11 | Kormos | `kormos` |
| 12 | Mare | `mare` |
| 13 | Moroi | `moroi` |
| 14 | Myling | `myling` |
| 15 | Obake | `obake` |
| 16 | Obambo | `obambo` |
| 17 | Oni | `oni` |
| 18 | Onryo | `onryo` |
| 19 | Phantom | `phantom` |
| 20 | Poltergeist | `poltergeist` |
| 21 | Raiju | `raiju` |
| 22 | Revenant | `revenant` |
| 23 | Shade | `shade` |
| 24 | Spirit | `spirit` |
| 25 | Thaye | `thaye` |
| 26 | The Mimic | `the-mimic` |
| 27 | The Twins | `the-twins` |
| 28 | Wraith | `wraith` |
| 29 | Yokai | `yokai` |
| 30 | Yurei | `yurei` |

---

## Appendix B — Evidence matrix and special cases

Evidence columns: EMF = EMF Level 5; SB = Spirit Box; UV = Ultraviolet; ORB = Ghost Orbs; WRT = Ghost Writing; FRZ = Freezing Temperatures; DOT = D.O.T.S. Projector.

| Ghost | EMF | SB | UV | ORB | WRT | FRZ | DOT | Forced | Extra |
|---|---|---|---|---|---|---|---|---|---|
| Aswang |  |  |  |  | ✓ | ✓ | ✓ | — | — |
| Banshee |  |  | ✓ | ✓ |  |  | ✓ | — | — |
| Dayan | ✓ | ✓ |  | ✓ |  |  |  | — | — |
| Deildegast | ✓ |  |  |  | ✓ |  | ✓ | — | — |
| Demon |  |  | ✓ |  | ✓ | ✓ |  | — | — |
| Deogen |  | ✓ |  |  | ✓ |  | ✓ | Spirit Box | — |
| Gallu | ✓ | ✓ | ✓ |  |  |  |  | — | — |
| Goryo | ✓ |  | ✓ |  |  |  | ✓ | D.O.T.S. | — |
| Hantu |  |  | ✓ | ✓ |  | ✓ |  | Freezing | — |
| Jinn | ✓ |  | ✓ |  |  | ✓ |  | — | — |
| Kormos |  | ✓ | ✓ | ✓ |  |  |  | — | — |
| Mare |  | ✓ |  | ✓ | ✓ |  |  | — | — |
| Moroi |  | ✓ |  |  | ✓ | ✓ |  | Spirit Box | — |
| Myling | ✓ |  | ✓ |  | ✓ |  |  | — | — |
| Obake | ✓ |  | ✓ | ✓ |  |  |  | Ultraviolet | — |
| Obambo |  |  | ✓ |  | ✓ |  | ✓ | — | — |
| Oni | ✓ |  |  |  |  | ✓ | ✓ | — | — |
| Onryo |  | ✓ |  | ✓ |  | ✓ |  | — | — |
| Phantom |  | ✓ | ✓ |  |  |  | ✓ | — | — |
| Poltergeist |  | ✓ | ✓ |  | ✓ |  |  | — | — |
| Raiju | ✓ |  |  | ✓ |  |  | ✓ | — | — |
| Revenant |  |  |  | ✓ | ✓ | ✓ |  | — | — |
| Shade | ✓ |  |  |  | ✓ | ✓ |  | — | — |
| Spirit | ✓ | ✓ |  |  | ✓ |  |  | — | — |
| Thaye |  |  |  | ✓ | ✓ |  | ✓ | — | — |
| The Mimic |  | ✓ | ✓ |  |  | ✓ |  | — | Ghost Orbs |
| The Twins | ✓ | ✓ |  |  |  | ✓ |  | — | — |
| Wraith | ✓ | ✓ |  |  |  |  | ✓ | — | — |
| Yokai |  | ✓ |  | ✓ |  |  | ✓ | — | — |
| Yurei |  |  |  | ✓ |  | ✓ | ✓ | — | — |

Notes:

- The Mimic's three journal evidence are Spirit Box, Ultraviolet, and Freezing Temperatures; it additionally always produces Ghost Orbs, including at 0 evidence. This is modeled as `extraEvidence`, not as one of its three.
- Forced evidence applies on Nightmare, Insanity, and custom difficulties with 1–2 evidence shown. It does not apply at 0 evidence.
- Deildegast was absent from the Fandom Evidence page table at the time of writing; its row is taken from Fextralife and PhasmoHelper and must be re-verified at implementation.
- This matrix is the v1 starting point. Every value is re-verified against at least two sources before launch and recorded with a `lastVerified` date.

---

## Appendix C — Launch comparison set (12)

| Slug | Matchup |
|---|---|
| `deogen-vs-revenant` | Deogen vs Revenant |
| `demon-vs-shade` | Demon vs Shade |
| `the-twins-vs-the-mimic` | The Twins vs The Mimic |
| `banshee-vs-moroi` | Banshee vs Moroi |
| `phantom-vs-onryo` | Phantom vs Onryo |
| `goryo-vs-obake` | Goryo vs Obake |
| `hantu-vs-thaye` | Hantu vs Thaye |
| `mare-vs-yurei` | Mare vs Yurei |
| `jinn-vs-raiju` | Jinn vs Raiju |
| `oni-vs-yokai` | Oni vs Yokai |
| `deildegast-vs-deogen` | Deildegast vs Deogen |
| `dayan-vs-kormos` | Dayan vs Kormos |

Each pair must share at least two evidence types or a genuinely confusable behavior. Every page needs at least 250 words of unique comparison prose.

---

## Appendix D — Sources

- Phasmophobia Wiki (Fandom): https://phasmophobia.fandom.com/wiki/Ghost
- Phasmophobia Wiki (Fandom), Evidence: https://phasmophobia.fandom.com/wiki/Evidence
- Phasmophobia Wiki (Fandom), The Mimic: https://phasmophobia.fandom.com/wiki/The_Mimic
- Phasmophobia Wiki (Fextralife), Ghosts: https://phasmophobia.wiki.fextralife.com/Ghosts
- Phasmophobia Wiki (Fextralife), Evidence Cheat Sheet: https://phasmophobia.wiki.fextralife.com/Evidence_Cheat_Sheet
- Phasmophobia Wiki (Fextralife), Evidence: https://phasmophobia.wiki.fextralife.com/Evidence
- PhasmoHelper: https://phasmohelper.org/en/
- Wikipedia, Phasmophobia (video game): https://en.wikipedia.org/wiki/Phasmophobia_(video_game)
- Kinetic Games patch notes (verify current URL at implementation)

All sources are re-checked at content time; the spec's facts reflect the game state on 2026-11-02.
