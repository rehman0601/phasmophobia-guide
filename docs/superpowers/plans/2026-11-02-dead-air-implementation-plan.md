# DEAD AIR Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build DEAD AIR — a Phasmophobia field guide that is fast, SEO-first, and atmospheric. The v1 app includes 30 ghost pages, 7 evidence explainers, an evidence tracker with 4 difficulty modes, a cheat sheet, 12 curated comparisons, and supporting pages (home, about, changelog). All content is original prose with verified facts; the tracker is a pure function with URL-shareable state. The design direction is "Cursed Tape" (found-footage aesthetic). Stack: Astro 7.x static, React islands, TypeScript, Vitest/Playwright/axe testing, Cloudflare Pages deploy.

**Architecture:** Astro 7.4 static output with React island components for the tracker and filters. Content collections (ghosts, evidence, comparisons) via Astro's `src/content` layer with Zod schemas. Data pipeline: one-time Fandom wiki sync → curated JSON/MDX; never re-fetched at runtime. Tracker logic is a pure function enumerating observable evidence subsets per difficulty mode. SEO: static titles/meta/OG, Sitemap, JSON-LD. Deploy: Cloudflare Pages. No backend, no runtime API calls, no user accounts.

**Tech Stack:** Astro@7.4.4, React@19, TypeScript@6.x (compatible with astro check), Vitest, Playwright, @axe-core/playwright, @fontsource/space-mono, @fontsource-variable/inter, @astrojs/react, @astrojs/sitemap, cloudflare-wrangler for deploy.

## Global Constraints (from spec)

1. 30 ghosts, 7 evidence types (EMF 5, Spirit Box, UV, Ghost Orbs, Ghost Writing, Freezing, DOTS). The Mimic always has Ghost Orbs as extra evidence.
2. Five ghosts have forced evidence on reduced-evidence difficulties: Hantu→Freezing, Goryo→DOTS, Obake→UV, Moroi→Spirit Box, Deogen→Spirit Box.
3. Tracker modes: Normal (3 shown), Nightmare (2), Insanity (1), Custom (0-3).
4. Tracker ruled-out evidence disabled when shown < 3; only guaranteed evidence elimination active.
5. Exactly 12 curated comparison pairs; each ghost slug used at most once.
6. No verbatim wiki prose; every content page lists sources + lastVerified ISO date.
7. 57 indexable routes; sitemap includes exactly those routes; 404 excluded.
8. Lighthouse mobile ≥95 on performance/SEO/accessibility on home/ghost/tracker.
9. Axe: no serious/critical violations on key pages.
10. Build on Cloudflare Pages via `wrangler pages deploy dist --project-name dead-air`.
11. Cookieless Cloudflare analytics only; loaded when `PUBLIC_CF_ANALYTICS_TOKEN` env set.
12. Dark theme with WCAG AA contrast; respects prefers-reduced-motion.
12. Domain: `SITE_URL` env var; default `pages.dev` URL until custom domain.

---

## Task Structure

Each task is one action (2-5 minutes): write failing test → verify fail → minimal implementation → verify pass → commit.

### Task 1: Project scaffolding & toolchain (already started)

See inline execution below.

### Task 2: Global design system tokens

#### Step 1: Write design tokens to `src/styles/tokens.css`

#### Step 2: Extend `src/styles/base.css` with Cursed Tape rules

#### Step 3: Write `src/lib/tracker.ts` — pure matching logic (§7)

#### Step 4: Write `src/content.config.ts` — content schemas

#### Step 5: Run `npm run build` and `npx astro check` (fix TS version as needed)

### Task 3: Core content

#### Step 1: Create `src/content/ghosts/30 .mdx` files (schema from §6.2)

#### Step 2: Create `src/content/evidence/7 .mdx` files

#### Step 3: Create `src/content/comparisons/12 .mdx` files

#### Step 4: Build + verify all pages render; sitemap auto-generates

### Task 4: Evidence tracker tool

#### Step 1: Write `src/components/islands/Tracker.tsx` — React island with mode selector, evidence console, results rail, Mimic callout, share/reset

#### Step 2: Wire tracker data from `getCollection('ghosts')` into island props

#### Step 3: Add URL param sync (`?mode=nightmare&has=emf-5,dots&not=uv`)

#### Step 4: Unit tests (Vitest) for all mode matrices + Mimic edge cases

#### Step 5: Playwright E2E: full tracker flow, share URL roundtrip, mobile, 404

### Task 5: SEO and metadata

#### Step 1: Write `src/lib/seo.ts` — title/description/OG builders

#### Step 2: Add JSON-LD builders (Article, WebSite, BreadcrumbList)

#### Step 2: Configure `astro-og-canvas` for per-page OG images

#### Step 2: Add robots.txt generation + final SEO script

### Task 6: Testing, CI, and deployment

#### Step 1: Fix TypeScript version pin for `astro check` compatibility

#### Step 2: Write Vitest unit tests for tracker matching and data invariants

#### Step 2: Write Playwright E2E tests for core flows

#### Step 2: Update CI `.github/workflows/ci.yml` with correct check scripts

#### Step 2: Add bundle budget assertions

#### Step 2: Final Cloudflare Pages deploy + smoke test

### Task 7: Polish and launch

#### Step 1: Add print stylesheet for cheat sheet

#### Step 2: Final content audit (lastVerified dates, sources)

#### Step 3: Manual Lighthouse audit on key pages

#### Step 4: Publish to Cloudflare Pages with custom domain if desired

#### Step 5: Open the site and validate

---
---
```markdown
### Task 1: Project scaffolding & toolchain

**Files:**
- Create: `package.json` (already done)
- Create: `tsconfig.json` (already done)
- Create: `astro.config.mjs` (already done)
- Create: `public/robots.txt` (already done)
- Create: `public/_headers` (already done)
- Create: `public/favicon.svg` (already done)
- Create: `scripts/sync-wiki.mjs` (already done)
- Create: `scripts/check-data.mjs` (already done)
- Create: `scripts/check-seo.mjs` (already done)
- Create: `scripts/crawl-links.mjs` (already done)
- Create: `scripts/check-budgets.mjs` (already done)
- Create: `.github/workflows/ci.yml` (already done)
- Modify: `src/lib/schema.ts` (will create in Task 2)

**Interfaces:**
- Consumes: none (scaffolding task)
- Produces: functional Astro 7 project scaffolding with all scripts and CI

**Step 1: Write the failing test** — not applicable; scaffolding sets up the environment.

**Step 2: Run environment setup to verify it fails** (e.g., `npm run build` missing deps) — run: `npm run build` (this was failing before installing dependencies; now should succeed).

**Step 3: Write minimal implementation** — run all scaffold scripts:
```bash
npm run build         # must succeed
npx astro check       # must pass (fix TS version pin later)
node scripts/sync-wiki.mjs   # prints skeleton message
node scripts/check-data.mjs  # validates invariants on empty content dir
node scripts/check-seo.mjs   # prints skeleton message
node scripts/crawl-links.mjs # prints skeleton message
```
Expected: All scripts load; build produces dist/.

**Step 4: Run test to verify it passes** — `npm run build` completed successfully; dist/ exists.

**Step 5: Commit**
```bash
git add package.json tsconfig.json astro.config.mjs public/ scripts/ .github/
git commit -m "chore: project scaffolding & toolchain (Astro 7.4, React islands, scripts, CI)"
```

---
```