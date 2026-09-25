# Living Handbook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add auditable source freshness, a curated frontier radar, four current Agent engineering topics, and browser-local learning tools without introducing a backend.

**Architecture:** YAML remains the source registry, a Node checker produces machine-readable freshness reports, and a weekly GitHub workflow opens or updates an Issue for human review. VitePress renders evergreen chapters, frontier pages, chapter freshness metadata and client-only localStorage tools for routes, progress, bookmarks and interview practice.

**Tech Stack:** VitePress, Vue 3, TypeScript, Node.js, YAML, Vitest, GitHub Actions / Issues, localStorage

---

### Task 1: Upgrade the source registry schema

**Files:**
- Modify: `sources/source-index.yml`
- Modify: `scripts/validate-content.mjs`
- Modify: `tests/content.spec.ts`

- [ ] Write failing tests requiring schema v2 fields and valid dates/statuses.
- [ ] Run `pnpm vitest run tests/content.spec.ts -t 'source freshness schema'` and verify failure.
- [ ] Add `version`, `last_verified`, `review_by`, `status`, `replaced_by`, `impact_chapters`, and optional `watch_url` to every parsed source record; migrate existing `chapters` references to `impact_chapters`.
- [ ] Verify `pnpm test && pnpm validate` passes.
- [ ] Commit with `feat: add source freshness metadata`.

### Task 2: Build the safe source freshness checker

**Files:**
- Create: `scripts/check-sources.mjs`
- Create: `tests/source-freshness.spec.ts`
- Modify: `package.json`
- Create: `.github/workflows/source-freshness.yml`

- [ ] Write failing fixture tests for healthy URL, redirect, 404, timeout, archived GitHub repository, review due and version watch.
- [ ] Run `pnpm vitest run tests/source-freshness.spec.ts` and verify failure.
- [ ] Implement injectable fetch helpers, bounded concurrency, timeout, redirect/status capture, GitHub repository metadata and stable JSON/Markdown reports. Never include response bodies.
- [ ] Add `pnpm sources:check` and `pnpm sources:check --strict` behavior.
- [ ] Add a weekly/manual workflow with `contents: read` and `issues: write`; use `actions/github-script` to create/update/close one fixed freshness Issue. The workflow never edits or commits content.
- [ ] Verify fixture tests, run a real non-strict report and commit with `feat: automate source freshness review`.

### Task 3: Publish the frontier radar and current protocol updates

**Files:**
- Create: `docs/radar/index.md`
- Create: `docs/radar/2026-09.md`
- Create: `docs/frontier/context-engineering.md`
- Create: `docs/frontier/interoperability-identity.md`
- Create: `docs/frontier/durable-execution.md`
- Create: `docs/frontier/agent-security-evaluation.md`
- Modify: `docs/chapters/04-tools-mcp.md`
- Modify: `docs/.vitepress/config.mts`
- Modify: `sources/source-index.yml`
- Modify: `tests/content.spec.ts`

- [ ] Write failing route, status badge, version and source-ID tests.
- [ ] Run targeted tests and verify missing pages/current MCP version fail.
- [ ] Add official sources for MCP 2026-07-28, A2A v1.0.1, NIST initiative, Managed Agents, Context Engineering, OpenTelemetry GenAI and OWASP Agentic Security.
- [ ] Write six September radar entries with event, importance, impacted chapters, current decision and A-grade evidence.
- [ ] Write four topic pages with stable principles, current frontier, failure boundaries, version status and review schedule.
- [ ] Update chapter 4 to distinguish MCP tool interoperability from A2A agent interoperability and describe the 2026-07-28 compatibility boundary.
- [ ] Verify and commit with `docs: add frontier radar and protocol updates`.

### Task 4: Display chapter freshness

**Files:**
- Create: `docs/.vitepress/theme/data/chapterMeta.ts`
- Create: `docs/.vitepress/theme/components/ChapterFreshness.vue`
- Modify: `docs/.vitepress/theme/index.ts`
- Modify: `docs/.vitepress/theme/style.css`
- Modify: `docs/chapters/*.md`
- Modify: `tests/content.spec.ts`

- [ ] Write failing tests for 18 metadata records, valid dates, source IDs, version labels and one placement per page.
- [ ] Implement a compact component showing stability, last verified, review date and versions; calculate overdue state client-side without hiding content.
- [ ] Place it after each chapter/topic title.
- [ ] Verify accessibility, build and commit with `feat: surface chapter freshness`.

### Task 5: Add three reading paths and local progress

**Files:**
- Create: `docs/.vitepress/theme/data/readingPaths.ts`
- Create: `docs/.vitepress/theme/components/ReadingPaths.vue`
- Create: `docs/.vitepress/theme/components/ReadingProgress.vue`
- Create: `docs/paths/index.md`
- Modify: `docs/.vitepress/theme/index.ts`
- Modify: `docs/.vitepress/theme/style.css`
- Modify: `docs/.vitepress/config.mts`
- Modify: `tests/content.spec.ts`

- [ ] Write failing tests for three route definitions, valid chapter links, localStorage keys, bookmark controls and a clear action with confirmation.
- [ ] Implement beginner, engineering and interview paths without duplicating chapter content.
- [ ] Implement local progress using guarded browser APIs and graceful storage failure.
- [ ] Add visible focus, touch targets and mobile layout; keep data local.
- [ ] Verify and commit with `feat: add local reading paths and progress`.

### Task 6: Add interview training mode

**Files:**
- Create: `docs/.vitepress/theme/components/InterviewTrainer.vue`
- Create: `docs/appendix/interview-training.md`
- Modify: `docs/.vitepress/theme/index.ts`
- Modify: `docs/.vitepress/theme/style.css`
- Modify: `docs/.vitepress/config.mts`
- Modify: `tests/content.spec.ts`

- [ ] Write failing tests for role/difficulty/topic filters, query-string sync, random selection, answer reveal and local self-assessment.
- [ ] Implement filters and random draw from the existing 42-question registry; no duplicate question data.
- [ ] Persist only `unknown | fuzzy | mastered` by question ID, with local-only disclosure and confirmed reset.
- [ ] Verify keyboard/mobile behavior and commit with `feat: add interview training mode`.

### Task 7: Final audit and deployment

- [ ] Run `pnpm test && pnpm validate && pnpm build`.
- [ ] Verify source checker fixture coverage and inspect the real report without printing response bodies.
- [ ] Browser-test radar, four frontier pages, freshness labels, three paths, progress/bookmarks and interview trainer at 1440px and 390px in light/dark modes.
- [ ] Cross-review with the judge; resolve evidence-backed findings.
- [ ] Fast-forward `main`, deploy Pages and verify public routes, search, local state refresh and process-document 404.

## Plan self-review

- All approved P0 and selected P1 features map to concrete files and tests.
- Automatic jobs only report or open Issues; they cannot modify book content.
- Stable chapters, frontier pages and monthly radar remain visibly separate.
- No backend, account, comments, cloud progress, automatic publishing or framework ranking is introduced.
