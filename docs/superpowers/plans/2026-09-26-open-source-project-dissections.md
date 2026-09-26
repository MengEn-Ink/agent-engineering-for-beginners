# Open Source Project Dissections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish one project overview, six version-pinned open-source project dissections, and one historical counterexample page while preserving source truth, license boundaries, existing URLs, local progress, and the separation from the future Python Lab Kit.

**Architecture:** `contentRegistry` remains the only owner of public page identity. A new `sources/project-index.yml` owns repository pins, repository status, catalog tier, license scopes, source entrypoints, page-to-subject mappings, and call-chain data; a Node loader validates it for tests, builds, and weekly freshness checks, while a VitePress data loader exposes the same serializable data to four SSR-safe Vue components. Markdown owns teaching prose, course/navigation files reference stable item IDs, and automation may report upstream changes but never rewrite or publish content.

**Tech Stack:** VitePress 1.6, Vue 3, TypeScript, JavaScript ESM, YAML 2.8, Vitest 3.2, parse5 8.0.1, parse-srcset 1.0.2, PostCSS 8.5.28, postcss-selector-parser 7.1.6, GitHub Actions, GitHub REST API, GitHub Pages

---

## Scope and file map

**Create:**

- `sources/project-index.yml` — canonical project-page mapping, 13 pinned subjects, license scopes, 66 file-level source entrypoints, and seven primary chains.
- `scripts/project-catalog.mjs` — schema parser, discriminated license validation, cross-reference validation, and build-time loader.
- `scripts/project-catalog.d.mts` — TypeScript declaration for the Node catalog loader.
- `scripts/check-projects.mjs` — bounded GitHub freshness scan that writes project review reports without editing content.
- `scripts/publication-contracts.mjs` — shared parse5/VitePress-Markdown contract extractor for paths, visible text, anchors, headings, and every image candidate form.
- `scripts/validate-provenance.mjs` — allowlist gate for any future file in `docs/public/project-assets/`.
- `assets/provenance.yml` — empty versioned registry; no external asset is added in this phase.
- `docs/.vitepress/theme/data/projectCatalog.data.ts` — VitePress build-time loader for the validated YAML catalog.
- `docs/.vitepress/theme/data/projectCatalogTypes.ts` — serializable catalog types shared by the loader, pure lookup, and components.
- `docs/.vitepress/theme/data/projectCatalogCore.ts` — pure injectable lookup factory used by Vitest without VitePress virtual data.
- `docs/.vitepress/theme/data/projectCatalog.ts` — typed, fail-closed page/subject/chain lookup helpers.
- `docs/.vitepress/theme/components/ProjectOverview.vue` — SSR index for core, historical, and watch-only entries.
- `docs/.vitepress/theme/components/ProjectMeta.vue` — fixed pin, repository status, catalog tier, and license summary.
- `docs/.vitepress/theme/components/ProjectCallChain.vue` — one primary call chain with native list semantics and a text fallback.
- `docs/.vitepress/theme/components/ProjectSourceLinks.vue` — fixed-commit GitHub source links plus explicit print-only URL text.
- `docs/projects/index.md` — `/projects/` overview.
- `docs/projects/mcp-python-sdk.md` — MCP specification and Python SDK dissection.
- `docs/projects/aider.md` — Aider dissection.
- `docs/projects/openhands.md` — OpenHands Canvas and software-agent-sdk dissection.
- `docs/projects/agent-benchmarks.md` — SWE-bench and τ²-bench comparison.
- `docs/projects/dify.md` — Dify workflow execution dissection.
- `docs/projects/crewai.md` — CrewAI collaboration execution dissection.
- `docs/projects/history-autogpt-flowise.md` — historical counterexample page.
- `tests/project-catalog.spec.ts` — project schema, exact inventory, licenses, pins, chain, and freshness tests.
- `tests/project-pages.spec.ts` — page template, source link, navigation, course, provenance, and dist tests.
- `docs/.vitepress/env.d.ts` — Vue/Vite module types for the scoped component check.
- `tsconfig.projects.json` — strict type-check boundary for the new data and Vue files.

**Modify:**

- `docs/.vitepress/theme/data/contentRegistry.ts` — add exactly eight project page identities.
- `docs/.vitepress/theme/data/courseMap.ts` — add six core project items; project stage becomes seven items and total becomes 26.
- `docs/.vitepress/theme/data/readingPaths.ts` — append six core pages and the delivery case to the engineering path; 17 stations total.
- `docs/.vitepress/theme/index.ts` — register four project components.
- `docs/.vitepress/theme/style.css` — restrained metadata, call-chain, mobile, focus, dark, print, and cascade-protected URL rules.
- `docs/.vitepress/theme/components/ProjectMeta.vue` — retain the on-screen disclosure and add explicit wrapping print-only license URLs.
- `docs/.vitepress/config.mts` — add project overview to the top nav and the exact eight-item project sidebar group.
- `scripts/validate-content.mjs` — include project catalog and provenance validation.
- `scripts/check-dist.mjs` — canonicalize output paths, reject symlinks/collisions, parse built HTML structurally, allow exactly eight project outputs, require 26 exact course targets, and keep all labs/capstone outputs forbidden.
- `tests/course-map.spec.ts` — exact 39-item registry, 26-item course graph, and 17-step engineering path.
- `tests/content.spec.ts` — canonical path/symlink, structured HTML, strict course/project-anchor, remote-image, source-baseline, and public-boundary assertions.
- `tests/source-freshness.spec.ts` — project freshness failure classification and token-scope regressions.
- `.github/workflows/source-freshness.yml` — run the project scan in the read-only job and report from the token-isolated job.
- `package.json` — add scoped Vue type checking and `projects:check`, plus direct parse5, parse-srcset, PostCSS, and selector-parser development dependencies.
- `pnpm-lock.yaml` — lock `vue-tsc@3.3.11`, `parse5@8.0.1`, `parse-srcset@1.0.2`, `postcss@8.5.28`, and `postcss-selector-parser@7.1.6`.
- `sources/source-index.yml` — record the manually verified Pydantic AI v2.51.0 and Google ADK v2.10.0 rolling baselines.
- `README.md` — add project-reading entry and preserve the no-backend/no-Lab boundary.

**Verify without editing:**

- `docs/.vitepress/theme/components/CourseMap.vue` — the existing data-driven loops must render and print the larger project stage without a component change.

**Explicitly untouched:** the 14 chapter bodies, four frontier article bodies, all 42 interview question objects, any Python package or Lab fixture, `/labs/`, `/capstone/`, model/API calls, benchmark execution, external images, account/backend features, and current localStorage keys.

## Immutable inventory

Public routes added by this phase, in order:

```text
/projects/
/projects/mcp-python-sdk
/projects/aider
/projects/openhands
/projects/agent-benchmarks
/projects/dify
/projects/crewai
/projects/history-autogpt-flowise
```

Core course IDs added by this phase, in project-stage order:

```text
project-mcp-python-sdk
project-aider
project-openhands
project-agent-benchmarks
project-dify
project-crewai
```

The existing `case-delivery-agent` follows those six. `projects-index` and `project-history-autogpt-flowise` are public but not counted. The course denominator is 26 and the engineering path contains its existing 10 steps followed by the six core project IDs and `case-delivery-agent`, for 17 steps total.

## Execution rules

- Run every task as RED → confirm the expected failure → minimal GREEN → focused tests → full affected gate → independent commit.
- Do not start a later task while the current task leaves `pnpm test`, `pnpm validate`, or `pnpm build` red.
- Source links always use a 40-character commit SHA. A moving branch or tag may appear only as human-readable metadata or a watch URL.
- No task may create a Python environment, run an upstream project, call a model, execute a benchmark, or add `/labs/` content.
- Every `git diff` release check uses the explicit range `git diff origin/main...HEAD --check`; a clean working tree alone is not evidence.

## Implementation worktree setup

After this plan is approved and before Task 1, create the isolated implementation branch from the approved baseline:

```bash
set -e
git fetch origin --prune
git worktree add /Users/bytedance/work/agent-engineering-for-beginners/.trae/worktrees/open-source-project-dissections -b feat/open-source-project-dissections 815d7613ca639d462979b1e57024eafd897e176b
git -C /Users/bytedance/work/agent-engineering-for-beginners/.trae/worktrees/open-source-project-dissections status --short --branch
```

Expected: branch `feat/open-source-project-dissections`, clean worktree, HEAD `815d7613ca639d462979b1e57024eafd897e176b`. All Task 1–13 commands run in that worktree; Task 14 runs there only after final reviewer approval.

## Specification coverage

| Approved requirement | Implemented and proved by |
| --- | --- |
| Project schema, dual status axes, mixed-license model | Tasks 1–2 |
| 8 page mappings, 13 exact subjects, 66 exact file-level source entries, 7 chains | Task 2 |
| VitePress loader, pure Vitest lookup, Vue type gate | Task 3 |
| Separate architecture graph, text call chain, source facts, print fallback | Task 3 |
| Intermediate commits remain buildable while pages arrive | Task 4 and every task-level full gate |
| Six core narratives, history page, watch-only safety zone | Tasks 5–8 |
| 26-item course, 29 tracked routes, 17-step engineering path, full nav | Task 9 |
| Strict host/repo/ref/path/license provenance | Task 10 |
| Default-branch HEAD, release, pin, path, license digest, permissions | Task 11 |
| Canonical path/symlink boundary, structured HTML/Markdown, exact anchors, remote-image coverage, and eight-page SSR contract | Task 12 |
| README and source baselines; all-page mobile/desktop, cascade, no-JS, print, fresh HAR, and route evidence | Task 13 |
| Approved merge, Pages run, production HTTP and browser evidence | Task 14 |

### Task 1: Add the project catalog parser and schema validator

**Files:**

- Create: `scripts/project-catalog.mjs`
- Create: `scripts/project-catalog.d.mts`
- Create: `tests/project-catalog.spec.ts`

- [ ] **Step 1: Write failing parser and schema tests**

Create `tests/project-catalog.spec.ts` with a minimal valid fixture and the required negative cases:

```ts
import { describe, expect, it } from 'vitest'
import {
  parseProjectCatalog,
  validateProjectCatalog,
  validateProjectCatalogIntegration,
} from '../scripts/project-catalog.mjs'

const sha = 'a'.repeat(40)

const validCatalog = {
  schema_version: 1,
  defaults: { verified_at: '2026-09-26', review_by: '2026-10-26' },
  pages: [{
    page_item_id: 'project-aider',
    catalog_tier: 'core',
    subjects: ['aider'],
    interview_question_ids: ['iq-13-a'],
    counted_in_course: true,
    primary_chain_id: 'aider-chain',
  }],
  subjects: [{
    id: 'aider',
    canonical_repo: 'Aider-AI/aider',
    canonical_url: 'https://github.com/Aider-AI/aider',
    pin_kind: 'release',
    pinned_ref: 'v0.86.0',
    pinned_commit: sha,
    verified_default_branch: 'main',
    verified_default_head: 'c'.repeat(40),
    repository_status: 'active',
    archived: false,
    catalog_tier: 'core',
    license_summary: 'Apache-2.0',
    license_scopes: [{
      basis: 'path', expression: 'Apache-2.0', path_or_glob: '**',
      scope: 'repository', note: 'File-level exceptions still win.',
    }],
    license_sources: [{ path: 'LICENSE.txt', sha256: 'b'.repeat(64) }],
    watch_url: 'https://github.com/Aider-AI/aider/releases/latest',
    entrypoints: [{ path: 'aider/main.py', symbols: ['main'], responsibility: 'Validate repository arguments.' }],
  }],
  chains: [{
    id: 'aider-chain',
    page_item_id: 'project-aider',
    label: 'request to edit',
    reading_hint: 'Follow state and evidence.',
    misconception: 'A patch is not task completion.',
    steps: [{
      id: 'entry', label: 'CLI', subject_id: 'aider', source_path: 'aider/main.py',
      symbol: 'main', responsibility: 'Validate the repository and arguments.',
    }],
  }],
}

describe('project catalog schema', () => {
  it('accepts a valid catalog', () => {
    expect(validateProjectCatalog(validCatalog)).toEqual([])
  })

  it('requires a verified default branch and a full commit SHA for every subject', () => {
    const missingBranch = structuredClone(validCatalog)
    delete (missingBranch.subjects[0] as Partial<typeof missingBranch.subjects[0]>).verified_default_branch
    expect(validateProjectCatalog(missingBranch)).toContain(
      'Subject aider requires verified_default_branch',
    )

    const invalidHead = structuredClone(validCatalog)
    invalidHead.subjects[0].verified_default_head = 'abc123'
    expect(validateProjectCatalog(invalidHead)).toContain(
      'Subject aider has invalid verified_default_head',
    )
  })

  it('requires path and contribution licenses to use disjoint selectors', () => {
    const pathMissing = structuredClone(validCatalog)
    pathMissing.subjects[0].license_scopes[0] = {
      basis: 'path', expression: 'MIT', scope: 'repo', note: 'missing glob',
    } as never
    expect(validateProjectCatalog(pathMissing)).toContain(
      'Subject aider path license scope requires path_or_glob and forbids selector',
    )

    const contribution = structuredClone(validCatalog)
    contribution.subjects[0].license_scopes = [
      { basis: 'contribution', expression: 'Apache-2.0', selector: 'new-code', scope: 'new', note: 'new contributions' },
      { basis: 'contribution', expression: 'MIT', selector: 'legacy-no-consent', scope: 'legacy', note: 'old contributions' },
    ]
    expect(validateProjectCatalog(contribution)).toEqual([])
  })

  it('rejects conflicting path scopes but not contribution scopes', () => {
    const conflicting = structuredClone(validCatalog)
    conflicting.subjects[0].license_scopes.push({
      basis: 'path', expression: 'MIT', path_or_glob: '**',
      scope: 'same files', note: 'ambiguous',
    })
    expect(validateProjectCatalog(conflicting)).toContain(
      'Subject aider has conflicting path license scopes for **',
    )
  })

  it('keeps repository status and catalog tier independent', () => {
    const historical = structuredClone(validCatalog)
    historical.subjects[0].repository_status = 'active'
    historical.subjects[0].archived = false
    historical.subjects[0].catalog_tier = 'historical'
    expect(validateProjectCatalog(historical)).toEqual([])
    const missingArchived = structuredClone(validCatalog)
    delete missingArchived.subjects[0].archived
    expect(validateProjectCatalog(missingArchived)).toContain('Subject aider archived must be boolean')
  })

  it('fails closed for unknown page, subject, chain, and source-path references', () => {
    const broken = structuredClone(validCatalog)
    broken.pages[0].subjects = ['missing']
    broken.pages[0].primary_chain_id = 'missing-chain'
    broken.chains[0].steps[0].source_path = 'missing.py'
    expect(validateProjectCatalog(broken)).toEqual(expect.arrayContaining([
      'Page project-aider references unknown subject: missing',
      'Page project-aider references unknown chain: missing-chain',
      'Chain aider-chain step entry references an undeclared entrypoint: aider/missing.py',
    ]))
    expect(validateProjectCatalogIntegration(validCatalog, {
      contentItems: [{ id: 'other' }],
      interviewQuestions: [{ id: 'iq-other' }],
    })).toEqual([
      'Project page is missing from contentRegistry: project-aider',
      'Project page project-aider references unknown interview question: iq-13-a',
    ])
    expect(validateProjectCatalogIntegration(validCatalog, {
      contentItems: [{ id: 'project-aider' }],
      interviewQuestions: [{ id: 'iq-13-a' }],
    })).toEqual([])
    expect(validateProjectCatalogIntegration(validCatalog, {
      contentItems: [{ id: 'other' }],
      interviewQuestions: [{ id: 'iq-other' }],
      contentRegistryText: "// { id: 'project-aider' }",
      interviewQuestionsText: "const unrelated = \"question('iq-13-a', only, in, a, string)\"",
    } as never)).toEqual([
      'Project page is missing from contentRegistry: project-aider',
      'Project page project-aider references unknown interview question: iq-13-a',
    ])
  })

  it('requires complete chains, unique steps, and page-owned subjects', () => {
    const broken = structuredClone(validCatalog)
    broken.chains[0].label = '   '
    broken.pages[0].subjects = []
    broken.chains[0].steps.push({ ...broken.chains[0].steps[0] })
    expect(validateProjectCatalog(broken)).toEqual(expect.arrayContaining([
      'Chain aider-chain requires non-empty label',
      'Chain aider-chain has duplicate step ID: entry',
      'Chain aider-chain step entry subject is not owned by page: aider',
    ]))
    broken.chains[0].steps = []
    expect(validateProjectCatalog(broken)).toContain('Chain aider-chain requires non-empty steps')

    const wrongSymbol = structuredClone(validCatalog)
    wrongSymbol.chains[0].steps[0].symbol = 'missing'
    expect(validateProjectCatalog(wrongSymbol)).toContain(
      'Chain aider-chain step entry references an undeclared entrypoint: aider/aider/main.py#missing',
    )

    const emptySymbols = structuredClone(validCatalog)
    emptySymbols.subjects[0].entrypoints[0].symbols = []
    expect(validateProjectCatalog(emptySymbols)).toContain(
      'Subject aider entrypoint aider/main.py requires non-empty symbols',
    )

    const blankSymbol = structuredClone(validCatalog)
    blankSymbol.subjects[0].entrypoints[0].symbols = ['main', '   ']
    expect(validateProjectCatalog(blankSymbol)).toContain(
      'Subject aider entrypoint aider/main.py symbols must contain only non-empty strings',
    )

    const duplicateSymbols = structuredClone(validCatalog)
    duplicateSymbols.subjects[0].entrypoints[0].symbols = ['main', 'main']
    expect(validateProjectCatalog(duplicateSymbols)).toContain(
      'Subject aider entrypoint aider/main.py has duplicate symbols',
    )

    const legacySymbol = structuredClone(validCatalog) as any
    legacySymbol.subjects[0].entrypoints[0] = {
      path: 'aider/main.py', symbol: 'main', responsibility: 'Validate repository arguments.',
    }
    expect(validateProjectCatalog(legacySymbol)).toContain(
      'Subject aider entrypoint aider/main.py requires non-empty symbols',
    )
  })

  it('parses YAML without accepting an empty or malformed registry', () => {
    const empty = parseProjectCatalog('schema_version: 1\ndefaults:\n  verified_at: 2026-09-26\n  review_by: 2026-10-26\npages: []\nsubjects: []\nchains: []\n')
    expect(validateProjectCatalog(empty)).toEqual(expect.arrayContaining([
      'Project catalog requires pages',
      'Project catalog requires subjects',
      'Project catalog requires chains',
    ]))
    expect(() => parseProjectCatalog('{broken')).toThrow('Project catalog YAML cannot be parsed')
  })
})
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```bash
pnpm vitest run tests/project-catalog.spec.ts -t 'project catalog schema'
```

Expected: FAIL because `scripts/project-catalog.mjs` does not exist.

- [ ] **Step 3: Implement the minimal parser and validator**

Create `scripts/project-catalog.mjs` with these public functions and checks:

```js
import { existsSync, readFileSync } from 'node:fs'
import { parse } from 'yaml'

const shaPattern = /^[0-9a-f]{40}$/u
const datePattern = /^\d{4}-\d{2}-\d{2}$/u
const pageTiers = new Set(['core', 'historical'])
const subjectTiers = new Set(['core', 'historical', 'watch-only'])
const repositoryStatuses = new Set(['active', 'archived', 'eol'])
const pinKinds = new Set(['release', 'tag', 'commit'])
const pathScopePattern = /^(?:\*\*|[-.\w/]+(?:\/\*\*)?)$/u

function nonEmpty(value) {
  return typeof value === 'string' && value.trim() !== ''
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function validDate(value) {
  if (!nonEmpty(value) || !datePattern.test(value)) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

export function parseProjectCatalog(text) {
  try {
    return parse(text)
  } catch {
    throw new Error('Project catalog YAML cannot be parsed')
  }
}

export function validateProjectCatalog(data) {
  const errors = []
  const pages = Array.isArray(data?.pages) ? data.pages : []
  const subjects = Array.isArray(data?.subjects)
    ? data.subjects.map((subject) => ({ ...data?.defaults, ...subject }))
    : []
  const chains = Array.isArray(data?.chains) ? data.chains : []
  const pageById = new Map(pages.map((page) => [page.page_item_id, page]))
  const subjectById = new Map(subjects.map((subject) => [subject.id, subject]))
  const chainById = new Map(chains.map((chain) => [chain.id, chain]))

  if (data?.schema_version !== 1) errors.push('Project catalog schema_version must be 1')
  if (pages.length === 0) errors.push('Project catalog requires pages')
  if (subjects.length === 0) errors.push('Project catalog requires subjects')
  if (chains.length === 0) errors.push('Project catalog requires chains')
  if (!validDate(data?.defaults?.verified_at)) errors.push('Project catalog verified_at is invalid')
  if (!validDate(data?.defaults?.review_by)) errors.push('Project catalog review_by is invalid')
  if (data?.defaults?.review_by < data?.defaults?.verified_at) {
    errors.push('Project catalog review_by cannot precede verified_at')
  }

  for (const page of pages) {
    for (const field of ['page_item_id', 'catalog_tier', 'subjects', 'interview_question_ids', 'counted_in_course', 'primary_chain_id']) {
      if (!Object.hasOwn(page, field)) errors.push(`Page ${page?.page_item_id ?? '<unknown>'} is missing ${field}`)
    }
    if (!pageTiers.has(page.catalog_tier)) errors.push(`Page ${page.page_item_id} has invalid catalog_tier`)
    if (!Array.isArray(page.subjects) || !Array.isArray(page.interview_question_ids)
      || typeof page.counted_in_course !== 'boolean') {
      errors.push(`Page ${page.page_item_id} has invalid mapping fields`)
    }
    for (const subjectId of page.subjects ?? []) {
      if (!subjectById.has(subjectId)) errors.push(`Page ${page.page_item_id} references unknown subject: ${subjectId}`)
    }
    if (page.primary_chain_id !== null && !chainById.has(page.primary_chain_id)) {
      errors.push(`Page ${page.page_item_id} references unknown chain: ${page.primary_chain_id}`)
    }
    if (page.page_item_id === 'projects-index' && page.primary_chain_id !== null) {
      errors.push('Page projects-index primary_chain_id must be null')
    }
    if (page.page_item_id !== 'projects-index' && page.primary_chain_id === null) {
      errors.push(`Page ${page.page_item_id} requires primary_chain_id`)
    }
    if (page.primary_chain_id !== null && chainById.get(page.primary_chain_id)?.page_item_id !== page.page_item_id) {
      errors.push(`Page ${page.page_item_id} chain belongs to another page`)
    }
  }

  for (const subject of subjects) {
    for (const field of ['id', 'canonical_repo', 'canonical_url', 'pinned_ref', 'license_summary', 'watch_url']) {
      if (!nonEmpty(subject[field])) errors.push(`Subject ${subject?.id ?? '<unknown>'} requires ${field}`)
    }
    if (!/^[-\w]+\/[-.\w]+$/u.test(subject.canonical_repo ?? '')) {
      errors.push(`Subject ${subject.id} has invalid canonical_repo`)
    }
    if (subject.canonical_url !== `https://github.com/${subject.canonical_repo}`) {
      errors.push(`Subject ${subject.id} canonical_url does not match canonical_repo`)
    }
    if (!pinKinds.has(subject.pin_kind)) errors.push(`Subject ${subject.id} has invalid pin_kind`)
    if (!shaPattern.test(subject.pinned_commit ?? '')) errors.push(`Subject ${subject.id} has invalid pinned_commit`)
    if (!nonEmpty(subject.verified_default_branch)) {
      errors.push(`Subject ${subject.id} requires verified_default_branch`)
    }
    if (!shaPattern.test(subject.verified_default_head ?? '')) {
      errors.push(`Subject ${subject.id} has invalid verified_default_head`)
    }
    if (!repositoryStatuses.has(subject.repository_status)) errors.push(`Subject ${subject.id} has invalid repository_status`)
    if (!subjectTiers.has(subject.catalog_tier)) errors.push(`Subject ${subject.id} has invalid catalog_tier`)
    if (typeof subject.archived !== 'boolean') errors.push(`Subject ${subject.id} archived must be boolean`)
    if (!validDate(subject.verified_at) || !validDate(subject.review_by)
      || subject.review_by < subject.verified_at) {
      errors.push(`Subject ${subject.id} has invalid review dates`)
    }
    if (subject.repository_status === 'active' && subject.archived !== false) {
      errors.push(`Subject ${subject.id} active status requires archived=false`)
    }
    if (subject.repository_status === 'archived' && subject.archived !== true) {
      errors.push(`Subject ${subject.id} archived status requires archived=true`)
    }
    if (!nonEmpty(subject.license_summary) || !Array.isArray(subject.license_scopes) || subject.license_scopes.length === 0) {
      errors.push(`Subject ${subject.id} requires license_summary and license_scopes`)
    }
    if (!/^https:\/\//u.test(subject.watch_url ?? '') || !Array.isArray(subject.entrypoints)
      || !Array.isArray(subject.license_sources) || subject.license_sources.length === 0) {
      errors.push(`Subject ${subject.id} requires HTTPS watch_url, entrypoints, and license_sources`)
    }
    const entryPaths = new Set()
    for (const entry of subject.entrypoints ?? []) {
      if (!nonEmpty(entry.path) || !nonEmpty(entry.responsibility)) {
        errors.push(`Subject ${subject.id} has an incomplete entrypoint`)
      }
      if (!Array.isArray(entry.symbols) || entry.symbols.length === 0) {
        errors.push(`Subject ${subject.id} entrypoint ${entry.path} requires non-empty symbols`)
      } else {
        if (!entry.symbols.every(nonEmpty)) {
          errors.push(`Subject ${subject.id} entrypoint ${entry.path} symbols must contain only non-empty strings`)
        }
        if (new Set(entry.symbols).size !== entry.symbols.length) {
          errors.push(`Subject ${subject.id} entrypoint ${entry.path} has duplicate symbols`)
        }
      }
      if (entryPaths.has(entry.path)) errors.push(`Subject ${subject.id} has duplicate entrypoint: ${entry.path}`)
      entryPaths.add(entry.path)
    }
    for (const license of subject.license_sources ?? []) {
      if (!nonEmpty(license.path) || !/^[0-9a-f]{64}$/u.test(license.sha256 ?? '')) {
        errors.push(`Subject ${subject.id} has an invalid license source`)
      }
    }

    const pathExpressions = new Map()
    for (const scope of subject.license_scopes ?? []) {
      if (!['path', 'contribution'].includes(scope.basis)
        || !nonEmpty(scope.expression) || !nonEmpty(scope.scope) || !nonEmpty(scope.note)) {
        errors.push(`Subject ${subject.id} has an invalid license scope`)
        continue
      }
      if (scope.basis === 'path') {
        if (!nonEmpty(scope.path_or_glob) || Object.hasOwn(scope, 'selector')) {
          errors.push(`Subject ${subject.id} path license scope requires path_or_glob and forbids selector`)
        } else if (!pathScopePattern.test(scope.path_or_glob)) {
          errors.push(`Subject ${subject.id} has unsupported path license scope: ${scope.path_or_glob}`)
        } else {
          const previous = pathExpressions.get(scope.path_or_glob)
          if (previous && previous !== scope.expression) {
            errors.push(`Subject ${subject.id} has conflicting path license scopes for ${scope.path_or_glob}`)
          }
          pathExpressions.set(scope.path_or_glob, scope.expression)
        }
      } else if (!nonEmpty(scope.selector) || Object.hasOwn(scope, 'path_or_glob')) {
        errors.push(`Subject ${subject.id} contribution license scope requires selector and forbids path_or_glob`)
      }
    }
  }

  for (const chain of chains) {
    for (const field of ['id', 'page_item_id', 'label', 'reading_hint', 'misconception', 'steps']) {
      if (!Object.hasOwn(chain, field)) errors.push(`Chain ${chain?.id ?? '<unknown>'} is missing ${field}`)
    }
    for (const field of ['id', 'page_item_id', 'label', 'reading_hint', 'misconception']) {
      if (!nonEmpty(chain[field])) errors.push(`Chain ${chain?.id ?? '<unknown>'} requires non-empty ${field}`)
    }
    const page = pageById.get(chain.page_item_id)
    if (!page) errors.push(`Chain ${chain.id} references unknown page: ${chain.page_item_id}`)
    if (!Array.isArray(chain.steps) || chain.steps.length === 0) errors.push(`Chain ${chain.id} requires non-empty steps`)
    const stepIds = new Set()
    for (const step of chain.steps ?? []) {
      for (const field of ['id', 'label', 'subject_id', 'source_path', 'symbol', 'responsibility']) {
        if (!nonEmpty(step[field])) errors.push(`Chain ${chain.id} step ${step?.id ?? '<unknown>'} is missing ${field}`)
      }
      if (stepIds.has(step.id)) errors.push(`Chain ${chain.id} has duplicate step ID: ${step.id}`)
      stepIds.add(step.id)
      const subject = subjectById.get(step.subject_id)
      if (!subject) {
        errors.push(`Chain ${chain.id} step ${step.id} references unknown subject: ${step.subject_id}`)
      } else if (!page?.subjects?.includes(step.subject_id)) {
        errors.push(`Chain ${chain.id} step ${step.id} subject is not owned by page: ${step.subject_id}`)
      } else {
        const matchingPath = (subject.entrypoints ?? []).some((entry) => entry.path === step.source_path)
        const matchingEntrypoint = (subject.entrypoints ?? []).some((entry) =>
          entry.path === step.source_path
          && Array.isArray(entry.symbols)
          && entry.symbols.includes(step.symbol))
        if (!matchingEntrypoint) {
          const reference = `${step.subject_id}/${step.source_path}${matchingPath ? `#${step.symbol}` : ''}`
          errors.push(`Chain ${chain.id} step ${step.id} references an undeclared entrypoint: ${reference}`)
        }
      }
    }
  }

  for (const [label, rows] of [['page', pages], ['subject', subjects], ['chain', chains]]) {
    const ids = rows.map((row) => label === 'page' ? row.page_item_id : row.id)
    if (new Set(ids).size !== ids.length) errors.push(`Project catalog has duplicate ${label} IDs`)
  }
  for (const subject of subjects.filter((item) => item.catalog_tier === 'watch-only')) {
    const owners = pages.filter((page) => page.subjects?.includes(subject.id)).map((page) => page.page_item_id)
    if (owners.length !== 1 || owners[0] !== 'projects-index') {
      errors.push(`Watch-only subject ${subject.id} must belong only to projects-index`)
    }
    if (!Array.isArray(subject.risk_tags) || subject.risk_tags.length === 0) {
      errors.push(`Watch-only subject ${subject.id} requires risk_tags`)
    }
  }
  return errors
}

export function validateProjectCatalogIntegration(data, sources) {
  const errors = []
  const pages = Array.isArray(data?.pages) ? data.pages : []
  const contentItems = Array.isArray(sources?.contentItems) ? sources.contentItems : []
  const interviewQuestions = Array.isArray(sources?.interviewQuestions) ? sources.interviewQuestions : []
  if (!Array.isArray(data?.pages)) errors.push('Project catalog integration requires pages')
  if (!Array.isArray(sources?.contentItems)) errors.push('Project catalog integration requires contentItems')
  if (!Array.isArray(sources?.interviewQuestions)) {
    errors.push('Project catalog integration requires interviewQuestions')
  }
  const contentIds = new Set()
  for (const [index, item] of contentItems.entries()) {
    if (!isRecord(item) || !nonEmpty(item.id)) {
      errors.push(`Content registry item at index ${index} requires non-empty id`)
    } else {
      contentIds.add(item.id)
    }
  }
  const questionIds = new Set()
  for (const [index, question] of interviewQuestions.entries()) {
    if (!isRecord(question) || !nonEmpty(question.id)) {
      errors.push(`Interview question at index ${index} requires non-empty id`)
    } else {
      questionIds.add(question.id)
    }
  }
  for (const [index, page] of pages.entries()) {
    if (!isRecord(page)) {
      errors.push(`Project catalog integration page at index ${index} must be an object`)
      continue
    }
    if (!contentIds.has(page.page_item_id)) {
      errors.push(`Project page is missing from contentRegistry: ${page.page_item_id}`)
    }
    for (const questionId of page.interview_question_ids ?? []) {
      if (!questionIds.has(questionId)) {
        errors.push(`Project page ${page.page_item_id} references unknown interview question: ${questionId}`)
      }
    }
  }
  return errors
}

export function validateProjectCatalogFile(path) {
  if (!existsSync(path)) return ['Missing sources/project-index.yml']
  try {
    return validateProjectCatalog(parseProjectCatalog(readFileSync(path, 'utf8')))
  } catch (error) {
    return [error instanceof Error ? error.message : 'Project catalog YAML cannot be parsed']
  }
}

export function loadProjectCatalog(path) {
  const parsed = parseProjectCatalog(readFileSync(path, 'utf8'))
  const data = {
    ...parsed,
    subjects: (parsed.subjects ?? []).map((subject) => ({ ...parsed.defaults, ...subject })),
  }
  const errors = validateProjectCatalog(data)
  if (errors.length > 0) throw new Error(errors.join('\n'))
  return data
}
```

Create `scripts/project-catalog.d.mts` so later TypeScript modules do not import an untyped JavaScript boundary:

```ts
export function parseProjectCatalog(text: string): unknown
export function validateProjectCatalog(data: unknown): string[]
export function validateProjectCatalogIntegration(data: unknown, sources: {
  contentItems: readonly { id?: unknown }[]
  interviewQuestions: readonly { id?: unknown }[]
}): string[]
export function validateProjectCatalogFile(path: string): string[]
export function loadProjectCatalog(path: string): unknown
```

The accepted path-scope grammar is deliberately small: `**`, one exact repository-relative file, or one repository-relative `prefix/**`. This makes “most specific wins” deterministic; equal-specificity overlaps reduce to identical selectors and are rejected when their expressions differ.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run:

```bash
pnpm vitest run tests/project-catalog.spec.ts -t 'project catalog schema'
pnpm test && pnpm validate && pnpm build
```

Expected: 8 focused tests pass, followed by a green full suite, validation, and production build.

- [ ] **Step 5: Commit the parser**

```bash
git add scripts/project-catalog.mjs scripts/project-catalog.d.mts tests/project-catalog.spec.ts
git commit -m "feat: validate project catalog contracts"
```

### Task 2: Populate the exact 13-subject catalog and wire content validation

**Files:**

- Create: `sources/project-index.yml`
- Modify: `scripts/validate-content.mjs`
- Modify: `tests/project-catalog.spec.ts`

- [ ] **Step 1: Add a failing file-existence test without reading a missing file**

Start the real-catalog section with a guarded load. This makes the first RED an assertion failure rather than a top-level `ENOENT` suite error:

```ts
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { parse } from 'yaml'
import { validateBook } from '../scripts/validate-content.mjs'

const pageIds = [
  'projects-index', 'project-mcp-python-sdk', 'project-aider', 'project-openhands',
  'project-agent-benchmarks', 'project-dify', 'project-crewai',
  'project-history-autogpt-flowise',
]
const subjectIds = [
  'mcp-spec', 'mcp-python-sdk', 'aider', 'openhands-canvas', 'openhands-sdk',
  'swe-bench', 'tau2-bench', 'dify', 'crewai', 'autogpt', 'flowise',
  'hermes-agent', 'openclaw',
]
const expectedPageMappings = {
  'projects-index': { catalog_tier: 'core', subjects: subjectIds, interview_question_ids: [], counted_in_course: false, primary_chain_id: null },
  'project-mcp-python-sdk': { catalog_tier: 'core', subjects: ['mcp-spec', 'mcp-python-sdk'], interview_question_ids: ['iq-04-a', 'iq-04-b', 'iq-04-c'], counted_in_course: true, primary_chain_id: 'mcp-tool-call' },
  'project-aider': { catalog_tier: 'core', subjects: ['aider'], interview_question_ids: ['iq-13-a', 'iq-13-b', 'iq-13-c'], counted_in_course: true, primary_chain_id: 'aider-repo-to-verified-edit' },
  'project-openhands': { catalog_tier: 'core', subjects: ['openhands-canvas', 'openhands-sdk'], interview_question_ids: ['iq-09-b', 'iq-10-a', 'iq-13-c'], counted_in_course: true, primary_chain_id: 'openhands-canvas-to-workspace-event' },
  'project-agent-benchmarks': { catalog_tier: 'core', subjects: ['swe-bench', 'tau2-bench'], interview_question_ids: ['iq-08-a', 'iq-08-b', 'iq-08-c'], counted_in_course: true, primary_chain_id: 'benchmark-task-to-score' },
  'project-dify': { catalog_tier: 'core', subjects: ['dify'], interview_question_ids: ['iq-02-b', 'iq-06-a', 'iq-10-a'], counted_in_course: true, primary_chain_id: 'dify-request-to-graph-events' },
  'project-crewai': { catalog_tier: 'core', subjects: ['crewai'], interview_question_ids: ['iq-07-a', 'iq-07-b', 'iq-07-c'], counted_in_course: true, primary_chain_id: 'crewai-kickoff-to-task-output' },
  'project-history-autogpt-flowise': { catalog_tier: 'historical', subjects: ['autogpt', 'flowise'], interview_question_ids: ['iq-02-b', 'iq-07-c', 'iq-10-a'], counted_in_course: false, primary_chain_id: 'autogpt-flowise-evolution' },
}
const expectedEntrypoints = {
  'mcp-spec': ['schema/2026-07-28/schema.json'],
  'mcp-python-sdk': ['examples/snippets/servers/basic_tool.py', 'src/mcp/server/mcpserver/server.py', 'src/mcp/server/stdio.py', 'src/mcp/server/lowlevel/server.py', 'src/mcp/server/runner.py', 'src/mcp/shared/jsonrpc_dispatcher.py', 'src/mcp/server/mcpserver/tools/tool_manager.py', 'src/mcp/server/mcpserver/tools/base.py'],
  aider: ['aider/main.py', 'aider/coders/base_coder.py', 'aider/models.py', 'aider/repomap.py', 'aider/coders/editblock_coder.py', 'aider/io.py', 'aider/repo.py', 'aider/commands.py'],
  'openhands-canvas': ['src/components/features/chat/chat-interface.tsx', 'src/hooks/use-send-message.ts', 'src/contexts/conversation-websocket-context.tsx'],
  'openhands-sdk': ['openhands-agent-server/openhands/agent_server/sockets.py', 'openhands-agent-server/openhands/agent_server/event_service.py', 'openhands-sdk/openhands/sdk/conversation/impl/local_conversation.py', 'openhands-sdk/openhands/sdk/agent/agent.py', 'openhands-sdk/openhands/sdk/agent/response_dispatch.py', 'openhands-sdk/openhands/sdk/tool/tool.py'],
  'swe-bench': ['swebench/harness/run_evaluation.py', 'swebench/harness/docker_utils.py', 'swebench/harness/grading.py', 'swebench/harness/reporting.py'],
  'tau2-bench': ['src/tau2/cli.py', 'src/tau2/runner/batch.py', 'src/tau2/runner/helpers.py', 'src/tau2/runner/build.py', 'src/tau2/runner/simulation.py', 'src/tau2/orchestrator/orchestrator.py', 'src/tau2/environment/environment.py', 'src/tau2/evaluator/evaluator.py'],
  dify: ['api/controllers/service_api/app/workflow.py', 'api/services/app_generate_service.py', 'api/tasks/app_generate/workflow_execute_task.py', 'api/core/app/apps/workflow/app_generator.py', 'api/core/app/apps/workflow/app_runner.py', 'api/core/app/apps/workflow_app_runner.py', 'api/core/workflow/node_factory.py', 'api/core/workflow/nodes/agent_v2/agent_node.py', 'api/core/workflow/workflow_entry.py', 'api/core/app/apps/workflow/app_queue_manager.py', 'api/core/app/apps/workflow/generate_task_pipeline.py', 'api/core/app/apps/common/workflow_response_converter.py', 'api/core/app/apps/workflow/generate_response_converter.py'],
  crewai: ['lib/crewai/src/crewai/crew.py', 'lib/crewai/src/crewai/execution.py', 'lib/crewai/src/crewai/crews/utils.py', 'lib/crewai/src/crewai/process.py', 'lib/crewai/src/crewai/task.py', 'lib/crewai/src/crewai/agent/core.py', 'lib/crewai/src/crewai/experimental/agent_executor.py', 'lib/crewai/src/crewai/utilities/agent_utils.py', 'lib/crewai/src/crewai/tools/tool_usage.py', 'lib/crewai/src/crewai/tools/structured_tool.py', 'lib/crewai/src/crewai/agents/step_executor.py'],
  autogpt: ['classic/original_autogpt/autogpt/app/main.py', 'classic/original_autogpt/autogpt/agents/agent.py'],
  flowise: ['packages/server/src/controllers/predictions/index.ts', 'packages/server/src/services/predictions/index.ts'],
  'hermes-agent': [],
  openclaw: [],
}
const expectedCoreEntrypointSymbols = {
  'mcp-spec': {
    'schema/2026-07-28/schema.json': ['CallToolRequest'],
  },
  'mcp-python-sdk': {
    'examples/snippets/servers/basic_tool.py': ['MCPServer', 'mcp.tool', 'sum'],
    'src/mcp/server/mcpserver/server.py': ['MCPServer.run', 'run_stdio_async', 'MCPServer._handle_call_tool', 'MCPServer.call_tool'],
    'src/mcp/server/stdio.py': ['stdio_server'],
    'src/mcp/server/lowlevel/server.py': ['Server.run', 'get_request_handler'],
    'src/mcp/server/runner.py': ['serve_dual_era_loop', 'ServerRunner._on_request', 'ServerRunner._serialize'],
    'src/mcp/shared/jsonrpc_dispatcher.py': ['JSONRPCDispatcher.run', 'JSONRPCDispatcher._dispatch_request', 'JSONRPCDispatcher._write_result'],
    'src/mcp/server/mcpserver/tools/tool_manager.py': ['ToolManager.call_tool'],
    'src/mcp/server/mcpserver/tools/base.py': ['Tool.run'],
  },
  aider: {
    'aider/main.py': ['main'],
    'aider/coders/base_coder.py': ['Coder.run', 'Coder.run_one', 'Coder.send_message', 'Coder.send', 'Coder.apply_updates', 'Coder.prepare_to_edit', 'Coder.auto_commit', 'Coder.lint_edited', 'Coder.run_shell_commands', 'Coder.handle_shell_commands'],
    'aider/models.py': ['Model.send_completion', 'simple_send_with_retries'],
    'aider/repomap.py': ['RepoMap.get_repo_map'],
    'aider/coders/editblock_coder.py': ['EditBlockCoder.get_edits', 'EditBlockCoder.apply_edits_dry_run', 'EditBlockCoder.apply_edits'],
    'aider/io.py': ['InputOutput.write_text', 'InputOutput.confirm_ask'],
    'aider/repo.py': ['GitRepo.commit', 'GitRepo.get_commit_message'],
    'aider/commands.py': ['Commands.cmd_test'],
  },
  'openhands-canvas': {
    'src/components/features/chat/chat-interface.tsx': ['handleSendMessage'],
    'src/hooks/use-send-message.ts': ['useSendMessage().send'],
    'src/contexts/conversation-websocket-context.tsx': ['ConversationWebSocketProvider.sendMessage', 'ConversationWebSocketProvider.handleMainMessage'],
  },
  'openhands-sdk': {
    'openhands-agent-server/openhands/agent_server/sockets.py': ['events_socket', '_WebSocketSubscriber.__call__', '_send_event'],
    'openhands-agent-server/openhands/agent_server/event_service.py': ['EventService.send_message', 'EventService.run', 'EventService.subscribe_to_events', 'EventService.start'],
    'openhands-sdk/openhands/sdk/conversation/impl/local_conversation.py': ['LocalConversation.__init__', 'LocalConversation.send_message', 'LocalConversation.arun'],
    'openhands-sdk/openhands/sdk/agent/agent.py': ['Agent.astep', 'Agent._get_action_event', 'Agent._aexecute_actions'],
    'openhands-sdk/openhands/sdk/agent/response_dispatch.py': ['_ahandle_tool_calls'],
    'openhands-sdk/openhands/sdk/tool/tool.py': ['ToolDefinition.__call__'],
  },
  'tau2-bench': {
    'src/tau2/cli.py': ['main'],
    'src/tau2/runner/batch.py': ['run_domain', 'run_tasks', 'run_single_task'],
    'src/tau2/runner/helpers.py': ['get_tasks', 'load_tasks'],
    'src/tau2/runner/build.py': ['build_orchestrator', 'build_environment', 'build_agent', 'build_user'],
    'src/tau2/runner/simulation.py': ['run_simulation'],
    'src/tau2/orchestrator/orchestrator.py': ['BaseOrchestrator.run', 'BaseOrchestrator._execute_tool_calls'],
    'src/tau2/environment/environment.py': ['Environment.get_response', 'Environment.make_tool_call'],
    'src/tau2/evaluator/evaluator.py': ['evaluate_simulation'],
  },
  dify: {
    'api/controllers/service_api/app/workflow.py': ['WorkflowRunApi.post'],
    'api/services/app_generate_service.py': ['AppGenerateService.generate', 'AppGenerateService._run_with_guardrails', 'AppGenerateService._dispatch_generate', 'AppGenerateService._build_streaming_task_on_subscribe'],
    'api/tasks/app_generate/workflow_execute_task.py': ['_AppRunner.run', '_publish_streaming_response', 'workflow_based_app_execution_task'],
    'api/core/app/apps/workflow/app_generator.py': ['WorkflowAppGenerator.generate', 'WorkflowAppGenerator._generate', 'WorkflowAppGenerator._generate_worker'],
    'api/core/app/apps/workflow/app_runner.py': ['WorkflowAppRunner.run'],
    'api/core/app/apps/workflow_app_runner.py': ['WorkflowBasedAppRunner._init_graph', 'WorkflowBasedAppRunner._handle_event'],
    'api/core/workflow/node_factory.py': ['DifyNodeFactory.create_node'],
    'api/core/workflow/nodes/agent_v2/agent_node.py': ['DifyAgentNode.__init__', 'DifyAgentNode._run', 'DifyAgentNode._run_inner'],
    'api/core/workflow/workflow_entry.py': ['WorkflowEntry.__init__', 'WorkflowEntry.run'],
    'api/core/app/apps/workflow/app_queue_manager.py': ['WorkflowAppQueueManager._publish'],
    'api/core/app/apps/workflow/generate_task_pipeline.py': ['WorkflowAppGenerateTaskPipeline.process', 'WorkflowAppGenerateTaskPipeline._to_blocking_response', 'WorkflowAppGenerateTaskPipeline._to_stream_response'],
    'api/core/app/apps/common/workflow_response_converter.py': ['WorkflowResponseConverter.workflow_start_to_stream_response', 'WorkflowResponseConverter.workflow_finish_to_stream_response', 'WorkflowResponseConverter.handle_agent_log'],
    'api/core/app/apps/workflow/generate_response_converter.py': ['WorkflowAppGenerateResponseConverter.convert_blocking_full_response', 'WorkflowAppGenerateResponseConverter.convert_stream_full_response'],
  },
  crewai: {
    'lib/crewai/src/crewai/crew.py': ['Crew.kickoff', 'Crew._run_sequential_process', 'Crew._execute_tasks', 'Crew._create_crew_output'],
    'lib/crewai/src/crewai/execution.py': ['begin_execution', 'end_execution'],
    'lib/crewai/src/crewai/crews/utils.py': ['prepare_kickoff', 'setup_agents', 'prepare_task_execution'],
    'lib/crewai/src/crewai/process.py': ['Process'],
    'lib/crewai/src/crewai/task.py': ['Task.execute_sync', 'Task._execute_core', 'Task._export_output'],
    'lib/crewai/src/crewai/agent/core.py': ['Agent.execute_task', 'Agent.create_agent_executor', 'Agent._finalize_task_execution'],
    'lib/crewai/src/crewai/experimental/agent_executor.py': ['AgentExecutor.invoke', 'AgentExecutor.generate_plan', 'AgentExecutor._ensure_step_executor', 'AgentExecutor.call_llm_and_parse', 'AgentExecutor.execute_tool_action', 'AgentExecutor.call_llm_native_tools', 'AgentExecutor.execute_native_tool', 'AgentExecutor._execute_single_native_tool_call'],
    'lib/crewai/src/crewai/utilities/agent_utils.py': ['process_llm_response'],
    'lib/crewai/src/crewai/tools/tool_usage.py': ['ToolUsage.use', 'ToolUsage._use'],
    'lib/crewai/src/crewai/tools/structured_tool.py': ['CrewStructuredTool.invoke'],
    'lib/crewai/src/crewai/agents/step_executor.py': ['StepExecutor.execute'],
  },
}
const expectedChains = {
  'mcp-tool-call': ['schema:mcp-spec:schema/2026-07-28/schema.json:CallToolRequest', 'host-run:mcp-python-sdk:src/mcp/server/mcpserver/server.py:MCPServer.run', 'transport:mcp-python-sdk:src/mcp/server/stdio.py:stdio_server', 'server-run:mcp-python-sdk:src/mcp/server/lowlevel/server.py:Server.run', 'runner-loop:mcp-python-sdk:src/mcp/server/runner.py:serve_dual_era_loop', 'dispatcher-loop:mcp-python-sdk:src/mcp/shared/jsonrpc_dispatcher.py:JSONRPCDispatcher.run', 'dispatcher-request:mcp-python-sdk:src/mcp/shared/jsonrpc_dispatcher.py:JSONRPCDispatcher._dispatch_request', 'request:mcp-python-sdk:src/mcp/server/runner.py:ServerRunner._on_request', 'dispatch:mcp-python-sdk:src/mcp/server/lowlevel/server.py:get_request_handler', 'mcp-handler:mcp-python-sdk:src/mcp/server/mcpserver/server.py:MCPServer._handle_call_tool', 'mcp-call:mcp-python-sdk:src/mcp/server/mcpserver/server.py:MCPServer.call_tool', 'tool-lookup:mcp-python-sdk:src/mcp/server/mcpserver/tools/tool_manager.py:ToolManager.call_tool', 'tool-run:mcp-python-sdk:src/mcp/server/mcpserver/tools/base.py:Tool.run', 'tool-function:mcp-python-sdk:examples/snippets/servers/basic_tool.py:sum', 'serialize:mcp-python-sdk:src/mcp/server/runner.py:ServerRunner._serialize', 'dispatcher-response:mcp-python-sdk:src/mcp/shared/jsonrpc_dispatcher.py:JSONRPCDispatcher._write_result', 'stdout:mcp-python-sdk:src/mcp/server/stdio.py:stdio_server'],
  'aider-repo-to-verified-edit': ['cli:aider:aider/main.py:main', 'run:aider:aider/coders/base_coder.py:Coder.run', 'turn:aider:aider/coders/base_coder.py:Coder.run_one', 'context:aider:aider/coders/base_coder.py:Coder.send_message', 'repo-map:aider:aider/repomap.py:RepoMap.get_repo_map', 'send:aider:aider/coders/base_coder.py:Coder.send', 'completion:aider:aider/models.py:Model.send_completion', 'parse:aider:aider/coders/editblock_coder.py:EditBlockCoder.get_edits', 'apply-updates:aider:aider/coders/base_coder.py:Coder.apply_updates', 'dry-run:aider:aider/coders/editblock_coder.py:EditBlockCoder.apply_edits_dry_run', 'prepare:aider:aider/coders/base_coder.py:Coder.prepare_to_edit', 'apply:aider:aider/coders/editblock_coder.py:EditBlockCoder.apply_edits', 'write:aider:aider/io.py:InputOutput.write_text', 'auto-commit:aider:aider/coders/base_coder.py:Coder.auto_commit', 'commit:aider:aider/repo.py:GitRepo.commit', 'auto-lint:aider:aider/coders/base_coder.py:Coder.lint_edited', 'lint-commit:aider:aider/coders/base_coder.py:Coder.auto_commit', 'shell-confirm:aider:aider/io.py:InputOutput.confirm_ask', 'shell-run:aider:aider/coders/base_coder.py:Coder.handle_shell_commands', 'auto-test:aider:aider/commands.py:Commands.cmd_test', 'reflection:aider:aider/coders/base_coder.py:Coder.run_one'],
  'openhands-canvas-to-workspace-event': ['chat-submit:openhands-canvas:src/components/features/chat/chat-interface.tsx:handleSendMessage', 'hook-send:openhands-canvas:src/hooks/use-send-message.ts:useSendMessage().send', 'canvas-send:openhands-canvas:src/contexts/conversation-websocket-context.tsx:ConversationWebSocketProvider.sendMessage', 'socket-receive:openhands-sdk:openhands-agent-server/openhands/agent_server/sockets.py:events_socket', 'service-message:openhands-sdk:openhands-agent-server/openhands/agent_server/event_service.py:EventService.send_message', 'conversation-message:openhands-sdk:openhands-sdk/openhands/sdk/conversation/impl/local_conversation.py:LocalConversation.send_message', 'service-run:openhands-sdk:openhands-agent-server/openhands/agent_server/event_service.py:EventService.run', 'conversation-run:openhands-sdk:openhands-sdk/openhands/sdk/conversation/impl/local_conversation.py:LocalConversation.arun', 'agent-step:openhands-sdk:openhands-sdk/openhands/sdk/agent/agent.py:Agent.astep', 'dispatch-tool-calls:openhands-sdk:openhands-sdk/openhands/sdk/agent/response_dispatch.py:_ahandle_tool_calls', 'execute-actions:openhands-sdk:openhands-sdk/openhands/sdk/agent/agent.py:Agent._aexecute_actions', 'tool-call:openhands-sdk:openhands-sdk/openhands/sdk/tool/tool.py:ToolDefinition.__call__', 'persist-event:openhands-sdk:openhands-sdk/openhands/sdk/conversation/impl/local_conversation.py:LocalConversation.__init__', 'publish-event:openhands-sdk:openhands-agent-server/openhands/agent_server/event_service.py:EventService.start', 'socket-send:openhands-sdk:openhands-agent-server/openhands/agent_server/sockets.py:_WebSocketSubscriber.__call__', 'canvas-receive:openhands-canvas:src/contexts/conversation-websocket-context.tsx:ConversationWebSocketProvider.handleMainMessage'],
  'benchmark-task-to-score': ['swe-input:swe-bench:swebench/harness/run_evaluation.py:main', 'swe-env:swe-bench:swebench/harness/docker_utils.py:exec_run_with_timeout', 'swe-grade:swe-bench:swebench/harness/grading.py:get_eval_report', 'swe-report:swe-bench:swebench/harness/reporting.py:make_run_report', 'tau-cli:tau2-bench:src/tau2/cli.py:main', 'tau-domain:tau2-bench:src/tau2/runner/batch.py:run_domain', 'tau-load:tau2-bench:src/tau2/runner/helpers.py:get_tasks', 'tau-batch:tau2-bench:src/tau2/runner/batch.py:run_tasks', 'tau-task:tau2-bench:src/tau2/runner/batch.py:run_single_task', 'tau-build:tau2-bench:src/tau2/runner/build.py:build_orchestrator', 'tau-sim:tau2-bench:src/tau2/runner/simulation.py:run_simulation', 'tau-orchestrator:tau2-bench:src/tau2/orchestrator/orchestrator.py:BaseOrchestrator.run', 'tau-environment:tau2-bench:src/tau2/environment/environment.py:Environment.make_tool_call', 'tau-trajectory:tau2-bench:src/tau2/runner/simulation.py:run_simulation', 'tau-evaluate:tau2-bench:src/tau2/evaluator/evaluator.py:evaluate_simulation', 'tau-reward:tau2-bench:src/tau2/evaluator/evaluator.py:evaluate_simulation'],
  'dify-request-to-graph-events': ['dify-01-controller:dify:api/controllers/service_api/app/workflow.py:WorkflowRunApi.post', 'dify-02-service:dify:api/services/app_generate_service.py:AppGenerateService.generate', 'dify-03-guardrails:dify:api/services/app_generate_service.py:AppGenerateService._run_with_guardrails', 'dify-04-workflow-mode:dify:api/services/app_generate_service.py:AppGenerateService._dispatch_generate', 'dify-05-generate:dify:api/core/app/apps/workflow/app_generator.py:WorkflowAppGenerator.generate', 'dify-06-generate-core:dify:api/core/app/apps/workflow/app_generator.py:WorkflowAppGenerator._generate', 'dify-07-worker:dify:api/core/app/apps/workflow/app_generator.py:WorkflowAppGenerator._generate_worker', 'dify-08-runner:dify:api/core/app/apps/workflow/app_runner.py:WorkflowAppRunner.run', 'dify-09-graph-init:dify:api/core/app/apps/workflow_app_runner.py:WorkflowBasedAppRunner._init_graph', 'dify-10-node-factory:dify:api/core/workflow/node_factory.py:DifyNodeFactory.create_node', 'dify-11-agent-node:dify:api/core/workflow/nodes/agent_v2/agent_node.py:DifyAgentNode.__init__', 'dify-12-entry:dify:api/core/workflow/workflow_entry.py:WorkflowEntry.__init__', 'dify-12b-runner-layers:dify:api/core/app/apps/workflow/app_runner.py:WorkflowAppRunner.run', 'dify-13-engine:dify:api/core/workflow/workflow_entry.py:WorkflowEntry.run', 'dify-14-agent-run:dify:api/core/workflow/nodes/agent_v2/agent_node.py:DifyAgentNode._run', 'dify-15-agent-backend:dify:api/core/workflow/nodes/agent_v2/agent_node.py:DifyAgentNode._run_inner', 'dify-16-event-handler:dify:api/core/app/apps/workflow_app_runner.py:WorkflowBasedAppRunner._handle_event', 'dify-17-queue:dify:api/core/app/apps/workflow/app_queue_manager.py:WorkflowAppQueueManager._publish', 'dify-18-pipeline:dify:api/core/app/apps/workflow/generate_task_pipeline.py:WorkflowAppGenerateTaskPipeline.process', 'dify-19-typed:dify:api/core/app/apps/common/workflow_response_converter.py:WorkflowResponseConverter.workflow_finish_to_stream_response', 'dify-20-aggregate:dify:api/core/app/apps/workflow/generate_task_pipeline.py:WorkflowAppGenerateTaskPipeline._to_blocking_response', 'dify-21-public:dify:api/core/app/apps/workflow/generate_response_converter.py:WorkflowAppGenerateResponseConverter.convert_blocking_full_response', 'dify-stream-01-subscribe:dify:api/services/app_generate_service.py:AppGenerateService._build_streaming_task_on_subscribe', 'dify-stream-02-dispatch:dify:api/services/app_generate_service.py:AppGenerateService._dispatch_generate', 'dify-stream-03-task:dify:api/tasks/app_generate/workflow_execute_task.py:workflow_based_app_execution_task', 'dify-stream-04-runner:dify:api/tasks/app_generate/workflow_execute_task.py:_AppRunner.run', 'dify-stream-05-worker:dify:api/core/app/apps/workflow/app_generator.py:WorkflowAppGenerator._generate_worker', 'dify-stream-06-typed:dify:api/core/app/apps/workflow/generate_task_pipeline.py:WorkflowAppGenerateTaskPipeline._to_stream_response', 'dify-stream-07-public:dify:api/core/app/apps/workflow/generate_response_converter.py:WorkflowAppGenerateResponseConverter.convert_stream_full_response', 'dify-stream-08-topic:dify:api/tasks/app_generate/workflow_execute_task.py:_publish_streaming_response', 'dify-stream-09-retrieve:dify:api/services/app_generate_service.py:AppGenerateService._dispatch_generate'],
  'crewai-kickoff-to-task-output': ['crew-01-kickoff:crewai:lib/crewai/src/crewai/crew.py:Crew.kickoff', 'crew-02-begin:crewai:lib/crewai/src/crewai/execution.py:begin_execution', 'crew-03-prepare:crewai:lib/crewai/src/crewai/crews/utils.py:prepare_kickoff', 'crew-04-setup-agents:crewai:lib/crewai/src/crewai/crews/utils.py:setup_agents', 'crew-05-create-executor:crewai:lib/crewai/src/crewai/agent/core.py:Agent.create_agent_executor', 'crew-06-sequential:crewai:lib/crewai/src/crewai/crew.py:Crew._run_sequential_process', 'crew-07-execute-tasks:crewai:lib/crewai/src/crewai/crew.py:Crew._execute_tasks', 'crew-08-prepare-task:crewai:lib/crewai/src/crewai/crews/utils.py:prepare_task_execution', 'crew-09-task-sync:crewai:lib/crewai/src/crewai/task.py:Task.execute_sync', 'crew-10-task-core:crewai:lib/crewai/src/crewai/task.py:Task._execute_core', 'crew-11-agent:crewai:lib/crewai/src/crewai/agent/core.py:Agent.execute_task', 'crew-12-invoke:crewai:lib/crewai/src/crewai/experimental/agent_executor.py:AgentExecutor.invoke', 'crew-13-finish:crewai:lib/crewai/src/crewai/experimental/agent_executor.py:AgentExecutor.invoke', 'crew-14-finalize:crewai:lib/crewai/src/crewai/agent/core.py:Agent._finalize_task_execution', 'crew-15-task-output:crewai:lib/crewai/src/crewai/task.py:Task._execute_core', 'crew-16-crew-output:crewai:lib/crewai/src/crewai/crew.py:Crew._create_crew_output', 'crew-17-end:crewai:lib/crewai/src/crewai/execution.py:end_execution', 'crew-text-01-llm:crewai:lib/crewai/src/crewai/experimental/agent_executor.py:AgentExecutor.call_llm_and_parse', 'crew-text-02-action:crewai:lib/crewai/src/crewai/experimental/agent_executor.py:AgentExecutor.execute_tool_action', 'crew-text-03-use:crewai:lib/crewai/src/crewai/tools/tool_usage.py:ToolUsage.use', 'crew-text-04-use-inner:crewai:lib/crewai/src/crewai/tools/tool_usage.py:ToolUsage._use', 'crew-text-05-invoke:crewai:lib/crewai/src/crewai/tools/structured_tool.py:CrewStructuredTool.invoke', 'crew-native-01-llm:crewai:lib/crewai/src/crewai/experimental/agent_executor.py:AgentExecutor.call_llm_native_tools', 'crew-native-02-action:crewai:lib/crewai/src/crewai/experimental/agent_executor.py:AgentExecutor.execute_native_tool', 'crew-native-03-single:crewai:lib/crewai/src/crewai/experimental/agent_executor.py:AgentExecutor._execute_single_native_tool_call', 'crew-plan-01-plan:crewai:lib/crewai/src/crewai/experimental/agent_executor.py:AgentExecutor.generate_plan', 'crew-plan-02-lazy:crewai:lib/crewai/src/crewai/experimental/agent_executor.py:AgentExecutor._ensure_step_executor', 'crew-plan-03-execute:crewai:lib/crewai/src/crewai/agents/step_executor.py:StepExecutor.execute'],
  'autogpt-flowise-evolution': ['autogpt-entry:autogpt:classic/original_autogpt/autogpt/app/main.py:run_auto_gpt', 'autogpt-agent:autogpt:classic/original_autogpt/autogpt/agents/agent.py:Agent.execute', 'flowise-entry:flowise:packages/server/src/controllers/predictions/index.ts:createPrediction', 'flowise-service:flowise:packages/server/src/services/predictions/index.ts:buildChatflow'],
}
const expectedAiderTracksAndLabels = [
  ['cli', '主请求链', 'Repository preflight'],
  ['run', '主请求链', 'Conversation loop'],
  ['turn', '主请求链', 'Single turn'],
  ['context', '主请求链', 'Context assembly'],
  ['repo-map', '主请求链', 'RepoMap selection'],
  ['send', '主请求链', 'Model send'],
  ['completion', '主请求链', 'Completion stream'],
  ['parse', '主请求链', 'Edit tuple parsing'],
  ['apply-updates', '主请求链', 'Update orchestration'],
  ['dry-run', '主请求链', 'Dry-run validation'],
  ['prepare', '主请求链', 'Dirty-file precommit'],
  ['apply', '主请求链', 'Filesystem edit'],
  ['write', '主请求链', 'File write'],
  ['auto-commit', '自动提交与 lint（条件分支）', 'First auto-commit'],
  ['commit', '自动提交与 lint（条件分支）', 'Git commit'],
  ['auto-lint', '自动提交与 lint（条件分支）', 'Auto-lint edited files'],
  ['lint-commit', '自动提交与 lint（条件分支）', 'Second commit after lint'],
  ['shell-confirm', '需确认 Shell 分支', 'Shell confirmation'],
  ['shell-run', '需确认 Shell 分支', 'Shell execution'],
  ['auto-test', '可选 auto-test 分支', 'Optional auto-test'],
  ['reflection', '错误反思回路', 'Error reflection'],
]
const expectedSubjectFacts = {
  'mcp-spec': ['modelcontextprotocol/modelcontextprotocol', '2026-07-28', '5f5440bb26a62e2cf3440b92da5a667efa03b267', 'active', false, 'core', 'LICENSE:0382b0057770ca05e9c350a50aa3b1c1fea84da0bc81d723bf00b9aa841be58a'],
  'mcp-python-sdk': ['modelcontextprotocol/python-sdk', 'v2.2.0', '9972c21aa42054fb1450c5fc614761ed11847ec6', 'active', false, 'core', 'LICENSE:5e13dbbc1d120fc2a03cecde7c91424ae2d7de11b63d58ded2f4431e261ee50d'],
  aider: ['Aider-AI/aider', 'v0.86.0', 'a4be6ccd87ebaa59b361f3f028d116ce1761b626', 'active', false, 'core', 'LICENSE.txt:cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30'],
  'openhands-canvas': ['OpenHands/OpenHands', 'v1.24.0', '7dc6805406ea3c76cb4a3ce407c3c72d481b0ac6', 'active', false, 'core', 'LICENSE:e1d1fa9f3a8d7bef24449d488fcd8f00f8f272cac297bb9bed161eb6175b876a'],
  'openhands-sdk': ['OpenHands/software-agent-sdk', 'v1.49.6', 'fcc102a697874d54a357e36004e02c95040dbdc0', 'active', false, 'core', 'LICENSE:14a9b631c658eee682c6c2973525fbdf808c3457176bc47513052c559cc5ce86'],
  'swe-bench': ['SWE-bench/SWE-bench', 'v5.0.1', '87ab1f6ced28f75ba73ca899dc759b019310944a', 'active', false, 'core', 'LICENSE:2bd2e08df7147f67a69b42c10efae09bd4bf119df397371036187d5dd1b02f57'],
  'tau2-bench': ['sierra-research/tau2-bench', 'v1.0.1', 'fc0055dc4e0a316c3f83133267fbd6faaa770992', 'active', false, 'core', 'LICENSE:e67c5aa0074dfcaefd3c3a1aedb94cb539234aecd15d5a972574e3200e6252fe'],
  dify: ['langgenius/dify', '1.17.1', '8387590ace4a094de812b7847fc6a4c3a27cd52b', 'active', false, 'core', 'LICENSE:232cf91474932d5110ed304e53b6b742a58463857c571fae803fdf2ac36d7bb3'],
  crewai: ['crewAIInc/crewAI', '1.15.22', '7a01af27912c2b142d8bac70d1894343f8b91bd1', 'active', false, 'core', 'LICENSE:28868731966f4aa37f02879839aabc797137e27ddde4e274ef9cf965f9a71774'],
  autogpt: ['Significant-Gravitas/AutoGPT', 'autogpt-platform-beta-v0.8.1', 'ead8f943f981ea650285eee3020c8ff0e7eda94d', 'active', false, 'historical', 'LICENSE:aafc62ebf01092909ae72131b66f48c89ea7eaf4bd7e916f3f05f7960611799a'],
  flowise: ['FlowiseAI/Flowise', 'flowise@3.1.4', 'a65f81bb43ef66d3ce734bf0dff4223ae8041c95', 'eol', true, 'historical', 'LICENSE.md:eb8cc244c81eb4a556f9ac22edc3033ac4fa12f7ef7a8899bb5ddc4578c2dd73'],
  'hermes-agent': ['NousResearch/hermes-agent', 'v2026.9.24', 'f97608f178d1ffeca59860195ab7da295f7c8e5f', 'active', false, 'watch-only', 'LICENSE:821556e6336796450ab852d375117b48a4887e71d255794fd6318d99982a5ab6'],
  openclaw: ['openclaw/openclaw', 'v2026.9.6', 'eb377ac59e6c9fd6c7705028034812becf00271b', 'active', false, 'watch-only', 'LICENSE:73571b25326281d369087f469842c02444fe39faaecebda4d82ed21ff3a1c29d|THIRD_PARTY_NOTICES.md:c1d1bbc550feee74853eba104e347341569cbbbe37a9f77659993ca0766277d5'],
}
const expectedDefaultHeads = {
  'mcp-spec': ['main', 'ab3a39c13bd23be691c2760e1c6c5c15a64582e1'],
  'mcp-python-sdk': ['main', 'f1b6589088534632fef92238ee9750951e3c0185'],
  aider: ['main', '5dc9490bb35f9729ef2c95d00a19ccd30c26339c'],
  'openhands-canvas': ['main', '47a10808d78561546a02555d0d2c7fa96fa96300'],
  'openhands-sdk': ['main', 'a350dc73ef9b4d3a801ffab2aed211a04d2120a9'],
  'swe-bench': ['main', '02e7a74ffd0b707aab73d203fe87bdc7c76afc8e'],
  'tau2-bench': ['main', 'b7ea9074c1cba482b30687fecdb5c8425fd6f619'],
  dify: ['main', 'f4602cc1fe8448486e185be74152699322ccec3f'],
  crewai: ['main', '4ed2abc7bbf504a634d3b733f2a97e0fbe8d44ec'],
  autogpt: ['master', '5e84f064d3779acc49c86c51e2167ba8f660c93d'],
  flowise: ['main', '9291856d1ea4a4ceea9f8fef8ce14f4f6c81e8eb'],
  'hermes-agent': ['main', 'd0288be5b3330d2442e3907185b8e9d0958297bb'],
  openclaw: ['main', '51ec96836f768c07c80e9d11af872014e7436d69'],
}
const expectedSubjectDigests = {
  'mcp-spec': '911ce4822c6c2a9a08ea69979905bd0ab7d809fe125130dc5d64fba3826b0a4b',
  'mcp-python-sdk': '44c444c5693d70a6303caa5c73199bb66f64b4cad976a3b7531636aa543e2bca',
  aider: 'e05d3f6975d9073915a8c08023631b926b674e84e25f8f417f4ef01058e0f7b9',
  'openhands-canvas': '20adab4e8847459cccb32b0e35c691be4d9ecf62beec281231eb7b461c1b35f6',
  'openhands-sdk': '058bd4781231926efe7b2f5b0da0f625044db08ba9761bdf38b8254f53842560',
  'swe-bench': '6a56d49723da575a8a3cc7d25f0c2518a55b9e123d4842e90a0b1750cb49bd81',
  'tau2-bench': '595043b096692a7a1b7013dd97db7d3f13a502af5d4cb312b899f0cce4be7b80',
  dify: '829d3713451b9ab8d4ee5006a08887e250abc6ef304497d28436e9b53c210d9b',
  crewai: '4fbcdba367ecc5a34c26073f43a562cf69d479101cd7fe2e1fe23857abf3892a',
  autogpt: '04b3fc7cd80081e19a46f0a53cb47d3c30b18ba31f5e61c7a51e67d9958ac134',
  flowise: 'c5b6637a3dd85cfc3a936a45a72e4753f2662b2749a27c52c7b73909f50cc90e',
  'hermes-agent': 'a66ccc1c3e28d2f188954922f48ad62c53783cf5bac110000ffcd8771445ee5d',
  openclaw: '4bbbb022c40f27ede7f2b9bea9faecfcfd9154728fe21ed556775c41a97d5fa3',
}
const expectedChainDigests = {
  'mcp-tool-call': '54b46cce64ce2559ae2656a61335d2b92df9df99fdf87e1b7215efe76d4a1ab4',
  'aider-repo-to-verified-edit': '222bc344a8184b8ff7cac95a1e36f620a50a58cacb0f61b459132238164486ce',
  'openhands-canvas-to-workspace-event': '168bff273714e7a5f797f51d6bff179ede412397be22f5c5742bbef8669a5a06',
  'benchmark-task-to-score': '4bc18b2acf77c5290f31cf416e89b1f34a3001b1f85a69c365425fcbf8ae5da2',
  'dify-request-to-graph-events': 'b54db7b2c91b7969d29df2894329f69be106d1e6112b81474cfa289f932317da',
  'crewai-kickoff-to-task-output': '9cf11a684c407317005fcedb74236f4f44f75bc962239b5c6b08452ded490943',
  'autogpt-flowise-evolution': '2d20650faa158737e729becfdc9559ed3d1f419bbcffccf2977f4eb946d722df',
}
const digest = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex')

const projectCatalogPath = 'sources/project-index.yml'
const catalog = existsSync(projectCatalogPath)
  ? parse(readFileSync(projectCatalogPath, 'utf8'))
  : { pages: [], subjects: [], chains: [] }

describe('real project catalog', () => {
  it('requires the canonical project catalog file', () => {
    expect(existsSync(projectCatalogPath)).toBe(true)
  })

  it('contains the exact approved pages, subjects, and source paths', () => {
    expect(Object.keys(catalog)).toEqual(['schema_version', 'defaults', 'pages', 'subjects', 'chains'])
    expect(catalog.schema_version).toBe(1)
    expect(catalog.defaults).toEqual({ verified_at: '2026-09-26', review_by: '2026-10-26' })
    expect(digest(catalog)).toBe('5af94d203b278b9e91a1900b0472494e394decf2e25f55270245023c19b21194')
    expect(catalog.pages.map((page: { page_item_id: string }) => page.page_item_id)).toEqual(pageIds)
    expect(catalog.subjects.map((subject: { id: string }) => subject.id)).toEqual(subjectIds)
    expect(Object.fromEntries(catalog.subjects.map((subject: any) => [subject.id, [
      subject.canonical_repo, subject.pinned_ref, subject.pinned_commit,
      subject.repository_status, subject.archived, subject.catalog_tier,
      subject.license_sources.map((source: { path: string; sha256: string }) => `${source.path}:${source.sha256}`).join('|'),
    ]]))).toEqual(expectedSubjectFacts)
    expect(Object.fromEntries(catalog.subjects.map((subject: any) => [subject.id, [
      subject.verified_default_branch,
      subject.verified_default_head,
    ]]))).toEqual(expectedDefaultHeads)
    expect(Object.fromEntries(catalog.subjects.map((subject: { id: string }) => [subject.id, digest(subject)])))
      .toEqual(expectedSubjectDigests)
    expect(Object.fromEntries(catalog.subjects.map((subject: { id: string; entrypoints: Array<{ path: string; symbols: string[]; responsibility: string }> }) => [subject.id, subject.entrypoints.map((entry) => entry.path)])))
      .toEqual(expectedEntrypoints)
    const coreSubjects = Object.fromEntries(catalog.subjects
      .filter((subject: { id: string }) => Object.hasOwn(expectedCoreEntrypointSymbols, subject.id))
      .map((subject: { id: string; entrypoints: Array<{ path: string; symbols: string[] }> }) => [
        subject.id,
        Object.fromEntries(subject.entrypoints.map((entry) => [entry.path, entry.symbols])),
      ]))
    expect(coreSubjects).toEqual(expectedCoreEntrypointSymbols)
    const sourceEntries = catalog.subjects.flatMap((subject: { entrypoints: Array<{ path: string; symbols: string[]; responsibility: string }> }) => subject.entrypoints)
    expect(sourceEntries).toHaveLength(66)
    expect(sourceEntries.every((entry: { path: string; symbols: string[]; responsibility: string }) =>
      [entry.path, entry.responsibility].every((value) => value.trim().length > 0)
        && entry.symbols.length > 0
        && entry.symbols.every((symbol) => symbol.trim().length > 0),
    )).toBe(true)
    expect(Object.fromEntries(catalog.chains.map((chain: { id: string; steps: Array<{ id: string; subject_id: string; source_path: string; symbol: string }> }) => [
      chain.id,
      chain.steps.map((step) => `${step.id}:${step.subject_id}:${step.source_path}:${step.symbol}`),
    ]))).toEqual(expectedChains)
    const subjectsById = Object.fromEntries(catalog.subjects.map((subject: { id: string; entrypoints: unknown[] }) => [subject.id, subject]))
    expect(subjectsById['openhands-canvas'].entrypoints).toHaveLength(3)
    expect(subjectsById['openhands-sdk'].entrypoints).toHaveLength(6)
    expect(subjectsById['tau2-bench'].entrypoints).toHaveLength(8)
    expect([...subjectsById['swe-bench'].entrypoints, ...subjectsById['tau2-bench'].entrypoints]).toHaveLength(12)
    expect(subjectsById.dify.entrypoints).toHaveLength(13)
    expect(subjectsById.crewai.entrypoints).toHaveLength(11)
    expect(subjectsById.dify.entrypoints.find((entry: { path: string }) =>
      entry.path === 'api/core/app/apps/workflow/app_runner.py').responsibility).toBe(
      'Use the existing Graph to construct WorkflowEntry, then attach WorkflowPersistenceLayer, workspace-retirement, and external custom layers to workflow_entry.graph_engine.',
    )
    expect(subjectsById.dify.entrypoints.find((entry: { path: string }) =>
      entry.path === 'api/core/workflow/workflow_entry.py').responsibility).toBe(
      'Receive the existing Graph, construct GraphEngine, and attach debug, execution-limit, and optional observability layers.',
    )
    const entrypointPaths = (id: string) => subjectsById[id].entrypoints.map((entry: { path: string }) => entry.path)
    expect(entrypointPaths('openhands-canvas')).not.toEqual(expect.arrayContaining([
      'src/api/conversation-service/agent-server-conversation-service.api.ts',
      'src/api/agent-server-adapter.ts',
    ]))
    expect(entrypointPaths('openhands-sdk')).not.toEqual(expect.arrayContaining([
      'openhands-agent-server/openhands/agent_server/conversation_router.py',
      'openhands-agent-server/openhands/agent_server/conversation_service.py',
      'openhands-sdk/openhands/sdk/conversation/conversation.py',
      'openhands-sdk/openhands/sdk/workspace/workspace.py',
      'openhands-sdk/openhands/sdk/conversation/local_conversation.py',
    ]))
    expect(entrypointPaths('tau2-bench')).not.toContain('src/tau2/run.py')
    expect(subjectsById['tau2-bench'].entrypoints.find((entry: { path: string }) => entry.path === 'src/tau2/cli.py').symbols)
      .not.toContain('run')
    expect(entrypointPaths('crewai')).not.toContain('lib/crewai/src/crewai/agents/crew_agent_executor.py')
    const openHandsChain = catalog.chains.find((chain: { id: string }) => chain.id === 'openhands-canvas-to-workspace-event')
    expect(openHandsChain.steps).toHaveLength(16)
    expect(openHandsChain.misconception).toContain('environment and configuration source')
    expect(JSON.stringify(openHandsChain)).not.toMatch(/owns tool resources|owner boundary/iu)
    expect(openHandsChain.steps.map((step: { track?: string }) => step.track)).toEqual([
      ...Array(6).fill('message 入站'),
      ...Array(6).fill('action / observation 执行'),
      ...Array(4).fill('durable event 回流'),
    ])
    const benchmarkChain = catalog.chains.find((chain: { id: string }) => chain.id === 'benchmark-task-to-score')
    const trackSizes = Object.values(Object.groupBy(
      benchmarkChain.steps,
      (step: { track?: string }) => step.track ?? 'main',
    )).map((steps) => steps?.length ?? 0)
    expect(Math.max(...trackSizes)).toBeLessThanOrEqual(12)
    const tauEvaluate = benchmarkChain.steps.find((step: { id: string }) => step.id === 'tau-evaluate')
    const tauReward = benchmarkChain.steps.find((step: { id: string }) => step.id === 'tau-reward')
    expect(tauEvaluate.responsibility).toContain('EvaluationType.ALL_WITH_NL_ASSERTIONS')
    expect(tauReward.responsibility).toContain('task.evaluation_criteria.reward_basis')
    const aiderChain = catalog.chains.find((chain: { id: string }) => chain.id === 'aider-repo-to-verified-edit')
    expect(aiderChain.steps.map((step: { id: string; track?: string; label: string }) =>
      [step.id, step.track, step.label],
    )).toEqual(expectedAiderTracksAndLabels)
    const difyChain = catalog.chains.find((chain: { id: string }) => chain.id === 'dify-request-to-graph-events')
    expect(difyChain.steps.map((step: { track: string }) => step.track)).toEqual([
      ...Array(13).fill('blocking 01 · request to graph'),
      ...Array(9).fill('blocking 02 · graph to response'),
      ...Array(9).fill('streaming side path'),
    ])
    expect(difyChain.misconception).toContain('WorkflowEntry receives an existing Graph')
    expect(difyChain.steps.slice(11, 14).map((step: { id: string }) => step.id)).toEqual([
      'dify-12-entry', 'dify-12b-runner-layers', 'dify-13-engine',
    ])
    expect(difyChain.steps[11].responsibility).toBe(
      'Receive the existing Graph, construct GraphEngine, and attach debug, execution-limit, and optional observability layers.',
    )
    expect(difyChain.steps[12].responsibility).toBe(
      'After WorkflowEntry returns, attach WorkflowPersistenceLayer, workspace-retirement, and external custom layers to workflow_entry.graph_engine.',
    )
    expect(difyChain.steps.find((step: { id: string }) => step.id === 'dify-15-agent-backend').responsibility)
      .toContain('create_run and consume stream_events')
    expect(difyChain.steps.find((step: { id: string }) => step.id === 'dify-19-typed').responsibility)
      .toContain('typed internal workflow response')
    expect(difyChain.steps.at(-1).responsibility).toContain('request-side retrieval')
    expect(difyChain.steps.at(-1).id).toBe('dify-stream-09-retrieve')
    const difyBlockingSteps = difyChain.steps.filter((step: { track: string }) => step.track.startsWith('blocking'))
    const difyStreamingSteps = difyChain.steps.filter((step: { track: string }) => step.track === 'streaming side path')
    expect(difyBlockingSteps.map((step: { source_path: string }) => step.source_path))
      .not.toContain('api/tasks/app_generate/workflow_execute_task.py')
    expect(difyStreamingSteps.filter((step: { source_path: string }) =>
      step.source_path === 'api/tasks/app_generate/workflow_execute_task.py')).toHaveLength(3)
    expect(subjectsById.dify.entrypoints.find((entry: { path: string }) =>
      entry.path === 'api/tasks/app_generate/workflow_execute_task.py').symbols)
      .not.toContain('_AppRunner._publish_streaming_response')

    const crewChain = catalog.chains.find((chain: { id: string }) => chain.id === 'crewai-kickoff-to-task-output')
    expect(crewChain.steps.map((step: { track: string }) => step.track)).toEqual([
      ...Array(8).fill('default sequential 01 · setup'),
      ...Array(9).fill('default sequential 02 · execution and output'),
      ...Array(5).fill('text ReAct · conditional'),
      ...Array(3).fill('native tool · conditional'),
      ...Array(3).fill('planning · conditional'),
    ])
    const defaultCrewSteps = crewChain.steps.filter((step: { track: string }) => step.track.startsWith('default sequential'))
    for (const oldDefaultSymbol of [
      'CrewAgentExecutor.invoke',
      'StepExecutor.execute',
      'Task._export_output',
      'Process',
      'Process.sequential',
    ]) {
      expect(defaultCrewSteps.map((step: { symbol: string }) => step.symbol)).not.toContain(oldDefaultSymbol)
    }
    expect(crewChain.steps.find((step: { id: string }) => step.id === 'crew-native-03-single').responsibility)
      .toContain('_available_functions[func_name]')
    expect(crewChain.steps.find((step: { id: string }) => step.id === 'crew-plan-02-lazy').responsibility)
      .toContain('after todos exist')
    expect(defaultCrewSteps[1].symbol).toBe('begin_execution')
    expect(defaultCrewSteps[2].symbol).toBe('prepare_kickoff')
    expect(defaultCrewSteps.at(-1).symbol).toBe('end_execution')
    for (const chain of [difyChain, crewChain]) {
      const sizes = Object.values(Object.groupBy(chain.steps, (step: { track: string }) => step.track))
        .map((steps) => steps?.length ?? 0)
      expect(Math.max(...sizes)).toBeLessThanOrEqual(13)
    }
    expect(Object.fromEntries(catalog.chains.map((chain: { id: string }) => [chain.id, digest(chain)])))
      .toEqual(expectedChainDigests)
    expect(Object.fromEntries(catalog.pages.map((page: { page_item_id: string }) => {
      const { page_item_id: id, ...mapping } = page
      return [id, mapping]
    }))).toEqual(expectedPageMappings)
  })

  it('keeps status and teaching tier orthogonal', () => {
    const byId = Object.fromEntries(catalog.subjects.map((subject: { id: string }) => [subject.id, subject]))
    expect(byId.autogpt).toMatchObject({ repository_status: 'active', archived: false, catalog_tier: 'historical' })
    expect(byId.flowise).toMatchObject({ repository_status: 'eol', archived: true, catalog_tier: 'historical' })
    expect(byId['hermes-agent']).toMatchObject({ repository_status: 'active', archived: false, catalog_tier: 'watch-only' })
    expect(byId.openclaw).toMatchObject({ repository_status: 'active', archived: false, catalog_tier: 'watch-only' })
  })

  it('maps all eight pages without promoting watch-only subjects', () => {
    expect(catalog.pages.every((page: Record<string, unknown>) =>
      ['page_item_id', 'catalog_tier', 'subjects', 'interview_question_ids', 'counted_in_course', 'primary_chain_id']
        .every((field) => Object.hasOwn(page, field)),
    )).toBe(true)
    expect(catalog.pages.find((page: { page_item_id: string }) => page.page_item_id === 'projects-index').subjects)
      .toEqual(subjectIds)
    for (const id of ['hermes-agent', 'openclaw']) {
      expect(catalog.pages.filter((page: { subjects: string[] }) => page.subjects.includes(id)).map((page: { page_item_id: string }) => page.page_item_id))
        .toEqual(['projects-index'])
    }
  })

  it('represents MCP licensing by contribution rather than conflicting globs', () => {
    const mcp = catalog.subjects.find((subject: { id: string }) => subject.id === 'mcp-spec')
    expect(mcp.license_scopes.filter((scope: { basis: string }) => scope.basis === 'contribution'))
      .toEqual(expect.arrayContaining([
        expect.objectContaining({ expression: 'Apache-2.0', selector: 'new-code-or-spec-contribution OR recorded-relicense-consent' }),
        expect.objectContaining({ expression: 'MIT', selector: 'historical-contribution-without-recorded-consent' }),
      ]))
    expect(validateProjectCatalog(catalog)).toEqual([])
  })

  it('makes the book validator fail closed on a missing project catalog', () => {
    expect(validateBook(process.cwd())).toEqual([])
    expect(validateBook(process.cwd(), { projectCatalogPath: 'sources/missing-project-index.yml' }))
      .toContain('Missing sources/project-index.yml')
  })
})
```

The full-catalog SHA-256 assertion covers exact top-level structure and ordering. The per-subject assertion covers the complete parsed subject object, including `pin_kind`, `verified_default_branch`, `verified_default_head`, `license_summary`, ordered `license_scopes`, `watch_url`, `license_sources`, and every entrypoint `path/symbols/responsibility`. The per-chain digest covers `page_item_id`, label, reading hint, misconception, and every ordered step field; changing any value requires an intentional expected-digest review. All three digest layers must be computed from the concatenated YAML snippets below after parsing; never hand-edit or guess a digest.

- [ ] **Step 2: Run only the existence test and verify RED**

Run: `pnpm vitest run tests/project-catalog.spec.ts -t 'requires the canonical project catalog file'`

Expected: FAIL with `expected false to be true`; the suite must not terminate with `ENOENT`.

- [ ] **Step 3: Create a parseable empty catalog shell**

Create `sources/project-index.yml`:

```yaml
schema_version: 1
defaults:
  verified_at: '2026-09-26'
  review_by: '2026-10-26'
pages: []
subjects: []
chains: []
```

- [ ] **Step 4: Verify the existence test is GREEN and the inventory tests are RED**

Run:

```bash
pnpm vitest run tests/project-catalog.spec.ts -t 'requires the canonical project catalog file'
pnpm vitest run tests/project-catalog.spec.ts -t 'contains the exact approved pages'
```

Expected: the first command passes; the second fails on the empty page/subject/chain inventory rather than file I/O.

- [ ] **Step 5: Replace the shell with catalog defaults and eight exact page records**

Create `sources/project-index.yml`. The complete `pages` block is:

```yaml
schema_version: 1
defaults:
  verified_at: '2026-09-26'
  review_by: '2026-10-26'

pages:
  - page_item_id: projects-index
    catalog_tier: core
    subjects: [mcp-spec, mcp-python-sdk, aider, openhands-canvas, openhands-sdk, swe-bench, tau2-bench, dify, crewai, autogpt, flowise, hermes-agent, openclaw]
    interview_question_ids: []
    counted_in_course: false
    primary_chain_id: null
  - page_item_id: project-mcp-python-sdk
    catalog_tier: core
    subjects: [mcp-spec, mcp-python-sdk]
    interview_question_ids: [iq-04-a, iq-04-b, iq-04-c]
    counted_in_course: true
    primary_chain_id: mcp-tool-call
  - page_item_id: project-aider
    catalog_tier: core
    subjects: [aider]
    interview_question_ids: [iq-13-a, iq-13-b, iq-13-c]
    counted_in_course: true
    primary_chain_id: aider-repo-to-verified-edit
  - page_item_id: project-openhands
    catalog_tier: core
    subjects: [openhands-canvas, openhands-sdk]
    interview_question_ids: [iq-09-b, iq-10-a, iq-13-c]
    counted_in_course: true
    primary_chain_id: openhands-canvas-to-workspace-event
  - page_item_id: project-agent-benchmarks
    catalog_tier: core
    subjects: [swe-bench, tau2-bench]
    interview_question_ids: [iq-08-a, iq-08-b, iq-08-c]
    counted_in_course: true
    primary_chain_id: benchmark-task-to-score
  - page_item_id: project-dify
    catalog_tier: core
    subjects: [dify]
    interview_question_ids: [iq-02-b, iq-06-a, iq-10-a]
    counted_in_course: true
    primary_chain_id: dify-request-to-graph-events
  - page_item_id: project-crewai
    catalog_tier: core
    subjects: [crewai]
    interview_question_ids: [iq-07-a, iq-07-b, iq-07-c]
    counted_in_course: true
    primary_chain_id: crewai-kickoff-to-task-output
  - page_item_id: project-history-autogpt-flowise
    catalog_tier: historical
    subjects: [autogpt, flowise]
    interview_question_ids: [iq-02-b, iq-07-c, iq-10-a]
    counted_in_course: false
    primary_chain_id: autogpt-flowise-evolution
```

- [ ] **Step 6: Add MCP and Aider subject records**

Append the first three subjects. Define YAML anchors only for the repeated standard MIT and Apache scopes; do not use them for mixed licenses:

```yaml
subjects:
  - id: mcp-spec
    canonical_repo: modelcontextprotocol/modelcontextprotocol
    canonical_url: https://github.com/modelcontextprotocol/modelcontextprotocol
    pin_kind: release
    pinned_ref: '2026-07-28'
    pinned_commit: 5f5440bb26a62e2cf3440b92da5a667efa03b267
    verified_default_branch: main
    verified_default_head: ab3a39c13bd23be691c2760e1c6c5c15a64582e1
    repository_status: active
    archived: false
    catalog_tier: core
    license_summary: Contribution-level MIT to Apache-2.0 transition; ordinary non-spec documentation is CC-BY-4.0.
    license_scopes:
      - basis: contribution
        expression: Apache-2.0
        selector: new-code-or-spec-contribution OR recorded-relicense-consent
        scope: New code and specification contributions, plus contributions with recorded consent.
        note: Contribution history must be checked before direct reuse.
      - basis: contribution
        expression: MIT
        selector: historical-contribution-without-recorded-consent
        scope: Historical contributions whose authors have not granted relicensing consent.
        note: Contribution history must be checked before direct reuse.
      - basis: path
        expression: CC-BY-4.0
        path_or_glob: docs/**
        scope: Ordinary documentation contributions, excluding specifications.
        note: Specification files remain under the contribution-level transition.
    license_sources: [{ path: LICENSE, sha256: 0382b0057770ca05e9c350a50aa3b1c1fea84da0bc81d723bf00b9aa841be58a }]
    watch_url: https://github.com/modelcontextprotocol/modelcontextprotocol/releases/latest
    entrypoints:
      - { path: schema/2026-07-28/schema.json, symbols: [CallToolRequest], responsibility: Define the versioned tools/call request and result contract. }

  - id: mcp-python-sdk
    canonical_repo: modelcontextprotocol/python-sdk
    canonical_url: https://github.com/modelcontextprotocol/python-sdk
    pin_kind: release
    pinned_ref: v2.2.0
    pinned_commit: 9972c21aa42054fb1450c5fc614761ed11847ec6
    verified_default_branch: main
    verified_default_head: f1b6589088534632fef92238ee9750951e3c0185
    repository_status: active
    archived: false
    catalog_tier: core
    license_summary: MIT; third-party assets still require file-level review.
    license_scopes: &mit_scope
      - basis: path
        expression: MIT
        path_or_glob: '**'
        scope: Repository code and documentation unless a file states otherwise.
        note: Logos, trademarks, and third-party files are not granted by the code license.
    license_sources: [{ path: LICENSE, sha256: 5e13dbbc1d120fc2a03cecde7c91424ae2d7de11b63d58ded2f4431e261ee50d }]
    watch_url: https://github.com/modelcontextprotocol/python-sdk/releases/latest
    entrypoints:
      - { path: examples/snippets/servers/basic_tool.py, symbols: [MCPServer, mcp.tool, sum], responsibility: Register the example tool and expose the host-owned server start point. }
      - { path: src/mcp/server/mcpserver/server.py, symbols: [MCPServer.run, run_stdio_async, MCPServer._handle_call_tool, MCPServer.call_tool], responsibility: Select stdio and bridge the low-level handler to the high-level tool API. }
      - { path: src/mcp/server/stdio.py, symbols: [stdio_server], responsibility: Transport framed messages from the reader through the final stdout_writer. }
      - { path: src/mcp/server/lowlevel/server.py, symbols: [Server.run, get_request_handler], responsibility: Run the protocol loop and resolve the tools/call handler. }
      - { path: src/mcp/server/runner.py, symbols: [serve_dual_era_loop, ServerRunner._on_request, ServerRunner._serialize], responsibility: Drive the era-specific loop, execute request handlers, and normalize result dictionaries. }
      - { path: src/mcp/shared/jsonrpc_dispatcher.py, symbols: [JSONRPCDispatcher.run, JSONRPCDispatcher._dispatch_request, JSONRPCDispatcher._write_result], responsibility: Dispatch inbound JSON-RPC requests and construct and write JSONRPCResponse messages. }
      - { path: src/mcp/server/mcpserver/tools/tool_manager.py, symbols: [ToolManager.call_tool], responsibility: Find the registered tool and delegate execution. }
      - { path: src/mcp/server/mcpserver/tools/base.py, symbols: [Tool.run], responsibility: Validate tool input, invoke the function, and convert its result. }

  - id: aider
    canonical_repo: Aider-AI/aider
    canonical_url: https://github.com/Aider-AI/aider
    pin_kind: release
    pinned_ref: v0.86.0
    pinned_commit: a4be6ccd87ebaa59b361f3f028d116ce1761b626
    verified_default_branch: main
    verified_default_head: 5dc9490bb35f9729ef2c95d00a19ccd30c26339c
    repository_status: active
    archived: false
    catalog_tier: core
    license_summary: Apache-2.0 repository license; third-party assets still require file-level review.
    license_scopes: &apache_scope
      - basis: path
        expression: Apache-2.0
        path_or_glob: '**'
        scope: Repository code and documentation unless a file states otherwise.
        note: Preserve notices and separately review logos, trademarks, and third-party files.
    license_sources: [{ path: LICENSE.txt, sha256: cfc7749b96f63bd31c3c42b5c471bf756814053e847c10f3eb003417bc523d30 }]
    watch_url: https://github.com/Aider-AI/aider/releases/latest
    entrypoints:
      - { path: aider/main.py, symbols: [main], responsibility: Parse options and establish repository context. }
      - { path: aider/coders/base_coder.py, symbols: [Coder.run, Coder.run_one, Coder.send_message, Coder.send, Coder.apply_updates, Coder.prepare_to_edit, Coder.auto_commit, Coder.lint_edited, Coder.run_shell_commands, Coder.handle_shell_commands], responsibility: Coordinate turns, model calls, edit preparation, commits, lint, and confirmed shell commands. }
      - { path: aider/models.py, symbols: [Model.send_completion, simple_send_with_retries], responsibility: Send the coding request and support model-generated commit messages. }
      - { path: aider/repomap.py, symbols: [RepoMap.get_repo_map], responsibility: Select a bounded structural repository context. }
      - { path: aider/coders/editblock_coder.py, symbols: [EditBlockCoder.get_edits, EditBlockCoder.apply_edits_dry_run, EditBlockCoder.apply_edits], responsibility: Parse edit tuples, dry-run them, and apply accepted edits. }
      - { path: aider/io.py, symbols: [InputOutput.write_text, InputOutput.confirm_ask], responsibility: Write edited text and enforce explicit confirmation policies. }
      - { path: aider/repo.py, symbols: [GitRepo.commit, GitRepo.get_commit_message], responsibility: Generate commit messages and record bounded file changes in Git. }
      - { path: aider/commands.py, symbols: [Commands.cmd_test], responsibility: Run the optional configured test command. }
```

- [ ] **Step 7: Add OpenHands and benchmark subject records**

Append the next four subjects:

```yaml

  - id: openhands-canvas
    canonical_repo: OpenHands/OpenHands
    canonical_url: https://github.com/OpenHands/OpenHands
    pin_kind: release
    pinned_ref: v1.24.0
    pinned_commit: 7dc6805406ea3c76cb4a3ce407c3c72d481b0ac6
    verified_default_branch: main
    verified_default_head: 47a10808d78561546a02555d0d2c7fa96fa96300
    repository_status: active
    archived: false
    catalog_tier: core
    license_summary: MIT; this repository owns Agent Canvas and local orchestration, not the Python agent runtime.
    license_scopes: *mit_scope
    license_sources: [{ path: LICENSE, sha256: e1d1fa9f3a8d7bef24449d488fcd8f00f8f272cac297bb9bed161eb6175b876a }]
    watch_url: https://github.com/OpenHands/OpenHands/releases/latest
    entrypoints:
      - { path: src/components/features/chat/chat-interface.tsx, symbols: [handleSendMessage], responsibility: Admit a user message from the active Canvas conversation. }
      - { path: src/hooks/use-send-message.ts, symbols: [useSendMessage().send], responsibility: Prepare the Canvas message and delegate it to the conversation transport. }
      - { path: src/contexts/conversation-websocket-context.tsx, symbols: [ConversationWebSocketProvider.sendMessage, ConversationWebSocketProvider.handleMainMessage], responsibility: Send Canvas messages and fold returned server events into the client event store. }

  - id: openhands-sdk
    canonical_repo: OpenHands/software-agent-sdk
    canonical_url: https://github.com/OpenHands/software-agent-sdk
    pin_kind: release
    pinned_ref: v1.49.6
    pinned_commit: fcc102a697874d54a357e36004e02c95040dbdc0
    verified_default_branch: main
    verified_default_head: a350dc73ef9b4d3a801ffab2aed211a04d2120a9
    repository_status: active
    archived: false
    catalog_tier: core
    license_summary: MIT; the pinned Canvas release consumes the matching TypeScript client version 1.49.6.
    license_scopes: *mit_scope
    license_sources: [{ path: LICENSE, sha256: 14a9b631c658eee682c6c2973525fbdf808c3457176bc47513052c559cc5ce86 }]
    watch_url: https://github.com/OpenHands/software-agent-sdk/releases/latest
    entrypoints:
      - { path: openhands-agent-server/openhands/agent_server/sockets.py, symbols: [events_socket, _WebSocketSubscriber.__call__, _send_event], responsibility: Subscribe the WebSocket to an existing conversation and send published events back to Canvas. }
      - { path: openhands-agent-server/openhands/agent_server/event_service.py, symbols: [EventService.send_message, EventService.run, EventService.subscribe_to_events, EventService.start], responsibility: Forward messages to LocalConversation and configure its persistence-first callback bridge to PubSub. }
      - { path: openhands-sdk/openhands/sdk/conversation/impl/local_conversation.py, symbols: [LocalConversation.__init__, LocalConversation.send_message, LocalConversation.arun], responsibility: Compose persistence-first callbacks and drive the local conversation event loop. }
      - { path: openhands-sdk/openhands/sdk/agent/agent.py, symbols: [Agent.astep, Agent._get_action_event, Agent._aexecute_actions], responsibility: Derive action events and coordinate their execution. }
      - { path: openhands-sdk/openhands/sdk/agent/response_dispatch.py, symbols: [_ahandle_tool_calls], responsibility: Translate model tool calls into ActionEvent values. }
      - { path: openhands-sdk/openhands/sdk/tool/tool.py, symbols: [ToolDefinition.__call__], responsibility: Convert an action into a bounded tool invocation. }

  - id: swe-bench
    canonical_repo: SWE-bench/SWE-bench
    canonical_url: https://github.com/SWE-bench/SWE-bench
    pin_kind: tag
    pinned_ref: v5.0.1
    pinned_commit: 87ab1f6ced28f75ba73ca899dc759b019310944a
    verified_default_branch: main
    verified_default_head: 02e7a74ffd0b707aab73d203fe87bdc7c76afc8e
    repository_status: active
    archived: false
    catalog_tier: core
    license_summary: MIT; benchmark datasets and third-party repositories retain their own terms.
    license_scopes: *mit_scope
    license_sources: [{ path: LICENSE, sha256: 2bd2e08df7147f67a69b42c10efae09bd4bf119df397371036187d5dd1b02f57 }]
    watch_url: https://github.com/SWE-bench/SWE-bench/tags
    entrypoints:
      - { path: swebench/harness/run_evaluation.py, symbols: [main], responsibility: Bind predictions to instances and coordinate evaluation. }
      - { path: swebench/harness/docker_utils.py, symbols: [exec_run_with_timeout], responsibility: Execute commands in the evaluation container with a timeout. }
      - { path: swebench/harness/grading.py, symbols: [get_eval_report], responsibility: Convert test evidence into resolution status. }
      - { path: swebench/harness/reporting.py, symbols: [make_run_report], responsibility: Aggregate per-instance evidence without changing the denominator. }

  - id: tau2-bench
    canonical_repo: sierra-research/tau2-bench
    canonical_url: https://github.com/sierra-research/tau2-bench
    pin_kind: release
    pinned_ref: v1.0.1
    pinned_commit: fc0055dc4e0a316c3f83133267fbd6faaa770992
    verified_default_branch: main
    verified_default_head: b7ea9074c1cba482b30687fecdb5c8425fd6f619
    repository_status: active
    archived: false
    catalog_tier: core
    license_summary: MIT; domain data and external services require separate review.
    license_scopes: *mit_scope
    license_sources: [{ path: LICENSE, sha256: e67c5aa0074dfcaefd3c3a1aedb94cb539234aecd15d5a972574e3200e6252fe }]
    watch_url: https://github.com/sierra-research/tau2-bench/releases/latest
    entrypoints:
      - { path: src/tau2/cli.py, symbols: [main], responsibility: Register a local run_command callback and dispatch the tau2 run command to run_domain. }
      - { path: src/tau2/runner/batch.py, symbols: [run_domain, run_tasks, run_single_task], responsibility: Load one domain and fan tasks into bounded simulation runs. }
      - { path: src/tau2/runner/helpers.py, symbols: [get_tasks, load_tasks], responsibility: Resolve and load the selected task set. }
      - { path: src/tau2/runner/build.py, symbols: [build_orchestrator, build_environment, build_agent, build_user], responsibility: Construct the orchestrator and its controlled participants and environment. }
      - { path: src/tau2/runner/simulation.py, symbols: [run_simulation], responsibility: Coordinate the multi-turn trajectory. }
      - { path: src/tau2/orchestrator/orchestrator.py, symbols: [BaseOrchestrator.run, BaseOrchestrator._execute_tool_calls], responsibility: Drive participant turns and dispatch requested environment tools. }
      - { path: src/tau2/environment/environment.py, symbols: [Environment.get_response, Environment.make_tool_call], responsibility: Apply tool calls to authoritative domain state and return environment responses. }
      - { path: src/tau2/evaluator/evaluator.py, symbols: [evaluate_simulation], responsibility: Judge the outcome and produce reward evidence. }
```

- [ ] **Step 8: Add Dify and CrewAI subject records**

Append:

```yaml

  - id: dify
    canonical_repo: langgenius/dify
    canonical_url: https://github.com/langgenius/dify
    pin_kind: release
    pinned_ref: 1.17.1
    pinned_commit: 8387590ace4a094de812b7847fc6a4c3a27cd52b
    verified_default_branch: main
    verified_default_head: f4602cc1fe8448486e185be74152699322ccec3f
    repository_status: active
    archived: false
    catalog_tier: core
    license_summary: Modified Apache-2.0 with multi-tenant, frontend attribution, and appearance-patent conditions.
    license_scopes:
      - basis: path
        expression: LicenseRef-Dify-Modified-Apache-2.0
        path_or_glob: '**'
        scope: Repository code and content.
        note: Read the root LICENSE before commercial, multi-tenant, or frontend reuse.
    license_sources: [{ path: LICENSE, sha256: 232cf91474932d5110ed304e53b6b742a58463857c571fae803fdf2ac36d7bb3 }]
    watch_url: https://github.com/langgenius/dify/releases/latest
    entrypoints:
      - { path: api/controllers/service_api/app/workflow.py, symbols: [WorkflowRunApi.post], responsibility: Admit the Service API request and select blocking or streaming response mode. }
      - { path: api/services/app_generate_service.py, symbols: [AppGenerateService.generate, AppGenerateService._run_with_guardrails, AppGenerateService._dispatch_generate, AppGenerateService._build_streaming_task_on_subscribe], responsibility: "Apply request guardrails, select AppMode.WORKFLOW, and keep streaming task startup behind subscription." }
      - { path: api/tasks/app_generate/workflow_execute_task.py, symbols: [_AppRunner.run, _publish_streaming_response, workflow_based_app_execution_task], responsibility: "Run the Celery worker, rehydrate execution, and publish already public-mapped chunks to the streaming topic." }
      - { path: api/core/app/apps/workflow/app_generator.py, symbols: [WorkflowAppGenerator.generate, WorkflowAppGenerator._generate, WorkflowAppGenerator._generate_worker], responsibility: "Build workflow state, inject execution repositories into WorkflowAppRunner, and run the shared worker." }
      - { path: api/core/app/apps/workflow/app_runner.py, symbols: [WorkflowAppRunner.run], responsibility: "Use the existing Graph to construct WorkflowEntry, then attach WorkflowPersistenceLayer, workspace-retirement, and external custom layers to workflow_entry.graph_engine." }
      - { path: api/core/app/apps/workflow_app_runner.py, symbols: [WorkflowBasedAppRunner._init_graph, WorkflowBasedAppRunner._handle_event], responsibility: Initialize Graph with DifyNodeFactory and translate graph events into queue events. }
      - { path: api/core/workflow/node_factory.py, symbols: [DifyNodeFactory.create_node], responsibility: Resolve versioned node implementations and construct DifyAgentNode only for the matching kind. }
      - { path: api/core/workflow/nodes/agent_v2/agent_node.py, symbols: [DifyAgentNode.__init__, DifyAgentNode._run, DifyAgentNode._run_inner], responsibility: Execute the Dify agent-node contract through backend create_run and stream_events calls. }
      - { path: api/core/workflow/workflow_entry.py, symbols: [WorkflowEntry.__init__, WorkflowEntry.run], responsibility: "Receive the existing Graph, construct GraphEngine, and attach debug, execution-limit, and optional observability layers." }
      - { path: api/core/app/apps/workflow/app_queue_manager.py, symbols: [WorkflowAppQueueManager._publish], responsibility: Publish typed app queue events to the selected queue transport. }
      - { path: api/core/app/apps/workflow/generate_task_pipeline.py, symbols: [WorkflowAppGenerateTaskPipeline.process, WorkflowAppGenerateTaskPipeline._to_blocking_response, WorkflowAppGenerateTaskPipeline._to_stream_response], responsibility: "Consume queue events, apply typed conversion, and aggregate the selected response mode." }
      - { path: api/core/app/apps/common/workflow_response_converter.py, symbols: [WorkflowResponseConverter.workflow_start_to_stream_response, WorkflowResponseConverter.workflow_finish_to_stream_response, WorkflowResponseConverter.handle_agent_log], responsibility: Convert queue events into typed internal workflow response objects. }
      - { path: api/core/app/apps/workflow/generate_response_converter.py, symbols: [WorkflowAppGenerateResponseConverter.convert_blocking_full_response, WorkflowAppGenerateResponseConverter.convert_stream_full_response], responsibility: Map typed workflow responses to the final public blocking or streaming payload. }

  - id: crewai
    canonical_repo: crewAIInc/crewAI
    canonical_url: https://github.com/crewAIInc/crewAI
    pin_kind: release
    pinned_ref: 1.15.22
    pinned_commit: 7a01af27912c2b142d8bac70d1894343f8b91bd1
    verified_default_branch: main
    verified_default_head: 4ed2abc7bbf504a634d3b733f2a97e0fbe8d44ec
    repository_status: active
    archived: false
    catalog_tier: core
    license_summary: MIT; current source paths live under the lib/crewai monorepo package.
    license_scopes: *mit_scope
    license_sources: [{ path: LICENSE, sha256: 28868731966f4aa37f02879839aabc797137e27ddde4e274ef9cf965f9a71774 }]
    watch_url: https://github.com/crewAIInc/crewAI/releases/latest
    entrypoints:
      - { path: lib/crewai/src/crewai/crew.py, symbols: [Crew.kickoff, Crew._run_sequential_process, Crew._execute_tasks, Crew._create_crew_output], responsibility: "Prepare kickoff, run synchronous sequential tasks, and construct the final CrewOutput." }
      - { path: lib/crewai/src/crewai/execution.py, symbols: [begin_execution, end_execution], responsibility: Open and close the kickoff execution and tracing context. }
      - { path: lib/crewai/src/crewai/crews/utils.py, symbols: [prepare_kickoff, setup_agents, prepare_task_execution], responsibility: Set up agents and prepare each task before synchronous execution. }
      - { path: lib/crewai/src/crewai/process.py, symbols: [Process], responsibility: Define orchestration choices inspected by Crew.kickoff; the enum is not an execution node. }
      - { path: lib/crewai/src/crewai/task.py, symbols: [Task.execute_sync, Task._execute_core, Task._export_output], responsibility: Delegate synchronous work and construct TaskOutput; _export_output only handles structured conversion. }
      - { path: lib/crewai/src/crewai/agent/core.py, symbols: [Agent.execute_task, Agent.create_agent_executor, Agent._finalize_task_execution], responsibility: "Create the default experimental executor, run it, and finalize the raw result." }
      - { path: lib/crewai/src/crewai/experimental/agent_executor.py, symbols: [AgentExecutor.invoke, AgentExecutor.generate_plan, AgentExecutor._ensure_step_executor, AgentExecutor.call_llm_and_parse, AgentExecutor.execute_tool_action, AgentExecutor.call_llm_native_tools, AgentExecutor.execute_native_tool, AgentExecutor._execute_single_native_tool_call], responsibility: "Run the default executor and expose mutually exclusive text, native-tool, and planning routes." }
      - { path: lib/crewai/src/crewai/utilities/agent_utils.py, symbols: [process_llm_response], responsibility: Parse text ReAct responses into AgentAction or AgentFinish. }
      - { path: lib/crewai/src/crewai/tools/tool_usage.py, symbols: [ToolUsage.use, ToolUsage._use], responsibility: Resolve and execute a text ReAct tool call while recording its outcome. }
      - { path: lib/crewai/src/crewai/tools/structured_tool.py, symbols: [CrewStructuredTool.invoke], responsibility: Invoke the selected structured tool implementation. }
      - { path: lib/crewai/src/crewai/agents/step_executor.py, symbols: [StepExecutor.execute], responsibility: Execute a planned todo only after planning creates todos and lazily constructs StepExecutor. }
```

- [ ] **Step 9: Add historical and watch-only subject records**

Append:

```yaml

  - id: autogpt
    canonical_repo: Significant-Gravitas/AutoGPT
    canonical_url: https://github.com/Significant-Gravitas/AutoGPT
    pin_kind: release
    pinned_ref: autogpt-platform-beta-v0.8.1
    pinned_commit: ead8f943f981ea650285eee3020c8ff0e7eda94d
    verified_default_branch: master
    verified_default_head: 5e84f064d3779acc49c86c51e2167ba8f660c93d
    repository_status: active
    archived: false
    catalog_tier: historical
    license_summary: Directory-scoped PolyForm Shield and MIT licenses.
    license_scopes:
      - basis: path
        expression: PolyForm-Shield-1.0.0
        path_or_glob: autogpt_platform/**
        scope: Platform directory code and content.
        note: Do not label the platform directory MIT.
      - basis: path
        expression: MIT
        path_or_glob: '**'
        scope: Classic and other areas explicitly listed by the root LICENSE.
        note: The more specific platform scope wins; file notices still override.
    license_sources: [{ path: LICENSE, sha256: aafc62ebf01092909ae72131b66f48c89ea7eaf4bd7e916f3f05f7960611799a }]
    watch_url: https://github.com/Significant-Gravitas/AutoGPT/releases/latest
    entrypoints:
      - { path: classic/original_autogpt/autogpt/app/main.py, symbols: [run_auto_gpt], responsibility: Enter the classic autonomous interaction loop. }
      - { path: classic/original_autogpt/autogpt/agents/agent.py, symbols: [Agent.execute], responsibility: Execute a proposed action in the classic agent. }

  - id: flowise
    canonical_repo: FlowiseAI/Flowise
    canonical_url: https://github.com/FlowiseAI/Flowise
    pin_kind: release
    pinned_ref: flowise@3.1.4
    pinned_commit: a65f81bb43ef66d3ce734bf0dff4223ae8041c95
    verified_default_branch: main
    verified_default_head: 9291856d1ea4a4ceea9f8fef8ce14f4f6c81e8eb
    repository_status: eol
    archived: true
    catalog_tier: historical
    license_summary: Archived and EOL; commercial scopes coexist with Apache-2.0 content.
    license_scopes:
      - basis: path
        expression: LicenseRef-Flowise-Commercial
        path_or_glob: packages/server/src/enterprise/**
        scope: Enterprise directory.
        note: Commercial license; not a reusable asset source.
      - basis: path
        expression: LicenseRef-Flowise-Commercial
        path_or_glob: packages/server/src/IdentityManager.ts
        scope: File explicitly named by the root license.
        note: Any other explicit commercial notice must become another scope.
      - basis: path
        expression: Apache-2.0
        path_or_glob: '**'
        scope: Remaining content outside more specific commercial scopes.
        note: Third-party components retain their own licenses.
    license_sources: [{ path: LICENSE.md, sha256: eb8cc244c81eb4a556f9ac22edc3033ac4fa12f7ef7a8899bb5ddc4578c2dd73 }]
    watch_url: https://github.com/FlowiseAI/Flowise/discussions/6727
    entrypoints:
      - { path: packages/server/src/controllers/predictions/index.ts, symbols: [createPrediction], responsibility: Admit a visual-flow prediction request. }
      - { path: packages/server/src/services/predictions/index.ts, symbols: [buildChatflow], responsibility: Execute the configured chatflow service path. }

  - id: hermes-agent
    canonical_repo: NousResearch/hermes-agent
    canonical_url: https://github.com/NousResearch/hermes-agent
    pin_kind: release
    pinned_ref: v2026.9.24
    pinned_commit: f97608f178d1ffeca59860195ab7da295f7c8e5f
    verified_default_branch: main
    verified_default_head: d0288be5b3330d2442e3907185b8e9d0958297bb
    repository_status: active
    archived: false
    catalog_tier: watch-only
    risk_tags: [长期自主, 长期记忆, 外部系统]
    license_summary: MIT; high-permission behavior remains outside the beginner execution path.
    license_scopes: *mit_scope
    license_sources: [{ path: LICENSE, sha256: 821556e6336796450ab852d375117b48a4887e71d255794fd6318d99982a5ab6 }]
    watch_url: https://github.com/NousResearch/hermes-agent/releases/latest
    entrypoints: []

  - id: openclaw
    canonical_repo: openclaw/openclaw
    canonical_url: https://github.com/openclaw/openclaw
    pin_kind: release
    pinned_ref: v2026.9.6
    pinned_commit: eb377ac59e6c9fd6c7705028034812becf00271b
    verified_default_branch: main
    verified_default_head: 51ec96836f768c07c80e9d11af872014e7436d69
    repository_status: active
    archived: false
    catalog_tier: watch-only
    risk_tags: [长期自主, IM, 桌面控制, 外部系统]
    license_summary: MIT plus THIRD_PARTY_NOTICES.md; high-permission behavior remains watch-only.
    license_scopes: *mit_scope
    license_sources:
      - { path: LICENSE, sha256: 73571b25326281d369087f469842c02444fe39faaecebda4d82ed21ff3a1c29d }
      - { path: THIRD_PARTY_NOTICES.md, sha256: c1d1bbc550feee74853eba104e347341569cbbbe37a9f77659993ca0766277d5 }
    watch_url: https://github.com/openclaw/openclaw/releases/latest
    entrypoints: []
```

- [ ] **Step 10: Append the MCP, Aider, and OpenHands primary chains**

Append:

```yaml
chains:
  - id: mcp-tool-call
    page_item_id: project-mcp-python-sdk
    label: One tools/call request through the Python SDK
    reading_hint: Follow the protocol envelope separately from business authorization.
    misconception: SDK dispatch does not prove that a business action is authorized or correct.
    steps:
      - { id: schema, label: Protocol schema, subject_id: mcp-spec, source_path: schema/2026-07-28/schema.json, symbol: CallToolRequest, responsibility: Define the versioned request and result contract. }
      - { id: host-run, label: Host starts MCPServer, subject_id: mcp-python-sdk, source_path: src/mcp/server/mcpserver/server.py, symbol: MCPServer.run, responsibility: Let the host select stdio while run_stdio_async performs the adjacent transport setup. }
      - { id: transport, label: stdio transport, subject_id: mcp-python-sdk, source_path: src/mcp/server/stdio.py, symbol: stdio_server, responsibility: Expose the reader and stdout_writer without adding business authority. }
      - { id: server-run, label: Low-level server loop, subject_id: mcp-python-sdk, source_path: src/mcp/server/lowlevel/server.py, symbol: Server.run, responsibility: Enter the low-level protocol loop with request-scoped outbound support kept separate. }
      - { id: runner-loop, label: Dual-era runner loop, subject_id: mcp-python-sdk, source_path: src/mcp/server/runner.py, symbol: serve_dual_era_loop, responsibility: Drive the runner that accepts incoming protocol messages. }
      - { id: dispatcher-loop, label: JSON-RPC dispatcher loop, subject_id: mcp-python-sdk, source_path: src/mcp/shared/jsonrpc_dispatcher.py, symbol: JSONRPCDispatcher.run, responsibility: Read framed messages and route requests into the dispatcher request path. }
      - { id: dispatcher-request, label: Dispatcher request callback, subject_id: mcp-python-sdk, source_path: src/mcp/shared/jsonrpc_dispatcher.py, symbol: JSONRPCDispatcher._dispatch_request, responsibility: Invoke ServerRunner._on_request through the registered on_request callback. }
      - { id: request, label: Request handler entry, subject_id: mcp-python-sdk, source_path: src/mcp/server/runner.py, symbol: ServerRunner._on_request, responsibility: Build request context, run the selected handler, and return a normalized result dictionary. }
      - { id: dispatch, label: tools/call handler lookup, subject_id: mcp-python-sdk, source_path: src/mcp/server/lowlevel/server.py, symbol: get_request_handler, responsibility: Select the registered low-level tools/call handler. }
      - { id: mcp-handler, label: High-level tools/call handler, subject_id: mcp-python-sdk, source_path: src/mcp/server/mcpserver/server.py, symbol: MCPServer._handle_call_tool, responsibility: Adapt the protocol request to the high-level call surface. }
      - { id: mcp-call, label: MCPServer tool call, subject_id: mcp-python-sdk, source_path: src/mcp/server/mcpserver/server.py, symbol: MCPServer.call_tool, responsibility: Delegate the named tool request to the tool manager. }
      - { id: tool-lookup, label: Registered tool lookup, subject_id: mcp-python-sdk, source_path: src/mcp/server/mcpserver/tools/tool_manager.py, symbol: ToolManager.call_tool, responsibility: Find the registered tool without owning validation or invocation. }
      - { id: tool-run, label: Validation and invocation, subject_id: mcp-python-sdk, source_path: src/mcp/server/mcpserver/tools/base.py, symbol: Tool.run, responsibility: Validate input, invoke the Python function, and convert its result. }
      - { id: tool-function, label: Business tool function, subject_id: mcp-python-sdk, source_path: examples/snippets/servers/basic_tool.py, symbol: sum, responsibility: Execute the registered example capability. }
      - { id: serialize, label: Result normalization, subject_id: mcp-python-sdk, source_path: src/mcp/server/runner.py, symbol: ServerRunner._serialize, responsibility: Normalize the handler result into a versioned result dictionary without constructing or writing JSONRPCResponse. }
      - { id: dispatcher-response, label: JSON-RPC response write, subject_id: mcp-python-sdk, source_path: src/mcp/shared/jsonrpc_dispatcher.py, symbol: JSONRPCDispatcher._write_result, responsibility: Construct JSONRPCResponse and write it through the dispatcher stream. }
      - { id: stdout, label: stdout delivery, subject_id: mcp-python-sdk, source_path: src/mcp/server/stdio.py, symbol: stdio_server, responsibility: Carry the dispatched response through the transport stdout_writer. }

  - id: aider-repo-to-verified-edit
    page_item_id: project-aider
    label: Repository request to reviewable edit
    reading_hint: Track what context is selected and where edits become filesystem changes.
    misconception: A generated patch or automatic commit is not proof that the task is correct.
    steps:
      - { id: cli, track: 主请求链, label: Repository preflight, subject_id: aider, source_path: aider/main.py, symbol: main, responsibility: Parse options and establish the selected repository conditions. }
      - { id: run, track: 主请求链, label: Conversation loop, subject_id: aider, source_path: aider/coders/base_coder.py, symbol: Coder.run, responsibility: Own the top-level request loop. }
      - { id: turn, track: 主请求链, label: Single turn, subject_id: aider, source_path: aider/coders/base_coder.py, symbol: Coder.run_one, responsibility: Execute one request and response turn. }
      - { id: context, track: 主请求链, label: Context assembly, subject_id: aider, source_path: aider/coders/base_coder.py, symbol: Coder.send_message, responsibility: Assemble chat files and bounded repository context for the turn. }
      - { id: repo-map, track: 主请求链, label: RepoMap selection, subject_id: aider, source_path: aider/repomap.py, symbol: RepoMap.get_repo_map, responsibility: Produce a budgeted structural summary rather than reading every file. }
      - { id: send, track: 主请求链, label: Model send, subject_id: aider, source_path: aider/coders/base_coder.py, symbol: Coder.send, responsibility: Submit the assembled coding prompt and consume the response stream. }
      - { id: completion, track: 主请求链, label: Completion stream, subject_id: aider, source_path: aider/models.py, symbol: Model.send_completion, responsibility: Open the selected model completion request. }
      - { id: parse, track: 主请求链, label: Edit tuple parsing, subject_id: aider, source_path: aider/coders/editblock_coder.py, symbol: EditBlockCoder.get_edits, responsibility: Parse model text into edit tuples without writing files. }
      - { id: apply-updates, track: 主请求链, label: Update orchestration, subject_id: aider, source_path: aider/coders/base_coder.py, symbol: Coder.apply_updates, responsibility: Coordinate validation and application of the parsed edits. }
      - { id: dry-run, track: 主请求链, label: Dry-run validation, subject_id: aider, source_path: aider/coders/editblock_coder.py, symbol: EditBlockCoder.apply_edits_dry_run, responsibility: Check whether the edit tuples can be applied before mutation. }
      - { id: prepare, track: 主请求链, label: Dirty-file precommit, subject_id: aider, source_path: aider/coders/base_coder.py, symbol: Coder.prepare_to_edit, responsibility: Protect dirty files by committing eligible pre-existing changes before editing. }
      - { id: apply, track: 主请求链, label: Filesystem edit, subject_id: aider, source_path: aider/coders/editblock_coder.py, symbol: EditBlockCoder.apply_edits, responsibility: Apply validated edit tuples to selected files. }
      - { id: write, track: 主请求链, label: File write, subject_id: aider, source_path: aider/io.py, symbol: InputOutput.write_text, responsibility: Persist the resulting text to disk. }
      - { id: auto-commit, track: 自动提交与 lint（条件分支）, label: First auto-commit, subject_id: aider, source_path: aider/coders/base_coder.py, symbol: Coder.auto_commit, responsibility: Conditionally request the first post-edit commit. }
      - { id: commit, track: 自动提交与 lint（条件分支）, label: Git commit, subject_id: aider, source_path: aider/repo.py, symbol: GitRepo.commit, responsibility: Generate a message through the weak or main model and record the bounded diff. }
      - { id: auto-lint, track: 自动提交与 lint（条件分支）, label: Auto-lint edited files, subject_id: aider, source_path: aider/coders/base_coder.py, symbol: Coder.lint_edited, responsibility: By default lint only the files edited in this turn. }
      - { id: lint-commit, track: 自动提交与 lint（条件分支）, label: Second commit after lint, subject_id: aider, source_path: aider/coders/base_coder.py, symbol: Coder.auto_commit, responsibility: Conditionally create a second commit after automatic lint fixes. }
      - { id: shell-confirm, track: 需确认 Shell 分支, label: Shell confirmation, subject_id: aider, source_path: aider/io.py, symbol: InputOutput.confirm_ask, responsibility: Set explicit_yes_required to require yes for proposed shell commands even after yes-always. }
      - { id: shell-run, track: 需确认 Shell 分支, label: Shell execution, subject_id: aider, source_path: aider/coders/base_coder.py, symbol: Coder.handle_shell_commands, responsibility: Execute the confirmed command and return its output without a third automatic commit. }
      - { id: auto-test, track: 可选 auto-test 分支, label: Optional auto-test, subject_id: aider, source_path: aider/commands.py, symbol: Commands.cmd_test, responsibility: Run configured tests only when auto-test is enabled and do not create a third commit. }
      - { id: reflection, track: 错误反思回路, label: Error reflection, subject_id: aider, source_path: aider/coders/base_coder.py, symbol: Coder.run_one, responsibility: Repeat only when reflected_message was set; lint and test failures require Attempt to fix confirmation, while shell output requires separate confirmation before joining cur_messages. }

  - id: openhands-canvas-to-workspace-event
    page_item_id: project-openhands
    label: Existing Canvas conversation message to durable event return
    reading_hint: Read the three tracks as causal slices across asynchronous boundaries, not one synchronous call stack.
    misconception: Workspace is an environment and configuration source consumed by tool construction and execution, not the next call after ToolDefinition.
    steps:
      - { id: chat-submit, track: message 入站, label: Chat submit, subject_id: openhands-canvas, source_path: src/components/features/chat/chat-interface.tsx, symbol: handleSendMessage, responsibility: Admit a message for the already selected conversation. }
      - { id: hook-send, track: message 入站, label: Message hook, subject_id: openhands-canvas, source_path: src/hooks/use-send-message.ts, symbol: useSendMessage().send, responsibility: Prepare the Canvas Message for its active WebSocket. }
      - { id: canvas-send, track: message 入站, label: WebSocket send, subject_id: openhands-canvas, source_path: src/contexts/conversation-websocket-context.tsx, symbol: ConversationWebSocketProvider.sendMessage, responsibility: Send the Canvas Message without creating a conversation. }
      - { id: socket-receive, track: message 入站, label: Events socket receive, subject_id: openhands-sdk, source_path: openhands-agent-server/openhands/agent_server/sockets.py, symbol: events_socket, responsibility: Subscribe through EventService.subscribe_to_events and receive messages for the existing conversation. }
      - { id: service-message, track: message 入站, label: Event service message, subject_id: openhands-sdk, source_path: openhands-agent-server/openhands/agent_server/event_service.py, symbol: EventService.send_message, responsibility: Call LocalConversation directly with the incoming message. }
      - { id: conversation-message, track: message 入站, label: User MessageEvent, subject_id: openhands-sdk, source_path: openhands-sdk/openhands/sdk/conversation/impl/local_conversation.py, symbol: LocalConversation.send_message, responsibility: Convert the Canvas Message into a durable user MessageEvent. }
      - { id: service-run, track: action / observation 执行, label: Event service run, subject_id: openhands-sdk, source_path: openhands-agent-server/openhands/agent_server/event_service.py, symbol: EventService.run, responsibility: Start the existing LocalConversation execution and return without owning event subscription. }
      - { id: conversation-run, track: action / observation 执行, label: Local conversation loop, subject_id: openhands-sdk, source_path: openhands-sdk/openhands/sdk/conversation/impl/local_conversation.py, symbol: LocalConversation.arun, responsibility: Advance the existing conversation from its durable event state. }
      - { id: agent-step, track: action / observation 执行, label: Agent step, subject_id: openhands-sdk, source_path: openhands-sdk/openhands/sdk/agent/agent.py, symbol: Agent.astep, responsibility: Ask the agent to derive its next response and actions. }
      - { id: dispatch-tool-calls, track: action / observation 执行, label: ActionEvent dispatch, subject_id: openhands-sdk, source_path: openhands-sdk/openhands/sdk/agent/response_dispatch.py, symbol: _ahandle_tool_calls, responsibility: Convert tool calls into ActionEvent values. }
      - { id: execute-actions, track: action / observation 执行, label: Action execution, subject_id: openhands-sdk, source_path: openhands-sdk/openhands/sdk/agent/agent.py, symbol: Agent._aexecute_actions, responsibility: Execute the emitted actions and collect their results. }
      - { id: tool-call, track: action / observation 执行, label: Tool observation, subject_id: openhands-sdk, source_path: openhands-sdk/openhands/sdk/tool/tool.py, symbol: ToolDefinition.__call__, responsibility: Invoke the tool and return an Observation using the Workspace-backed environment configuration. }
      - { id: persist-event, track: durable event 回流, label: Persistence-first callback, subject_id: openhands-sdk, source_path: openhands-sdk/openhands/sdk/conversation/impl/local_conversation.py, symbol: LocalConversation.__init__, responsibility: Compose the default callback so durable append happens before caller-supplied callbacks. }
      - { id: publish-event, track: durable event 回流, label: Async PubSub bridge, subject_id: openhands-sdk, source_path: openhands-agent-server/openhands/agent_server/event_service.py, symbol: EventService.start, responsibility: Construct AsyncCallbackWrapper(self._pub_sub, ...) and register it as a LocalConversation callback so invocation schedules PubSub after persistence. }
      - { id: socket-send, track: durable event 回流, label: WebSocket subscriber send, subject_id: openhands-sdk, source_path: openhands-agent-server/openhands/agent_server/sockets.py, symbol: _WebSocketSubscriber.__call__, responsibility: Receive the published event as a subscriber and call _send_event to serialize it to Canvas. }
      - { id: canvas-receive, track: durable event 回流, label: Canvas event store, subject_id: openhands-canvas, source_path: src/contexts/conversation-websocket-context.tsx, symbol: ConversationWebSocketProvider.handleMainMessage, responsibility: Fold the returned event into the Canvas event store. }

```

- [ ] **Step 11: Append benchmark, Dify, CrewAI, and historical chains**

Append:

```yaml

  - id: benchmark-task-to-score
    page_item_id: project-agent-benchmarks
    label: Task to reproducible score
    reading_hint: Compare evidence contracts, not headline scores.
    misconception: Scores from different tasks, environments, or graders are not directly interchangeable.
    steps:
      - { id: swe-input, track: swe-bench, label: Instance and prediction, subject_id: swe-bench, source_path: swebench/harness/run_evaluation.py, symbol: main, responsibility: Bind a patch prediction to a benchmark instance. }
      - { id: swe-env, track: swe-bench, label: Container execution, subject_id: swe-bench, source_path: swebench/harness/docker_utils.py, symbol: exec_run_with_timeout, responsibility: Execute commands inside a bounded container. }
      - { id: swe-grade, track: swe-bench, label: Test grading, subject_id: swe-bench, source_path: swebench/harness/grading.py, symbol: get_eval_report, responsibility: Convert test evidence into resolution status. }
      - { id: swe-report, track: swe-bench, label: Report, subject_id: swe-bench, source_path: swebench/harness/reporting.py, symbol: make_run_report, responsibility: Aggregate results without changing the denominator. }
      - { id: tau-cli, track: tau2-bench, label: CLI run command, subject_id: tau2-bench, source_path: src/tau2/cli.py, symbol: main, responsibility: Register the nested run_command callback and dispatch tau2 run to run_domain. }
      - { id: tau-domain, track: tau2-bench, label: Domain run, subject_id: tau2-bench, source_path: src/tau2/runner/batch.py, symbol: run_domain, responsibility: Resolve the selected domain and its controlled run configuration. }
      - { id: tau-load, track: tau2-bench, label: Task loading, subject_id: tau2-bench, source_path: src/tau2/runner/helpers.py, symbol: get_tasks, responsibility: Load and filter the selected tasks. }
      - { id: tau-batch, track: tau2-bench, label: Task batch, subject_id: tau2-bench, source_path: src/tau2/runner/batch.py, symbol: run_tasks, responsibility: Schedule the bounded set of task simulations. }
      - { id: tau-task, track: tau2-bench, label: Single task, subject_id: tau2-bench, source_path: src/tau2/runner/batch.py, symbol: run_single_task, responsibility: Build and execute one task trial. }
      - { id: tau-build, track: tau2-bench, label: Orchestrator build, subject_id: tau2-bench, source_path: src/tau2/runner/build.py, symbol: build_orchestrator, responsibility: Construct the orchestrator with its environment, agent, and user. }
      - { id: tau-sim, track: tau2-bench, label: Simulation, subject_id: tau2-bench, source_path: src/tau2/runner/simulation.py, symbol: run_simulation, responsibility: Coordinate one controlled simulation. }
      - { id: tau-orchestrator, track: tau2-bench, label: Orchestrator loop, subject_id: tau2-bench, source_path: src/tau2/orchestrator/orchestrator.py, symbol: BaseOrchestrator.run, responsibility: Drive agent and user turns while routing tool requests. }
      - { id: tau-environment, track: tau2-bench, label: Environment calls, subject_id: tau2-bench, source_path: src/tau2/environment/environment.py, symbol: Environment.make_tool_call, responsibility: Apply requested tools to authoritative domain state. }
      - { id: tau-trajectory, track: tau2-bench, label: Trajectory, subject_id: tau2-bench, source_path: src/tau2/runner/simulation.py, symbol: run_simulation, responsibility: Return the complete controlled interaction trajectory. }
      - { id: tau-evaluate, track: tau2-bench, label: Evaluation branch, subject_id: tau2-bench, source_path: src/tau2/evaluator/evaluator.py, symbol: evaluate_simulation, responsibility: Separate single types and *_IGNORE_BASIS modes from basis-aware EvaluationType.ALL and EvaluationType.ALL_WITH_NL_ASSERTIONS; the latter only forces NL assertions. }
      - { id: tau-reward, track: tau2-bench, label: Reward info, subject_id: tau2-bench, source_path: src/tau2/evaluator/evaluator.py, symbol: evaluate_simulation, responsibility: Multiply only task.evaluation_criteria.reward_basis components so ACTION gates only when selected; premature termination returns 0.0 and missing criteria returns 1.0. }

  - id: dify-request-to-graph-events
    page_item_id: project-dify
    label: Blocking Service API request to public workflow response
    reading_hint: Follow the numbered blocking path; read streaming as an independent delivery side path.
    misconception: WorkflowEntry receives an existing Graph; GraphEngine does not create nodes, and the internal converter does not emit the final public payload.
    steps:
      - { id: dify-01-controller, track: blocking 01 · request to graph, label: Service API, subject_id: dify, source_path: api/controllers/service_api/app/workflow.py, symbol: WorkflowRunApi.post, responsibility: Admit one numbered Service API workflow request. }
      - { id: dify-02-service, track: blocking 01 · request to graph, label: Generate service, subject_id: dify, source_path: api/services/app_generate_service.py, symbol: AppGenerateService.generate, responsibility: Enter the shared app generation service. }
      - { id: dify-03-guardrails, track: blocking 01 · request to graph, label: Request guardrails, subject_id: dify, source_path: api/services/app_generate_service.py, symbol: AppGenerateService._run_with_guardrails, responsibility: Apply quota and app-level concurrency guardrails. }
      - { id: dify-04-workflow-mode, track: blocking 01 · request to graph, label: Blocking workflow branch, subject_id: dify, source_path: api/services/app_generate_service.py, symbol: AppGenerateService._dispatch_generate, responsibility: Select AppMode.WORKFLOW with streaming=false. }
      - { id: dify-05-generate, track: blocking 01 · request to graph, label: Workflow generator, subject_id: dify, source_path: api/core/app/apps/workflow/app_generator.py, symbol: WorkflowAppGenerator.generate, responsibility: Validate inputs and build workflow execution configuration. }
      - { id: dify-06-generate-core, track: blocking 01 · request to graph, label: Generation core, subject_id: dify, source_path: api/core/app/apps/workflow/app_generator.py, symbol: WorkflowAppGenerator._generate, responsibility: Create the queue manager and start the common worker. }
      - { id: dify-07-worker, track: blocking 01 · request to graph, label: Generation worker, subject_id: dify, source_path: api/core/app/apps/workflow/app_generator.py, symbol: WorkflowAppGenerator._generate_worker, responsibility: Construct WorkflowAppRunner and inject both execution repositories. }
      - { id: dify-08-runner, track: blocking 01 · request to graph, label: Workflow runner, subject_id: dify, source_path: api/core/app/apps/workflow/app_runner.py, symbol: WorkflowAppRunner.run, responsibility: Prepare runtime state and obtain an existing Graph through _init_graph. }
      - { id: dify-09-graph-init, track: blocking 01 · request to graph, label: Graph initialization, subject_id: dify, source_path: api/core/app/apps/workflow_app_runner.py, symbol: WorkflowBasedAppRunner._init_graph, responsibility: Call Graph.init with DifyNodeFactory. }
      - { id: dify-10-node-factory, track: blocking 01 · request to graph, label: Node factory, subject_id: dify, source_path: api/core/workflow/node_factory.py, symbol: DifyNodeFactory.create_node, responsibility: Resolve and construct each versioned node. }
      - { id: dify-11-agent-node, track: blocking 01 · request to graph, label: Conditional agent node, subject_id: dify, source_path: api/core/workflow/nodes/agent_v2/agent_node.py, symbol: DifyAgentNode.__init__, responsibility: Construct DifyAgentNode only when agent_node_kind is dify_agent. }
      - { id: dify-12-entry, track: blocking 01 · request to graph, label: Workflow entry, subject_id: dify, source_path: api/core/workflow/workflow_entry.py, symbol: WorkflowEntry.__init__, responsibility: "Receive the existing Graph, construct GraphEngine, and attach debug, execution-limit, and optional observability layers." }
      - { id: dify-12b-runner-layers, track: blocking 01 · request to graph, label: Runner-owned layers, subject_id: dify, source_path: api/core/app/apps/workflow/app_runner.py, symbol: WorkflowAppRunner.run, responsibility: "After WorkflowEntry returns, attach WorkflowPersistenceLayer, workspace-retirement, and external custom layers to workflow_entry.graph_engine." }
      - { id: dify-13-engine, track: blocking 02 · graph to response, label: Graph engine, subject_id: dify, source_path: api/core/workflow/workflow_entry.py, symbol: WorkflowEntry.run, responsibility: "Drive GraphEngine.run, its worker, and Node.run through Graphon." }
      - { id: dify-14-agent-run, track: blocking 02 · graph to response, label: Agent-node execution, subject_id: dify, source_path: api/core/workflow/nodes/agent_v2/agent_node.py, symbol: DifyAgentNode._run, responsibility: Enter the selected agent node execution. }
      - { id: dify-15-agent-backend, track: blocking 02 · graph to response, label: Agent backend events, subject_id: dify, source_path: api/core/workflow/nodes/agent_v2/agent_node.py, symbol: DifyAgentNode._run_inner, responsibility: Call create_run and consume stream_events as graph node events. }
      - { id: dify-16-event-handler, track: blocking 02 · graph to response, label: Graph event adapter, subject_id: dify, source_path: api/core/app/apps/workflow_app_runner.py, symbol: WorkflowBasedAppRunner._handle_event, responsibility: Translate Graphon events into typed app queue events. }
      - { id: dify-17-queue, track: blocking 02 · graph to response, label: Queue publish, subject_id: dify, source_path: api/core/app/apps/workflow/app_queue_manager.py, symbol: WorkflowAppQueueManager._publish, responsibility: Publish events to the local blocking queue transport. }
      - { id: dify-18-pipeline, track: blocking 02 · graph to response, label: Response pipeline, subject_id: dify, source_path: api/core/app/apps/workflow/generate_task_pipeline.py, symbol: WorkflowAppGenerateTaskPipeline.process, responsibility: Consume queue events in blocking mode. }
      - { id: dify-19-typed, track: blocking 02 · graph to response, label: Typed internal conversion, subject_id: dify, source_path: api/core/app/apps/common/workflow_response_converter.py, symbol: WorkflowResponseConverter.workflow_finish_to_stream_response, responsibility: Create typed internal workflow response objects. }
      - { id: dify-20-aggregate, track: blocking 02 · graph to response, label: Blocking aggregation, subject_id: dify, source_path: api/core/app/apps/workflow/generate_task_pipeline.py, symbol: WorkflowAppGenerateTaskPipeline._to_blocking_response, responsibility: Aggregate the terminal typed event into WorkflowAppBlockingResponse. }
      - { id: dify-21-public, track: blocking 02 · graph to response, label: Public response, subject_id: dify, source_path: api/core/app/apps/workflow/generate_response_converter.py, symbol: WorkflowAppGenerateResponseConverter.convert_blocking_full_response, responsibility: Map the typed blocking response to the final public payload. }
      - { id: dify-stream-01-subscribe, track: streaming side path, label: Subscribe before enqueue, subject_id: dify, source_path: api/services/app_generate_service.py, symbol: AppGenerateService._build_streaming_task_on_subscribe, responsibility: Prepare topic retrieval before task submission. }
      - { id: dify-stream-02-dispatch, track: streaming side path, label: Task dispatch and retrieval, subject_id: dify, source_path: api/services/app_generate_service.py, symbol: AppGenerateService._dispatch_generate, responsibility: Submit the Celery task after subscription and keep the request process on retrieve_events for SSE. }
      - { id: dify-stream-03-task, track: streaming side path, label: Celery task, subject_id: dify, source_path: api/tasks/app_generate/workflow_execute_task.py, symbol: workflow_based_app_execution_task, responsibility: Rehydrate the execution payload and invoke the Celery _AppRunner. }
      - { id: dify-stream-04-runner, track: streaming side path, label: Celery app runner, subject_id: dify, source_path: api/tasks/app_generate/workflow_execute_task.py, symbol: _AppRunner.run, responsibility: Enter the same WorkflowAppGenerator and WorkflowAppRunner path used by blocking execution. }
      - { id: dify-stream-05-worker, track: streaming side path, label: Shared generation worker, subject_id: dify, source_path: api/core/app/apps/workflow/app_generator.py, symbol: WorkflowAppGenerator._generate_worker, responsibility: Execute the shared graph runner with injected repositories. }
      - { id: dify-stream-06-typed, track: streaming side path, label: Streaming typed response, subject_id: dify, source_path: api/core/app/apps/workflow/generate_task_pipeline.py, symbol: WorkflowAppGenerateTaskPipeline._to_stream_response, responsibility: Wrap internal typed responses for streaming conversion. }
      - { id: dify-stream-07-public, track: streaming side path, label: Streaming public response, subject_id: dify, source_path: api/core/app/apps/workflow/generate_response_converter.py, symbol: WorkflowAppGenerateResponseConverter.convert_stream_full_response, responsibility: Map typed workflow responses into public response chunks. }
      - { id: dify-stream-08-topic, track: streaming side path, label: Topic publish, subject_id: dify, source_path: api/tasks/app_generate/workflow_execute_task.py, symbol: _publish_streaming_response, responsibility: Write already public-mapped chunks to the topic for request-side retrieval and SSE delivery. }
      - { id: dify-stream-09-retrieve, track: streaming side path, label: Request retrieval and SSE, subject_id: dify, source_path: api/services/app_generate_service.py, symbol: AppGenerateService._dispatch_generate, responsibility: Perform request-side retrieval of public mappings from the topic and deliver SSE. }

  - id: crewai-kickoff-to-task-output
    page_item_id: project-crewai
    label: Default sequential kickoff to CrewOutput
    reading_hint: Follow Process.sequential with Task.async_execution=false and Agent.planning=false; conditional tool and planning tracks are not unconditional stages.
    misconception: Role names and role count do not create isolation or prove multi-agent value; StepExecutor is not on the default planning-disabled path.
    steps:
      - { id: crew-01-kickoff, track: default sequential 01 · setup, label: Crew kickoff, subject_id: crewai, source_path: lib/crewai/src/crewai/crew.py, symbol: Crew.kickoff, responsibility: Start the fixed default synchronous execution. }
      - { id: crew-02-begin, track: default sequential 01 · setup, label: Execution context, subject_id: crewai, source_path: lib/crewai/src/crewai/execution.py, symbol: begin_execution, responsibility: Open the execution and tracing context before kickoff preparation. }
      - { id: crew-03-prepare, track: default sequential 01 · setup, label: Kickoff preparation, subject_id: crewai, source_path: lib/crewai/src/crewai/crews/utils.py, symbol: prepare_kickoff, responsibility: "Prepare inputs, callbacks, agents, and optional planning." }
      - { id: crew-04-setup-agents, track: default sequential 01 · setup, label: Agent setup, subject_id: crewai, source_path: lib/crewai/src/crewai/crews/utils.py, symbol: setup_agents, responsibility: Bind each agent to the crew and request executor creation. }
      - { id: crew-05-create-executor, track: default sequential 01 · setup, label: Executor creation, subject_id: crewai, source_path: lib/crewai/src/crewai/agent/core.py, symbol: Agent.create_agent_executor, responsibility: Create the default experimental AgentExecutor. }
      - { id: crew-06-sequential, track: default sequential 01 · setup, label: Sequential process, subject_id: crewai, source_path: lib/crewai/src/crewai/crew.py, symbol: Crew._run_sequential_process, responsibility: Delegate the task list to sequential execution. }
      - { id: crew-07-execute-tasks, track: default sequential 01 · setup, label: Task loop, subject_id: crewai, source_path: lib/crewai/src/crewai/crew.py, symbol: Crew._execute_tasks, responsibility: Iterate tasks with Task.async_execution=false. }
      - { id: crew-08-prepare-task, track: default sequential 01 · setup, label: Task preparation, subject_id: crewai, source_path: lib/crewai/src/crewai/crews/utils.py, symbol: prepare_task_execution, responsibility: "Resolve the current agent, tools, and prior-task context." }
      - { id: crew-09-task-sync, track: default sequential 02 · execution and output, label: Synchronous task, subject_id: crewai, source_path: lib/crewai/src/crewai/task.py, symbol: Task.execute_sync, responsibility: Enter synchronous task execution. }
      - { id: crew-10-task-core, track: default sequential 02 · execution and output, label: Task core, subject_id: crewai, source_path: lib/crewai/src/crewai/task.py, symbol: Task._execute_core, responsibility: Delegate work to the assigned agent. }
      - { id: crew-11-agent, track: default sequential 02 · execution and output, label: Agent execution, subject_id: crewai, source_path: lib/crewai/src/crewai/agent/core.py, symbol: Agent.execute_task, responsibility: Prepare the task prompt and invoke the configured executor. }
      - { id: crew-12-invoke, track: default sequential 02 · execution and output, label: Experimental executor, subject_id: crewai, source_path: lib/crewai/src/crewai/experimental/agent_executor.py, symbol: AgentExecutor.invoke, responsibility: "With planning disabled, enter exactly one native-tool or text ReAct route." }
      - { id: crew-13-finish, track: default sequential 02 · execution and output, label: Final answer, subject_id: crewai, source_path: lib/crewai/src/crewai/experimental/agent_executor.py, symbol: AgentExecutor.invoke, responsibility: Read AgentFinish.output after either the text or native branch finishes. }
      - { id: crew-14-finalize, track: default sequential 02 · execution and output, label: Agent finalization, subject_id: crewai, source_path: lib/crewai/src/crewai/agent/core.py, symbol: Agent._finalize_task_execution, responsibility: Finalize the raw agent result. }
      - { id: crew-15-task-output, track: default sequential 02 · execution and output, label: Task output, subject_id: crewai, source_path: lib/crewai/src/crewai/task.py, symbol: Task._execute_core, responsibility: Construct and own TaskOutput; _export_output only converts structured fields. }
      - { id: crew-16-crew-output, track: default sequential 02 · execution and output, label: Crew output, subject_id: crewai, source_path: lib/crewai/src/crewai/crew.py, symbol: Crew._create_crew_output, responsibility: Construct CrewOutput from completed TaskOutput values. }
      - { id: crew-17-end, track: default sequential 02 · execution and output, label: Execution context close, subject_id: crewai, source_path: lib/crewai/src/crewai/execution.py, symbol: end_execution, responsibility: Close the kickoff execution context after output construction. }
      - { id: crew-text-01-llm, track: text ReAct · conditional, label: Text LLM and parse, subject_id: crewai, source_path: lib/crewai/src/crewai/experimental/agent_executor.py, symbol: AgentExecutor.call_llm_and_parse, responsibility: Parse text output into AgentAction or AgentFinish. }
      - { id: crew-text-02-action, track: text ReAct · conditional, label: Text tool action, subject_id: crewai, source_path: lib/crewai/src/crewai/experimental/agent_executor.py, symbol: AgentExecutor.execute_tool_action, responsibility: Dispatch a parsed AgentAction through ToolUsage. }
      - { id: crew-text-03-use, track: text ReAct · conditional, label: Tool usage, subject_id: crewai, source_path: lib/crewai/src/crewai/tools/tool_usage.py, symbol: ToolUsage.use, responsibility: Validate and enter the text tool call. }
      - { id: crew-text-04-use-inner, track: text ReAct · conditional, label: Tool execution, subject_id: crewai, source_path: lib/crewai/src/crewai/tools/tool_usage.py, symbol: ToolUsage._use, responsibility: Resolve the selected CrewStructuredTool and invoke it. }
      - { id: crew-text-05-invoke, track: text ReAct · conditional, label: Structured tool, subject_id: crewai, source_path: lib/crewai/src/crewai/tools/structured_tool.py, symbol: CrewStructuredTool.invoke, responsibility: Call the selected structured tool implementation. }
      - { id: crew-native-01-llm, track: native tool · conditional, label: Native LLM call, subject_id: crewai, source_path: lib/crewai/src/crewai/experimental/agent_executor.py, symbol: AgentExecutor.call_llm_native_tools, responsibility: Request native tool calls from the model. }
      - { id: crew-native-02-action, track: native tool · conditional, label: Native tool batch, subject_id: crewai, source_path: lib/crewai/src/crewai/experimental/agent_executor.py, symbol: AgentExecutor.execute_native_tool, responsibility: Process the native tool-call batch. }
      - { id: crew-native-03-single, track: native tool · conditional, label: Single native call, subject_id: crewai, source_path: lib/crewai/src/crewai/experimental/agent_executor.py, symbol: AgentExecutor._execute_single_native_tool_call, responsibility: "Resolve and invoke _available_functions[func_name] for one native call." }
      - { id: crew-plan-01-plan, track: planning · conditional, label: Planning gate, subject_id: crewai, source_path: lib/crewai/src/crewai/experimental/agent_executor.py, symbol: AgentExecutor.generate_plan, responsibility: Run only when Agent.planning_enabled is true and create todos from plan steps. }
      - { id: crew-plan-02-lazy, track: planning · conditional, label: Lazy step executor, subject_id: crewai, source_path: lib/crewai/src/crewai/experimental/agent_executor.py, symbol: AgentExecutor._ensure_step_executor, responsibility: Lazily construct StepExecutor only after todos exist. }
      - { id: crew-plan-03-execute, track: planning · conditional, label: Planned step, subject_id: crewai, source_path: lib/crewai/src/crewai/agents/step_executor.py, symbol: StepExecutor.execute, responsibility: Execute one planned todo; absent from the default planning-disabled path. }

  - id: autogpt-flowise-evolution
    page_item_id: project-history-autogpt-flowise
    label: Early autonomy and visual-flow assumptions to current boundaries
    reading_hint: Read the page as a migration lesson, not a production recommendation.
    misconception: An active repository or a visible canvas does not prove that an older architecture is maintained or suitable.
    steps:
      - { id: autogpt-entry, track: autogpt, label: Classic entry, subject_id: autogpt, source_path: classic/original_autogpt/autogpt/app/main.py, symbol: run_auto_gpt, responsibility: Show the original autonomous-loop product boundary. }
      - { id: autogpt-agent, track: autogpt, label: Classic agent, subject_id: autogpt, source_path: classic/original_autogpt/autogpt/agents/agent.py, symbol: Agent.execute, responsibility: Expose the loop and prompt-strategy assumptions. }
      - { id: flowise-entry, track: flowise, label: Prediction controller, subject_id: flowise, source_path: packages/server/src/controllers/predictions/index.ts, symbol: createPrediction, responsibility: Admit a visual-flow prediction request. }
      - { id: flowise-service, track: flowise, label: Prediction service, subject_id: flowise, source_path: packages/server/src/services/predictions/index.ts, symbol: buildChatflow, responsibility: Execute the configured flow before the archived EOL boundary. }
```

- [ ] **Step 12: Wire the project catalog into content validation**

Change `validateBook` to accept optional paths while preserving current callers:

```js
import { validateProjectCatalogFile } from './project-catalog.mjs'

export function validateBook(root = process.cwd(), options = {}) {
  const sourcePath = join(root, 'sources/source-index.yml')
  const projectCatalogPath = resolve(root, options.projectCatalogPath ?? 'sources/project-index.yml')
  return [
    ...validateSourceRegistry(sourcePath),
    ...validateProjectCatalogFile(projectCatalogPath),
    ...validatePublishedFiles(root),
  ]
}
```

Task 10 adds provenance validation after its module and registry exist.

- [ ] **Step 13: Run exact inventory tests and full validation**

Run:

```bash
pnpm vitest run tests/project-catalog.spec.ts
pnpm test && pnpm validate && pnpm build
```

Expected: project catalog tests pass, content validation passes, and the full suite remains green.

- [ ] **Step 14: Commit the canonical project data**

```bash
git add sources/project-index.yml scripts/validate-content.mjs tests/project-catalog.spec.ts
git commit -m "feat: add pinned project source catalog"
```

### Task 3: Add the build-time catalog loader and four SSR-safe components

**Files:**

- Create: `docs/.vitepress/theme/data/projectCatalog.data.ts`
- Create: `docs/.vitepress/theme/data/projectCatalogTypes.ts`
- Create: `docs/.vitepress/theme/data/projectCatalogCore.ts`
- Create: `docs/.vitepress/theme/data/projectCatalog.ts`
- Create: `docs/.vitepress/env.d.ts`
- Create: `tsconfig.projects.json`
- Create: `docs/.vitepress/theme/components/ProjectOverview.vue`
- Create: `docs/.vitepress/theme/components/ProjectMeta.vue`
- Create: `docs/.vitepress/theme/components/ProjectCallChain.vue`
- Create: `docs/.vitepress/theme/components/ProjectSourceLinks.vue`
- Modify: `docs/.vitepress/theme/index.ts`
- Modify: `docs/.vitepress/theme/style.css`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `tests/project-pages.spec.ts`

- [ ] **Step 1: Write failing loader, lookup, SSR, and semantic tests**

Create `tests/project-pages.spec.ts` with these first contracts:

```ts
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { loadProjectCatalog } from '../scripts/project-catalog.mjs'
import { createProjectCatalogLookup } from '../docs/.vitepress/theme/data/projectCatalogCore'
import {
  type ProjectCatalog,
} from '../docs/.vitepress/theme/data/projectCatalogTypes'

const projectCatalog = loadProjectCatalog(resolve('sources/project-index.yml')) as ProjectCatalog
const {
  getProjectChain, getProjectPage, getProjectSubject, projectSourceUrl,
} = createProjectCatalogLookup(projectCatalog)

describe('project presentation primitives', () => {
  it('loads the validated project catalog and fails closed on inherited IDs', () => {
    expect(getProjectPage('project-aider').subjects).toEqual(['aider'])
    expect(getProjectSubject('aider').pinned_ref).toBe('v0.86.0')
    expect(getProjectSubject('hermes-agent').risk_tags).toEqual(['长期自主', '长期记忆', '外部系统'])
    expect(getProjectSubject('openclaw').risk_tags).toEqual(['长期自主', 'IM', '桌面控制', '外部系统'])
    expect(getProjectChain('aider-repo-to-verified-edit').steps).toHaveLength(21)

    for (const id of ['missing', 'toString', 'constructor', '__proto__']) {
      expect(() => getProjectPage(id)).toThrow(`Unknown project page: ${id}`)
      expect(() => getProjectSubject(id)).toThrow(`Unknown project subject: ${id}`)
      expect(() => getProjectChain(id)).toThrow(`Unknown project chain: ${id}`)
    }
  })

  it('generates immutable source links from the pinned commit', () => {
    expect(projectSourceUrl('aider', 'aider/main.py')).toBe(
      'https://github.com/Aider-AI/aider/blob/a4be6ccd87ebaa59b361f3f028d116ce1761b626/aider/main.py',
    )
    expect(projectSourceUrl('aider', 'LICENSE.txt')).toContain(
      '/blob/a4be6ccd87ebaa59b361f3f028d116ce1761b626/LICENSE.txt',
    )
    expect(() => projectSourceUrl('aider', 'README.md')).toThrow(
      'Undeclared project source: aider/README.md',
    )
  })

  it('URL-encodes each declared source path segment without encoding separators', () => {
    const specialCatalog = structuredClone(projectCatalog)
    const aider = specialCatalog.subjects.find((subject) => subject.id === 'aider')!
    aider.entrypoints.push({
      path: 'docs/path with space/#guide?100%.md',
      symbols: ['render special path'],
      responsibility: 'Exercise reserved URL characters in a declared source path.',
    })
    const specialLookup = createProjectCatalogLookup(specialCatalog)

    expect(specialLookup.projectSourceUrl('aider', 'docs/path with space/#guide?100%.md')).toBe(
      'https://github.com/Aider-AI/aider/blob/a4be6ccd87ebaa59b361f3f028d116ce1761b626/docs/path%20with%20space/%23guide%3F100%25.md',
    )
  })

  it('loads the catalog relative to the loader module instead of the process working directory', () => {
    const loader = readFileSync('docs/.vitepress/theme/data/projectCatalog.data.ts', 'utf8')
    expect(loader).not.toContain('process.cwd()')
    expect(loader).not.toContain('watchedFiles[0]')
    expect(loader).toContain('import.meta.url')
    expect(loader).toContain("new URL('../../../../sources/project-index.yml', import.meta.url)")
  })

  it('registers four SSR-safe components with native list and disclosure semantics', () => {
    const loader = readFileSync('docs/.vitepress/theme/data/projectCatalog.data.ts', 'utf8')
    expect(loader).toContain("import { defineLoader } from 'vitepress'")
    expect(loader).not.toContain('type { Loader }')

    const core = readFileSync('docs/.vitepress/theme/data/projectCatalogCore.ts', 'utf8')
    expect(core).not.toContain('projectCatalog.data')

    const theme = readFileSync('docs/.vitepress/theme/index.ts', 'utf8')
    for (const name of ['ProjectOverview', 'ProjectMeta', 'ProjectCallChain', 'ProjectSourceLinks']) {
      expect(theme).toContain(`'${name}'`)
    }

    const chain = readFileSync('docs/.vitepress/theme/components/ProjectCallChain.vue', 'utf8')
    expect(chain).toContain('<figure')
    expect(chain).toContain('class="project-architecture"')
    expect(chain).toContain('本书归纳 · 原创建筑关系图')
    expect(chain).toContain('<ol')
    expect(chain).toContain('role="list"')
    expect(chain).toContain('role="listitem"')
    expect(chain).toContain('源码事实：')
    expect(chain).toContain('本书归纳：')
    expect(chain).toContain('不要误解')

    const meta = readFileSync('docs/.vitepress/theme/components/ProjectMeta.vue', 'utf8')
    expect(meta).toContain('仓库状态')
    expect(meta).toContain('教学层级')
    expect(meta).toContain('<details')
    expect(meta).toContain('project-license-print')
    expect(meta).not.toContain('pinned_commit.slice')
    expect(meta).toContain('scope.basis')
    expect(meta).toContain('scope.path_or_glob ?? scope.selector')
    expect(meta).toContain('projectSourceUrl(subject.id, source.path)')

    const sources = readFileSync('docs/.vitepress/theme/components/ProjectSourceLinks.vue', 'utf8')
    for (const field of ['row.path', 'row.symbols', 'row.responsibility']) {
      expect(sources).toContain(field)
    }
    expect(sources).not.toContain('row.symbol }}')

    const overview = readFileSync('docs/.vitepress/theme/components/ProjectOverview.vue', 'utf8')
    expect(overview).toContain('subject.risk_tags')
    for (const id of ['frontier-agent-security-evaluation', 'chapter-09-safety-recovery', 'radar']) {
      expect(overview).toContain(id)
    }
  })

  it('parses responsive project rules by media scope and effective cascade', async () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
    expect(pkg.devDependencies.postcss).toBe('8.5.28')
    expect(pkg.devDependencies['postcss-selector-parser']).toBe('7.1.6')

    const sourceComponent = readFileSync(
      'docs/.vitepress/theme/components/ProjectSourceLinks.vue',
      'utf8',
    )
    expect(sourceComponent).toContain('class="project-source-print-url"')
    expect(sourceComponent).toContain('aria-hidden="true"')
    expect(sourceComponent).toContain('{{ row.href }}')
    expect(readFileSync('docs/.vitepress/theme/components/ProjectMeta.vue', 'utf8'))
      .toContain('class="project-license-print-url"')

    const { default: postcss } = await import('postcss')
    const { default: selectorParser } = await import('postcss-selector-parser')
    expect(selectorParser).toBeTypeOf('function')
    const root = postcss.parse(readFileSync('docs/.vitepress/theme/style.css', 'utf8'))
    const rules: any[] = []
    root.walkRules((rule) => rules.push(rule))

    const selectors = (rule: any) => postcss.list.comma(rule.selector).map((value) => value.trim())
    const scope = (rule: any) => {
      let parent = rule.parent
      while (parent && parent !== root) {
        if (parent.type === 'atrule' && parent.name === 'media') {
          return parent.params.replace(/\s+/gu, '').toLowerCase()
        }
        parent = parent.parent
      }
      return 'root'
    }
    const findExactRule = (expectedSelectors: string[], expectedScope: string) => {
      const expected = [...expectedSelectors].sort()
      const matches = rules.filter((rule) =>
        scope(rule) === expectedScope
        && JSON.stringify([...selectors(rule)].sort()) === JSON.stringify(expected))
      expect(matches, `${expectedScope}: ${expectedSelectors.join(', ')}`).toHaveLength(1)
      return matches[0]
    }
    const declarations = (rule: any) => Object.fromEntries(
      rule.nodes
        .filter((node: any) => node.type === 'decl')
        .map((node: any) => [node.prop, { value: node.value, important: Boolean(node.important) }]),
    )
    const expectEffectiveRule = (
      expectedSelectors: string[],
      expectedScope: string,
      expectedDeclarations: Record<string, { value: string, important?: boolean }>,
    ) => {
      const rule = findExactRule(expectedSelectors, expectedScope)
      const actual = declarations(rule)
      for (const [property, expected] of Object.entries(expectedDeclarations)) {
        expect(actual[property], `${rule.selector} ${property}`).toEqual({
          value: expected.value,
          important: expected.important ?? false,
        })
      }
      const laterRules = rules.slice(rules.indexOf(rule) + 1)
      for (const selector of expectedSelectors) {
        for (const property of Object.keys(expectedDeclarations)) {
          const overrides = laterRules.filter((candidate) =>
            scope(candidate) === expectedScope
            && selectors(candidate).includes(selector)
            && Boolean(declarations(candidate)[property]))
          expect(overrides, `later ${expectedScope} override: ${selector} ${property}`).toEqual([])
        }
      }
    }

    expectEffectiveRule(['.project-meta > ul > li'], 'root', {
      'grid-template-columns': { value: 'minmax(0, 1fr)', important: true },
      'min-width': { value: '0', important: true },
    })
    expectEffectiveRule(['.project-meta > ul > li > *'], 'root', {
      'min-width': { value: '0', important: true },
    })
    expectEffectiveRule(['.project-source-links > li'], 'root', {
      'grid-template-columns': { value: 'minmax(0, 1fr)' },
    })
    expectEffectiveRule(['.project-call-chain li'], 'root', {
      'grid-template-columns': { value: 'minmax(0, 1fr)' },
      'min-width': { value: '0' },
    })
    expectEffectiveRule(['.project-license-print-url'], 'root', {
      'overflow-wrap': { value: 'anywhere' },
    })
    expectEffectiveRule(['.project-source-print-url'], 'root', {
      display: { value: 'none' },
    })

    expectEffectiveRule(
      ['.project-architecture-nodes', '.project-call-chain'],
      '(max-width:700px)',
      { 'grid-template-columns': { value: '1fr' } },
    )
    expectEffectiveRule(
      ['.project-meta', '.project-chain-section', '.project-overview section'],
      '(max-width:700px)',
      { padding: { value: '0.9rem' } },
    )

    expectEffectiveRule(
      ['.project-meta > ul', '.project-source-links', '.project-call-chain'],
      'print',
      { display: { value: 'block' } },
    )
    expectEffectiveRule(
      ['.project-meta > ul > li', '.project-source-links > li', '.project-call-chain li'],
      'print',
      { display: { value: 'block' }, 'break-inside': { value: 'avoid' } },
    )
    expectEffectiveRule(
      ['.project-meta > ul > li > *', '.project-source-links > li > *', '.project-call-chain li > *'],
      'print',
      { display: { value: 'block' } },
    )
    expectEffectiveRule(['.project-source-print-url'], 'print', {
      display: { value: 'block', important: true },
      'max-width': { value: '100%', important: true },
      'overflow-wrap': { value: 'anywhere', important: true },
      'white-space': { value: 'normal', important: true },
    })

    const mediaAncestors = (rule: any) => {
      const ancestors: string[] = []
      let parent = rule.parent
      while (parent && parent !== root) {
        if (parent.type === 'atrule' && parent.name === 'media') ancestors.unshift(parent.params)
        parent = parent.parent
      }
      return ancestors
    }
    const mediaBranches = (params: string) => postcss.list.comma(params)
      .map((branch) => branch.trim().toLowerCase())
    const branchAllowsPrint = (branch: string) => {
      if (/\bnot\s+print\b/u.test(branch)) return false
      if (/\b(?:only\s+)?screen\b/u.test(branch) && !/\bnot\s+screen\b/u.test(branch)) return false
      return true
    }
    const branchAllowsMobile = (branch: string, width = 390) => {
      if (/\bnot\s+screen\b/u.test(branch)) return false
      if (/\bprint\b/u.test(branch) && !/\bnot\s+print\b/u.test(branch)) return false
      const min = [...branch.matchAll(/min-width\s*:\s*(\d+)px/gu)].map((match) => Number(match[1]))
      const max = [...branch.matchAll(/max-width\s*:\s*(\d+)px/gu)].map((match) => Number(match[1]))
      return min.every((value) => width >= value) && max.every((value) => width <= value)
    }
    const appliesToPrint = (rule: any) => mediaAncestors(rule)
      .every((params) => mediaBranches(params).some(branchAllowsPrint))
    const appliesToMobile = (rule: any) => mediaAncestors(rule)
      .every((params) => mediaBranches(params).some((branch) => branchAllowsMobile(branch)))
    const selectorAnalysis = (selector: string) => {
      const selectorRoot = selectorParser().astSync(selector)
      const selectorNode: any = selectorRoot.nodes[0]
      const specificity = [0, 0, 0]
      const classes = new Set<string>()
      const tags = new Set<string>()
      const pseudos = new Set<string>()
      selectorNode.walk((node: any) => {
        if (node.type === 'id') specificity[0] += 1
        else if (node.type === 'class' || node.type === 'attribute') specificity[1] += 1
        else if (node.type === 'pseudo') {
          if (node.value.startsWith('::')) specificity[2] += 1
          else specificity[1] += 1
        } else if (node.type === 'tag') specificity[2] += 1
        if (node.type === 'class') classes.add(node.value)
        if (node.type === 'tag') tags.add(node.value)
        if (node.type === 'pseudo') pseudos.add(node.value)
      })
      const nodes = selectorNode.nodes as any[]
      const lastCombinator = nodes.reduce(
        (index, node, candidate) => node.type === 'combinator' ? candidate : index,
        -1,
      )
      const lastCompound = nodes.slice(lastCombinator + 1)
      return {
        classes,
        lastHasLi: lastCompound.some((node) => node.type === 'tag' && node.value === 'li'),
        pseudos,
        specificity,
        tags,
      }
    }
    const compareSpecificity = (left: number[], right: number[]) => {
      for (let index = 0; index < 3; index += 1) {
        if (left[index] !== right[index]) return left[index] - right[index]
      }
      return 0
    }
    const criticalCascadeViolations = (css: string) => {
      const fixtureRoot = postcss.parse(css)
      const fixtureRules: any[] = []
      fixtureRoot.walkRules((rule) => fixtureRules.push(rule))
      const fixtureSelectors = (rule: any) => postcss.list.comma(rule.selector)
        .map((value) => value.trim())
      const fixtureDeclarations = (rule: any) => rule.nodes
        .filter((node: any) => node.type === 'decl')
      const fixtureMediaAncestors = (rule: any) => {
        const ancestors: string[] = []
        let parent = rule.parent
        while (parent && parent !== fixtureRoot) {
          if (parent.type === 'atrule' && parent.name === 'media') ancestors.unshift(parent.params)
          parent = parent.parent
        }
        return ancestors
      }
      const fixtureAppliesToPrint = (rule: any) => fixtureMediaAncestors(rule)
        .every((params) => mediaBranches(params).some(branchAllowsPrint))
      const fixtureAppliesToMobile = (rule: any) => fixtureMediaAncestors(rule)
        .every((params) => mediaBranches(params).some((branch) => branchAllowsMobile(branch)))
      const exactRules = (selector: string, media: 'root' | 'print') => fixtureRules.filter((rule) => {
        const exactSelector = fixtureSelectors(rule).length === 1 && fixtureSelectors(rule)[0] === selector
        if (!exactSelector) return false
        const ancestors = fixtureMediaAncestors(rule).map((value) => value.replace(/\s+/gu, '').toLowerCase())
        return media === 'root' ? ancestors.length === 0 : ancestors.length === 1 && ancestors[0] === 'print'
      })
      const errors: string[] = []
      const metaRules = exactRules('.project-meta > ul > li', 'root')
      const printBaseRules = exactRules('.project-source-print-url', 'root')
      const printRules = exactRules('.project-source-print-url', 'print')
      if (metaRules.length !== 1) errors.push('missing approved mobile meta rule')
      if (printBaseRules.length !== 1) errors.push('missing approved screen-hidden print URL rule')
      if (printRules.length !== 1) errors.push('missing approved print URL rule')

      const metaRule = metaRules[0]
      const printRule = printRules[0]
      const metaIndex = fixtureRules.indexOf(metaRule)
      const printIndex = fixtureRules.indexOf(printRule)
      const metaSpecificity = selectorAnalysis('.project-meta > ul > li').specificity
      const printSpecificity = selectorAnalysis('.project-source-print-url').specificity
      const metaExpected: Record<string, string> = {
        'grid-template-columns': 'minmax(0, 1fr)',
        'min-width': '0',
      }
      const printExpected: Record<string, string> = {
        display: 'block',
        'max-width': '100%',
        'overflow-wrap': 'anywhere',
        'white-space': 'normal',
      }
      if (metaRule) {
        const actual = Object.fromEntries(fixtureDeclarations(metaRule).map((node: any) => [node.prop, node]))
        for (const [property, value] of Object.entries(metaExpected)) {
          if (actual[property]?.value !== value || !actual[property]?.important) {
            errors.push(`approved mobile meta ${property} must be ${value} !important`)
          }
        }
      }
      if (printRule) {
        const actual = Object.fromEntries(fixtureDeclarations(printRule).map((node: any) => [node.prop, node]))
        for (const [property, value] of Object.entries(printExpected)) {
          if (actual[property]?.value !== value || !actual[property]?.important) {
            errors.push(`approved print URL ${property} must be ${value} !important`)
          }
        }
      }

      fixtureRules.forEach((rule, ruleIndex) => {
        fixtureSelectors(rule).forEach((selector) => {
          const analysis = selectorAnalysis(selector)
          const declarationByProperty = Object.fromEntries(
            fixtureDeclarations(rule).map((node: any) => [node.prop, node]),
          )
          const targetsMetaRow = analysis.classes.has('project-meta') && analysis.lastHasLi
          if (targetsMetaRow && fixtureAppliesToMobile(rule)) {
            for (const property of Object.keys(metaExpected)) {
              const declaration = declarationByProperty[property]
              if (!declaration || rule === metaRule) continue
              if (declaration.important) {
                errors.push(`competing mobile !important: ${selector} ${property}`)
              } else if (metaRule && ruleIndex > metaIndex
                && compareSpecificity(analysis.specificity, metaSpecificity) >= 0) {
                errors.push(`later mobile override: ${selector} ${property}`)
              }
            }
          }

          if (analysis.classes.has('project-source-print-url') && fixtureAppliesToPrint(rule)) {
            for (const property of Object.keys(printExpected)) {
              const declaration = declarationByProperty[property]
              if (!declaration || rule === printRule) continue
              const approvedScreenDefault = rule === printBaseRules[0]
                && property === 'display'
                && declaration.value === 'none'
                && !declaration.important
              if (approvedScreenDefault) continue
              if (declaration.important) {
                errors.push(`competing print !important: ${selector} ${property}`)
              } else if (printRule && ruleIndex > printIndex
                && compareSpecificity(analysis.specificity, printSpecificity) >= 0) {
                errors.push(`later print override: ${selector} ${property}`)
              }
            }
          }

          const hasLinkPseudo = analysis.tags.has('a')
            && [...analysis.pseudos].some((pseudo) => pseudo.startsWith('::'))
          if (hasLinkPseudo && fixtureDeclarations(rule).some((node: any) =>
            node.prop === 'content' && /attr\(href\)/u.test(node.value))) {
            errors.push(`link pseudo attr(href): ${selector}`)
          }
        })
      })
      return errors
    }

    const style = readFileSync('docs/.vitepress/theme/style.css', 'utf8')
    expect(criticalCascadeViolations(style)).toEqual([])
    const legacyApprovedRulesRemain = (css: string) => {
      const fixtureRoot = postcss.parse(css)
      let meta = 0
      let printUrl = 0
      fixtureRoot.walkRules((rule) => {
        const actual = postcss.list.comma(rule.selector).map((value) => value.trim())
        if (actual.length === 1 && actual[0] === '.project-meta > ul > li' && rule.parent === fixtureRoot) meta += 1
        if (actual.length === 1 && actual[0] === '.project-source-print-url'
          && rule.parent?.type === 'atrule' && rule.parent.params.replace(/\s+/gu, '') === 'print') printUrl += 1
      })
      return meta === 1 && printUrl === 1
    }
    const ruleWithDeclarations = (
      selector: string,
      values: Array<[string, string, boolean?]>,
    ) => {
      const rule = postcss.rule({ selector })
      for (const [prop, value, important = false] of values) {
        rule.append(postcss.decl({ prop, value, important }))
      }
      return rule
    }

    const earlierPrint = root.clone()
    const earlierPrintMedia = postcss.atRule({ name: 'media', params: 'print' })
    earlierPrintMedia.append(ruleWithDeclarations(
      '.project-source-links .project-source-print-url',
      [['display', 'none', true]],
    ))
    earlierPrint.prepend(earlierPrintMedia)
    expect(legacyApprovedRulesRemain(earlierPrint.toString())).toBe(true)
    expect(criticalCascadeViolations(earlierPrint.toString()))
      .toContain('competing print !important: .project-source-links .project-source-print-url display')

    const laterSame = root.clone()
    const laterPrintMedia = postcss.atRule({ name: 'media', params: 'print' })
    laterPrintMedia.append(ruleWithDeclarations(
      '.project-source-print-url',
      [['display', 'none', true]],
    ))
    laterSame.append(laterPrintMedia)
    expect(criticalCascadeViolations(laterSame.toString()))
      .toContain('missing approved print URL rule')

    const nestedNotScreen = root.clone()
    const notScreenMedia = postcss.atRule({ name: 'media', params: 'not screen' })
    const nestedColorMedia = postcss.atRule({ name: 'media', params: '(color)' })
    nestedColorMedia.append(ruleWithDeclarations(
      '.project-source-links .project-source-print-url',
      [['white-space', 'nowrap', true]],
    ))
    notScreenMedia.append(nestedColorMedia)
    nestedNotScreen.prepend(notScreenMedia)
    expect(legacyApprovedRulesRemain(nestedNotScreen.toString())).toBe(true)
    expect(criticalCascadeViolations(nestedNotScreen.toString()))
      .toContain('competing print !important: .project-source-links .project-source-print-url white-space')

    const mobileOverlap = root.clone()
    const narrowMedia = postcss.atRule({ name: 'media', params: '(max-width: 390px)' })
    narrowMedia.append(ruleWithDeclarations(
      '.project-meta > ul > li.is-tight',
      [['grid-template-columns', 'max-content'], ['min-width', 'max-content']],
    ))
    mobileOverlap.append(narrowMedia)
    expect(legacyApprovedRulesRemain(mobileOverlap.toString())).toBe(true)
    expect(criticalCascadeViolations(mobileOverlap.toString())).toEqual(expect.arrayContaining([
      'later mobile override: .project-meta > ul > li.is-tight grid-template-columns',
      'later mobile override: .project-meta > ul > li.is-tight min-width',
    ]))

    const commentAndWrongMedia = root.clone()
    const commentRules: any[] = []
    commentAndWrongMedia.walkRules((rule) => {
      const actual = postcss.list.comma(rule.selector).map((value) => value.trim())
      if (actual.length === 1 && actual[0] === '.project-meta > ul > li'
        && rule.parent === commentAndWrongMedia) commentRules.push(rule)
    })
    const removedMeta = commentRules[0]
    const wrongMedia = postcss.atRule({ name: 'media', params: '(min-width: 701px)' })
    wrongMedia.append(removedMeta.clone())
    removedMeta.replaceWith(postcss.comment({ text: removedMeta.toString() }))
    commentAndWrongMedia.append(wrongMedia)
    expect(criticalCascadeViolations(commentAndWrongMedia.toString()))
      .toContain('missing approved mobile meta rule')

    const allowedProjectWrapping = new Set([
      '.project-meta code',
      '.project-call-chain code',
      '.project-source-links code',
      '.project-license-print-url',
      '.project-source-print-url',
    ])
    for (const rule of rules) {
      const actual = declarations(rule)
      if (actual['overflow-wrap']?.value === 'anywhere') {
        for (const selector of selectors(rule).filter((value) => value.startsWith('.project'))) {
          expect(allowedProjectWrapping.has(selector), `broad project wrap: ${selector}`).toBe(true)
        }
      }
      if (selectors(rule).includes('.project-license-print p')) {
        expect(actual['word-break']?.value).not.toBe('break-all')
      }
      if (selectors(rule).some((selector) => selector.includes('.project-source-links') && selector.includes('::after'))) {
        expect(actual.content?.value ?? '').not.toMatch(/attr\(href\)/u)
      }
      if (selectors(rule).some((selector) => selector.startsWith('.project'))) {
        for (const declaration of Object.values(actual) as Array<{ value: string }>) {
          expect(declaration.value).not.toMatch(/#[0-9a-f]{6}\b/iu)
        }
      }
    }
  })

  it('enforces the scoped Vue and TypeScript check during production builds', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
    const tsconfig = JSON.parse(readFileSync('tsconfig.projects.json', 'utf8'))
    expect(pkg.scripts['typecheck:projects']).toBe('vue-tsc --noEmit -p tsconfig.projects.json')
    expect(pkg.scripts.build).toContain('pnpm typecheck:projects')
    expect(pkg.devDependencies['vue-tsc']).toBe('^3.3.11')
    expect(pkg.devDependencies.typescript).toBe('^5.9.3')
    expect(pkg.devDependencies['@types/node']).toBe('^24.10.0')
    expect(tsconfig.compilerOptions.types).toEqual(['vitepress/client', 'node'])
  })
})

```

- [ ] **Step 2: Run the component tests and verify RED**

Run: `pnpm vitest run tests/project-pages.spec.ts -t 'project presentation primitives'`

Expected: FAIL because the loader, lookup module, and components do not exist.

- [ ] **Step 3: Add the VitePress data loader and fail-closed lookups**

Create `docs/.vitepress/theme/data/projectCatalogTypes.ts` with the following interfaces:

```ts
export interface LicenseScope {
  basis: 'path' | 'contribution'
  expression: string
  path_or_glob?: string
  selector?: string
  scope: string
  note: string
}

export interface ProjectSourceEntrypoint {
  path: string
  symbols: string[]
  responsibility: string
}

export interface ProjectSubject {
  id: string
  canonical_repo: string
  canonical_url: string
  pin_kind: 'release' | 'tag' | 'commit'
  pinned_ref: string
  pinned_commit: string
  verified_default_branch: string
  verified_default_head: string
  repository_status: 'active' | 'archived' | 'eol'
  archived: boolean
  catalog_tier: 'core' | 'historical' | 'watch-only'
  risk_tags?: string[]
  license_summary: string
  license_scopes: LicenseScope[]
  license_sources: Array<{ path: string; sha256: string }>
  watch_url: string
  entrypoints: ProjectSourceEntrypoint[]
  verified_at: string
  review_by: string
}

export interface ProjectPageRecord {
  page_item_id: string
  catalog_tier: 'core' | 'historical'
  subjects: string[]
  interview_question_ids: string[]
  counted_in_course: boolean
  primary_chain_id: string | null
}

export interface ProjectChainStep {
  id: string
  track?: string
  label: string
  subject_id: string
  source_path: string
  symbol: string
  responsibility: string
}

export interface ProjectChain {
  id: string
  page_item_id: string
  label: string
  reading_hint: string
  misconception: string
  steps: ProjectChainStep[]
}

export interface ProjectCatalog {
  schema_version: 1
  pages: ProjectPageRecord[]
  subjects: ProjectSubject[]
  chains: ProjectChain[]
}
```

Create `docs/.vitepress/theme/data/projectCatalog.data.ts`:

```ts
import { resolve } from 'node:path'
import { defineLoader } from 'vitepress'
import { loadProjectCatalog } from '../../../../scripts/project-catalog.mjs'
import type { ProjectCatalog } from './projectCatalogTypes'

declare const data: ProjectCatalog
export { data }

export default defineLoader({
  watch: ['../../../../sources/project-index.yml'],
  load() {
    return loadProjectCatalog(resolve(process.cwd(), 'sources/project-index.yml')) as ProjectCatalog
  },
})
```

Create `docs/.vitepress/theme/data/projectCatalogCore.ts`. It is a pure module: it receives an ordinary catalog and never imports `.data.ts`.

```ts
import type { ProjectCatalog } from './projectCatalogTypes'

export function createProjectCatalogLookup(data: ProjectCatalog) {
  const pageById = Object.fromEntries(data.pages.map((page) => [page.page_item_id, page]))
  const subjectById = Object.fromEntries(data.subjects.map((subject) => [subject.id, subject]))
  const chainById = Object.fromEntries(data.chains.map((chain) => [chain.id, chain]))

  function own<T>(record: Record<string, T>, id: string, label: string): T {
    if (!Object.hasOwn(record, id)) throw new Error(`Unknown ${label}: ${id}`)
    return record[id]
  }

  const getProjectPage = (id: string) => own(pageById, id, 'project page')
  const getProjectSubject = (id: string) => own(subjectById, id, 'project subject')
  const getProjectChain = (id: string) => own(chainById, id, 'project chain')

  function projectSourceUrl(subjectId: string, sourcePath: string): string {
    const subject = getProjectSubject(subjectId)
    const allowedPaths = new Set([
      ...subject.entrypoints.map((entry) => entry.path),
      ...subject.license_sources.map((license) => license.path),
    ])
    if (!allowedPaths.has(sourcePath)) {
      throw new Error(`Undeclared project source: ${subjectId}/${sourcePath}`)
    }
    return `${subject.canonical_url}/blob/${subject.pinned_commit}/${sourcePath}`
  }

  return { projectCatalog: data, getProjectPage, getProjectSubject, getProjectChain, projectSourceUrl }
}
```

Create the VitePress-only wrapper `docs/.vitepress/theme/data/projectCatalog.ts`:

```ts
import { data } from './projectCatalog.data'
import { createProjectCatalogLookup } from './projectCatalogCore'

export const {
  projectCatalog,
  getProjectPage,
  getProjectSubject,
  getProjectChain,
  projectSourceUrl,
} = createProjectCatalogLookup(data)
```

Create `docs/.vitepress/env.d.ts`:

```ts
/// <reference types="vite/client" />
```

Create `tsconfig.projects.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "skipLibCheck": true,
    "allowJs": true,
    "checkJs": false,
    "resolveJsonModule": true,
    "types": ["vitepress/client"]
  },
  "include": [
    "docs/.vitepress/env.d.ts",
    "docs/.vitepress/theme/data/projectCatalog*.ts",
    "docs/.vitepress/theme/components/Project*.vue",
    "scripts/project-catalog.d.mts"
  ]
}
```

Run `pnpm add -D vue-tsc@3.3.11 typescript@5.9.3 @types/node@24.10.0`. Add these scripts:

```json
"typecheck:projects": "vue-tsc --noEmit -p tsconfig.projects.json",
"build": "pnpm validate && pnpm typecheck:projects && vitepress build docs && node scripts/check-dist.mjs"
```

- [ ] **Step 4: Implement the four components**

Create `ProjectMeta.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { getProjectPage, getProjectSubject, projectSourceUrl } from '../data/projectCatalog'

const props = defineProps<{ projectId: string }>()
const page = computed(() => getProjectPage(props.projectId))
const subjects = computed(() => page.value.subjects.map(getProjectSubject))
const tierLabel = computed(() => page.value.catalog_tier === 'core' ? '核心拆解' : '历史反例')
const statusLabels: Record<string, string> = { active: '活跃', archived: '已归档', eol: '已停止维护' }
const statusLabel = (status: string) => statusLabels[status] ?? status
</script>

<template>
  <aside class="project-meta" aria-label="项目版本与许可边界">
    <p><strong>教学层级：</strong>{{ tierLabel }}</p>
    <ul role="list">
      <li v-for="subject in subjects" :key="subject.id" role="listitem">
        <a :href="subject.canonical_url">{{ subject.canonical_repo }}</a>
        <span><strong>固定版本：</strong>{{ subject.pinned_ref }} · <code>{{ subject.pinned_commit }}</code></span>
        <span><strong>仓库状态：</strong>{{ statusLabel(subject.repository_status) }}<template v-if="subject.archived"> · GitHub 已归档</template></span>
        <span><strong>核验：</strong>{{ subject.verified_at }}，下次 {{ subject.review_by }}</span>
        <a :href="subject.watch_url">检查上游更新</a>
        <details>
          <summary>许可证边界</summary>
          <p>{{ subject.license_summary }}</p>
          <ul role="list">
            <li
              v-for="scope in subject.license_scopes"
              :key="`${scope.expression}-${scope.path_or_glob ?? scope.selector}`"
              role="listitem"
            >
              <code>{{ scope.basis }}</code> · <code>{{ scope.expression }}</code> ·
              <code>{{ scope.path_or_glob ?? scope.selector }}</code> · {{ scope.scope }} — {{ scope.note }}
            </li>
          </ul>
          <p>
            许可证原文：
            <a
              v-for="source in subject.license_sources"
              :key="source.path"
              :href="projectSourceUrl(subject.id, source.path)"
            ><code>{{ source.path }}</code></a>
          </p>
        </details>
        <div class="project-license-print" aria-hidden="true">
          <p><strong>许可证摘要：</strong>{{ subject.license_summary }}</p>
          <ul>
            <li
              v-for="scope in subject.license_scopes"
              :key="`print-${scope.expression}-${scope.path_or_glob ?? scope.selector}`"
            >
              {{ scope.basis }} · {{ scope.expression }} · {{ scope.path_or_glob ?? scope.selector }} · {{ scope.scope }} — {{ scope.note }}
            </li>
          </ul>
          <p
            v-for="source in subject.license_sources"
            :key="`print-license-${source.path}`"
            class="project-license-print-url"
          >
            许可证原文：{{ projectSourceUrl(subject.id, source.path) }}
          </p>
        </div>
      </li>
    </ul>
  </aside>
</template>
```

Create `ProjectCallChain.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { getProjectChain, getProjectPage } from '../data/projectCatalog'
import type { ProjectChainStep } from '../data/projectCatalogTypes'

const props = defineProps<{ projectId: string }>()
const page = computed(() => getProjectPage(props.projectId))
const chain = computed(() => getProjectChain(page.value.primary_chain_id!))
const tracks = computed(() => {
  const grouped = new Map<string, ProjectChainStep[]>()
  for (const step of chain.value.steps) {
    const key = step.track ?? 'main'
    grouped.set(key, [...(grouped.get(key) ?? []), step])
  }
  return [...grouped].map(([id, steps]) => ({ id, label: id === 'main' ? '主链' : id, steps }))
})
const architectureLabel = computed(() => tracks.value
  .map((track) => `${track.label}：${track.steps.map((step) => step.label).join('，然后')}`)
  .join('；'))
</script>

<template>
  <section class="project-chain-section" :aria-labelledby="`${projectId}-chain-title`">
    <h3 :id="`${projectId}-chain-title`">{{ chain.label }}</h3>
    <figure
      class="project-architecture"
      role="img"
      :aria-label="`本书原创架构关系图：${chain.label}。${architectureLabel}。`"
    >
      <figcaption>本书归纳 · 原创建筑关系图</figcaption>
      <div class="project-architecture-tracks" aria-hidden="true">
        <div v-for="track in tracks" :key="`visual-${track.id}`" class="project-architecture-track">
          <strong v-if="track.id !== 'main'">{{ track.label }}</strong>
          <div class="project-architecture-nodes">
            <span v-for="step in track.steps" :key="`visual-${step.id}`">{{ step.label }}</span>
          </div>
        </div>
      </div>
    </figure>
    <p class="project-chain-reading"><strong>怎么看：</strong>{{ chain.reading_hint }}</p>
    <section v-for="track in tracks" :key="`text-${track.id}`" class="project-chain-track-group">
      <h4 v-if="track.id !== 'main'">{{ track.label }}</h4>
      <ol class="project-call-chain" role="list" :aria-label="`${track.label}源码调用链文本版`">
        <li v-for="step in track.steps" :key="step.id" role="listitem">
          <strong>{{ step.label }}</strong>
          <span><b>源码事实：</b><code>{{ step.source_path }} · {{ step.symbol }}</code></span>
          <span><b>本书归纳：</b>{{ step.responsibility }}</span>
        </li>
      </ol>
    </section>
    <p class="project-chain-warning"><strong>不要误解：</strong>{{ chain.misconception }}</p>
  </section>
</template>
```

Create `ProjectSourceLinks.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { getProjectPage, getProjectSubject, projectSourceUrl } from '../data/projectCatalog'

const props = defineProps<{ projectId: string }>()
const rows = computed(() => getProjectPage(props.projectId).subjects.flatMap((subjectId) => {
  const subject = getProjectSubject(subjectId)
  return subject.entrypoints.map((entry) => ({
    subjectId,
    repo: subject.canonical_repo,
    path: entry.path,
    symbols: entry.symbols,
    responsibility: entry.responsibility,
    href: projectSourceUrl(subjectId, entry.path),
  }))
}))
</script>

<template>
  <ol class="project-source-links" role="list">
    <li v-for="row in rows" :key="`${row.subjectId}:${row.path}`" role="listitem">
      <a :href="row.href"><code>{{ row.path }}</code></a>
      <strong>{{ row.symbols.join(' · ') }}</strong>
      <span>{{ row.responsibility }}</span>
      <small>{{ row.repo }} · 固定 commit</small>
      <span class="project-source-print-url" aria-hidden="true">{{ row.href }}</span>
    </li>
  </ol>
</template>
```

Create `ProjectOverview.vue`; its setup remains lazy so Task 3 builds before Task 8 adds the project IDs:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { getContentItem } from '../data/contentRegistry'
import { courseItemById } from '../data/courseMap'
import { getProjectSubject, projectCatalog } from '../data/projectCatalog'

const corePages = computed(() => projectCatalog.pages.filter((page) =>
  page.catalog_tier === 'core' && page.page_item_id !== 'projects-index',
))
const historicalPages = computed(() => projectCatalog.pages.filter((page) => page.catalog_tier === 'historical'))
const watchSubjects = computed(() => projectCatalog.subjects.filter((subject) => subject.catalog_tier === 'watch-only'))
const courseItemFor = (itemId: string) => Object.hasOwn(courseItemById, itemId) ? courseItemById[itemId] : null
const prerequisiteText = (itemId: string) => courseItemFor(itemId)?.prerequisites
  .map((id) => getContentItem(id).title).join('、') ?? ''
const subjectStatus = (subjectId: string) => {
  const subject = getProjectSubject(subjectId)
  return `${subject.pinned_ref} · ${subject.repository_status}`
}
const safetyLinks = [
  getContentItem('frontier-agent-security-evaluation'),
  getContentItem('chapter-09-safety-recovery'),
  getContentItem('radar'),
]
</script>

<template>
  <nav class="project-overview" aria-label="开源项目拆解目录">
    <section aria-labelledby="project-core-title">
      <h2 id="project-core-title">核心源码拆解</h2>
      <ol role="list">
        <li v-for="page in corePages" :key="page.page_item_id" role="listitem">
          <a :href="withBase(getContentItem(page.page_item_id).route)">{{ getContentItem(page.page_item_id).title }}</a>
          <span>{{ page.subjects.map(subjectStatus).join('；') }}</span>
          <p v-if="courseItemFor(page.page_item_id)">{{ courseItemFor(page.page_item_id)?.outcome }}</p>
          <small v-if="prerequisiteText(page.page_item_id)">先修：{{ prerequisiteText(page.page_item_id) }}</small>
        </li>
      </ol>
    </section>
    <section aria-labelledby="project-history-title">
      <h2 id="project-history-title">历史反例</h2>
      <ul role="list"><li v-for="page in historicalPages" :key="page.page_item_id" role="listitem"><a :href="withBase(getContentItem(page.page_item_id).route)">{{ getContentItem(page.page_item_id).title }}</a></li></ul>
    </section>
    <section aria-labelledby="project-watch-title">
      <h2 id="project-watch-title">前沿高权限观察区</h2>
      <p>这些项目不是初学者默认安装步骤，也不计入课程完成度。</p>
      <ul role="list">
        <li v-for="subject in watchSubjects" :key="subject.id" role="listitem">
          <a :href="subject.canonical_url">{{ subject.canonical_repo }}</a> · {{ subject.pinned_ref }} · watch-only
          <span v-for="tag in subject.risk_tags" :key="tag" class="project-risk-tag">{{ tag }}</span>
        </li>
      </ul>
      <p class="project-safety-links">
        安全延伸：<a v-for="item in safetyLinks" :key="item.id" :href="withBase(item.route)">{{ item.title }}</a>
      </p>
    </section>
  </nav>
</template>
```

- [ ] **Step 5: Register components and add the exact style block**

Import and register the four components in `docs/.vitepress/theme/index.ts`. Append this scoped block to `style.css`:

```css
.project-meta,
.project-chain-section,
.project-overview section {
  margin: 1.5rem 0;
  border: 1px solid var(--reading-rule);
  border-radius: 12px;
  background: var(--reading-bg);
}

.project-meta,
.project-chain-section,
.project-overview section {
  padding: 1rem 1.1rem;
}

.project-meta > ul,
.project-overview ol,
.project-overview ul,
.project-call-chain,
.project-source-links {
  margin: 0;
  padding: 0;
  list-style: none;
}

.project-meta > ul > li,
.project-source-links > li {
  display: grid;
  gap: 0.35rem;
  padding: 0.85rem 0;
  border-top: 1px solid var(--reading-rule);
}

.project-meta > ul > li {
  grid-template-columns: minmax(0, 1fr) !important;
  min-width: 0 !important;
}

.project-meta > ul > li > * {
  min-width: 0 !important;
}

.project-source-links > li {
  grid-template-columns: minmax(0, 1fr);
}

.project-architecture {
  margin: 1rem 0;
}

.project-architecture figcaption {
  color: var(--reading-text);
  font-weight: 750;
  font-size: 1.05rem;
}

.project-architecture-tracks {
  display: grid;
  gap: 1rem;
}

.project-architecture-nodes,
.project-call-chain {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
}

.project-architecture-nodes span {
  position: relative;
  padding: 0.7rem;
  border: 1px solid var(--reading-rule);
  border-radius: 8px;
  background: var(--reading-bg-soft);
  text-align: center;
}

.project-architecture-nodes span:not(:last-child)::after {
  position: absolute;
  inset-inline-end: -0.65rem;
  content: '→';
  color: var(--reading-link);
}

.project-call-chain li {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.4rem;
  min-width: 0;
  padding: 0.85rem;
  border-left: 3px solid var(--reading-link);
  background: var(--reading-bg-soft);
}

.project-meta code,
.project-call-chain code,
.project-source-links code {
  overflow-wrap: anywhere;
  white-space: normal;
}

.project-chain-track-group h4,
.project-meta small,
.project-source-links small {
  color: var(--reading-text-soft);
  font-size: 0.8rem;
}

.project-chain-warning {
  padding-left: 0.8rem;
  border-left: 3px solid var(--reading-risk);
}

.project-risk-tag {
  display: inline-block;
  margin: 0.25rem 0.25rem 0 0;
  padding: 0.15rem 0.45rem;
  border: 1px solid var(--reading-risk);
  border-radius: 999px;
  color: var(--reading-risk);
}

.project-safety-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.project-license-print {
  display: none;
}

.project-license-print-url {
  overflow-wrap: anywhere;
}

.project-source-print-url {
  display: none;
}

.project-meta summary {
  min-height: 44px;
  touch-action: manipulation;
}

.project-overview a,
.project-source-links a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  touch-action: manipulation;
}

.project-meta :focus-visible,
.project-overview :focus-visible,
.project-source-links :focus-visible {
  outline: 3px solid var(--reading-link);
  outline-offset: 3px;
}

@media (max-width: 700px) {
  .project-architecture-nodes,
  .project-call-chain {
    grid-template-columns: 1fr;
  }

  .project-architecture-nodes span:not(:last-child)::after {
    inset-inline-end: auto;
    inset-block-end: -0.8rem;
    inset-inline-start: 50%;
    content: '↓';
  }

  .project-meta,
  .project-chain-section,
  .project-overview section {
    padding: 0.9rem;
  }
}

@media print {
  .course-stage-more,
  .course-stage-more > summary,
  .course-progress progress,
  .course-stage progress {
    display: none;
  }

  .vp-doc ol.course-print-items {
    display: grid;
    grid-column: 2;
    gap: 0.75rem;
    list-style: none;
  }

  .course-print-items li {
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--reading-rule);
  }

  .course-print-items span {
    font-weight: 800;
  }

  .course-stage,
  .course-item {
    break-inside: avoid;
  }

  .project-meta details {
    display: none !important;
  }

  .project-meta > ul,
  .project-source-links,
  .project-call-chain {
    display: block;
  }

  .project-meta > ul > li,
  .project-source-links > li,
  .project-call-chain li {
    display: block;
    break-inside: avoid;
  }

  .project-meta > ul > li > *,
  .project-source-links > li > *,
  .project-call-chain li > * {
    display: block;
  }

  .project-license-print {
    display: block !important;
  }

  .project-architecture {
    display: none !important;
  }

  .project-call-chain {
    grid-template-columns: 1fr;
  }

  .project-source-print-url {
    display: block !important;
    max-width: 100% !important;
    overflow-wrap: anywhere !important;
    white-space: normal !important;
  }
}
```

Use only the existing `--reading-bg`, `--reading-bg-soft`, `--reading-text`, `--reading-text-soft`, `--reading-link`, `--reading-risk`, and `--reading-rule` variables; do not insert literal colors inside project selectors.

- [ ] **Step 6: Run component tests and build**

Run:

```bash
pnpm vitest run tests/project-pages.spec.ts -t 'project presentation primitives'
pnpm typecheck:projects
pnpm test && pnpm validate && pnpm build
```

Expected: all tests and the production build pass; no public project route exists yet.

- [ ] **Step 7: Commit the presentation primitives**

```bash
git add docs/.vitepress/theme/data/projectCatalog.data.ts docs/.vitepress/theme/data/projectCatalogTypes.ts docs/.vitepress/theme/data/projectCatalogCore.ts docs/.vitepress/theme/data/projectCatalog.ts docs/.vitepress/theme/components/ProjectOverview.vue docs/.vitepress/theme/components/ProjectMeta.vue docs/.vitepress/theme/components/ProjectCallChain.vue docs/.vitepress/theme/components/ProjectSourceLinks.vue docs/.vitepress/theme/index.ts docs/.vitepress/theme/style.css docs/.vitepress/env.d.ts tsconfig.projects.json package.json pnpm-lock.yaml tests/project-pages.spec.ts
git commit -m "feat: add project dissection primitives"
```

### Task 4: Introduce a progressive project-output allowlist before any page exists

**Files:**

- Modify: `scripts/check-dist.mjs`
- Modify: `tests/content.spec.ts`

- [ ] **Step 1: Write failing transition-boundary tests**

Add tests against a pure exported helper so a normal incomplete project subset can be tested without fabricating the rest of dist:

```ts
import { validatePublishedRouteBoundary } from '../scripts/check-dist.mjs'

describe('progressive project publication boundary', () => {
  it('allows any subset of the eight approved project outputs during implementation', () => {
    expect(validatePublishedRouteBoundary([
      'index.html',
      'projects/mcp-python-sdk.html',
      'projects/aider.html',
    ])).toEqual([])
  })

  it('still rejects unapproved projects and every lab or capstone output', () => {
    expect(validatePublishedRouteBoundary([
      'projects/unreviewed.html',
      'projects/private/notes.html',
      'projects.html',
      'labs/index.html',
      'capstone/index.html',
    ])).toEqual(expect.arrayContaining([
      expect.stringContaining('projects/unreviewed.html'),
      expect.stringContaining('projects/private/notes.html'),
      expect.stringContaining('projects.html'),
      expect.stringContaining('labs/index.html'),
      expect.stringContaining('capstone/index.html'),
    ]))
  })
})
```

- [ ] **Step 2: Run the transition test and verify RED**

Run: `pnpm vitest run tests/content.spec.ts -t 'progressive project publication boundary'`

Expected: FAIL because `validatePublishedRouteBoundary` is not exported and the current gate rejects every project file.

- [ ] **Step 3: Add the approved output set and pure boundary helper**

At the top of `scripts/check-dist.mjs`, add:

```js
export const approvedProjectFiles = new Set([
  'projects/index.html',
  'projects/mcp-python-sdk.html',
  'projects/aider.html',
  'projects/openhands.html',
  'projects/agent-benchmarks.html',
  'projects/dify.html',
  'projects/crewai.html',
  'projects/history-autogpt-flowise.html',
])

export function validatePublishedRouteBoundary(relativeFiles) {
  const forbidden = relativeFiles.filter((file) =>
    /^(?:labs|capstone)(?:\.html|[\\/])/u.test(file)
    || (/^projects(?:\.html|[\\/])/u.test(file) && !approvedProjectFiles.has(file)),
  )
  return forbidden.length === 0
    ? []
    : [`构建产物包含未批准项目、实验或综合实战页面：${forbidden.join(', ')}`]
}
```

Replace the old blanket `unpublished` block inside `validateDist` with:

```js
errors.push(...validatePublishedRouteBoundary(relativeFiles))
```

In the existing `requires every published course target and rejects unpublished route artifacts` test, keep `projects/index.html` in the fixture as an approved subset example, remove the assertion that it is rejected, and retain rejection assertions for `projects/example.html`, `projects.html`, `labs/index.html`, `labs/example.html`, and `labs.html`. Add `capstone/index.html` and `capstone.html` to the fixture and rejection assertions.

Do not require any project file yet. Keep `publishedCourseRoutes`, the 20-link course check, and `/projects/` inside `forbiddenCourseMarkers` unchanged until Task 9; Task 12 is the only task that makes all eight approved project outputs mandatory.

- [ ] **Step 4: Run focused and full gates**

Run:

```bash
pnpm vitest run tests/content.spec.ts -t 'progressive project publication boundary'
pnpm test && pnpm validate && pnpm build
```

Expected: approved subsets pass, unapproved project/Lab/capstone files fail, and the current site with zero project outputs still builds.

- [ ] **Step 5: Commit the transition gate**

```bash
git add scripts/check-dist.mjs tests/content.spec.ts
git commit -m "test: allow only approved project outputs"
```

### Task 5: Write the MCP and Aider core dissections

**Files:**

- Create: `docs/projects/mcp-python-sdk.md`
- Create: `docs/projects/aider.md`
- Modify: `tests/project-pages.spec.ts`

- [ ] **Step 1: Write failing page-contract tests**

Add a shared heading contract and assertions for the first two pages:

```ts
const requiredProjectHeadings = [
  '30 秒结论', '为什么选', '版本与边界', '原创架构图', '唯一纵向调用链',
  '关键源码入口', '一次请求的数据流', '阅读练习', '失败边界', '生产边界',
  '高频面试点', '升级复核', '来源与归因',
]

function expectCoreProjectPage(path: string, projectId: string) {
  const text = readFileSync(path, 'utf8')
  const h2s = Array.from(text.matchAll(/^## (.+)$/gmu), (match) => match[1])
  expect(text).toContain(`<ProjectMeta project-id="${projectId}" />`)
  expect(text).toContain(`<ProjectCallChain project-id="${projectId}" />`)
  expect(text).toContain(`<ProjectSourceLinks project-id="${projectId}" />`)
  expect(h2s, path).toEqual(requiredProjectHeadings)
  expect(text).not.toMatch(/npm install|pip install|docker run|OPENAI_API_KEY|ANTHROPIC_API_KEY/u)
  expect(text).not.toMatch(/!\[[^\]]*\]\(https?:\/\//u)
}

describe('MCP and Aider dissections', () => {
  it('publishes both complete reading-only pages', () => {
    expectCoreProjectPage('docs/projects/mcp-python-sdk.md', 'project-mcp-python-sdk')
    expectCoreProjectPage('docs/projects/aider.md', 'project-aider')
  })

  it('keeps protocol, implementation, patch, and completion claims separate', () => {
    const mcp = readFileSync('docs/projects/mcp-python-sdk.md', 'utf8')
    expect(mcp).toContain('规范仓库定义协议，Python SDK 实现协议')
    expect(mcp).toContain('业务授权')
    expect(mcp).toContain('basic_tool.py 只注册工具')
    expect(mcp).toContain('宿主调用 `mcp.run`')
    expect(mcp).toContain('Runner 负责')
    expect(mcp).toContain('ServerSession 只是 request-scoped outbound proxy')
    expect(mcp).toContain('ToolManager 只负责查找')
    expect(mcp).toContain('Tool.run 才负责输入验证、调用函数和结果转换')
    expect(mcp).toContain('JSONRPCDispatcher._dispatch_request 调用 `ServerRunner._on_request`')
    expect(mcp).toContain('ServerRunner._serialize 只负责规范化 result dict')
    expect(mcp).toContain('JSONRPCDispatcher._write_result 构造并写回 `JSONRPCResponse`')
    expect(mcp).toContain('connection、dispatcher 和 request-context')
    const aider = readFileSync('docs/projects/aider.md', 'utf8')
    expect(aider).toContain('RepoMap 不是“读完全部仓库”')
    expect(aider).toContain('生成补丁不等于任务完成')
    expect(aider).toContain('lint 默认开启，而且只检查已编辑文件')
    expect(aider).toContain('test 默认关闭')
    expect(aider).toContain('shell 命令必须显式回答 yes')
    expect(aider).toContain('yes-always 也不会放行 shell')
    expect(aider).toContain('InputOutput.confirm_ask')
    expect(aider).toContain('explicit_yes_required=True')
    expect(aider).toContain('Coder.handle_shell_commands')
    expect(aider).toContain('lint 修复后可能产生第二次提交')
    expect(aider).toContain('shell 或 test 之后没有第三次自动提交')
    expect(aider).toContain('commit message 会调用 weak/main model')
    expect(aider).toContain('parser 只产出 tuples')
    expect(aider).toContain('写盘发生在 `apply_edits` 和 `InputOutput.write_text`')
    expect(aider).toContain('lint/test failure 只有在用户确认 Attempt to fix 后才设置 reflected_message')
    expect(aider).toContain('shell output 只有再次确认后才加入 cur_messages')
    expect(aider).toContain('不自动触发当前 run_one 的 reflection')
  })

  it('keeps the approved MCP and Aider file-level source inventories visible', () => {
    const entrypointCount = (pageId: string) => getProjectPage(pageId).subjects.reduce(
      (total, subjectId) => total + getProjectSubject(subjectId).entrypoints.length,
      0,
    )
    expect(entrypointCount('project-mcp-python-sdk')).toBe(9)
    expect(entrypointCount('project-aider')).toBe(8)
    expect(getProjectSubject('mcp-python-sdk').entrypoints.map((entry) => entry.path))
      .toContain('src/mcp/shared/jsonrpc_dispatcher.py')
  })
})
```

- [ ] **Step 2: Run the page tests and verify RED**

Run: `pnpm vitest run tests/project-pages.spec.ts -t 'MCP and Aider'`

Expected: FAIL because both Markdown files are absent.

- [ ] **Step 3: Create the MCP page with exact teaching content**

Create `docs/projects/mcp-python-sdk.md`:

```md
---
title: MCP 规范与 Python SDK：一次工具调用到底经过什么
description: 从 2026-07-28 规范到官方 Python SDK，拆开协议、传输、工具实现与业务授权。
---

# MCP 规范与 Python SDK：一次工具调用到底经过什么

## 30 秒结论

MCP 统一的是 Host、Client、Server 之间如何描述能力和交换消息。规范仓库定义协议，Python SDK 实现协议；业务授权、最小权限、工具副作用和结果真实性仍由应用负责。

## 为什么选

它把第 4 章的“工具契约”落到真实 schema、dispatcher、runner、transport 和工具对象。读完应能指出协议层、SDK 层与业务层分别负责什么，而不是把 MCP 叫作万能插件市场。

## 版本与边界

<ProjectMeta project-id="project-mcp-python-sdk" />

本页只解释固定版本中的 `tools/call` 主链。Resources、Prompts、OAuth 扩展和 draft 能力只标出边界，不展开成第二条主线。

## 原创建筑图

<ProjectCallChain project-id="project-mcp-python-sdk" />

图中每一层都可以替换实现，但消息结构、请求分发和业务授权不能互相冒充。示例里的 basic_tool.py 只注册工具，真正启动服务由宿主调用 `mcp.run`。

## 唯一纵向调用链

从 `CallToolRequest` 开始，沿宿主的 `MCPServer.run("stdio")`、`stdio_server`、`Server.run` 和 `serve_dual_era_loop` 进入 `JSONRPCDispatcher.run`。JSONRPCDispatcher._dispatch_request 调用 `ServerRunner._on_request`，后者再经 `get_request_handler`、`MCPServer._handle_call_tool`、`MCPServer.call_tool`、`ToolManager.call_tool`、`Tool.run` 到示例 `sum`。返回时 ServerRunner._serialize 只负责规范化 result dict，JSONRPCDispatcher._write_result 构造并写回 `JSONRPCResponse`，最终由 stdio transport 的 `stdout_writer` 输出。

## 关键源码入口

<ProjectSourceLinks project-id="project-mcp-python-sdk" />

源码链接全部固定到 commit；不要把 `main` 上的新扩展反推到本页版本。

## 一次请求的数据流

客户端发送带工具名和参数的 `tools/call`。Runner 负责连接事实、handler 执行与 result dict 规范化；独立的 JSONRPCDispatcher 读取消息、调用 `ServerRunner._on_request`，并在返回路径构造和写入 `JSONRPCResponse`。stdio 层只提供 reader 与最终的 `stdout_writer`。ServerSession 只是 request-scoped outbound proxy 旁路，不是入站请求的主 dispatcher。高层 handler 把请求交给工具路径后，ToolManager 只负责查找，Tool.run 才负责输入验证、调用函数和结果转换。业务系统仍必须重新校验调用主体、资源范围与副作用。

## 阅读练习

1. 在 schema 中找到 `CallToolRequest` 与结果类型。
2. 从宿主启动 `MCPServer.run("stdio")` 追到 dispatcher 的 `_write_result`。
3. 对比 ToolManager 的查找职责与 Tool.run 的验证、调用和结果转换。

## 失败边界

如果工具名存在但调用者无权操作目标资源，协议解析成功也必须拒绝业务动作。不要用“请求符合 MCP schema”替代身份、授权、幂等和真实回执。

## 生产边界

SDK 不自动提供租户隔离、凭证托管、数据可信度、工具审批或结果正确性。高风险工具仍需白名单、预算、审计、超时后的状态查询和人工接管。

## 高频面试点

- [IQ-04-A：工具契约至少包含什么](/chapters/04-tools-mcp#iq-04-a)
- [IQ-04-B：MCP 解决与不解决什么](/chapters/04-tools-mcp#iq-04-b)
- [IQ-04-C：怎样避免消息工具误发全员](/chapters/04-tools-mcp#iq-04-c)

## 升级复核

新版本出现时依次比较 schema、版本协商、tool result、connection、dispatcher 和 request-context；最后检查 Python SDK 对该规范版本的支持矩阵。只在差异影响本页主链时修订正文。

## 来源与归因

架构图为本书原创重绘，事实依据是上方固定的 MCP 规范和官方 Python SDK 源码。许可证按贡献历史与文件路径分别处理；公开可读不代表可无条件复制原图或大段代码。
```

- [ ] **Step 4: Create the Aider page with exact teaching content**

Create `docs/projects/aider.md`:

```md
---
title: Aider：从仓库上下文到可审查补丁
description: 沿一条真实调用链理解 repo map、模型请求、edit format、文件修改与 Git 证据。
---

# Aider：从仓库上下文到可审查补丁

## 30 秒结论

Aider 的价值不只是“在终端里聊天”，而是把仓库识别、上下文选择、编辑格式、文件变更与 Git 证据连成受约束的 Coding Agent 循环。生成补丁不等于任务完成；测试、构建和业务验收仍是独立证据。

## 为什么选

它的主链比大型平台短，适合第一次读 Coding Agent 源码。RepoMap、Coder、edit format 和 GitRepo 分工清楚，可以直接对应第 13 章的现场核对、TDD 与最终差异审查。

## 版本与边界

<ProjectMeta project-id="project-aider" />

本页固定在 v0.86.0，只追踪一个 edit-block 路径。所选条件是 Git 仓库内启用默认 auto-commit 与 auto-lint，同时保持 auto-test 关闭；其他模型适配、语音、网页 UI 和排行榜不进入主链。

## 原创建筑图

<ProjectCallChain project-id="project-aider" />

RepoMap 不是“读完全部仓库”，而是被预算约束的结构摘要。parser 只产出 tuples，写盘发生在 `apply_edits` 和 `InputOutput.write_text`。

## 唯一纵向调用链

从 `main` 进入 `Coder.run` / `Coder.run_one`，由 `Coder.send_message` 组装聊天文件和 RepoMap 上下文，再经 `Coder.send`、`Model.send_completion`、edit tuple 解析、dry run、脏文件预提交、写盘、自动提交和 lint。之后分别观察需确认的 shell、可选 auto-test 与错误 reflection 分支。

## 关键源码入口

<ProjectSourceLinks project-id="project-aider" />

## 一次请求的数据流

用户请求先与明确加入的文件和 RepoMap 组合，`Coder.send` 再通过 `Model.send_completion` 请求模型。`EditBlockCoder.get_edits` 这个 parser 只产出 tuples；`apply_edits_dry_run` 先验证，`prepare_to_edit` 为脏文件做预提交，写盘发生在 `apply_edits` 和 `InputOutput.write_text`。编辑后可先自动提交；commit message 会调用 weak/main model。lint 默认开启，而且只检查已编辑文件，lint 修复后可能产生第二次提交。test 默认关闭；shell 命令必须显式回答 yes：调用 `InputOutput.confirm_ask` 时设置 `explicit_yes_required=True`，所以 yes-always 也不会放行 shell；确认后才由 `Coder.handle_shell_commands` 执行。shell 或 test 之后没有第三次自动提交。lint/test failure 只有在用户确认 Attempt to fix 后才设置 reflected_message；shell output 只有再次确认后才加入 cur_messages，不自动触发当前 run_one 的 reflection。

## 阅读练习

1. 找出仓库根目录与脏文件在进入 Coder 前如何处理。
2. 比较 RepoMap 与聊天文件的来源和预算。
3. 从 `get_edits` 追到 `write_text`，再按 track 标出首次提交、lint 后第二次提交、shell、test 与条件 reflection。

## 失败边界

当模型输出不能解析为 edit block，正确结果是保留原文件并反馈格式错误；不能用模糊字符串替换“尽量改一下”。dry run 或脏文件保护失败也必须在写盘前停止。lint 或 test 错误只有在用户确认 Attempt to fix 后进入 reflection；shell 输出则需要再次确认才进入对话历史。当 lint、shell 或测试命令失败，提交存在也不能被报告为任务成功。

## 生产边界

Aider 不替团队决定需求是否正确，也不自动解决权限、秘密、依赖供应链或跨服务业务验证。真实仓库必须保护用户未提交改动，并限制命令和可编辑路径。

## 高频面试点

- [IQ-13-A：改代码前核对什么](/chapters/13-coding-agent#iq-13-a)
- [IQ-13-B：为什么先看测试失败](/chapters/13-coding-agent#iq-13-b)
- [IQ-13-C：怎样验收 Coding Agent](/chapters/13-coding-agent#iq-13-c)

## 升级复核

重点比较 CLI 入口、`run_one` 与 `send_message` 生命周期、RepoMap 选择、edit tuple parser、脏文件预提交、自动 lint/test 默认值、shell 确认和 Git 提交时序。模型列表或榜单变化只进入更新记录，不自动改写稳定工程结论。

## 来源与归因

调用链图为本书原创重绘，依据固定 commit 的 Aider 源码。页面不复用项目 Logo、网站截图或排行榜图；短源码概念按 Apache-2.0 边界归因。
```

- [ ] **Step 5: Run focused and full gates**

Run:

```bash
pnpm vitest run tests/project-pages.spec.ts -t 'MCP and Aider'
pnpm test && pnpm validate && pnpm build
```

Expected: both pages pass the 13-section contract; build succeeds without adding navigation or course items yet.

- [ ] **Step 6: Commit the first two dissections**

```bash
git add docs/projects/mcp-python-sdk.md docs/projects/aider.md tests/project-pages.spec.ts
git commit -m "docs: dissect MCP and Aider"
```

### Task 6: Write the OpenHands and benchmark core dissections

**Files:**

- Create: `docs/projects/openhands.md`
- Create: `docs/projects/agent-benchmarks.md`
- Modify: `tests/project-pages.spec.ts`

- [ ] **Step 1: Write failing current-architecture and benchmark-boundary tests**

```ts
describe('OpenHands and benchmark dissections', () => {
  it('publishes both complete reading-only pages', () => {
    expectCoreProjectPage('docs/projects/openhands.md', 'project-openhands')
    expectCoreProjectPage('docs/projects/agent-benchmarks.md', 'project-agent-benchmarks')
  })

  it('uses the current OpenHands multi-repository boundary', () => {
    const text = readFileSync('docs/projects/openhands.md', 'utf8')
    expect(text).toContain('Agent Canvas')
    expect(text).toContain('software-agent-sdk')
    expect(text).toContain('不是旧版单体 Python Agent 仓库')
    expect(text).toContain('已有会话的 message/action/event 链')
    expect(text).toContain('Canvas Message')
    expect(text).toContain('SDK `MessageEvent`')
    expect(text).toContain('Agent Server 直接调用 `LocalConversation`')
    expect(text).toContain('Workspace 是工具构造与执行所消费的环境边界和配置来源')
    expect(text).not.toContain('Workspace 只是工具的 owner')
    expect(text).toContain('streaming delta 不属于持久事件回流链')
    expect(text).toContain('不追踪 conversation 创建链')
    expect(text).toContain('持久化 append 先发生')
    expect(text).toContain('`LocalConversation.__init__`')
    expect(text).toContain('`AsyncCallbackWrapper.__call__`')
    expect(text).toContain('`EventService.start`')
    expect(text).toContain('`AsyncCallbackWrapper(self._pub_sub, ...)`')
    expect(text).toContain('`EventService.subscribe_to_events`')
    expect(text).toContain('`_WebSocketSubscriber.__call__`')
    expect(text).toContain('subscriber 调用 `_send_event`')
    expect(text).toContain('三条 track 不是一条跨异步边界的同步调用栈')
    expect(text).not.toMatch(/conversation router|conversation service|adapter/iu)
  })

  it('does not present local fixtures or cross-benchmark scores as official results', () => {
    const text = readFileSync('docs/projects/agent-benchmarks.md', 'utf8')
    expect(text).toContain('不能直接横比')
    expect(text).toContain('不是官方 benchmark 成绩')
    expect(text).toContain('两条受控轨道并列')
    expect(text).toContain('不是先运行 SWE-bench 再运行 τ²-bench')
    expect(text).toContain('`tau2.run.run_task` 与 `tau2.run.run_tasks`')
    expect(text).toContain('旧 flat 参数 API 已 deprecated')
    expect(text).toContain('不是说整个 `tau2.run` module 都 deprecated')
    expect(text).toContain('`main` 注册局部 `run_command`')
    expect(text).toContain('把 `tau2 run` 分派到 `run_domain`')
    expect(text).not.toContain('CLI 的 `run`')
    expect(text).toContain('默认 `EvaluationType.ALL`')
    expect(text).toContain('`EvaluationType.ALL_WITH_NL_ASSERTIONS`')
    expect(text).toContain('只强制 NL assertions')
    expect(text).toContain('按 `task.evaluation_criteria.reward_basis` 选择分量后相乘')
    expect(text).toContain('ACTION 只有被选中时才是硬门禁')
    expect(text).toContain('单项类型与 `*_IGNORE_BASIS` 各走自己的分支')
    expect(text).toContain('early termination 返回 `0.0`')
    expect(text).toContain('没有 criteria 时返回 `1.0`')
    expect(text).not.toMatch(/本书.*SWE-bench.*(?:得分|准确率|通过率)\s*\d/iu)
  })
})
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `pnpm vitest run tests/project-pages.spec.ts -t 'OpenHands and benchmark'`

Expected: FAIL because both pages are absent.

- [ ] **Step 3: Create the OpenHands page**

Create `docs/projects/openhands.md`:

```md
---
title: OpenHands：从 Agent Canvas 到受控工作区
description: 按当前多仓库架构追踪 Canvas、Agent Server、SDK agent、工具、工作区与事件回流。
---

# OpenHands：从 Agent Canvas 到受控工作区

## 30 秒结论

当前 OpenHands 不是旧版单体 Python Agent 仓库。`OpenHands/OpenHands` 主要承载 Agent Canvas 与本地编排，`OpenHands/software-agent-sdk` 承载 Agent Server、conversation、agent、tool 和 workspace；两者通过公开客户端与事件契约连接。

## 为什么选

它能把大型 Coding Agent 的产品界面、服务边界、执行循环和环境权限拆开观察。读者应学会跨仓库追踪契约，而不是从头阅读全部源码。

## 版本与边界

<ProjectMeta project-id="project-openhands" />

Canvas v1.24.0 依赖 `@openhands/typescript-client@1.49.6`，与本页固定的 software-agent-sdk v1.49.6 对齐。页面只解释已有会话的 message/action/event 链，不追踪 conversation 创建链。

## 原创建筑图

<ProjectCallChain project-id="project-openhands" />

图中最重要的边界是：Canvas `Message` 是客户端传输消息，SDK `MessageEvent` 才进入持久事件模型。Agent Server 直接调用 `LocalConversation`，SDK 决定动作并调用工具。Workspace 是工具构造与执行所消费的环境边界和配置来源，不是 tools 的 owner，也不是这条链的下一跳。

## 唯一纵向调用链

从 `handleSendMessage` 与 `useSendMessage().send` 进入 WebSocket 后，`events_socket` 通过 `EventService.subscribe_to_events` 注册订阅，并把消息交给 `EventService.send_message`，后者直接调用 `LocalConversation.send_message` 写入用户 `MessageEvent`。`EventService.run` 只启动已有 conversation 的执行，不拥有订阅；执行侧再由 `LocalConversation.arun` 和 `Agent.astep` 推进，tool call 被转成 `ActionEvent`，工具结果形成 `Observation`。装配阶段，`EventService.start` 构造并注册 `AsyncCallbackWrapper(self._pub_sub, ...)`；事件实际回流时，`LocalConversation.__init__` 组装的 callback 保证持久化 append 先发生，随后 `AsyncCallbackWrapper.__call__` 调度 EventService `_pub_sub`/PubSub，`_WebSocketSubscriber.__call__` 作为 subscriber 调用 `_send_event`，最后回到 Canvas event store。图中的三条 track 不是一条跨异步边界的同步调用栈。

## 关键源码入口

<ProjectSourceLinks project-id="project-openhands" />

## 一次请求的数据流

用户消息由 Canvas 发送到已有 conversation 的 Agent Server。Canvas Message 与 SDK event 不能混为一个对象：服务把消息交给 `LocalConversation`，agent 基于持久事件产生 `ActionEvent`，工具返回 `Observation`。持久化优先不是 `_on_event` 方法，而是 `LocalConversation.__init__` 组装的 default callback 先 append、caller callback 后执行。模型生成过程中的 streaming delta 不属于持久事件回流链，而是非持久旁路，也不能被当作已完成动作。权限、秘密和文件范围仍必须由工具构造与执行所消费的 Workspace 环境边界实际限制。

## 阅读练习

1. 从 `handleSendMessage` 追到 `LocalConversation.send_message`，标出 Canvas Message 与 SDK `MessageEvent` 的转换点。
2. 从 `_ahandle_tool_calls` 追到 `ToolDefinition.__call__`，区分 `ActionEvent` 与 `Observation`。
3. 从 `LocalConversation.__init__` 的 callback 组合追到 Canvas event store，解释为何持久追加与异步推送不能画成一个同步调用栈。

## 失败边界

如果 Agent Server 连接中断，Canvas 的“发送成功”不能冒充 workspace 动作完成。恢复必须基于 conversation/event 状态；直接重放高风险动作前要检查外部副作用。

## 生产边界

直接在宿主机启动 Agent Server 会拥有主机文件权限。Docker 或远端环境也不是自动安全，需要目录挂载、网络、秘密、工具和审批的最小权限策略。

## 高频面试点

- [IQ-09-B：沙箱、guardrail 与最小权限](/chapters/09-safety-recovery#iq-09-b)
- [IQ-10-A：从 Demo 到生产](/chapters/10-production#iq-10-a)
- [IQ-13-C：怎样验收 Coding Agent](/chapters/13-coding-agent#iq-13-c)

## 升级复核

先检查 Canvas 的消息 hook 与 WebSocket context、客户端依赖版本、Agent Server event service、SDK `LocalConversation`/Agent 和 Tool 契约。仓库再次拆分或合并时，先改边界图再改调用链。

## 来源与归因

架构图为本书原创重绘，依据固定的 Canvas 与 software-agent-sdk 两个仓库。页面不复用 OpenHands Logo、README 截图或云产品素材。
```

- [ ] **Step 4: Create the benchmark page**

Create `docs/projects/agent-benchmarks.md`:

```md
---
title: Agent 评测基准：从任务到可复核评分
description: 对照 SWE-bench 与 τ²-bench 的任务、环境、轨迹和评分边界，不混用指标。
---

# Agent 评测基准：从任务到可复核评分

## 30 秒结论

SWE-bench 关注代码补丁能否在固定仓库环境通过指定测试；τ²-bench 关注 Agent 与用户、工具和业务状态的多轮交互。两者任务、环境和评分合同不同，分数不能直接横比。

## 为什么选

这两个项目把第 8 章的“结果、轨迹、环境与证据”落到真实 harness。重点不是榜单，而是分母、环境、失败分类和可复现性。

## 版本与边界

<ProjectMeta project-id="project-agent-benchmarks" />

SWE-bench 的 v5.0.1 是 tag，不冒充 GitHub Release。页面只拆评测执行链，不复制数据集，也不运行模型或发布分数。

## 原创建筑图

<ProjectCallChain project-id="project-agent-benchmarks" />

两条受控轨道并列，分别闭合到自己的评分，不在图末尾合成一个“总分”；这不是先运行 SWE-bench 再运行 τ²-bench 的顺序流程。

## 唯一纵向调用链

本页使用一个“任务到评分”的比较视图：左轨是 patch、容器、测试与 report；右轨从当前 `tau2` CLI 的 `main` 开始。`main` 注册局部 `run_command`，再把 `tau2 run` 分派到 `run_domain`、任务加载、单任务 simulation、orchestrator、环境工具、trajectory、evaluation 与 `reward_info`；`run_command` 不是可链接的顶层 symbol。两轨只比较证据结构，不暗示调用关系或数值高低。

## 关键源码入口

<ProjectSourceLinks project-id="project-agent-benchmarks" />

## 一次请求的数据流

SWE-bench 将实例和预测 patch 放入隔离环境，运行目标测试并由 grading 生成解决状态。τ²-bench 由当前 CLI 调用 batch runner，构建 agent、user、environment 与 orchestrator；simulation 保留 trajectory。默认 `EvaluationType.ALL` 与 `EvaluationType.ALL_WITH_NL_ASSERTIONS` 都按 `task.evaluation_criteria.reward_basis` 选择分量后相乘，后者只强制 NL assertions；ACTION 只有被选中时才是硬门禁。单项类型与 `*_IGNORE_BASIS` 各走自己的分支。early termination 返回 `0.0`，没有 criteria 时返回 `1.0`，这些短路结果不能冒充 basis-aware 分支的乘积。

## 阅读练习

1. 找出 SWE-bench 的预测输入、容器执行和最终报告边界。
2. 找出 τ²-bench 中 user simulator 与 environment 的职责差异。
3. 列出三个会让两个分数不可比较的契约差异。

兼容层里的 `tau2.run.run_task` 与 `tau2.run.run_tasks` 是旧 flat 参数 API 已 deprecated；这不是说整个 `tau2.run` module 都 deprecated，也不是当前 CLI 主链入口。

## 失败边界

镜像构建失败、基础设施超时、测试解析失败和产品行为失败必须分开。把环境阻塞从分母删掉或把解析异常当作模型失败，都会制造错误结论。

## 生产边界

公开 benchmark 不能替代企业自己的权限、数据、延迟和业务后果评测。第三阶段若提供 10 条本地 fixture，它们只是本书自建微型回归集，不是官方 benchmark 成绩。

## 高频面试点

- [IQ-08-A：非确定性 Agent 怎样评测](/chapters/08-evaluation#iq-08-a)
- [IQ-08-B：怎样避免泄漏与指标投机](/chapters/08-evaluation#iq-08-b)
- [IQ-08-C：怎样避免单指标绑架](/chapters/08-evaluation#iq-08-c)

## 升级复核

检查任务 schema、环境镜像、预测格式、评分逻辑、失败分类和报告分母。任何 leaderboard 变化都只进入 Radar，除非 harness 契约本身改变。

## 来源与归因

比较图为本书原创重绘，依据两个固定 commit 的 harness 源码。页面不复制 benchmark 数据、排行榜或第三方仓库内容。
```

- [ ] **Step 5: Run focused and full gates**

Run:

```bash
pnpm vitest run tests/project-pages.spec.ts -t 'OpenHands and benchmark'
pnpm test && pnpm validate && pnpm build
```

Expected: focused tests and the full build pass.

- [ ] **Step 6: Commit both pages**

```bash
git add docs/projects/openhands.md docs/projects/agent-benchmarks.md tests/project-pages.spec.ts
git commit -m "docs: dissect OpenHands and agent benchmarks"
```

### Task 7: Write the Dify and CrewAI core dissections

**Files:**

- Create: `docs/projects/dify.md`
- Create: `docs/projects/crewai.md`
- Modify: `tests/project-pages.spec.ts`

- [ ] **Step 1: Write failing platform and multi-agent boundary tests**

```ts
describe('Dify and CrewAI dissections', () => {
  it('publishes both complete reading-only pages', () => {
    expectCoreProjectPage('docs/projects/dify.md', 'project-dify')
    expectCoreProjectPage('docs/projects/crewai.md', 'project-crewai')
  })

  it('states Dify and CrewAI boundaries without marketing claims', () => {
    const dify = readFileSync('docs/projects/dify.md', 'utf8')
    expect(dify).toContain('编号主链只选择 blocking')
    expect(dify).toContain('streaming 是独立旁路')
    expect(dify).toContain('WorkflowRunApi.post')
    expect(dify).toContain('AppGenerateService.generate')
    expect(dify).toContain('AppGenerateService._run_with_guardrails')
    expect(dify).toContain('AppMode.WORKFLOW')
    expect(dify).toContain('WorkflowAppGenerator._generate_worker')
    expect(dify).toContain('注入 execution repositories')
    expect(dify).toContain('WorkflowBasedAppRunner._init_graph')
    expect(dify).toContain('Graphon')
    expect(dify).toContain('Graph.init')
    expect(dify).toContain('DifyNodeFactory.create_node')
    expect(dify).toContain('agent_node_kind == dify_agent')
    expect(dify).toContain('WorkflowEntry 接收已经创建的 Graph')
    expect(dify).toContain('WorkflowEntry 不构图')
    expect(dify).toContain('WorkflowAppRunner.run 先用现成 Graph 构造 WorkflowEntry')
    expect(dify).toContain('WorkflowEntry.__init__ 创建 GraphEngine')
    expect(dify).toContain('自行挂 debug、execution-limit 和可选 observability layers')
    expect(dify).toContain('构造返回后，WorkflowAppRunner 才挂 WorkflowPersistenceLayer、workspace-retirement 和外部 custom layers')
    expect(dify).not.toContain('WorkflowAppRunner 创建 persistence、observability')
    expect(dify).not.toContain('Graph 和 layers 交给 WorkflowEntry')
    expect(dify).toContain('GraphEngine.run → worker → Node.run')
    expect(dify).toContain('create_run → stream_events')
    expect(dify).toContain('WorkflowAppRunner._handle_event')
    expect(dify).toContain('WorkflowAppQueueManager')
    expect(dify).toContain('WorkflowAppGenerateTaskPipeline')
    expect(dify).toContain('内部 typed response')
    expect(dify).toContain('最终 public payload')
    expect(dify).toContain('先订阅 topic，再投递 Celery `_AppRunner`')
    expect(dify).toContain('workflow_based_app_execution_task → _AppRunner.run')
    expect(dify).toContain('重载 app、user、workflow')
    expect(dify).toContain('`_publish_streaming_response` 是模块级函数')
    expect(dify).toContain('两类 Runner 不是同一个对象')
    expect(dify).toContain('修改版 Apache-2.0')
    expect(dify).toContain('持久化也不归 WorkflowEntry 单独负责')
    expect(dify).not.toContain('WorkflowEntry 创建 GraphEngine')
    expect(dify).not.toContain('AgentNode 直接输出 SSE')
    for (const id of ['IQ-02-B', 'IQ-06-A', 'IQ-10-A']) {
      expect(dify).toContain(id)
    }

    const crew = readFileSync('docs/projects/crewai.md', 'utf8')
    expect(crew).toContain('Process.sequential')
    expect(crew).toContain('Task.async_execution=false')
    expect(crew).toContain('Agent.planning=false')
    expect(crew).toContain('Crew.kickoff → begin_execution → prepare_kickoff → setup_agents → Agent.create_agent_executor')
    expect(crew).toContain('Process enum 只用于 kickoff 内的分支判断，不是执行节点')
    expect(crew).toContain('Crew._create_crew_output → end_execution')
    expect(crew).toContain('experimental.AgentExecutor.invoke')
    expect(crew).toContain('text ReAct 与 native tool 是二选一的条件分支')
    expect(crew).toContain('call_llm_and_parse → execute_tool_action → ToolUsage.use → ToolUsage._use → CrewStructuredTool.invoke')
    expect(crew).toContain('call_llm_native_tools → execute_native_tool → _execute_single_native_tool_call → _available_functions[...]')
    expect(crew).toContain('StepExecutor 只在 planning_enabled')
    expect(crew).toContain('todos 已生成后懒创建')
    expect(crew).toContain('CrewAgentExecutor 已 deprecated')
    expect(crew).toContain('Task._execute_core 构造并持有 TaskOutput')
    expect(crew).toContain('`_export_output` 只负责结构化输出转换')
    expect(crew).toContain('Crew._create_crew_output 构造 CrewOutput')
    expect(crew).toContain('角色名称不会自动形成权限隔离')
    expect(crew).toContain('消融实验显示增益')
    expect(crew).not.toContain('CrewAgentExecutor/StepExecutor 驱动工具循环')
    for (const id of ['IQ-07-A', 'IQ-07-B', 'IQ-07-C']) {
      expect(crew).toContain(id)
    }

    expect(`${dify}\n${crew}`).not.toMatch(/最佳框架|生产级首选|Star 数/u)
    expect(`${dify}\n${crew}`).not.toMatch(/^## Lab$/gmu)
  })
})
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `pnpm vitest run tests/project-pages.spec.ts -t 'Dify and CrewAI'`

Expected: FAIL because both pages are absent.

- [ ] **Step 3: Create the Dify page**

Create `docs/projects/dify.md`:

```md
---
title: Dify：blocking 请求怎样穿过工作流图
description: 固定 service API 的 blocking 主链，并把 streaming 作为独立交付旁路。
---

# Dify：blocking 请求怎样穿过工作流图

## 30 秒结论

Dify 的画布不是执行者。编号主链只选择 blocking：Service API 经过生成服务与 workflow generator/runner，先由 `Graph.init` 和 `DifyNodeFactory.create_node` 得到图及节点，再把已经创建的 Graph 交给 WorkflowEntry；Graphon 推进节点后，事件依次经过 queue、pipeline、内部 typed response 和最终 public payload。streaming 是独立旁路，不能混进这条同步返回链。

## 为什么选

它适合观察低代码平台怎样把编辑态配置变成运行态控制流，也能暴露平台边界：多租户、权限、插件、队列、交付方式与许可证限制都不会被一张画布消除。

## 版本与边界

<ProjectMeta project-id="project-dify" />

本页固定在 1.17.1（commit `8387590ace4a094de812b7847fc6a4c3a27cd52b`），只解释 `WorkflowRunApi.post` 接收的 service API workflow 请求。数据集、插件市场、计费、前端编辑器和云服务不展开；主链固定 `response_mode=blocking`。

## 原创建筑图

<ProjectCallChain project-id="project-dify" />

图中两个 blocking track 是同一条编号链为控制复杂度而分段，第三个 track 才是 streaming side path。Graphon 是固定版本中的图执行依赖；Dify 的装配、事件与响应适配层必须和 Graphon 引擎分开读。

## 唯一纵向调用链

blocking 主链按源码顺序为：`WorkflowRunApi.post → AppGenerateService.generate → AppGenerateService._run_with_guardrails → AppGenerateService._dispatch_generate(AppMode.WORKFLOW, streaming=false) → WorkflowAppGenerator.generate → WorkflowAppGenerator._generate → WorkflowAppGenerator._generate_worker → WorkflowAppRunner.run → WorkflowBasedAppRunner._init_graph → Graph.init + DifyNodeFactory.create_node → DifyAgentNode.__init__（仅 agent_node_kind == dify_agent）→ WorkflowEntry(existing Graph) → WorkflowEntry 内建 GraphEngine 与内部 layers → Runner 追加外部 layers → GraphEngine.run → worker → Node.run → DifyAgentNode._run/_run_inner → create_run → stream_events → WorkflowAppRunner._handle_event → WorkflowAppQueueManager → WorkflowAppGenerateTaskPipeline → WorkflowResponseConverter 内部 typed response → WorkflowAppGenerateResponseConverter 最终 public payload`。

WorkflowAppGenerator 创建 WorkflowAppRunner，并注入 execution repositories。WorkflowAppRunner.run 先用现成 Graph 构造 WorkflowEntry；WorkflowEntry.__init__ 创建 GraphEngine，并自行挂 debug、execution-limit 和可选 observability layers。构造返回后，WorkflowAppRunner 才挂 WorkflowPersistenceLayer、workspace-retirement 和外部 custom layers。WorkflowEntry 接收已经创建的 Graph；WorkflowEntry 不构图，GraphEngine 也不负责创建节点。DifyAgentNode 不直接输出 SSE，它只把 agent backend 事件适配为图节点事件。

## 关键源码入口

<ProjectSourceLinks project-id="project-dify" />

## 一次请求的数据流

blocking 请求先完成应用校验、配额与并发 guardrail，再选择 `AppMode.WORKFLOW`。generator 创建 queue manager 和工作线程，并向 runner 注入 workflow 与 node execution repositories；runner 建变量池和现成 Graph，用它构造 WorkflowEntry。Entry 创建 GraphEngine 与自身负责的内部 layers；返回 Runner 后，Runner 再追加 persistence、workspace-retirement 和调用方传入的 custom layers。`DifyNodeFactory.create_node` 依据节点类型与版本构造节点。只有配置为 agent v2 且 `agent_node_kind == dify_agent` 时才进入 DifyAgentNode，它通过 backend `create_run → stream_events` 产生节点事件。`WorkflowAppRunner._handle_event` 把 Graphon 事件转换成 app queue event，`WorkflowAppGenerateTaskPipeline` 消费并聚合；通用 `WorkflowResponseConverter` 只生成内部 typed response，最后由 `WorkflowAppGenerateResponseConverter` 映射 public payload。

streaming 旁路先订阅 topic，再投递 Celery `_AppRunner`：`workflow_based_app_execution_task → _AppRunner.run → WorkflowAppGenerator/WorkflowAppRunner → typed response → public mapping → _publish_streaming_response → topic`。其中 `_AppRunner.run` 重载 app、user、workflow 后进入同一套 Generator/Runner；请求进程同时沿 `retrieve_events → SSE` 交付。fixed commit 里 `_publish_streaming_response` 是模块级函数，不是 `_AppRunner._publish_streaming_response`。Celery `_AppRunner` 与执行工作流的 `WorkflowAppRunner` 是两类 Runner 不是同一个对象。

## 阅读练习

1. 从 `WorkflowRunApi.post` 追到 `_dispatch_generate`，说明 blocking 分支在哪里确定。
2. 从 `_init_graph` 追踪 `Graph.init` 与 `DifyNodeFactory.create_node`，解释为什么 WorkflowEntry 拿到的是 existing Graph。
3. 对照 blocking 与 streaming track，标出 public mapping、topic 写入、retrieve 和 SSE 的先后关系。

## 失败边界

请求被 guardrail 拒绝、节点失败、agent backend 流中断、人工输入暂停、Graphon 执行上限和响应交付中断是不同状态。恢复前必须区分图执行是否已产生外部副作用；页面仍显示流程图或 SSE 连接仍存在，都不能证明节点成功。

## 生产边界

执行限制、可观测与部分状态层会装配到 GraphEngine，但持久化也不归 WorkflowEntry 单独负责；队列、task pipeline、数据库仓储与 streaming topic 各有职责。平台封装也不自动保证工具最小权限、租户数据隔离或输出正确。Dify 使用修改版 Apache-2.0，根许可证对多租户服务、前端标识及外观专利另有附加条件，商业或平台复用必须逐条核对。

## 高频面试点

- [IQ-02-B：何时从 Workflow 升级为 Agent](/chapters/02-workflow-agent#iq-02-b)
- [IQ-06-A：什么时候需要显式 Graph](/chapters/06-loop-graph#iq-06-a)
- [IQ-10-A：从 Demo 到生产](/chapters/10-production#iq-10-a)

## 升级复核

逐项复核 controller、AppGenerateService、Celery workflow task、WorkflowAppGenerator、两类 Runner、Graphon 版本、NodeFactory、agent node、WorkflowEntry、queue、task pipeline 与两级 response converter。Graphon 主版本、streaming transport 或根许可证变化都必须触发人工复核。

## 来源与归因

调用链图为本书原创重绘，依据固定 commit 的 13 个 Dify 源文件。页面不复用 Dify Logo、产品截图或受外观专利保护的视觉表达。
```

- [ ] **Step 4: Create the CrewAI page**

Create `docs/projects/crewai.md`:

```md
---
title: CrewAI：默认 sequential 怎样产生 CrewOutput
description: 固定同步、无 planning 的 sequential 主链，再分开阅读 text、native tool 与 planning 条件分支。
---

# CrewAI：默认 sequential 怎样产生 CrewOutput

## 30 秒结论

本页的唯一默认主链固定为 `Process.sequential + Task.async_execution=false + Agent.planning=false`。CrewAI 用 Crew、Task 与 Agent 表达编排，但真正执行由默认 `experimental.AgentExecutor` 完成；角色名称不会自动形成权限隔离，角色数量也不是多 Agent 价值的证据。

## 为什么选

它能把第 7 章的 handoff、共享状态、协调成本和角色消融落到源码。只有权限、上下文或可并行工作确实分离，并且消融实验显示增益，多个 Agent 才有工程价值。

## 版本与边界

<ProjectMeta project-id="project-crewai" />

本页固定在 1.15.22（commit `7a01af27912c2b142d8bac70d1894343f8b91bd1`）的 `lib/crewai/...` monorepo 包。默认条件是同步 task 且关闭 agent planning；Flow、A2A、hierarchical process、企业平台和完整工具集合不进入主链。

## 原创建筑图

<ProjectCallChain project-id="project-crewai" />

两个 default sequential track 是一条连续主链的分段。Process enum 只用于 kickoff 内的分支判断，不是执行节点。text ReAct、native tool 与 planning 是条件 track，不应串成每次执行都会经过的调用栈；每个 track 都控制在 13 个节点以内。

## 唯一纵向调用链

默认链为：`Crew.kickoff → begin_execution → prepare_kickoff → setup_agents → Agent.create_agent_executor → kickoff 判断 self.process == Process.sequential → Crew._run_sequential_process → Crew._execute_tasks → prepare_task_execution → Task.execute_sync → Task._execute_core → Agent.execute_task → experimental.AgentExecutor.invoke → AgentFinish.output → Agent._finalize_task_execution → Task._execute_core 构造并持有 TaskOutput → Crew._create_crew_output → end_execution`。其中 `Crew._create_crew_output 构造 CrewOutput`，随后 kickoff 的 `finally` 关闭 execution context。

`prepare_kickoff → setup_agents → Agent.create_agent_executor` 发生在 process 分支选择之前。默认 executor 是 `experimental.AgentExecutor.invoke`；CrewAgentExecutor 已 deprecated，只是兼容实现，不能再画成默认主链。

## 关键源码入口

<ProjectSourceLinks project-id="project-crewai" />

## 一次请求的数据流

输入进入 Crew 后先由 `begin_execution` 打开执行与 tracing context，再完成 kickoff 准备和 agent executor 装配，之后 kickoff 才判断 `self.process == Process.sequential`。`Crew._execute_tasks` 在 `Task.async_execution=false` 下准备当前 task，`Task._execute_core` 委托 `Agent.execute_task`，随后进入 executor。`Agent.planning=false` 会绕过 planning/todos；executor 在 text ReAct 与 native tool 是二选一的条件分支，二者收敛到 `AgentFinish.output`，再由 Agent 完成 finalize。Task 对输出的所有权边界是：`Task._execute_core 构造并持有 TaskOutput`，`_export_output` 只负责结构化输出转换；最终 `Crew._create_crew_output 构造 CrewOutput`，`end_execution` 再关闭上下文。

text 分支是 `call_llm_and_parse → execute_tool_action → ToolUsage.use → ToolUsage._use → CrewStructuredTool.invoke`。native 分支是 `call_llm_native_tools → execute_native_tool → _execute_single_native_tool_call → _available_functions[...]`；它不经过 ToolUsage。两条分支都可能直接得到完成答案，不能强制画成先 text 后 native。

## 阅读练习

1. 从 `Crew.kickoff` 找出 `prepare_kickoff` 与 `Process.sequential` 的真实先后顺序。
2. 对照 text 与 native track，说明各自在哪里解析或分派工具。
3. 移除第二个角色做消融实验，比较任务质量、调用量、延迟、handoff 丢失与权限面，而不是比较角色数量。

## 失败边界

工具失败、Agent 无进展、Task 输出不满足契约、handoff 信息丢失和最终 CrewOutput 为空必须分别归因。完整聊天转交会复制噪声，却不能证明交接正确；角色名不同也不代表状态、权限或失败域已经隔离。

## 生产边界

多 Agent 会增加调用、等待、共享状态与评测组合。StepExecutor 只在 planning_enabled 为 true 且 todos 已生成后懒创建；默认 `Agent.planning=false` 主链不经过它。启用 planning 意味着额外模型调用、todo 状态、观察与重规划边界，必须单独评测，不能拿角色数量当收益。

## 高频面试点

- [IQ-07-A：多 Agent 的价值和成本](/chapters/07-multi-agent#iq-07-a)
- [IQ-07-B：可靠 handoff 包含什么](/chapters/07-multi-agent#iq-07-b)
- [IQ-07-C：怎样识别昂贵角色扮演](/chapters/07-multi-agent#iq-07-c)

## 升级复核

检查 monorepo 路径、execution context、kickoff utilities、Process、Task、Agent core、默认 experimental executor、text/native 工具路径、StepExecutor 条件和两个 output owner。新模式先进入 Radar，不自动替换本页固定默认链。

## 来源与归因

调用链图为本书原创重绘，依据固定 commit 的 11 个 CrewAI 源文件和 MIT 许可证。页面不复用 CrewAI Logo、官网截图或营销对比图。
```

- [ ] **Step 5: Run focused and full gates**

Run:

```bash
pnpm vitest run tests/project-pages.spec.ts -t 'Dify and CrewAI'
pnpm test && pnpm validate && pnpm build
```

Expected: focused tests and the full build pass.

- [ ] **Step 6: Commit both pages**

```bash
git add docs/projects/dify.md docs/projects/crewai.md tests/project-pages.spec.ts
git commit -m "docs: dissect Dify and CrewAI"
```

### Task 8: Publish the project overview and historical counterexample, then register all eight routes

**Files:**

- Create: `docs/projects/index.md`
- Create: `docs/projects/history-autogpt-flowise.md`
- Modify: `docs/.vitepress/theme/data/contentRegistry.ts`
- Modify: `scripts/validate-content.mjs`
- Modify: `tests/course-map.spec.ts`
- Modify: `tests/project-pages.spec.ts`
- Create: `tests/project-ssr.spec.ts`

- [ ] **Step 1: Write failing route, overview, and historical-boundary tests**

Update the shared test imports to include `mkdirSync`, `mkdtempSync`, `rmSync`, `writeFileSync`, `tmpdir`, `join`, `contentItems`, `interviewQuestions`, and `validateBook`; the snippets below use the real exported objects and isolated malformed-source fixtures.

```ts
import {
  loadProjectCatalog,
  validateProjectCatalogIntegration,
} from '../scripts/project-catalog.mjs'
import { contentItems, getContentItem } from '../docs/.vitepress/theme/data/contentRegistry'
import { interviewQuestions } from '../docs/.vitepress/theme/data/interviewQuestions'
import { validateBook } from '../scripts/validate-content.mjs'

const projectRouteRecords = [
  ['projects-index', '/projects/', '开源项目拆解', 'project'],
  ['project-mcp-python-sdk', '/projects/mcp-python-sdk', 'MCP 规范与 Python SDK', 'project'],
  ['project-aider', '/projects/aider', 'Aider 源码拆解', 'project'],
  ['project-openhands', '/projects/openhands', 'OpenHands 源码拆解', 'project'],
  ['project-agent-benchmarks', '/projects/agent-benchmarks', 'Agent 评测基准', 'project'],
  ['project-dify', '/projects/dify', 'Dify 源码拆解', 'project'],
  ['project-crewai', '/projects/crewai', 'CrewAI 源码拆解', 'project'],
  ['project-history-autogpt-flowise', '/projects/history-autogpt-flowise', 'AutoGPT 与 Flowise：历史反例', 'project'],
] as const

describe('project routes and catalog overview', () => {
  it('adds exactly eight project routes without changing the existing 31', () => {
    const actual = projectRouteRecords.map(([id]) => getContentItem(id))
    expect(actual.map(({ id, route, kind }) => [id, route, kind])).toEqual(
      projectRouteRecords.map(([id, route, , kind]) => [id, route, kind]),
    )
    expect(contentItems).toHaveLength(39)
    expect(projectCatalog.pages.map((page) => page.page_item_id))
      .toEqual(projectRouteRecords.map(([id]) => id))
    for (const page of projectCatalog.pages) {
      expect(getContentItem(page.page_item_id).kind).toBe('project')
    }
  })

  it('cross-validates real page and interview IDs instead of a second runtime allowlist', () => {
    const catalog = loadProjectCatalog('sources/project-index.yml')
    expect(validateProjectCatalogIntegration(catalog, {
      contentItems,
      interviewQuestions,
    })).toEqual([])
  })

  it('reports stable validation errors for malformed TypeScript integration sources', () => {
    const fixtureRoot = mkdtempSync(join(tmpdir(), 'project-integration-'))
    const dataRoot = join(fixtureRoot, 'docs/.vitepress/theme/data')
    mkdirSync(dataRoot, { recursive: true })
    const contentPath = join(dataRoot, 'contentRegistry.ts')
    const interviewPath = join(dataRoot, 'interviewQuestions.ts')
    writeFileSync(interviewPath, "export const interviewQuestions = [question('iq-02-b')]\n")

    try {
      writeFileSync(contentPath, 'export const contentItems = [\n')
      expect(validateBook(fixtureRoot, { projectCatalogPath: resolve('sources/project-index.yml') }))
        .toContain('contentItems TypeScript has parse diagnostics')

      writeFileSync(contentPath, 'export const otherItems = []\n')
      expect(validateBook(fixtureRoot, { projectCatalogPath: resolve('sources/project-index.yml') }))
        .toContain('contentItems TypeScript is missing exported array contentItems')

      writeFileSync(contentPath, "const dynamicId = 'projects-index'\nexport const contentItems = [{ id: dynamicId }]\n")
      expect(validateBook(fixtureRoot, { projectCatalogPath: resolve('sources/project-index.yml') }))
        .toContain('contentItems entry 0 requires a string-literal id')
    } finally {
      rmSync(fixtureRoot, { recursive: true, force: true })
    }
  })

  it('rejects interview IDs produced by any factory other than local question', () => {
    const fixtureRoot = mkdtempSync(join(tmpdir(), 'project-integration-factory-'))
    const dataRoot = join(fixtureRoot, 'docs/.vitepress/theme/data')
    mkdirSync(dataRoot, { recursive: true })
    writeFileSync(join(dataRoot, 'contentRegistry.ts'), "export const contentItems = [{ id: 'projects-index' }]\n")
    writeFileSync(join(dataRoot, 'interviewQuestions.ts'), "export const interviewQuestions = [otherFactory('iq-04-a')]\n")
    try {
      expect(validateBook(fixtureRoot, { projectCatalogPath: resolve('sources/project-index.yml') }))
        .toContain('interviewQuestions entry 0 must call local question with a string-literal id')
    } finally {
      rmSync(fixtureRoot, { recursive: true, force: true })
    }
  })

  it('publishes the overview and keeps watch-only items external-only', () => {
    const page = readFileSync('docs/projects/index.md', 'utf8')
    expect(page).toContain('<ProjectOverview />')
    expect(page).toContain('不是安装清单')
    const component = readFileSync('docs/.vitepress/theme/components/ProjectOverview.vue', 'utf8')
    expect(component).toContain("catalog_tier === 'watch-only'")
    expect(component).not.toContain("getContentItem(subject.id)")
  })

  it('labels AutoGPT and Flowise as historical for different factual reasons', () => {
    const page = readFileSync('docs/projects/history-autogpt-flowise.md', 'utf8')
    expect(page).toContain('AutoGPT 上游仍活跃')
    expect(page).toContain('Flowise 已归档并于 2026-08-31 EOL')
    expect(page).toContain('PolyForm Shield')
    expect(page).toContain('商业许可')
    expect(page).not.toMatch(/推荐安装|生产级首选/u)
  })
})
```

Create `tests/project-ssr.spec.ts` to inspect real VitePress SSR output instead of component source text:

```ts
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

let outputRoot = ''
const projectHtmlFiles = [
  'projects/index.html',
  'projects/mcp-python-sdk.html',
  'projects/aider.html',
  'projects/openhands.html',
  'projects/agent-benchmarks.html',
  'projects/dify.html',
  'projects/crewai.html',
  'projects/history-autogpt-flowise.html',
]

beforeAll(() => {
  outputRoot = mkdtempSync(join(tmpdir(), 'project-ssr-'))
  execFileSync('pnpm', ['exec', 'vitepress', 'build', 'docs', '--outDir', outputRoot], {
    cwd: process.cwd(), stdio: 'pipe', encoding: 'utf8', timeout: 120_000,
  })
}, 120_000)

afterAll(() => rmSync(outputRoot, { recursive: true, force: true }))

describe('actual project SSR', () => {
  it('bounds the VitePress subprocess independently of the Vitest hook', () => {
    const source = readFileSync('tests/project-ssr.spec.ts', 'utf8')
    expect(source).toMatch(/execFileSync\([\s\S]+timeout:\s*120_000/u)
  })

  it('renders all eight approved routes', () => {
    expect(projectHtmlFiles.filter((file) => !existsSync(join(outputRoot, file)))).toEqual([])
  })

  it('renders metadata, architecture, textual chains, and fixed sources into every dissection page', () => {
    for (const file of projectHtmlFiles.slice(1)) {
      const html = readFileSync(join(outputRoot, file), 'utf8')
      for (const marker of [
        'project-meta', 'project-architecture', 'project-call-chain', 'project-source-links',
        '源码事实', '本书归纳', '仓库状态', '教学层级', '许可证边界', '失败边界',
      ]) expect(html, `${file}: ${marker}`).toContain(marker)
      expect(html, file).toMatch(/\b[0-9a-f]{40}\b/u)
      expect(html, file).toMatch(/github\.com\/[^/]+\/[^/]+\/blob\/[0-9a-f]{40}\//u)
      expect(html, file).toMatch(/role="img"[^>]+aria-label="本书原创架构关系图/u)
      expect(html, file).toMatch(/<ol[^>]+role="list"[^>]+aria-label="[^"]*源码调用链文本版"/u)
    }
    const openhands = readFileSync(join(outputRoot, 'projects/openhands.html'), 'utf8')
    expect(openhands).toContain('7dc6805406ea3c76cb4a3ce407c3c72d481b0ac6')
    expect(openhands).toContain('fcc102a697874d54a357e36004e02c95040dbdc0')
  })
})
```

- [ ] **Step 2: Run tests and verify RED**

Run: `pnpm vitest run tests/project-pages.spec.ts tests/course-map.spec.ts tests/project-ssr.spec.ts -t 'project routes|catalog overview|actual project SSR'`

Expected: FAIL because the pages and registry records do not exist; the integration test must report the eight missing `contentRegistry` page IDs rather than throwing.

- [ ] **Step 3: Add the eight exact content records**

Insert these records after `case-delivery-agent` in `contentRegistry.ts`; preserve all existing records byte-for-byte:

```ts
  { id: 'projects-index', route: '/projects/', title: '开源项目拆解', navTitle: '开源项目', kind: 'project' },
  { id: 'project-mcp-python-sdk', route: '/projects/mcp-python-sdk', title: 'MCP 规范与 Python SDK', kind: 'project' },
  { id: 'project-aider', route: '/projects/aider', title: 'Aider 源码拆解', kind: 'project' },
  { id: 'project-openhands', route: '/projects/openhands', title: 'OpenHands 源码拆解', kind: 'project' },
  { id: 'project-agent-benchmarks', route: '/projects/agent-benchmarks', title: 'Agent 评测基准', kind: 'project' },
  { id: 'project-dify', route: '/projects/dify', title: 'Dify 源码拆解', kind: 'project' },
  { id: 'project-crewai', route: '/projects/crewai', title: 'CrewAI 源码拆解', kind: 'project' },
  { id: 'project-history-autogpt-flowise', route: '/projects/history-autogpt-flowise', title: 'AutoGPT 与 Flowise：历史反例', navTitle: '历史反例', kind: 'project' },
```

Extend the existing `expectedIds` array in `tests/course-map.spec.ts` at the same position and keep the existing route-to-file assertion unchanged so all eight Markdown files are required.

- [ ] **Step 4: Create the overview page**

Create `docs/projects/index.md`:

```md
---
title: 开源项目拆解
description: 按工程问题阅读 MCP、Coding Agent、评测、平台与多 Agent 源码，不做框架排行榜。
---

# 开源项目拆解

这不是安装清单，也不是 Star 排行榜。每篇只沿一条固定版本的纵向调用链，把“源码事实、本书解释、阅读练习”分开。

推荐顺序是 MCP → Aider → OpenHands → Agent 评测基准 → Dify → CrewAI。前四篇先建立协议、代码修改、执行环境和证据链；后两篇再看平台化与多 Agent 协调。

<ProjectOverview />

## 现有交付型案例

[交付型 Agent 的质量门](/case-study/delivery-agent) 继续作为脱敏的本书案例，负责把多个项目中看到的评测、安全和上线原则收束成可复核交付；它不冒充任何开源仓库的源码事实。

## 怎么使用这些页面

先读 30 秒结论和原创图，再打开固定 commit 的源码入口。每次只回答一个问题：数据从哪里来，状态由谁拥有，动作在哪里发生，结果由什么证据确认。

## 与 Python Lab 的边界

本阶段只有源码阅读和设计练习。可运行 fake provider、fixture、成本上限和清理命令属于第三阶段 Python Lab Kit；这里不会用“即将上线”按钮或空目录冒充实验已经存在。

## 版权与版本

图解默认由本书原创重绘。源码链接固定到 commit，许可证按文件、目录或贡献历史记录；公开网页和代码许可证都不会自动授予 Logo、商标、截图或第三方素材的复用权。
```

- [ ] **Step 5: Create the historical page**

Create `docs/projects/history-autogpt-flowise.md`:

```md
---
title: AutoGPT 与 Flowise：历史反例不是嘲笑旧项目
description: 从早期自主循环和低代码画布中提取仍有效的设计经验，并说明维护与许可证边界。
---

# AutoGPT 与 Flowise：历史反例不是嘲笑旧项目

## 30 秒结论

AutoGPT 和 Flowise 都推动了 Agent 工程普及，但“曾经重要”不等于“今天仍是默认生产基线”。历史拆解关注哪些假设失效、哪些能力迁移，以及怎样识别维护和许可证风险。

## 为什么选

AutoGPT 代表早期开放式自主循环，Flowise 代表可视化低代码工作流。它们能帮助读者理解为什么今天更强调窄任务、显式状态、可验证工具和可维护运行时。

## 版本与边界

<ProjectMeta project-id="project-history-autogpt-flowise" />

AutoGPT 上游仍活跃，但本书把经典自主循环放在 historical 层；这不是“无人维护”。Flowise 已归档并于 2026-08-31 EOL，属于仓库生命周期事实。

## 原创建筑图

<ProjectCallChain project-id="project-history-autogpt-flowise" />

## 唯一纵向调用链

左轨只看 AutoGPT classic 的入口与 agent，右轨只看 Flowise prediction controller 与 service。目标是比较“开放式循环”和“画布配置执行”分别把复杂度藏在哪里。

## 关键源码入口

<ProjectSourceLinks project-id="project-history-autogpt-flowise" />

## 一次请求的数据流

AutoGPT classic 从目标进入 agent 循环，依赖模型持续规划；Flowise 从 prediction 请求进入已配置流程。两者都说明：入口体验不能替代停止条件、权限、状态、环境证据和维护责任。

## 阅读练习

1. 找出 AutoGPT classic 循环依赖模型继续推进的边界。
2. 找出 Flowise controller 与 service 的职责分离。
3. 把两个项目分别改写成一个更窄、更可测的任务合同。

## 失败边界

AutoGPT 的风险来自开放目标、长循环和工具权限；Flowise 的风险还包括归档后的依赖、安全补丁与运行维护。仓库可见不等于仍有官方维护承诺。

## 生产边界

AutoGPT 上游仍活跃，但 `autogpt_platform/**` 使用 PolyForm Shield；classic 等范围才是 MIT。Flowise enterprise 目录和显式文件使用商业许可，其余才按 Apache-2.0。两者都不作为本书默认安装步骤。

## 高频面试点

- [IQ-02-B：什么时候应该升级为 Agent](/chapters/02-workflow-agent#iq-02-b)
- [IQ-07-C：如何识别昂贵的角色扮演](/chapters/07-multi-agent#iq-07-c)
- [IQ-10-A：从 Demo 到生产需要什么](/chapters/10-production#iq-10-a)

## 升级复核

AutoGPT 检查 classic 与 platform 的边界和根许可证；Flowise 检查归档状态、Discussion #6727、根许可证与生态迁移。维护状态与本书教学层级分别记录。

## 来源与归因

比较图为本书原创重绘。事实来自固定 commit、根许可证和 Flowise 维护者公告，不复用项目截图、Logo 或第三方素材。
```

- [ ] **Step 6: Wire the real integration check into `validateBook`**

In `scripts/validate-content.mjs`, add `import ts from 'typescript'`, extend the Task 2 import to include `loadProjectCatalog` and `validateProjectCatalogIntegration`, then parse the two exported arrays with the TypeScript AST and pass actual `{ id }` objects to the integration validator. Do not regex source text: comments, unrelated strings, aliased factories, or dynamic IDs must not become registry facts. Add these helpers and replace the Task 2 `validateBook` body with the complete integrated version below:

```js
import ts from 'typescript'
import {
  loadProjectCatalog,
  validateProjectCatalogFile,
  validateProjectCatalogIntegration,
} from './project-catalog.mjs'

function exportedArray(sourceFile, exportName) {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)
      || !statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) continue
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.name.text === exportName
        && declaration.initializer && ts.isArrayLiteralExpression(declaration.initializer)) {
        return declaration.initializer
      }
    }
  }
  return null
}

function literalIdFromEntry(entry, exportName) {
  if (exportName === 'contentItems' && ts.isObjectLiteralExpression(entry)) {
    const property = entry.properties.find((candidate) =>
      ts.isPropertyAssignment(candidate)
      && ((ts.isIdentifier(candidate.name) && candidate.name.text === 'id')
        || (ts.isStringLiteral(candidate.name) && candidate.name.text === 'id')),
    )
    return property && ts.isStringLiteral(property.initializer) ? property.initializer.text : null
  }
  if (exportName === 'interviewQuestions' && ts.isCallExpression(entry)
    && ts.isIdentifier(entry.expression) && entry.expression.text === 'question') {
    const [firstArgument] = entry.arguments
    return firstArgument && ts.isStringLiteral(firstArgument) ? firstArgument.text : null
  }
  return null
}

function loadTypeScriptIdObjects(path, exportName) {
  if (!existsSync(path)) return { items: [], errors: [`${exportName} TypeScript file is missing`] }
  let sourceText
  try {
    sourceText = readFileSync(path, 'utf8')
  } catch {
    return { items: [], errors: [`${exportName} TypeScript file cannot be read`] }
  }
  const sourceFile = ts.createSourceFile(path, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  if (sourceFile.parseDiagnostics.length > 0) {
    return { items: [], errors: [`${exportName} TypeScript has parse diagnostics`] }
  }
  const array = exportedArray(sourceFile, exportName)
  if (!array) {
    return { items: [], errors: [`${exportName} TypeScript is missing exported array ${exportName}`] }
  }
  const items = []
  const errors = []
  for (const [index, entry] of array.elements.entries()) {
    if (exportName === 'interviewQuestions'
      && (!ts.isCallExpression(entry) || !ts.isIdentifier(entry.expression)
        || entry.expression.text !== 'question')) {
      errors.push(`${exportName} entry ${index} must call local question with a string-literal id`)
      continue
    }
    const id = literalIdFromEntry(entry, exportName)
    if (id === null) errors.push(`${exportName} entry ${index} requires a string-literal id`)
    else items.push({ id })
  }
  return { items, errors }
}

export function validateBook(root = process.cwd(), options = {}) {
  const sourcePath = join(root, 'sources/source-index.yml')
  const projectCatalogPath = resolve(root, options.projectCatalogPath ?? 'sources/project-index.yml')
  const projectCatalogErrors = validateProjectCatalogFile(projectCatalogPath)
  const contentRegistry = loadTypeScriptIdObjects(
    resolve(root, 'docs/.vitepress/theme/data/contentRegistry.ts'),
    'contentItems',
  )
  const interviewQuestionRegistry = loadTypeScriptIdObjects(
    resolve(root, 'docs/.vitepress/theme/data/interviewQuestions.ts'),
    'interviewQuestions',
  )
  const integrationSourceErrors = [
    ...contentRegistry.errors,
    ...interviewQuestionRegistry.errors,
  ]
  const projectIntegrationErrors = projectCatalogErrors.length === 0
    && integrationSourceErrors.length === 0
    ? validateProjectCatalogIntegration(loadProjectCatalog(projectCatalogPath), {
        contentItems: contentRegistry.items,
        interviewQuestions: interviewQuestionRegistry.items,
      })
    : []
  return [
    ...validateSourceRegistry(sourcePath),
    ...projectCatalogErrors,
    ...integrationSourceErrors,
    ...projectIntegrationErrors,
    ...validatePublishedFiles(root),
  ]
}
```

This is the first task allowed to enable the integration check because all eight real registry IDs now exist. Task 10 later inserts provenance errors into the same return array without changing these integration semantics.

- [ ] **Step 7: Run route, integration, page, and build tests**

Run:

```bash
pnpm vitest run tests/project-pages.spec.ts tests/course-map.spec.ts -t 'project routes|catalog overview|cross-validates real page'
pnpm test && pnpm validate && pnpm build
```

Expected: content registry has 39 unique real routes; overview/history tests and build pass.

- [ ] **Step 8: Commit the public catalog shell**

```bash
git add docs/projects/index.md docs/projects/history-autogpt-flowise.md docs/.vitepress/theme/data/contentRegistry.ts scripts/validate-content.mjs tests/course-map.spec.ts tests/project-pages.spec.ts tests/project-ssr.spec.ts
git commit -m "feat: publish the project dissection catalog"
```

### Task 9: Integrate six core projects into course progress, the engineering path, and navigation

**Files:**

- Modify: `docs/.vitepress/theme/data/courseMap.ts`
- Modify: `docs/.vitepress/theme/data/readingPaths.ts`
- Modify: `docs/.vitepress/config.mts`
- Modify: `scripts/check-dist.mjs`
- Modify: `tests/course-map.spec.ts`
- Modify: `tests/content.spec.ts`
- Modify: `tests/project-pages.spec.ts`

- [ ] **Step 1: Write failing graph, path, and navigation tests**

Add exact assertions rather than only checking that strings appear:

```ts
const projectCourseIds = [
  'project-mcp-python-sdk', 'project-aider', 'project-openhands',
  'project-agent-benchmarks', 'project-dify', 'project-crewai',
  'case-delivery-agent',
]
const expectedEngineeringSteps = [
  { itemId: 'chapter-02-workflow-agent', why: '避免一开始就过度 Agent 化' },
  { itemId: 'chapter-03-react', why: '明确观察、停止与恢复' },
  { itemId: 'chapter-04-tools-mcp', why: '缩小能力与权限边界' },
  { itemId: 'chapter-05-state-memory', why: '让任务可恢复、信息可治理' },
  { itemId: 'chapter-06-loop-graph', why: '把分支、汇合和错误边画出来' },
  { itemId: 'chapter-08-evaluation', why: '同时看结果、轨迹、证据和成本' },
  { itemId: 'chapter-09-safety-recovery', why: '处理幂等、补偿与接管' },
  { itemId: 'chapter-10-production', why: '用灰度、SLO 和回滚保护上线' },
  { itemId: 'chapter-13-coding-agent', why: '把工程原则放进真实仓库任务' },
  { itemId: 'chapter-14-computer-use', why: '验证高不确定环境里的证据链' },
  { itemId: 'project-mcp-python-sdk', why: '从协议读到官方 Python 实现' },
  { itemId: 'project-aider', why: '把仓库上下文变成可审查补丁' },
  { itemId: 'project-openhands', why: '理解大型 Coding Agent 的服务和执行边界' },
  { itemId: 'project-agent-benchmarks', why: '把结果、环境、轨迹和评分连成证据链' },
  { itemId: 'project-dify', why: '观察平台请求如何进入工作流图' },
  { itemId: 'project-crewai', why: '用源码评估多 Agent 的收益与协调成本' },
  { itemId: 'case-delivery-agent', why: '用质量门收束评测、安全与上线判断' },
]

describe('project curriculum integration', () => {
  it('adds six core pages and keeps a 26-item denominator', () => {
    expect(courseStages.find((stage) => stage.id === 'projects')?.itemIds).toEqual(projectCourseIds)
    expect(publishedCourseItems).toHaveLength(26)
    expect(projectCourseProgress([])).toMatchObject({ completed: 0, total: 26 })
    expect(courseItems.filter((item) => item.stageId === 'projects')).toHaveLength(7)
    expect(courseItems.some((item) => item.itemId === 'projects-index')).toBe(false)
    expect(courseItems.some((item) => item.itemId === 'project-history-autogpt-flowise')).toBe(false)
    expect(validateCourseMap(courseItems, courseStages)).toEqual([])
  })

  it('extends only the engineering path to 17 stable steps', () => {
    const engineering = readingPathDefinitions.find((path) => path.id === 'engineering')!
    expect(engineering.pace).toBe('17 站 · 建议边读边画调用链')
    expect(engineering.steps).toEqual(expectedEngineeringSteps)
    expect(readingPathDefinitions.find((path) => path.id === 'beginner')?.steps).toHaveLength(8)
    expect(readingPathDefinitions.find((path) => path.id === 'interview')?.steps).toHaveLength(11)
    const tracked = new Set([
      ...publishedCourseItems.map(({ itemId }) => getContentItem(itemId).route),
      ...readingPaths.flatMap((path) => path.steps.map((step) => step.path)),
    ])
    expect(tracked.size).toBe(29)
  })

  it('gives the project overview course outcomes and prerequisite text', () => {
    const overview = readFileSync('docs/.vitepress/theme/components/ProjectOverview.vue', 'utf8')
    expect(overview).toContain('courseItemById')
    expect(overview).toContain('courseItemFor(page.page_item_id)?.outcome')
    expect(overview).toContain('先修：')
  })

  it('uses the exact project navigation without exposing labs', () => {
    const themeConfig = siteConfig.themeConfig as {
      nav: Array<{ text: string; items: Array<{ text: string; link: string }> }>
      sidebar: Array<{ text: string; items: Array<{ text: string; link: string }> }>
    }
    const idByRoute = new Map(contentItems.map((item) => [item.route, item.id]))
    const practice = themeConfig.nav.find((group) => group.text === '实战')!
    expect(practice.items.map((item) => idByRoute.get(item.link))).toEqual(['projects-index', 'case-delivery-agent'])
    const projects = themeConfig.sidebar.find((group) => group.text === '开源项目拆解')!
    expect(projects.items.map((item) => idByRoute.get(item.link))).toEqual([
      'projects-index', 'project-mcp-python-sdk', 'project-aider', 'project-openhands',
      'project-agent-benchmarks', 'project-dify', 'project-crewai',
      'project-history-autogpt-flowise',
    ])
    expect(JSON.stringify(themeConfig)).not.toContain('/labs/')
    expect(themeConfig.nav.map((group) =>
      group.items.map((item) => idByRoute.get(item.link)),
    )).toEqual([
      ['course', 'preface', 'paths'],
      ['projects-index', 'case-delivery-agent'],
      ['radar', 'frontier-context-engineering', 'frontier-interoperability-identity', 'frontier-durable-execution', 'frontier-agent-security-evaluation'],
      ['appendix-interview-training', 'appendix-interview', 'appendix-glossary'],
    ])
    expect(themeConfig.sidebar.map((group) => [
      group.text,
      group.items.map((item) => idByRoute.get(item.link)),
    ])).toEqual([
      ['课程入口', ['course', 'paths']],
      ['第一篇 · 认识 Agent', ['preface', 'chapter-01-ai-native', 'chapter-02-workflow-agent', 'chapter-03-react']],
      ['第二篇 · 组装 Agent', ['chapter-04-tools-mcp', 'chapter-05-state-memory', 'chapter-06-loop-graph', 'chapter-07-multi-agent']],
      ['第三篇 · 敢于上线', ['chapter-08-evaluation', 'chapter-09-safety-recovery', 'chapter-10-production']],
      ['第四篇 · 应用方向', ['chapter-11-research-agent', 'chapter-12-service-operations-agent', 'chapter-13-coding-agent', 'chapter-14-computer-use']],
      ['开源项目拆解', ['projects-index', 'project-mcp-python-sdk', 'project-aider', 'project-openhands', 'project-agent-benchmarks', 'project-dify', 'project-crewai', 'project-history-autogpt-flowise']],
      ['案例研究', ['case-delivery-agent']],
      ['活教材 · 前沿层', ['radar', 'radar-2026-09', 'frontier-context-engineering', 'frontier-interoperability-identity', 'frontier-durable-execution', 'frontier-agent-security-evaluation']],
      ['随手查', ['appendix-glossary', 'appendix-review-checklist', 'appendix-reading', 'appendix-application-matrix', 'appendix-chapter-template', 'appendix-interview', 'appendix-interview-training']],
    ])
  })
})
```

Update the earlier graph tests from 20 to 26, rename the `handles 20/20` case to `handles 26/26`, update the tracked-route union assertion from 23 to 29, and update the exact `expectedCourseItems` array with the six records below. Replace the existing complete nav/sidebar expected arrays with the arrays above. In `tests/content.spec.ts`, change the course-link error assertion from 20 to 26 and remove `/projects/` from the course-page forbidden marker expectation. Do not keep contradictory old assertions and do not loosen equality into `arrayContaining`.

- [ ] **Step 2: Run focused tests and verify RED**

Run: `pnpm vitest run tests/course-map.spec.ts -t 'project curriculum integration|course graph'`

Expected: FAIL on project-stage IDs, denominator 20, engineering length 10, and the old nav/sidebar shape.

- [ ] **Step 3: Add the six exact CourseItem records and reorder the project stage**

Change the `projects` stage and insert these records before the existing case record:

```ts
{ id: 'projects', order: 5, title: '项目拆解', purpose: '沿真实源码验证协议、执行与证据链', availability: 'published', itemIds: [
  'project-mcp-python-sdk', 'project-aider', 'project-openhands',
  'project-agent-benchmarks', 'project-dify', 'project-crewai',
  'case-delivery-agent',
] },
```

```ts
{ itemId: 'project-mcp-python-sdk', stageId: 'projects', prerequisites: ['chapter-04-tools-mcp', 'frontier-interoperability-identity'], outcome: '区分协议、SDK 与业务授权，并追踪一次 tools/call', evidence: '一张规范层、SDK 层与业务授权层边界图' },
{ itemId: 'project-aider', stageId: 'projects', prerequisites: ['chapter-08-evaluation', 'chapter-09-safety-recovery', 'chapter-13-coding-agent'], outcome: '追踪仓库上下文如何变成可审查补丁', evidence: '一份从仓库上下文到补丁验证的调用链笔记' },
{ itemId: 'project-openhands', stageId: 'projects', prerequisites: ['chapter-09-safety-recovery', 'chapter-10-production', 'chapter-13-coding-agent', 'project-aider'], outcome: '拆开 Canvas、Agent Server、SDK 与工作区权限', evidence: '一张 Canvas、Server、SDK、Workspace 的信任边界图' },
{ itemId: 'project-agent-benchmarks', stageId: 'projects', prerequisites: ['chapter-08-evaluation', 'project-aider', 'project-openhands'], outcome: '从任务、环境与轨迹追到可复核评分', evidence: '一份任务、环境、轨迹、评分与不可比较项清单' },
{ itemId: 'project-dify', stageId: 'projects', prerequisites: ['chapter-06-loop-graph', 'chapter-09-safety-recovery', 'chapter-10-production'], outcome: '追踪平台请求如何进入工作流图和节点事件', evidence: '一张 API 请求到 Graph 节点事件的执行图' },
{ itemId: 'project-crewai', stageId: 'projects', prerequisites: ['chapter-07-multi-agent', 'chapter-08-evaluation', 'chapter-09-safety-recovery'], outcome: '解释 Crew、Task、Agent 与工具循环的协调成本', evidence: '一份角色消融与协调成本评审表' },
```

Leave `case-delivery-agent` unchanged except for its position after the new records. The existing graph validator must still report no cycles.

- [ ] **Step 4: Append the exact engineering path tail**

Keep the first 10 steps byte-for-byte and append:

```ts
{ itemId: 'project-mcp-python-sdk', why: '从协议读到官方 Python 实现' },
{ itemId: 'project-aider', why: '把仓库上下文变成可审查补丁' },
{ itemId: 'project-openhands', why: '理解大型 Coding Agent 的服务和执行边界' },
{ itemId: 'project-agent-benchmarks', why: '把结果、环境、轨迹和评分连成证据链' },
{ itemId: 'project-dify', why: '观察平台请求如何进入工作流图' },
{ itemId: 'project-crewai', why: '用源码评估多 Agent 的收益与协调成本' },
{ itemId: 'case-delivery-agent', why: '用质量门收束评测、安全与上线判断' },
```

Change its pace to `17 站 · 建议边读边画调用链`. Do not modify the beginner or interview definitions.

- [ ] **Step 5: Update top navigation and sidebar through registry IDs**

Use these exact groups in `config.mts`:

```ts
{ text: '实战', items: [navigationItem('projects-index', 'nav'), navigationItem('case-delivery-agent', 'nav')] },
```

```ts
{ text: '开源项目拆解', items: navItems([
  'projects-index', 'project-mcp-python-sdk', 'project-aider', 'project-openhands',
  'project-agent-benchmarks', 'project-dify', 'project-crewai',
  'project-history-autogpt-flowise',
]) },
```

Insert the project group after “第四篇 · 应用方向” and before the existing “案例研究”. Do not remove or rename any existing destination.

- [ ] **Step 6: Move the course dist contract from 20 to 26 links**

In `scripts/check-dist.mjs`, append the six core project routes to `publishedCourseRoutes`, change all exact link-count checks and error text from 20 to 26, and change:

```js
const forbiddenCourseMarkers = ['/projects/', '/labs/', '标记已读', '加入书签']
```

to:

```js
const forbiddenCourseMarkers = ['/labs/', '/capstone/', '标记已读', '加入书签']
```

Keep the Task 4 progressive project output allowlist. Do not require all eight project outputs yet; Task 12 adds completeness only after every page exists.

- [ ] **Step 7: Run graph, path, navigation, dist, and build gates**

Run:

```bash
pnpm vitest run tests/course-map.spec.ts tests/content.spec.ts -t 'project curriculum integration|course graph|course navigation integration|no-JavaScript course output'
pnpm test && pnpm validate && pnpm build
```

Expected: 26 published items, a seven-item project stage, 17 engineering steps, exact nav groups, and a green build.

- [ ] **Step 8: Commit the course integration**

```bash
git add docs/.vitepress/theme/data/courseMap.ts docs/.vitepress/theme/data/readingPaths.ts docs/.vitepress/config.mts scripts/check-dist.mjs tests/course-map.spec.ts tests/content.spec.ts tests/project-pages.spec.ts
git commit -m "feat: add project dissections to the curriculum"
```

### Task 10: Add the project asset provenance gate

**Files:**

- Create: `assets/provenance.yml`
- Create: `scripts/validate-provenance.mjs`
- Modify: `scripts/validate-content.mjs`
- Modify: `tests/project-catalog.spec.ts`
- Modify: `tests/project-pages.spec.ts`

- [ ] **Step 1: Write failing provenance tests**

Use temporary directories to prove both omission and unsafe moving URLs fail:

```ts
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { validateProvenanceFile } from '../scripts/validate-provenance.mjs'

const provenanceCatalog = {
  pages: [{ page_item_id: 'project-aider', subjects: ['aider'] }],
  subjects: [{
    id: 'aider',
    canonical_repo: 'Aider-AI/aider',
    pinned_commit: 'a'.repeat(40),
    license_scopes: [{ basis: 'path', expression: 'Apache-2.0', path_or_glob: '**' }],
  }],
}

describe('project asset provenance', () => {
  it('accepts the intentionally empty phase-two registry', () => {
    expect(validateProvenanceFile('assets/provenance.yml', process.cwd())).toEqual([])
  })

  it('rejects missing, object, and string assets instead of normalizing them to empty', () => {
    const root = mkdtempSync(join(tmpdir(), 'project-assets-schema-'))
    try {
      mkdirSync(join(root, 'assets'), { recursive: true })
      for (const [name, value] of [
        ['missing.yml', 'schema_version: 1\n'],
        ['object.yml', 'schema_version: 1\nassets: {}\n'],
        ['string.yml', 'schema_version: 1\nassets: invalid\n'],
      ]) {
        const path = join(root, 'assets', name)
        writeFileSync(path, value)
        expect(validateProvenanceFile(path, root, provenanceCatalog))
          .toContain('Asset provenance assets must be an array')
      }
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('rejects an unregistered project asset', () => {
    const root = mkdtempSync(join(tmpdir(), 'project-assets-'))
    try {
      mkdirSync(join(root, 'docs/public/project-assets'), { recursive: true })
      mkdirSync(join(root, 'assets'), { recursive: true })
      writeFileSync(join(root, 'docs/public/project-assets/copied.svg'), '<svg/>')
      writeFileSync(join(root, 'assets/provenance.yml'), 'schema_version: 1\nassets: []\n')
      expect(validateProvenanceFile(join(root, 'assets/provenance.yml'), root, provenanceCatalog))
        .toContain('Unregistered project asset: docs/public/project-assets/copied.svg')
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('rejects forged host, repository, source path, and license claims', () => {
    const root = mkdtempSync(join(tmpdir(), 'project-assets-'))
    try {
      mkdirSync(join(root, 'docs/public/project-assets'), { recursive: true })
      mkdirSync(join(root, 'assets'), { recursive: true })
      writeFileSync(join(root, 'docs/public/project-assets/copied.svg'), '<svg/>')
      writeFileSync(join(root, 'assets/provenance.yml'), `
schema_version: 1
assets:
  - local_file: docs/public/project-assets/copied.svg
    origin: third-party
    subject_id: aider
    source_url: https://evil.example/Aider-AI/other/blob/${'c'.repeat(40)}/other.svg
    source_repo: Aider-AI/other
    source_ref: ${'c'.repeat(40)}
    source_path: image.svg
    license: GPL-3.0
    license_basis: path
    manual_license_review: false
    manual_reviewed_by: null
    manual_review_note: null
    copyright_holder: Example
    modified: false
    used_by: [project-aider]
    alt: Architecture
    verified_at: '2026-09-26'
`)
      expect(validateProvenanceFile(join(root, 'assets/provenance.yml'), root, provenanceCatalog)).toEqual(expect.arrayContaining([
        'Third-party asset URL must use https://github.com: docs/public/project-assets/copied.svg',
        'Third-party asset source_repo does not match subject: docs/public/project-assets/copied.svg',
        'Third-party asset source_ref does not match subject pin: docs/public/project-assets/copied.svg',
        'Third-party asset URL does not match repo/ref/path: docs/public/project-assets/copied.svg',
        'Third-party asset license does not match the most specific path scope: docs/public/project-assets/copied.svg',
      ]))
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('requires explicit human evidence for contribution-based licenses', () => {
    const catalog = {
      pages: [{ page_item_id: 'project-mcp-python-sdk', subjects: ['mcp-spec'] }],
      subjects: [{
        id: 'mcp-spec', canonical_repo: 'modelcontextprotocol/modelcontextprotocol',
        pinned_commit: 'b'.repeat(40),
        license_scopes: [{ basis: 'contribution', expression: 'Apache-2.0', selector: 'new-code', scope: 'new', note: 'history required' }],
      }],
    }
    const root = mkdtempSync(join(tmpdir(), 'project-assets-'))
    try {
      mkdirSync(join(root, 'docs/public/project-assets'), { recursive: true })
      mkdirSync(join(root, 'assets'), { recursive: true })
      writeFileSync(join(root, 'docs/public/project-assets/schema.svg'), '<svg/>')
      writeFileSync(join(root, 'assets/provenance.yml'), `
schema_version: 1
assets:
  - local_file: docs/public/project-assets/schema.svg
    origin: third-party
    subject_id: mcp-spec
    source_url: https://github.com/modelcontextprotocol/modelcontextprotocol/blob/${'b'.repeat(40)}/schema.svg
    source_repo: modelcontextprotocol/modelcontextprotocol
    source_ref: ${'b'.repeat(40)}
    source_path: schema.svg
    license: Apache-2.0
    license_basis: contribution
    license_selector: new-code
    manual_license_review: false
    manual_reviewed_by: null
    manual_review_note: null
    copyright_holder: MCP contributors
    modified: true
    used_by: [project-mcp-python-sdk]
    alt: Schema relationship
    verified_at: '2026-09-26'
`)
      expect(validateProvenanceFile(join(root, 'assets/provenance.yml'), root, catalog))
        .toContain('Contribution-based asset requires recorded human review: docs/public/project-assets/schema.svg')
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('keeps project pages free of remote images', () => {
    for (const path of projectRouteRecords.map(([, route]) => `docs${route.endsWith('/') ? `${route}index` : route}.md`)) {
      expect(readFileSync(path, 'utf8'), path).not.toMatch(/!\[[^\]]*\]\(https?:\/\//u)
    }
  })
})
```

- [ ] **Step 2: Run provenance tests and verify RED**

Run: `pnpm vitest run tests/project-catalog.spec.ts tests/project-pages.spec.ts -t 'project asset provenance'`

Expected: FAIL because the provenance registry and validator do not exist.

- [ ] **Step 3: Create the empty registry and validator**

Create `assets/provenance.yml`:

```yaml
schema_version: 1
assets: []
```

Create `scripts/validate-provenance.mjs`:

```js
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import { parse } from 'yaml'
import { loadProjectCatalog } from './project-catalog.mjs'

const assetRoot = 'docs/public/project-assets'
const shaPattern = /^[0-9a-f]{40}$/u
const datePattern = /^\d{4}-\d{2}-\d{2}$/u
const requiredFields = [
  'local_file', 'origin', 'subject_id', 'source_url', 'source_repo', 'source_ref',
  'source_path', 'license', 'license_basis', 'manual_license_review',
  'manual_reviewed_by', 'manual_review_note', 'copyright_holder', 'modified',
  'used_by', 'alt', 'verified_at',
]

function files(root) {
  if (!existsSync(root)) return []
  return readdirSync(root).flatMap((entry) => {
    const path = join(root, entry)
    return statSync(path).isDirectory() ? files(path) : [path]
  })
}

function pathScopeMatches(path, pattern) {
  if (pattern === '**') return true
  if (pattern.endsWith('/**')) return path.startsWith(pattern.slice(0, -2))
  return path === pattern
}

function pathScopeSpecificity(pattern) {
  return pattern === '**' ? 0 : pattern.replace('/**', '').length
}

export function validateProvenanceFile(
  path,
  root = process.cwd(),
  catalog = null,
) {
  if (!existsSync(path)) return ['Missing assets/provenance.yml']
  let data
  try { data = parse(readFileSync(path, 'utf8')) } catch { return ['Asset provenance YAML cannot be parsed'] }
  const errors = []
  const assets = Array.isArray(data?.assets) ? data.assets : []
  if (data?.schema_version !== 1) errors.push('Asset provenance schema_version must be 1')
  if (!Array.isArray(data?.assets)) errors.push('Asset provenance assets must be an array')
  let projectCatalog = catalog
  if (!projectCatalog) {
    try { projectCatalog = loadProjectCatalog(resolve(root, 'sources/project-index.yml')) }
    catch { return [...errors, 'Asset provenance cannot load a valid project catalog'] }
  }
  const actual = files(resolve(root, assetRoot)).map((file) => relative(root, file).split(sep).join('/'))
  const counts = new Map()
  const subjectById = new Map(projectCatalog.subjects.map((subject) => [subject.id, subject]))
  const pageById = new Map(projectCatalog.pages.map((page) => [page.page_item_id, page]))

  for (const asset of assets) {
    for (const field of requiredFields) {
      if (!Object.hasOwn(asset, field)) errors.push(`Asset ${asset?.local_file ?? '<unknown>'} is missing ${field}`)
    }
    if (!['original', 'third-party'].includes(asset.origin)) errors.push(`Asset ${asset.local_file} has invalid origin`)
    if (typeof asset.local_file !== 'string' || !asset.local_file.startsWith(`${assetRoot}/`) || asset.local_file.includes('..')) {
      errors.push(`Asset path must stay inside ${assetRoot}: ${asset.local_file}`)
    }
    if (!Array.isArray(asset.used_by) || asset.used_by.length === 0) errors.push(`Asset ${asset.local_file} requires used_by`)
    if (!datePattern.test(asset.verified_at ?? '')) errors.push(`Asset ${asset.local_file} has invalid verified_at`)
    if (typeof asset.modified !== 'boolean') errors.push(`Asset ${asset.local_file} requires boolean modified`)
    counts.set(asset.local_file, (counts.get(asset.local_file) ?? 0) + 1)
    if (!actual.includes(asset.local_file)) errors.push(`Provenance record points to a missing file: ${asset.local_file}`)
    if (asset.origin === 'third-party') {
      if (!shaPattern.test(asset.source_ref ?? '')) errors.push(`Third-party asset must use a 40-character source_ref: ${asset.local_file}`)
      let sourceUrl = null
      try { sourceUrl = new URL(asset.source_url) } catch {}
      if (!sourceUrl || sourceUrl.protocol !== 'https:' || sourceUrl.hostname !== 'github.com') {
        errors.push(`Third-party asset URL must use https://github.com: ${asset.local_file}`)
      }
      const subject = subjectById.get(asset.subject_id)
      if (!subject || subject.canonical_repo !== asset.source_repo) {
        errors.push(`Third-party asset source_repo does not match subject: ${asset.local_file}`)
      }
      if (subject && subject.pinned_commit !== asset.source_ref) {
        errors.push(`Third-party asset source_ref does not match subject pin: ${asset.local_file}`)
      }
      const expectedPath = `/${asset.source_repo}/blob/${asset.source_ref}/${asset.source_path}`
      if (!sourceUrl || sourceUrl.pathname !== expectedPath || sourceUrl.search || sourceUrl.hash) {
        errors.push(`Third-party asset URL does not match repo/ref/path: ${asset.local_file}`)
      }
      for (const field of ['source_repo', 'source_path', 'license', 'copyright_holder', 'alt']) {
        if (typeof asset[field] !== 'string' || asset[field].trim() === '') errors.push(`Third-party asset ${asset.local_file} requires ${field}`)
      }
      for (const pageId of asset.used_by ?? []) {
        if (!pageById.get(pageId)?.subjects?.includes(asset.subject_id)) {
          errors.push(`Third-party asset subject is not owned by page ${pageId}: ${asset.local_file}`)
        }
      }

      if (subject && asset.license_basis === 'path') {
        const scopes = subject.license_scopes
          .filter((scope) => scope.basis === 'path' && pathScopeMatches(asset.source_path, scope.path_or_glob))
          .sort((a, b) => pathScopeSpecificity(b.path_or_glob) - pathScopeSpecificity(a.path_or_glob))
        if (scopes.length === 0 || scopes[0].expression !== asset.license) {
          errors.push(`Third-party asset license does not match the most specific path scope: ${asset.local_file}`)
        }
      } else if (subject && asset.license_basis === 'contribution') {
        const scope = subject.license_scopes.find((candidate) =>
          candidate.basis === 'contribution'
          && candidate.expression === asset.license
          && candidate.selector === asset.license_selector,
        )
        if (!scope || asset.manual_license_review !== true
          || typeof asset.manual_reviewed_by !== 'string' || asset.manual_reviewed_by.trim() === ''
          || typeof asset.manual_review_note !== 'string' || asset.manual_review_note.trim() === '') {
          errors.push(`Contribution-based asset requires recorded human review: ${asset.local_file}`)
        }
      } else {
        errors.push(`Third-party asset has invalid license_basis: ${asset.local_file}`)
      }
    }
  }

  for (const file of actual) {
    if (!counts.has(file)) errors.push(`Unregistered project asset: ${file}`)
    if ((counts.get(file) ?? 0) > 1) errors.push(`Duplicate project asset record: ${file}`)
  }
  for (const [file, count] of counts) {
    if (count > 1 && !actual.includes(file)) errors.push(`Duplicate project asset record: ${file}`)
  }
  return errors
}
```

- [ ] **Step 4: Add provenance to the normal validation gate**

Import `validateProvenanceFile` in `scripts/validate-content.mjs` and make `validateBook` append:

```js
...validateProvenanceFile(
  resolve(root, options.provenancePath ?? 'assets/provenance.yml'),
  root,
),
```

The gate runs even when the asset directory is absent; the registry file itself is mandatory.

- [ ] **Step 5: Run focused and full validation**

Run:

```bash
pnpm vitest run tests/project-catalog.spec.ts tests/project-pages.spec.ts -t 'project asset provenance'
pnpm test && pnpm validate && pnpm build
```

Expected: empty provenance is accepted, both malicious fixtures fail as asserted, and all production gates pass.

- [ ] **Step 6: Commit the provenance gate**

```bash
git add assets/provenance.yml scripts/validate-provenance.mjs scripts/validate-content.mjs tests/project-catalog.spec.ts tests/project-pages.spec.ts
git commit -m "feat: enforce project asset provenance"
```

### Task 11: Add project freshness discovery without automatic content edits

**Files:**

- Modify: `sources/project-index.yml`
- Modify: `scripts/project-catalog.mjs`
- Modify: `scripts/project-catalog.d.mts`
- Modify: `docs/.vitepress/theme/data/projectCatalogTypes.ts`
- Create: `scripts/check-projects.mjs`
- Modify: `tests/project-catalog.spec.ts`
- Modify: `tests/source-freshness.spec.ts`
- Modify: `package.json`
- Modify: `.github/workflows/source-freshness.yml`

- [ ] **Step 1: Write failing project freshness tests**

Change the existing YAML import to `import { parse, stringify } from 'yaml'`. Then append tests with injected fetch responses; never call GitHub in unit tests:

```ts
import {
  buildProjectFreshnessReport,
  checkProjectSubject,
  isProjectReportBlocking,
  requestProjectJson,
  runProjectCheck,
} from '../scripts/check-projects.mjs'
import { createHash } from 'node:crypto'

const licenseText = 'MIT fixture license\n'
const licenseDigest = createHash('sha256').update(licenseText).digest('hex')

const projectSubject = {
  id: 'aider',
  canonical_repo: 'Aider-AI/aider',
  canonical_url: 'https://github.com/Aider-AI/aider',
  pin_kind: 'release',
  pinned_ref: 'v0.86.0',
  pinned_commit: 'a'.repeat(40),
  verified_default_branch: 'main',
  verified_default_head: 'a'.repeat(40),
  repository_status: 'active',
  archived: false,
  catalog_tier: 'core',
  watch_url: 'https://github.com/Aider-AI/aider/releases/latest',
  verified_at: '2026-09-26',
  review_by: '2026-10-26',
  license_sources: [{ path: 'LICENSE.txt', sha256: licenseDigest }],
  entrypoints: [{ path: 'aider/main.py', symbols: ['main'], responsibility: 'Validate repository arguments.' }],
}

function projectFetchWithHead(headData: unknown) {
  return async (url: string) => {
    if (url.endsWith('/commits/v0.86.0')) return { status: 200, url, json: async () => ({ sha: 'a'.repeat(40) }) }
    if (url.endsWith('/commits/main')) return { status: 200, url, json: async () => headData }
    if (url.includes('/contents/aider/main.py')) return { status: 200, url, json: async () => ({ path: 'aider/main.py' }) }
    if (url.includes('/contents/LICENSE.txt')) return { status: 200, url, json: async () => ({ path: 'LICENSE.txt', encoding: 'base64', content: Buffer.from(licenseText).toString('base64') }) }
    if (url.endsWith('/releases/latest')) return { status: 200, url, json: async () => ({ tag_name: 'v0.86.0' }) }
    return { status: 200, url, json: async () => ({ full_name: 'Aider-AI/aider', archived: false, default_branch: 'main' }) }
  }
}

function projectFetchWithMalformedEndpoint(
  malformedEndpoint: 'metadata' | 'ref' | 'entrypoint' | 'license' | 'release' | 'tags',
  subject = projectSubject,
) {
  return async (url: string) => {
    const api = `https://api.github.com/repos/${subject.canonical_repo}`
    if (url === api) {
      return { status: 200, url, json: async () => malformedEndpoint === 'metadata'
        ? ({})
        : ({ full_name: subject.canonical_repo, archived: subject.archived, default_branch: subject.verified_default_branch }) }
    }
    if (url.endsWith(`/commits/${subject.verified_default_branch}`)) {
      return { status: 200, url, json: async () => ({ sha: subject.verified_default_head, commit: { committer: { date: '2026-09-26T00:00:00Z' } } }) }
    }
    if (url.endsWith(`/commits/${subject.pinned_ref}`)) {
      return { status: 200, url, json: async () => malformedEndpoint === 'ref' ? ({}) : ({ sha: subject.pinned_commit }) }
    }
    if (url.includes('/contents/aider/main.py')) {
      return { status: 200, url, json: async () => malformedEndpoint === 'entrypoint' ? ({}) : ({ path: 'aider/main.py' }) }
    }
    if (url.includes('/contents/LICENSE.txt')) {
      return { status: 200, url, json: async () => malformedEndpoint === 'license'
        ? ({})
        : ({ path: 'LICENSE.txt', encoding: 'base64', content: Buffer.from(licenseText).toString('base64') }) }
    }
    if (url.endsWith('/releases/latest')) {
      return { status: 200, url, json: async () => malformedEndpoint === 'release' ? ({}) : ({ tag_name: subject.pinned_ref }) }
    }
    if (url.endsWith('/tags?per_page=1')) {
      return { status: 200, url, json: async () => malformedEndpoint === 'tags' ? ({}) : ([{ name: subject.pinned_ref }]) }
    }
    return { status: 404, url, json: async () => ({}) }
  }
}

describe('project freshness checker', () => {
  it('accepts matching canonical metadata, ref, commit, and entrypoints', async () => {
    const result = await checkProjectSubject(projectSubject, {
      retryAttempts: 1,
      now: new Date('2026-09-26T00:00:00Z'),
      fetchImpl: async (url: string) => {
        if (url.endsWith('/commits/v0.86.0')) return { status: 200, url, json: async () => ({ sha: 'a'.repeat(40) }) }
        if (url.endsWith('/commits/main')) return { status: 200, url, json: async () => ({ sha: 'a'.repeat(40), commit: { committer: { date: '2026-09-26T00:00:00Z' } } }) }
        if (url.includes('/contents/aider/main.py')) return { status: 200, url, json: async () => ({ path: 'aider/main.py' }) }
        if (url.includes('/contents/LICENSE.txt')) return { status: 200, url, json: async () => ({ path: 'LICENSE.txt', encoding: 'base64', content: Buffer.from(licenseText).toString('base64') }) }
        if (url.endsWith('/releases/latest')) return { status: 200, url, json: async () => ({ tag_name: 'v0.86.0' }) }
        return { status: 200, url, json: async () => ({ full_name: 'Aider-AI/aider', archived: false, default_branch: 'main' }) }
      },
    })
    expect(result.findings).toEqual([])
    expect(result.license_source_paths).toEqual(['LICENSE.txt'])
  })

  it('reports deterministic pin, path, canonical, archive, and release changes', async () => {
    const result = await checkProjectSubject(projectSubject, {
      retryAttempts: 1,
      now: new Date('2026-09-26T00:00:00Z'),
      fetchImpl: async (url: string) => {
        if (url.endsWith('/commits/v0.86.0')) return { status: 200, url, json: async () => ({ sha: 'b'.repeat(40) }) }
        if (url.endsWith('/commits/main')) return { status: 200, url, json: async () => ({ sha: 'c'.repeat(40), commit: { committer: { date: '2026-09-27T00:00:00Z' } } }) }
        if (url.includes('/contents/')) return { status: 404, url, json: async () => ({}) }
        if (url.endsWith('/releases/latest')) return { status: 200, url, json: async () => ({ tag_name: 'v0.87.0' }) }
        return { status: 200, url, json: async () => ({ full_name: 'NewOwner/aider', archived: true, default_branch: 'main' }) }
      },
    })
    expect(result.findings).toEqual(expect.arrayContaining([
      'canonical_repo_changed', 'repository_status_changed', 'pin_ref_mismatch',
      'entrypoint_missing', 'license_source_missing', 'project_update_available', 'project_review_required',
    ]))
  })

  it('uses the default-branch HEAD commit rather than repository pushed_at', async () => {
    const result = await checkProjectSubject(projectSubject, {
      retryAttempts: 1,
      now: new Date('2026-09-26T00:00:00Z'),
      fetchImpl: async (url: string) => {
        if (url.endsWith('/commits/v0.86.0')) return { status: 200, url, json: async () => ({ sha: 'a'.repeat(40) }) }
        if (url.endsWith('/commits/main')) return { status: 200, url, json: async () => ({ sha: 'c'.repeat(40), commit: { committer: { date: '2026-09-27T00:00:00Z' } } }) }
        if (url.includes('/contents/LICENSE.txt')) return { status: 200, url, json: async () => ({ path: 'LICENSE.txt', encoding: 'base64', content: Buffer.from(licenseText).toString('base64') }) }
        if (url.includes('/contents/')) return { status: 200, url, json: async () => ({ path: 'aider/main.py' }) }
        if (url.endsWith('/releases/latest')) return { status: 200, url, json: async () => ({ tag_name: 'v0.86.0' }) }
        return { status: 200, url, json: async () => ({ full_name: 'Aider-AI/aider', archived: false, default_branch: 'main', pushed_at: '2020-01-01T00:00:00Z' }) }
      },
    })
    expect(result.findings).toEqual(['project_update_available'])
  })

  it('reports a changed default-branch HEAD even when its commit date is the verified date', async () => {
    const result = await checkProjectSubject(projectSubject, {
      retryAttempts: 1,
      now: new Date('2026-09-26T00:00:00Z'),
      fetchImpl: projectFetchWithHead({
        sha: 'c'.repeat(40),
        commit: { committer: { date: '2026-09-26T00:00:00Z' } },
      }),
    })
    expect(result.findings).toEqual(['project_update_available'])
  })

  it('fails closed when the default-branch HEAD response is empty', async () => {
    const result = await checkProjectSubject(projectSubject, {
      retryAttempts: 1,
      now: new Date('2026-09-26T00:00:00Z'),
      fetchImpl: projectFetchWithHead({}),
    })
    expect(result.findings).toEqual(expect.arrayContaining([
      'repository_head_invalid',
      'project_review_required',
    ]))
  })

  it('reports both an update and invalid HEAD when a changed SHA has no commit date', async () => {
    const result = await checkProjectSubject(projectSubject, {
      retryAttempts: 1,
      now: new Date('2026-09-26T00:00:00Z'),
      fetchImpl: projectFetchWithHead({ sha: 'c'.repeat(40) }),
    })
    expect(result.findings).toEqual(expect.arrayContaining([
      'project_update_available',
      'repository_head_invalid',
      'project_review_required',
    ]))
  })

  it('requires review when repository metadata changes the default branch', async () => {
    const result = await checkProjectSubject(projectSubject, {
      retryAttempts: 1,
      now: new Date('2026-09-26T00:00:00Z'),
      fetchImpl: async (url: string) => {
        if (url.endsWith('/commits/trunk')) return { status: 200, url, json: async () => ({ sha: 'a'.repeat(40), commit: { committer: { date: '2026-09-26T00:00:00Z' } } }) }
        if (url.endsWith('/commits/v0.86.0')) return { status: 200, url, json: async () => ({ sha: 'a'.repeat(40) }) }
        if (url.includes('/contents/aider/main.py')) return { status: 200, url, json: async () => ({ path: 'aider/main.py' }) }
        if (url.includes('/contents/LICENSE.txt')) return { status: 200, url, json: async () => ({ path: 'LICENSE.txt', encoding: 'base64', content: Buffer.from(licenseText).toString('base64') }) }
        if (url.endsWith('/releases/latest')) return { status: 200, url, json: async () => ({ tag_name: 'v0.86.0' }) }
        return { status: 200, url, json: async () => ({ full_name: 'Aider-AI/aider', archived: false, default_branch: 'trunk' }) }
      },
    })
    expect(result.findings).toEqual(expect.arrayContaining([
      'default_branch_changed',
      'project_review_required',
    ]))
  })

  it('uses the shared Shanghai date boundary and escalates an expired review', async () => {
    const result = await checkProjectSubject(projectSubject, {
      retryAttempts: 1,
      now: new Date('2026-10-26T16:30:00Z'),
      fetchImpl: async (url: string) => {
        if (url.endsWith('/commits/v0.86.0')) return { status: 200, url, json: async () => ({ sha: 'a'.repeat(40) }) }
        if (url.endsWith('/commits/main')) return { status: 200, url, json: async () => ({ sha: 'a'.repeat(40), commit: { committer: { date: '2026-09-26T00:00:00Z' } } }) }
        if (url.includes('/contents/LICENSE.txt')) return { status: 200, url, json: async () => ({ path: 'LICENSE.txt', encoding: 'base64', content: Buffer.from(licenseText).toString('base64') }) }
        if (url.includes('/contents/')) return { status: 200, url, json: async () => ({ path: 'aider/main.py' }) }
        if (url.endsWith('/releases/latest')) return { status: 200, url, json: async () => ({ tag_name: 'v0.86.0' }) }
        return { status: 200, url, json: async () => ({ full_name: 'Aider-AI/aider', archived: false, default_branch: 'main' }) }
      },
    })
    expect(result.findings).toEqual(['project_review_due', 'project_review_required'])
  })

  it('keeps HTTP, parse, and request failures explicit and non-healthy', async () => {
    const transient = await checkProjectSubject(projectSubject, {
      retryAttempts: 2,
      retryDelayMs: 0,
      now: new Date('2026-09-26T00:00:00Z'),
      fetchImpl: async () => ({ status: 503, url: '', json: async () => ({}) }),
    })
    expect(transient.findings).toContain('project_transient_error')
    const network = await checkProjectSubject(projectSubject, {
      retryAttempts: 1,
      now: new Date('2026-09-26T00:00:00Z'),
      fetchImpl: async () => { throw new Error('ECONNRESET') },
    })
    expect(network.findings).toContain('project_network_error')
    const http = await checkProjectSubject(projectSubject, {
      retryAttempts: 1,
      now: new Date('2026-09-26T00:00:00Z'),
      fetchImpl: async () => ({ status: 418, url: '', json: async () => ({}) }),
    })
    expect(http.findings).toContain('project_http_error')
    const parseFailure = await checkProjectSubject(projectSubject, {
      retryAttempts: 1,
      now: new Date('2026-09-26T00:00:00Z'),
      fetchImpl: async () => ({ status: 200, url: '', json: async () => { throw new Error('truncated json') } }),
    })
    expect(parseFailure.findings).toContain('project_parse_error')
  })

  it.each([
    ['metadata', 'repository_metadata_invalid'],
    ['ref', 'pinned_ref_response_invalid'],
    ['entrypoint', 'entrypoint_response_invalid'],
    ['license', 'license_response_invalid'],
    ['release', 'project_release_response_invalid'],
  ] as const)('fails closed for a malformed %s response', async (endpoint, finding) => {
    const result = await checkProjectSubject(projectSubject, {
      retryAttempts: 1,
      now: new Date('2026-09-26T00:00:00Z'),
      fetchImpl: projectFetchWithMalformedEndpoint(endpoint),
    })
    expect(result.findings).toEqual(expect.arrayContaining([finding, 'project_review_required']))
  })

  it('fails closed for a malformed tags response', async () => {
    const tagSubject = { ...projectSubject, pin_kind: 'tag' }
    const result = await checkProjectSubject(tagSubject, {
      retryAttempts: 1,
      now: new Date('2026-09-26T00:00:00Z'),
      fetchImpl: projectFetchWithMalformedEndpoint('tags', tagSubject),
    })
    expect(result.findings).toEqual(expect.arrayContaining([
      'project_tags_response_invalid',
      'project_review_required',
    ]))
  })

  it('retries JSON parsing before reporting an exhausted parse failure', async () => {
    let attempts = 0
    const recovered = await requestProjectJson('https://api.github.com/repos/example/repo', {
      retryAttempts: 2,
      retryDelayMs: 0,
      fetchImpl: async (url: string) => ({
        status: 200,
        url,
        json: async () => {
          attempts += 1
          if (attempts === 1) throw new Error('truncated json')
          return { full_name: 'example/repo' }
        },
      }),
    })
    expect(attempts).toBe(2)
    expect(recovered).toMatchObject({ failure: null, data: { full_name: 'example/repo' } })
  })

  it('does not treat ordinary rate headers on a 200 parse failure as a retry delay', async () => {
    let attempts = 0
    const sleeps: number[] = []
    const recovered = await requestProjectJson('https://api.github.com/repos/example/repo', {
      retryAttempts: 2,
      retryDelayMs: 10,
      maxRetryDelayMs: 5_000,
      now: new Date('2026-09-26T00:00:00Z'),
      sleepImpl: async (delayMs: number) => { sleeps.push(delayMs) },
      fetchImpl: async (url: string) => ({
        status: 200,
        url,
        headers: new Headers({
          'x-ratelimit-remaining': '4999',
          'x-ratelimit-reset': String(Date.parse('2026-09-26T01:00:00Z') / 1000),
        }),
        json: async () => {
          attempts += 1
          if (attempts === 1) throw new Error('truncated json')
          return { full_name: 'example/repo' }
        },
      }),
    })
    expect(sleeps).toEqual([10])
    expect(recovered.failure).toBeNull()
  })

  it('retries a rate-limited 403 and caps the reset-header delay', async () => {
    let attempts = 0
    const sleeps: number[] = []
    const recovered = await requestProjectJson('https://api.github.com/repos/example/repo', {
      retryAttempts: 2,
      retryDelayMs: 10,
      maxRetryDelayMs: 5_000,
      now: new Date('2026-09-26T00:00:00Z'),
      sleepImpl: async (delayMs: number) => { sleeps.push(delayMs) },
      fetchImpl: async (url: string) => {
        attempts += 1
        if (attempts === 1) {
          return {
            status: 403,
            url,
            headers: new Headers({
              'x-ratelimit-remaining': '0',
              'x-ratelimit-reset': String(Date.parse('2026-09-26T00:01:00Z') / 1000),
            }),
            json: async () => ({}),
          }
        }
        return { status: 200, url, headers: new Headers(), json: async () => ({ ok: true }) }
      },
    })
    expect(attempts).toBe(2)
    expect(sleeps).toEqual([5_000])
    expect(recovered).toMatchObject({ failure: null, data: { ok: true } })
  })

  it('retries a 403 carrying Retry-After even without a remaining header', async () => {
    let attempts = 0
    const sleeps: number[] = []
    const recovered = await requestProjectJson('https://api.github.com/repos/example/repo', {
      retryAttempts: 2,
      retryDelayMs: 10,
      maxRetryDelayMs: 5_000,
      now: new Date('2026-09-26T00:00:00Z'),
      sleepImpl: async (delayMs: number) => { sleeps.push(delayMs) },
      fetchImpl: async (url: string) => {
        attempts += 1
        return attempts === 1
          ? { status: 403, url, headers: new Headers({ 'retry-after': '3' }), json: async () => ({}) }
          : { status: 200, url, headers: new Headers(), json: async () => ({ ok: true }) }
      },
    })
    expect(attempts).toBe(2)
    expect(sleeps).toEqual([3_000])
    expect(recovered.failure).toBeNull()
  })

  it('retries a 403 carrying an explicit rate-limit body signal', async () => {
    let attempts = 0
    const sleeps: number[] = []
    const recovered = await requestProjectJson('https://api.github.com/repos/example/repo', {
      retryAttempts: 2,
      retryDelayMs: 25,
      maxRetryDelayMs: 5_000,
      now: new Date('2026-09-26T00:00:00Z'),
      sleepImpl: async (delayMs: number) => { sleeps.push(delayMs) },
      fetchImpl: async (url: string) => {
        attempts += 1
        return attempts === 1
          ? { status: 403, url, headers: new Headers(), json: async () => ({ message: 'You have exceeded a secondary rate limit.' }) }
          : { status: 200, url, headers: new Headers(), json: async () => ({ ok: true }) }
      },
    })
    expect(attempts).toBe(2)
    expect(sleeps).toEqual([25])
    expect(recovered.failure).toBeNull()
  })

  it('honors Retry-After when retrying a 429', async () => {
    let attempts = 0
    const sleeps: number[] = []
    const recovered = await requestProjectJson('https://api.github.com/repos/example/repo', {
      retryAttempts: 2,
      retryDelayMs: 10,
      maxRetryDelayMs: 5_000,
      now: new Date('2026-09-26T00:00:00Z'),
      sleepImpl: async (delayMs: number) => { sleeps.push(delayMs) },
      fetchImpl: async (url: string) => {
        attempts += 1
        return attempts === 1
          ? { status: 429, url, headers: new Headers({ 'retry-after': '2' }), json: async () => ({}) }
          : { status: 200, url, headers: new Headers(), json: async () => ({ ok: true }) }
      },
    })
    expect(attempts).toBe(2)
    expect(sleeps).toEqual([2_000])
    expect(recovered.failure).toBeNull()
  })

  it('honors the reset header when retrying a 5xx response', async () => {
    let attempts = 0
    const sleeps: number[] = []
    const recovered = await requestProjectJson('https://api.github.com/repos/example/repo', {
      retryAttempts: 2,
      retryDelayMs: 10,
      maxRetryDelayMs: 5_000,
      now: new Date('2026-09-26T00:00:00Z'),
      sleepImpl: async (delayMs: number) => { sleeps.push(delayMs) },
      fetchImpl: async (url: string) => {
        attempts += 1
        return attempts === 1
          ? {
              status: 503,
              url,
              headers: new Headers({ 'x-ratelimit-reset': String(Date.parse('2026-09-26T00:00:04Z') / 1000) }),
              json: async () => ({}),
            }
          : { status: 200, url, headers: new Headers(), json: async () => ({ ok: true }) }
      },
    })
    expect(attempts).toBe(2)
    expect(sleeps).toEqual([4_000])
    expect(recovered.failure).toBeNull()
  })

  it('does not retry an ordinary 403', async () => {
    let attempts = 0
    const sleeps: number[] = []
    const result = await requestProjectJson('https://api.github.com/repos/example/repo', {
      retryAttempts: 3,
      retryDelayMs: 10,
      maxRetryDelayMs: 5_000,
      now: new Date('2026-09-26T00:00:00Z'),
      sleepImpl: async (delayMs: number) => { sleeps.push(delayMs) },
      fetchImpl: async (url: string) => {
        attempts += 1
        return { status: 403, url, headers: new Headers(), json: async () => ({}) }
      },
    })
    expect(attempts).toBe(1)
    expect(sleeps).toEqual([])
    expect(result).toMatchObject({ status: 403, failure: 'http' })
  })

  it('fuses a full scan when Retry-After exceeds the default 30 second sleep budget', async () => {
    const outputRoot = mkdtempSync(join(tmpdir(), 'project-freshness-budget-'))
    const sleeps: number[] = []
    let requests = 0
    try {
      const report = await runProjectCheck({
        outputJson: join(outputRoot, 'project-freshness.json'),
        outputMarkdown: join(outputRoot, 'project-freshness.md'),
        retryAttempts: 3,
        maxRetryDelayMs: 60_000,
        clock: () => new Date('2026-09-26T00:00:00Z'),
        sleepImpl: async (delayMs: number) => { sleeps.push(delayMs) },
        fetchImpl: async (url: string) => {
          requests += 1
          return {
            status: 429,
            url,
            headers: new Headers({ 'retry-after': '3600' }),
            json: async () => ({}),
          }
        },
      })
      expect(sleeps).toEqual([])
      expect(requests).toBe(1)
      expect(report.results).toHaveLength(13)
      expect(report.results[0].findings).toEqual(expect.arrayContaining([
        'project_retry_budget_exhausted',
        'project_transient_error',
      ]))
      expect(report.results.slice(1).every((result: any) =>
        result.findings.includes('project_scan_skipped_after_budget'))).toBe(true)
      expect(isProjectReportBlocking(report)).toBe(true)
    } finally {
      rmSync(outputRoot, { recursive: true, force: true })
    }
  })

  it('creates a fresh retry budget for every run', async () => {
    const outputRoot = mkdtempSync(join(tmpdir(), 'project-freshness-budget-reset-'))
    const requestCounts: number[] = []
    const sleepTotals: number[] = []
    try {
      for (let run = 0; run < 2; run += 1) {
        let requests = 0
        let slept = 0
        const report = await runProjectCheck({
          outputJson: join(outputRoot, `project-freshness-${run}.json`),
          outputMarkdown: join(outputRoot, `project-freshness-${run}.md`),
          retryAttempts: 2,
          maxRetryDelayMs: 1_000,
          retryBudgetMs: 1_000,
          retrySleepBudgetMs: 1_000,
          clock: () => new Date('2026-09-26T00:00:00Z'),
          sleepImpl: async (delayMs: number) => { slept += delayMs },
          fetchImpl: async (url: string) => {
            requests += 1
            return {
              status: 429,
              url,
              headers: new Headers({ 'retry-after': '3600' }),
              json: async () => ({}),
            }
          },
        })
        requestCounts.push(requests)
        sleepTotals.push(slept)
        expect(isProjectReportBlocking(report)).toBe(true)
      }
      expect(requestCounts).toEqual([2, 2])
      expect(sleepTotals).toEqual([1_000, 1_000])
    } finally {
      rmSync(outputRoot, { recursive: true, force: true })
    }
  })

  it('checks the 120 second wall-clock budget before every request', async () => {
    const outputRoot = mkdtempSync(join(tmpdir(), 'project-freshness-wall-budget-'))
    let requests = 0
    let clockMs = Date.parse('2026-09-26T00:00:00Z')
    try {
      const report = await runProjectCheck({
        outputJson: join(outputRoot, 'project-freshness.json'),
        outputMarkdown: join(outputRoot, 'project-freshness.md'),
        clock: () => new Date(clockMs),
        sleepImpl: async () => { throw new Error('must not sleep') },
        fetchImpl: async (url: string) => {
          requests += 1
          clockMs += 120_000
          return {
            status: 200,
            url,
            headers: new Headers(),
            json: async () => ({
              full_name: 'modelcontextprotocol/modelcontextprotocol',
              archived: false,
              default_branch: 'main',
            }),
          }
        },
      })
      expect(requests).toBe(1)
      expect(report.results[0].findings).toEqual(expect.arrayContaining([
        'project_retry_budget_exhausted',
        'project_transient_error',
      ]))
      expect(report.results[1].findings).toEqual(['project_scan_skipped_after_budget'])
    } finally {
      rmSync(outputRoot, { recursive: true, force: true })
    }
  })

  it('caps each request at three attempts', async () => {
    let attempts = 0
    const result = await requestProjectJson('https://api.github.com/repos/example/repo', {
      retryAttempts: 99,
      retryDelayMs: 0,
      sleepImpl: async () => {},
      fetchImpl: async (url: string) => {
        attempts += 1
        return { status: 503, url, headers: new Headers(), json: async () => ({}) }
      },
    })
    expect(attempts).toBe(3)
    expect(result.failure).toBe('transient')
  })

  it('escalates a changed license digest to manual review', async () => {
    const result = await checkProjectSubject(projectSubject, {
      retryAttempts: 1,
      now: new Date('2026-09-26T00:00:00Z'),
      fetchImpl: async (url: string) => {
        if (url.endsWith('/commits/v0.86.0')) return { status: 200, url, json: async () => ({ sha: 'a'.repeat(40) }) }
        if (url.endsWith('/commits/main')) return { status: 200, url, json: async () => ({ sha: 'a'.repeat(40), commit: { committer: { date: '2026-09-26T00:00:00Z' } } }) }
        if (url.includes('/contents/LICENSE.txt')) return { status: 200, url, json: async () => ({ path: 'LICENSE.txt', encoding: 'base64', content: Buffer.from('changed license').toString('base64') }) }
        if (url.includes('/contents/')) return { status: 200, url, json: async () => ({ path: 'aider/main.py' }) }
        if (url.endsWith('/releases/latest')) return { status: 200, url, json: async () => ({ tag_name: 'v0.86.0' }) }
        return { status: 200, url, json: async () => ({ full_name: 'Aider-AI/aider', archived: false, default_branch: 'main' }) }
      },
    })
    expect(result.findings).toEqual(expect.arrayContaining(['license_changed', 'project_review_required']))
  })

  it('sends the token only to api.github.com and fails closed on invalid schema', async () => {
    const seen = new Map<string, string | undefined>()
    await checkProjectSubject(projectSubject, {
      githubToken: 'read-token',
      retryAttempts: 1,
      now: new Date('2026-09-26T00:00:00Z'),
      fetchImpl: async (url: string, init?: { headers?: Record<string, string> }) => {
        seen.set(url, init?.headers?.authorization)
        return { status: 200, url, json: async () => url.endsWith('/commits/v0.86.0')
          ? ({ sha: 'a'.repeat(40) })
          : url.endsWith('/commits/main') ? ({ sha: 'a'.repeat(40), commit: { committer: { date: '2026-09-26T00:00:00Z' } } })
          : url.includes('/contents/LICENSE.txt') ? ({ path: 'LICENSE.txt', encoding: 'base64', content: Buffer.from(licenseText).toString('base64') })
            : url.includes('/contents/') ? ({ path: 'aider/main.py' })
            : url.endsWith('/releases/latest') ? ({ tag_name: 'v0.86.0' })
              : ({ full_name: 'Aider-AI/aider', archived: false, default_branch: 'main' }) }
      },
    })
    expect([...seen.entries()].every(([url, auth]) => url.startsWith('https://api.github.com/') && auth === 'Bearer read-token')).toBe(true)

    let externalAuthorization: string | undefined
    await requestProjectJson('https://github.com/example/repo', {
      githubToken: 'read-token',
      retryAttempts: 1,
      retryDelayMs: 0,
      fetchImpl: async (_url: string, init?: { headers?: Record<string, string> }) => {
        externalAuthorization = init?.headers?.authorization
        return { status: 200, json: async () => ({}) }
      },
    })
    expect(externalAuthorization).toBeUndefined()

    const outputRoot = mkdtempSync(join(tmpdir(), 'project-freshness-'))
    try {
      const report = await runProjectCheck({
        projectPath: join(outputRoot, 'missing-project-index.yml'),
        outputJson: join(outputRoot, 'project-freshness.json'),
        outputMarkdown: join(outputRoot, 'project-freshness.md'),
        now: new Date('2026-09-26T00:00:00Z'),
        fetchImpl: async () => { throw new Error('must not fetch') },
      })
      expect(report.needs_review).toBe(true)
      expect(report.results[0].findings).toContain('project_schema_invalid')
    } finally {
      rmSync(outputRoot, { recursive: true, force: true })
    }
  })

  it('renders schema validation details in the Markdown report', async () => {
    const outputRoot = mkdtempSync(join(tmpdir(), 'project-freshness-schema-report-'))
    const outputMarkdown = join(outputRoot, 'project-freshness.md')
    try {
      await runProjectCheck({
        projectPath: join(outputRoot, 'missing-project-index.yml'),
        outputJson: join(outputRoot, 'project-freshness.json'),
        outputMarkdown,
        now: new Date('2026-09-26T00:00:00Z'),
        fetchImpl: async () => { throw new Error('must not fetch') },
      })
      expect(readFileSync(outputMarkdown, 'utf8')).toContain('Missing sources/project-index.yml')
    } finally {
      rmSync(outputRoot, { recursive: true, force: true })
    }
  })

  it('bounds schema details in Markdown with deterministic truncation markers', async () => {
    const outputRoot = mkdtempSync(join(tmpdir(), 'project-freshness-schema-limits-'))
    const projectPath = join(outputRoot, 'project-index.yml')
    const outputMarkdown = join(outputRoot, 'project-freshness.md')
    const longId = 'x'.repeat(500)
    writeFileSync(projectPath, stringify({
      schema_version: 0,
      defaults: {},
      pages: [],
      chains: [],
      subjects: Array.from({ length: 25 }, () => ({ id: longId })),
    }))
    try {
      await runProjectCheck({
        projectPath,
        outputJson: join(outputRoot, 'project-freshness.json'),
        outputMarkdown,
        now: new Date('2026-09-26T00:00:00Z'),
        fetchImpl: async () => { throw new Error('must not fetch') },
      })
      const markdown = readFileSync(outputMarkdown, 'utf8')
      expect(markdown).toContain('[truncated]')
      expect(markdown).toMatch(/additional schema errors omitted/u)
      expect(markdown).not.toContain(longId)
      expect(markdown.match(/^    - /gmu)?.length).toBeLessThanOrEqual(21)
    } finally {
      rmSync(outputRoot, { recursive: true, force: true })
    }
  })

  it('checks every catalog entrypoint and both pinned and default-branch license copies', async () => {
    const catalog = parse(readFileSync('sources/project-index.yml', 'utf8')) as any
    const subjects = catalog.subjects.map((subject: any) => ({ ...catalog.defaults, ...subject }))
    expect(subjects).toHaveLength(13)
    expect(subjects.flatMap((subject: any) => subject.entrypoints)).toHaveLength(66)
    expect(subjects.flatMap((subject: any) => subject.license_sources)).toHaveLength(14)

    const seen = new Set<string>()
    const outputRoot = mkdtempSync(join(tmpdir(), 'project-freshness-catalog-'))
    try {
      const report = await runProjectCheck({
        outputJson: join(outputRoot, 'project-freshness.json'),
        outputMarkdown: join(outputRoot, 'project-freshness.md'),
        now: new Date('2026-09-26T00:00:00Z'),
        fetchImpl: async (url: string) => {
          seen.add(url)
          const subject = subjects.find((item: any) => url.startsWith(`https://api.github.com/repos/${item.canonical_repo}`))
          if (!subject) return { status: 404, url, json: async () => ({}) }
          const api = `https://api.github.com/repos/${subject.canonical_repo}`
          if (url === api) return { status: 200, url, json: async () => ({ full_name: subject.canonical_repo, archived: subject.archived, default_branch: subject.verified_default_branch }) }
          if (url.endsWith(`/commits/${encodeURIComponent(subject.verified_default_branch)}`)) return { status: 200, url, json: async () => ({ sha: subject.verified_default_head, commit: { committer: { date: `${subject.verified_at}T00:00:00Z` } } }) }
          if (url.includes('/commits/')) return { status: 200, url, json: async () => ({ sha: subject.pinned_commit }) }
          if (url.includes('/contents/')) {
            const path = decodeURIComponent(url.split('/contents/')[1].split('?')[0])
            return { status: 200, url, json: async () => ({ path, encoding: 'base64', content: Buffer.from('license fixture').toString('base64') }) }
          }
          if (url.endsWith('/tags?per_page=1')) return { status: 200, url, json: async () => ([{ name: subject.pinned_ref }]) }
          return { status: 200, url, json: async () => ({ tag_name: subject.pinned_ref }) }
        },
      })

      expect(report.results).toHaveLength(13)
      for (const subject of subjects) {
        for (const entrypoint of subject.entrypoints) {
          const path = entrypoint.path.split('/').map(encodeURIComponent).join('/')
          expect(seen).toContain(`https://api.github.com/repos/${subject.canonical_repo}/contents/${path}?ref=${subject.pinned_commit}`)
        }
        for (const license of subject.license_sources) {
          const path = license.path.split('/').map(encodeURIComponent).join('/')
          expect(seen).toContain(`https://api.github.com/repos/${subject.canonical_repo}/contents/${path}?ref=${subject.pinned_commit}`)
          expect(seen).toContain(`https://api.github.com/repos/${subject.canonical_repo}/contents/${path}?ref=${subject.verified_default_branch}`)
        }
      }
    } finally {
      rmSync(outputRoot, { recursive: true, force: true })
    }
  })

  it('builds a stable issue summary', () => {
    expect(buildProjectFreshnessReport([
      { id: 'ok', license_source_paths: ['LICENSE'], findings: [] },
      { id: 'changed', license_source_paths: ['LICENSE'], findings: ['project_update_available'] },
    ], '2026-09-26T00:00:00.000Z').summary).toEqual({ total: 2, healthy: 1, needs_review: 1 })
    expect(isProjectReportBlocking(buildProjectFreshnessReport([
      { id: 'update', license_source_paths: ['LICENSE'], findings: ['project_update_available'] },
    ]))).toBe(false)
    expect(isProjectReportBlocking(buildProjectFreshnessReport([
      { id: 'license', license_source_paths: ['LICENSE'], findings: ['project_review_required'] },
    ]))).toBe(true)
    expect(isProjectReportBlocking(buildProjectFreshnessReport([
      { id: 'network', license_source_paths: ['LICENSE'], findings: ['project_network_error'] },
    ]))).toBe(true)
  })

  it('exposes the local project-check command', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
    expect(packageJson.scripts['projects:check']).toBe('node scripts/check-projects.mjs')
  })

  it('keeps write permission and repository execution in separate workflow jobs', () => {
    const workflow = parse(readFileSync('.github/workflows/source-freshness.yml', 'utf8')) as any
    expect(workflow.jobs.scan.permissions).toEqual({ contents: 'read' })
    expect(workflow.jobs.scan.steps.find((step: any) => step.uses === 'actions/checkout@v4').with['persist-credentials']).toBe(false)
    expect(workflow.jobs.scan.steps.some((step: any) => step.run === 'pnpm projects:check')).toBe(true)
    expect(workflow.jobs.scan.steps.find((step: any) => step.uses === 'actions/upload-artifact@v4').with.path).toBe('reports/*freshness.*')
    expect(workflow.jobs.report.permissions).toEqual({ contents: 'read', issues: 'write' })
    expect(workflow.jobs.report.if).toContain('default_branch')
    expect(workflow.jobs.report.steps.map((step: any) => step.uses)).toEqual([
      'actions/download-artifact@v4',
      'actions/github-script@v7',
    ])
    expect(workflow.jobs.report.steps.every((step: any) => !Object.hasOwn(step, 'run'))).toBe(true)
    const reportScript = workflow.jobs.report.steps.find((step: any) => step.uses === 'actions/github-script@v7').with.script
    expect(reportScript).toContain('[Freshness] Source review required')
    expect(reportScript).toContain('[Freshness] Project review required')
  })
})
```

- [ ] **Step 2: Run project freshness tests and verify RED**

Run: `pnpm vitest run tests/source-freshness.spec.ts -t 'project freshness checker'`

Expected: FAIL because `scripts/check-projects.mjs` does not exist.

- [ ] **Step 3: Implement the bounded GitHub checker**

Create `scripts/check-projects.mjs` with these public contracts:

```js
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parse } from 'yaml'
import { validateProjectCatalogFile } from './project-catalog.mjs'
import { reviewDateInTimeZone } from './review-date.mjs'

const retryable = new Set([408, 429, 500, 502, 503, 504])
const shaPattern = /^[0-9a-f]{40}$/iu
const maxSchemaErrors = 20
const maxSchemaErrorLength = 240
export const defaultProjectRetryBudgetMs = 120_000
export const defaultProjectRetrySleepBudgetMs = 30_000
const maxRequestAttempts = 3

function responseHeader(response, name) {
  if (typeof response?.headers?.get === 'function') return response.headers.get(name)
  if (!response?.headers || typeof response.headers !== 'object') return null
  const key = Object.keys(response.headers).find((item) => item.toLowerCase() === name.toLowerCase())
  return key ? String(response.headers[key]) : null
}

function timeMilliseconds(valueOrClock) {
  const value = typeof valueOrClock === 'function' ? valueOrClock() : valueOrClock
  return value instanceof Date ? value.getTime() : new Date(value).getTime()
}

function headerDelayMs(response, clock) {
  const delays = []
  const retryAfter = responseHeader(response, 'retry-after')
  if (retryAfter !== null && retryAfter.trim() !== '') {
    const seconds = Number(retryAfter)
    const delay = Number.isFinite(seconds)
      ? seconds * 1_000
      : Date.parse(retryAfter) - timeMilliseconds(clock)
    if (Number.isFinite(delay)) delays.push(Math.max(0, delay))
  }
  const resetHeader = responseHeader(response, 'x-ratelimit-reset')
  if (resetHeader !== null && resetHeader.trim() !== '') {
    const reset = Number(resetHeader)
    if (Number.isFinite(reset)) delays.push(Math.max(0, (reset * 1_000) - timeMilliseconds(clock)))
  }
  return delays.length > 0 ? Math.max(...delays) : null
}

function retryDelay(response, { attempt, retryDelayMs, maxRetryDelayMs, clock }) {
  const requested = headerDelayMs(response, clock) ?? retryDelayMs * attempt
  return Math.min(Math.max(0, requested), maxRetryDelayMs)
}

function createRetryBudget(retryBudgetMs, retrySleepBudgetMs, clock) {
  return {
    deadlineMs: timeMilliseconds(clock) + retryBudgetMs,
    remainingSleepMs: retrySleepBudgetMs,
    exhausted: false,
    clock,
  }
}

function retryBudgetAllowsRequest(retryBudget) {
  if (!retryBudget) return true
  if (retryBudget.exhausted || timeMilliseconds(retryBudget.clock) >= retryBudget.deadlineMs) {
    retryBudget.exhausted = true
    return false
  }
  return true
}

function claimRetryDelay(retryBudget, delayMs) {
  if (!retryBudget) return true
  if (!retryBudgetAllowsRequest(retryBudget)) return false
  const remainingWallMs = retryBudget.deadlineMs - timeMilliseconds(retryBudget.clock)
  if (delayMs > retryBudget.remainingSleepMs || delayMs > remainingWallMs) {
    retryBudget.exhausted = true
    return false
  }
  retryBudget.remainingSleepMs -= delayMs
  return true
}

function retryBudgetFailure(status = 0) {
  return { status, data: null, failure: 'budget' }
}

function markExhaustedAfterFinalRetry(retryBudget) {
  if (!retryBudget) return false
  if (retryBudget.remainingSleepMs <= 0
    || timeMilliseconds(retryBudget.clock) >= retryBudget.deadlineMs) {
    retryBudget.exhausted = true
    return true
  }
  return false
}

async function isRateLimited403(response) {
  if (response.status !== 403) return false
  if (responseHeader(response, 'x-ratelimit-remaining') === '0') return true
  const retryAfter = responseHeader(response, 'retry-after')
  if (retryAfter !== null && retryAfter.trim() !== '') return true
  try {
    const body = await response.json()
    const message = typeof body?.message === 'string' ? body.message : ''
    return /(?:secondary\s+)?rate\s+limit|abuse\s+detection/iu.test(message)
  } catch {
    return false
  }
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function nonEmpty(value) {
  return typeof value === 'string' && value.trim() !== ''
}

function validCommitSha(value) {
  return typeof value === 'string' && shaPattern.test(value)
}

function validCommitDate(value) {
  return typeof value === 'string' && Number.isFinite(Date.parse(value))
}

function validBase64Content(value) {
  if (typeof value !== 'string') return false
  const compact = value.replace(/\s/gu, '')
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/u.test(compact)) {
    return false
  }
  return Buffer.from(compact, 'base64').toString('base64') === compact
}

export async function requestProjectJson(url, {
  fetchImpl = fetch,
  githubToken,
  retryAttempts = 3,
  retryDelayMs = 250,
  maxRetryDelayMs = 60_000,
  now = new Date(),
  clock = () => now,
  sleepImpl = (delayMs) => new Promise((done) => setTimeout(done, delayMs)),
  retryBudget,
} = {}) {
  const attemptLimit = Math.min(maxRequestAttempts, Math.max(1, Math.trunc(retryAttempts)))
  for (let attempt = 1; attempt <= attemptLimit; attempt += 1) {
    if (!retryBudgetAllowsRequest(retryBudget)) return retryBudgetFailure()
    try {
      const isGitHubApi = new URL(url).hostname === 'api.github.com'
      const response = await fetchImpl(url, {
        signal: AbortSignal.timeout(12_000),
        headers: {
          accept: 'application/vnd.github+json',
          'user-agent': 'agent-engineering-handbook-project-check/1.0',
          ...(githubToken && isGitHubApi ? { authorization: `Bearer ${githubToken}` } : {}),
        },
      })
      const responseIsRetryable = retryable.has(response.status) || await isRateLimited403(response)
      if (responseIsRetryable && attempt < attemptLimit) {
        const delayMs = retryDelay(response, {
          attempt,
          retryDelayMs,
          maxRetryDelayMs,
          clock,
        })
        if (!claimRetryDelay(retryBudget, delayMs)) return retryBudgetFailure(response.status)
        await sleepImpl(delayMs)
        continue
      }
      if (response.status >= 400) {
        if (responseIsRetryable && markExhaustedAfterFinalRetry(retryBudget)) {
          return retryBudgetFailure(response.status)
        }
        return {
          status: response.status,
          data: null,
          failure: responseIsRetryable ? 'transient' : 'http',
        }
      }
      try {
        return { status: response.status, data: await response.json(), failure: null }
      } catch {
        if (attempt === attemptLimit) {
          if (markExhaustedAfterFinalRetry(retryBudget)) return retryBudgetFailure(response.status)
          return { status: response.status, data: null, failure: 'parse' }
        }
        const delayMs = Math.min(retryDelayMs * attempt, maxRetryDelayMs)
        if (!claimRetryDelay(retryBudget, delayMs)) return retryBudgetFailure(response.status)
        await sleepImpl(delayMs)
      }
    } catch {
      if (attempt === attemptLimit) {
        if (markExhaustedAfterFinalRetry(retryBudget)) return retryBudgetFailure()
        return { status: 0, data: null, failure: 'network' }
      }
      const delayMs = Math.min(retryDelayMs * attempt, maxRetryDelayMs)
      if (!claimRetryDelay(retryBudget, delayMs)) return retryBudgetFailure()
      await sleepImpl(delayMs)
    }
  }
  return { status: 0, data: null, failure: 'network' }
}

function recordFailure(findings, response) {
  if (response.failure === 'budget') {
    findings.push('project_retry_budget_exhausted', 'project_transient_error')
  } else if (response.failure === 'transient') findings.push('project_transient_error')
  else if (response.failure === 'network') findings.push('project_network_error')
  else if (response.failure === 'parse') findings.push('project_parse_error')
  else if (response.failure === 'http') findings.push('project_http_error')
}

function requireReview(findings, detail) {
  findings.push(detail, 'project_review_required')
}

function githubContentSha256(data) {
  if (data?.encoding !== 'base64' || typeof data.content !== 'string') return null
  const content = Buffer.from(data.content.replace(/\n/gu, ''), 'base64')
  return createHash('sha256').update(content).digest('hex')
}

function projectResult(subject, findings) {
  return {
    id: subject.id,
    license_source_paths: subject.license_sources.map((source) => source.path),
    findings: [...new Set(findings)],
  }
}

export async function checkProjectSubject(subject, {
  fetchImpl = fetch,
  githubToken = process.env.GITHUB_TOKEN,
  now = new Date(),
  retryAttempts = 3,
  retryDelayMs = 250,
  maxRetryDelayMs = 60_000,
  clock = () => now,
  sleepImpl = (delayMs) => new Promise((done) => setTimeout(done, delayMs)),
  retryBudget,
} = {}) {
  const api = `https://api.github.com/repos/${subject.canonical_repo}`
  const options = {
    fetchImpl,
    githubToken,
    retryAttempts,
    retryDelayMs,
    maxRetryDelayMs,
    now,
    clock,
    sleepImpl,
    retryBudget,
  }
  const findings = []
  let defaultBranch = null

  if (!retryBudgetAllowsRequest(retryBudget)) {
    recordFailure(findings, retryBudgetFailure())
    return projectResult(subject, findings)
  }

  const metadata = await requestProjectJson(api, options)
  if (metadata.failure) {
    recordFailure(findings, metadata)
    if (metadata.failure === 'budget') return projectResult(subject, findings)
  } else {
    const metadataData = metadata.data
    defaultBranch = metadataData?.default_branch
    if (!isRecord(metadataData)
      || !nonEmpty(metadataData.full_name)
      || typeof metadataData?.archived !== 'boolean'
      || !nonEmpty(defaultBranch)) {
      requireReview(findings, 'repository_metadata_invalid')
    }
    if (nonEmpty(metadataData?.full_name) && metadataData.full_name !== subject.canonical_repo) {
      requireReview(findings, 'canonical_repo_changed')
    }
    if (typeof metadataData?.archived === 'boolean' && metadataData.archived !== subject.archived) {
      requireReview(findings, 'repository_status_changed')
    }
    if (nonEmpty(defaultBranch) && defaultBranch !== subject.verified_default_branch) {
      requireReview(findings, 'default_branch_changed')
    }
  }

  if (defaultBranch) {
    const head = await requestProjectJson(`${api}/commits/${encodeURIComponent(defaultBranch)}`, options)
    if (head.failure) {
      recordFailure(findings, head)
      if (head.failure === 'budget') return projectResult(subject, findings)
    } else {
      const headSha = head.data?.sha
      const headDate = head.data?.commit?.committer?.date
      if (validCommitSha(headSha) && headSha !== subject.verified_default_head) {
        findings.push('project_update_available')
      }
      if (!isRecord(head.data) || !validCommitSha(headSha) || !validCommitDate(headDate)) {
        requireReview(findings, 'repository_head_invalid')
      }
    }
  }

  const ref = await requestProjectJson(`${api}/commits/${encodeURIComponent(subject.pinned_ref)}`, options)
  if (ref.failure) {
    recordFailure(findings, ref)
    if (ref.failure === 'budget') return projectResult(subject, findings)
  }
  else if (!isRecord(ref.data) || !validCommitSha(ref.data.sha)) {
    requireReview(findings, 'pinned_ref_response_invalid')
  } else if (ref.data.sha !== subject.pinned_commit) {
    requireReview(findings, 'pin_ref_mismatch')
  }

  for (const entrypoint of subject.entrypoints) {
    const encodedPath = entrypoint.path.split('/').map(encodeURIComponent).join('/')
    const entry = await requestProjectJson(
      `${api}/contents/${encodedPath}?ref=${subject.pinned_commit}`,
      options,
    )
    if (entry.failure === 'http' && entry.status === 404) {
      requireReview(findings, 'entrypoint_missing')
    } else if (entry.failure) {
      recordFailure(findings, entry)
      if (entry.failure === 'budget') return projectResult(subject, findings)
    } else if (!isRecord(entry.data) || entry.data.path !== entrypoint.path) {
      requireReview(findings, 'entrypoint_response_invalid')
    }
  }

  for (const source of subject.license_sources) {
    const encodedPath = source.path.split('/').map(encodeURIComponent).join('/')
    const refs = [...new Set([subject.pinned_commit, defaultBranch].filter(Boolean))]
    for (const refName of refs) {
      const license = await requestProjectJson(
        `${api}/contents/${encodedPath}?ref=${encodeURIComponent(refName)}`,
        options,
      )
      if (license.failure === 'http' && license.status === 404) {
        requireReview(findings, 'license_source_missing')
      } else if (license.failure) {
        recordFailure(findings, license)
        if (license.failure === 'budget') return projectResult(subject, findings)
      } else if (!isRecord(license.data)
        || license.data.path !== source.path
        || license.data.encoding !== 'base64'
        || !validBase64Content(license.data.content)) {
        requireReview(findings, 'license_response_invalid')
      } else if (githubContentSha256(license.data) !== source.sha256) {
        requireReview(findings, 'license_changed')
      }
    }
  }

  if (subject.pin_kind !== 'commit') {
    const latestUrl = subject.pin_kind === 'tag'
      ? `${api}/tags?per_page=1`
      : `${api}/releases/latest`
    const latest = await requestProjectJson(latestUrl, options)
    if (latest.failure === 'http' && latest.status === 404) {
      requireReview(findings, 'project_release_missing')
    } else if (latest.failure) {
      recordFailure(findings, latest)
      if (latest.failure === 'budget') return projectResult(subject, findings)
    } else {
      const validLatest = subject.pin_kind === 'tag'
        ? Array.isArray(latest.data) && isRecord(latest.data[0]) && nonEmpty(latest.data[0].name)
        : isRecord(latest.data) && nonEmpty(latest.data.tag_name)
      if (!validLatest) {
        requireReview(findings, subject.pin_kind === 'tag'
          ? 'project_tags_response_invalid'
          : 'project_release_response_invalid')
      } else {
        const latestRef = subject.pin_kind === 'tag' ? latest.data[0].name : latest.data.tag_name
        if (latestRef !== subject.pinned_ref) findings.push('project_update_available')
      }
    }
  }

  if (subject.review_by < reviewDateInTimeZone(now)) {
    requireReview(findings, 'project_review_due')
  }
  return projectResult(subject, findings)
}

export function buildProjectFreshnessReport(results, generatedAt = new Date().toISOString()) {
  const flagged = results.filter((result) => result.findings.length > 0)
  return {
    generated_at: generatedAt,
    summary: {
      total: results.length,
      healthy: results.length - flagged.length,
      needs_review: flagged.length,
    },
    needs_review: flagged.length > 0,
    results,
  }
}

const blockingFindings = new Set([
  'project_review_required',
  'project_transient_error',
  'project_network_error',
  'project_parse_error',
  'project_http_error',
  'project_schema_invalid',
  'project_retry_budget_exhausted',
  'project_scan_skipped_after_budget',
])

export function isProjectReportBlocking(report) {
  return report.results.some(
    (result) => result.findings.some((finding) => blockingFindings.has(finding)),
  )
}

function renderProjectReport(report) {
  const lines = ['# Project freshness report', '', `Generated: ${report.generated_at}`, '']
  for (const result of report.results.filter((item) => item.findings.length > 0)) {
    lines.push(`- ${result.id}: ${result.findings.join(', ')}`)
    if (result.license_source_paths.length > 0) {
      lines.push(`  - License sources: ${result.license_source_paths.join(', ')}`)
    }
    if (Array.isArray(result.schema_errors) && result.schema_errors.length > 0) {
      lines.push('  - Schema errors:')
      for (const error of result.schema_errors.slice(0, maxSchemaErrors)) {
        const normalized = String(error).replace(/\s+/gu, ' ').trim()
        const marker = '... [truncated]'
        const detail = normalized.length > maxSchemaErrorLength
          ? `${normalized.slice(0, maxSchemaErrorLength - marker.length)}${marker}`
          : normalized
        lines.push(`    - ${detail}`)
      }
      if (result.schema_errors.length > maxSchemaErrors) {
        lines.push(`    - ... ${result.schema_errors.length - maxSchemaErrors} additional schema errors omitted.`)
      }
    }
  }
  lines.push('', 'Automated findings request review; they never authorize content changes.', '')
  return lines.join('\n')
}

export async function runProjectCheck({
  projectPath = resolve('sources/project-index.yml'),
  outputJson = resolve('reports/project-freshness.json'),
  outputMarkdown = resolve('reports/project-freshness.md'),
  fetchImpl = fetch,
  githubToken = process.env.GITHUB_TOKEN,
  now = new Date(),
  retryAttempts = 3,
  retryDelayMs = 250,
  maxRetryDelayMs = 60_000,
  retryBudgetMs = defaultProjectRetryBudgetMs,
  retrySleepBudgetMs = defaultProjectRetrySleepBudgetMs,
  clock = () => new Date(),
  sleepImpl = (delayMs) => new Promise((done) => setTimeout(done, delayMs)),
} = {}) {
  const schemaErrors = validateProjectCatalogFile(projectPath)
  let report
  if (schemaErrors.length > 0) {
    report = buildProjectFreshnessReport([{
      id: 'project-catalog',
      license_source_paths: [],
      findings: ['project_schema_invalid'],
      schema_errors: schemaErrors,
    }], now.toISOString())
  } else {
    const data = parse(readFileSync(projectPath, 'utf8'))
    const subjects = data.subjects.map((subject) => ({ ...data.defaults, ...subject }))
    const retryBudget = createRetryBudget(retryBudgetMs, retrySleepBudgetMs, clock)
    const results = []
    for (const subject of subjects) {
      if (!retryBudgetAllowsRequest(retryBudget)) {
        results.push(projectResult(subject, ['project_scan_skipped_after_budget']))
        continue
      }
      results.push(await checkProjectSubject(subject, {
        fetchImpl,
        githubToken,
        now,
        retryAttempts,
        retryDelayMs,
        maxRetryDelayMs,
        clock,
        sleepImpl,
        retryBudget,
      }))
    }
    report = buildProjectFreshnessReport(results, now.toISOString())
  }
  mkdirSync(dirname(outputJson), { recursive: true })
  mkdirSync(dirname(outputMarkdown), { recursive: true })
  writeFileSync(outputJson, `${JSON.stringify(report, null, 2)}\n`)
  writeFileSync(outputMarkdown, renderProjectReport(report))
  return report
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : ''
if (invokedPath && pathToFileURL(invokedPath).href === import.meta.url) {
  const report = await runProjectCheck()
  console.log(JSON.stringify(report.summary))
  if (process.argv.includes('--strict') && isProjectReportBlocking(report)) process.exitCode = 1
}
```

Keep findings additive: a failed API check cannot produce a healthy subject. Do not send `githubToken` to `github.com`, raw content hosts, or any canonical page URL.

- [ ] **Step 4: Add the command and workflow steps**

Add to `package.json` scripts:

```json
"projects:check": "node scripts/check-projects.mjs"
```

In the workflow scan job, after `pnpm sources:check`, add:

```yaml
- name: Check project pins
  run: pnpm projects:check
  env:
    GITHUB_TOKEN: ${{ github.token }}
```

Change the artifact path to:

```yaml
path: reports/*freshness.*
```

In the report job, replace the single-report logic with this exact loop:

```js
const reports = [
  { file: 'source-freshness', title: '[Freshness] Source review required' },
  { file: 'project-freshness', title: '[Freshness] Project review required' },
]
const { owner, repo } = context.repo
const issues = await github.paginate(github.rest.issues.listForRepo, {
  owner, repo, state: 'open', per_page: 100,
})
for (const item of reports) {
  const report = JSON.parse(fs.readFileSync(`reports/${item.file}.json`, 'utf8'))
  const body = fs.readFileSync(`reports/${item.file}.md`, 'utf8')
  const existing = issues.find((issue) => !issue.pull_request && issue.title === item.title)
  if (report.needs_review && existing) {
    await github.rest.issues.update({ owner, repo, issue_number: existing.number, body })
  } else if (report.needs_review) {
    await github.rest.issues.create({ owner, repo, title: item.title, body })
  } else if (existing) {
    await github.rest.issues.update({ owner, repo, issue_number: existing.number, state: 'closed', body: `${body}\n\nAll automated findings are cleared.` })
  }
}
```

Keep `persist-credentials: false`, job-level `contents: read`, report-job `issues: write`, the default-branch `if`, and the existing concurrency group.

- [ ] **Step 5: Run focused, full, and real read-only checks**

Run:

```bash
pnpm vitest run tests/source-freshness.spec.ts -t 'project freshness checker'
pnpm test && pnpm validate && pnpm build
GITHUB_TOKEN="$(gh auth token)" pnpm projects:check
```

Expected: unit tests pass; real report has 13 results; default-branch HEAD is compared directly with `verified_default_head`; ordinary upstream changes appear only as `project_update_available`; malformed endpoint shapes and bounded schema reporting are covered. Every request gets at most three attempts; the scan shares a 120-second wall-clock and 30-second sleep budget. The subject that exhausts the budget records both `project_retry_budget_exhausted` and `project_transient_error`; later subjects record only `project_scan_skipped_after_budget`. All three findings remain strict-blocking, and injected `clock`/`sleepImpl` make the behavior deterministic.

- [ ] **Step 6: Commit project freshness automation**

```bash
git add sources/project-index.yml scripts/project-catalog.mjs scripts/project-catalog.d.mts docs/.vitepress/theme/data/projectCatalogTypes.ts scripts/check-projects.mjs tests/project-catalog.spec.ts tests/source-freshness.spec.ts package.json .github/workflows/source-freshness.yml
git commit -m "feat: monitor pinned project sources"
```

### Task 12: Require the complete approved project publication set

**Files:**

- Create: `scripts/publication-contracts.mjs`
- Modify: `scripts/check-dist.mjs`
- Modify: `tests/content.spec.ts`
- Modify: `tests/project-pages.spec.ts`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

- [ ] **Step 1: Write failing structured publication-contract tests**

Add final tests for all of these contracts before implementation:

- normalize POSIX and Windows separators, reject absolute/drive/NUL/traversal paths, preserve case sensitivity, detect normalized collisions, and return a structured error for both valid and dangling symlinks;
- parse course and project HTML structurally so comments, scripts, styles, templates, and unrelated text cannot satisfy the contract;
- render Markdown through VitePress and inspect its tokens/HTML rather than scanning raw source strings; fenced code, inline code, comments, `template`, `pre`, `svg`, `noscript`, `script`, and `style` cannot create fake headings, links, images, or forbidden visible text;
- require the exact 26 clean root-relative course anchors and the exact catalog-derived project document anchors, source anchors, license anchors, and interview anchors, with no duplicate, missing, or unexpected internal/external anchor;
- reject remote images in Markdown, HTML `src`, `srcset`, `picture/source`, `noscript`, SVG `href`/`xlink:href`, protocol-relative URLs, backslash/control-character variants, malformed URLs, and comma-bearing data-URL candidate lists; allow only explicit local, `data:`, and `blob:` candidates;
- require real visible `h2` elements in exact order, real visible “固定版本/关键源码入口” text, all eight approved outputs, and no extra project/Lab/capstone/superpowers output.

Run:

```bash
pnpm vitest run tests/content.spec.ts tests/project-pages.spec.ts -t 'progressive project publication boundary|project publication boundary|project routes and catalog overview'
```

Expected: RED against the string/regex-based validator; failures must identify the specific path, anchor, image, or structural contract.

- [ ] **Step 2: Add the parsing dependencies directly**

Run:

```bash
pnpm add -D parse5@8.0.1 parse-srcset@1.0.2
```

The final direct dependency contract is `"parse5": "8.0.1"` and `"parse-srcset": "1.0.2"`; both must appear in `package.json` and `pnpm-lock.yaml`.

- [ ] **Step 3: Add the shared publication parser**

Create `scripts/publication-contracts.mjs` exactly as follows:

```js
import { existsSync, lstatSync, readdirSync, statSync } from 'node:fs'
import { join, posix, relative } from 'node:path'
import parseSrcset from 'parse-srcset'
import { parse, parseFragment } from 'parse5'

const hiddenHtmlElements = new Set(['script', 'style', 'template', 'noscript'])
const hiddenMarkdownHtmlElements = new Set([
  ...hiddenHtmlElements,
  'code',
  'pre',
  'svg',
  'publication-hidden',
])
const hiddenImageHtmlElements = new Set(['script', 'style', 'template'])
const hiddenMarkdownImageHtmlElements = new Set([...hiddenImageHtmlElements, 'code', 'pre'])
const localImageBase = new URL('https://local.invalid/')

function attribute(node, name) {
  return node.attrs?.find((candidate) => candidate.name === name)?.value
}

function hasClass(node, expected) {
  return (attribute(node, 'class') ?? '').split(/\s+/u).includes(expected)
}

function visitElements(nodes, callback, hidden = false, hiddenElements = hiddenHtmlElements) {
  for (const node of nodes ?? []) {
    const nextHidden = hidden || hiddenElements.has(node.tagName)
    if (!nextHidden && node.tagName) callback(node)
    if (!nextHidden) visitElements(node.childNodes, callback, false, hiddenElements)
  }
}

function elementsWithin(roots, predicate, hiddenElements = hiddenHtmlElements) {
  const matches = []
  visitElements(roots, (node) => {
    if (predicate(node)) matches.push(node)
  }, false, hiddenElements)
  return matches
}

function visibleText(node, ignoredClasses = new Set(), hiddenElements = hiddenHtmlElements) {
  if (hiddenElements.has(node.tagName) || [...ignoredClasses].some((name) => hasClass(node, name))) {
    return ''
  }
  if (node.nodeName === '#text') return node.value ?? ''
  return (node.childNodes ?? [])
    .map((child) => visibleText(child, ignoredClasses, hiddenElements))
    .join(' ')
}

function normalizedVisibleText(nodes, hiddenElements = hiddenHtmlElements) {
  return nodes.map((node) => visibleText(node, new Set(['header-anchor']), hiddenElements))
    .join(' ')
    .replace(/\p{White_Space}+/gu, ' ')
    .trim()
}

function normalizeRenderedMarkdownHref(href) {
  return typeof href === 'string' && href.startsWith('/')
    ? href.replace(/\.html(?=#|$)/u, '')
    : href
}

function hrefsWithin(roots, hiddenElements = hiddenHtmlElements) {
  return elementsWithin(roots, (node) => node.tagName === 'a', hiddenElements)
    .map((node) => attribute(node, 'href') ?? null)
}

function parseSrcsetCandidates(srcset) {
  try {
    return parseSrcset(srcset).map((candidate) => candidate.url)
  } catch {
    return [null]
  }
}

function imageCandidatesWithin(roots, hiddenElements = hiddenImageHtmlElements) {
  return elementsWithin(
    roots,
    (node) => ['img', 'source', 'image'].includes(node.tagName),
    hiddenElements,
  ).flatMap((node) => {
    if (node.tagName === 'image') {
      return (node.attrs ?? [])
        .filter((candidate) => candidate.name === 'href')
        .map((candidate) => candidate.value)
    }
    return [
      ...(attribute(node, 'src') === undefined ? [] : [attribute(node, 'src')]),
      ...parseSrcsetCandidates(attribute(node, 'srcset') ?? ''),
    ]
  })
}

function listFiles(root) {
  if (!existsSync(root)) return { files: [], errors: [] }
  const files = []
  const errors = []
  for (const entry of readdirSync(root)) {
    const path = join(root, entry)
    const metadata = lstatSync(path)
    if (metadata.isSymbolicLink()) {
      try {
        statSync(path)
        errors.push({ path, kind: 'symlink' })
      } catch {
        errors.push({ path, kind: 'unreadable' })
      }
    } else if (metadata.isDirectory()) {
      const nested = listFiles(path)
      files.push(...nested.files)
      errors.push(...nested.errors)
    } else {
      files.push(path)
    }
  }
  return { files, errors }
}

export function normalizePublishedOutputPath(file) {
  if (
    file.includes('\0')
    || file.startsWith('/')
    || file.startsWith('\\')
    || /^[A-Za-z]:/u.test(file)
  ) {
    return null
  }

  const normalized = posix.normalize(file.replace(/\\/gu, '/'))
  return normalized === '..' || normalized.startsWith('../') ? null : normalized
}

export function indexDistFiles(root) {
  const files = new Map()
  const rawFiles = []
  const errors = []
  const listed = listFiles(root)
  for (const issue of listed.errors) {
    const raw = relative(root, issue.path)
    errors.push(issue.kind === 'unreadable'
      ? `构建产物包含无法读取的文件：${raw}`
      : `构建产物包含符号链接：${raw}`)
  }
  for (const absolute of listed.files) {
    const raw = relative(root, absolute)
    rawFiles.push(raw)
    const normalized = normalizePublishedOutputPath(raw)
    if (normalized === null) continue
    if (files.has(normalized)) {
      errors.push(`构建产物路径规范化后重复：${normalized}`)
      continue
    }
    files.set(normalized, absolute)
  }
  return { files, rawFiles, errors }
}

export function normalizeCleanCourseHref(href, siteBase) {
  if (
    typeof href !== 'string'
    || !href.startsWith('/')
    || href.startsWith('//')
    || href.includes('\\')
  ) {
    return null
  }
  try {
    const url = new URL(href, 'https://course.invalid')
    if (
      url.origin !== 'https://course.invalid'
      || url.search !== ''
      || url.hash !== ''
      || url.pathname !== href
      || !url.pathname.startsWith(`${siteBase}/`)
    ) {
      return null
    }
    const route = url.pathname.slice(siteBase.length)
    return route.endsWith('/') ? null : route
  } catch {
    return null
  }
}

export function extractCourseHtmlContract(html) {
  const document = parse(html)
  const courseMaps = elementsWithin(document.childNodes, (node) => hasClass(node, 'course-map'))
  const vpDocs = elementsWithin(document.childNodes, (node) => hasClass(node, 'vp-doc'))
  const pageRoots = vpDocs.length > 0 ? vpDocs : courseMaps
  return {
    hrefs: hrefsWithin(courseMaps),
    courseText: courseMaps.map((node) => visibleText(node)).join(' '),
    pageText: pageRoots.map((node) => visibleText(node)).join(' '),
  }
}

export function extractProjectHtmlContract(html) {
  const document = parse(html, { scriptingEnabled: false })
  const vpDocs = elementsWithin(document.childNodes, (node) => hasClass(node, 'vp-doc'))
  const headings = elementsWithin(vpDocs, (node) => node.tagName === 'h2')
    .map((node) => visibleText(node, new Set(['header-anchor'])).replace(/\s+/gu, ' ').trim())
  const sourceSections = elementsWithin(vpDocs, (node) => hasClass(node, 'project-source-links'))
  const metaSections = elementsWithin(vpDocs, (node) => hasClass(node, 'project-meta'))
  const licenseSections = elementsWithin(metaSections, (node) => node.tagName === 'details')
  return {
    text: normalizedVisibleText(vpDocs),
    headings,
    images: imageCandidatesWithin(vpDocs),
    hrefs: elementsWithin(vpDocs, (node) =>
      node.tagName === 'a' && !hasClass(node, 'header-anchor'))
      .map((node) => attribute(node, 'href') ?? null),
    sourceHrefs: hrefsWithin(sourceSections),
    licenseHrefs: hrefsWithin(licenseSections),
  }
}

export function extractProjectMarkdownContract(text, renderer) {
  const source = text.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/u, '')
  const contentSource = source.replace(
    /<(\/?)\s*(template|code|pre|svg|script|style|noscript)\b[^>]*>/giu,
    (match, closing) => closing === '/'
      ? '</publication-hidden>'
      : /\/\s*>$/u.test(match)
        ? '<publication-hidden></publication-hidden>'
        : '<publication-hidden>',
  )
  const root = parseFragment(renderer.render(contentSource), { scriptingEnabled: false })
  const imageRoot = parseFragment(renderer.render(source), { scriptingEnabled: false })
  const headings = elementsWithin(
    root.childNodes,
    (node) => node.tagName === 'h2',
    hiddenMarkdownHtmlElements,
  ).map((node) => normalizedVisibleText([node], hiddenMarkdownHtmlElements))
  const links = elementsWithin(
    root.childNodes,
    (node) => node.tagName === 'a' && !hasClass(node, 'header-anchor'),
    hiddenMarkdownHtmlElements,
  ).map((node) => normalizeRenderedMarkdownHref(attribute(node, 'href') ?? null))
  return {
    headings,
    links,
    images: imageCandidatesWithin(imageRoot.childNodes, hiddenMarkdownImageHtmlElements),
    text: normalizedVisibleText(root.childNodes, hiddenMarkdownHtmlElements),
  }
}

export function validatePinnedGithubSourceHref(href, expectedHref) {
  if (href !== expectedHref) return false
  try {
    const url = new URL(href)
    return url.protocol === 'https:'
      && url.hostname === 'github.com'
      && url.username === ''
      && url.password === ''
      && url.port === ''
      && url.search === ''
      && url.hash === ''
  } catch {
    return false
  }
}

export function isRemoteImageCandidate(candidate) {
  if (typeof candidate !== 'string' || candidate.trim() === '') return true
  const value = candidate.trim()
  const withoutAsciiControls = value.replace(/[\u0009\u000A\u000C\u000D]/gu, '')
  try {
    const url = new URL(value, localImageBase)
    if (url.protocol === 'data:' || url.protocol === 'blob:') return false
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return true
    return url.origin !== localImageBase.origin
      || /^(?:https?:|\/\/)/iu.test(withoutAsciiControls)
  } catch {
    return true
  }
}
```

The parser is the only source of publication extraction semantics. Both source-Markdown tests and built-HTML validation must reuse it; do not add a second regex parser.

- [ ] **Step 4: Replace the dist validator with the final structured implementation**

Use the following final `scripts/check-dist.mjs`:

```js
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { loadProjectCatalog } from './project-catalog.mjs'
import {
  extractCourseHtmlContract,
  extractProjectHtmlContract,
  indexDistFiles,
  isRemoteImageCandidate,
  normalizeCleanCourseHref,
  normalizePublishedOutputPath,
  validatePinnedGithubSourceHref,
} from './publication-contracts.mjs'

const courseStages = [
  '基础认知',
  '核心机制',
  '生产工程',
  '应用模式',
  '项目拆解',
  '综合实战',
]

const publishedCourseRoutes = [
  '/preface',
  '/chapters/01-ai-native',
  '/chapters/02-workflow-agent',
  '/chapters/03-react',
  '/chapters/04-tools-mcp',
  '/frontier/context-engineering',
  '/chapters/05-state-memory',
  '/chapters/06-loop-graph',
  '/chapters/07-multi-agent',
  '/frontier/interoperability-identity',
  '/chapters/08-evaluation',
  '/chapters/09-safety-recovery',
  '/chapters/10-production',
  '/frontier/durable-execution',
  '/frontier/agent-security-evaluation',
  '/chapters/11-research-agent',
  '/chapters/12-service-operations-agent',
  '/chapters/13-coding-agent',
  '/chapters/14-computer-use',
  '/projects/mcp-python-sdk',
  '/projects/aider',
  '/projects/openhands',
  '/projects/agent-benchmarks',
  '/projects/dify',
  '/projects/crewai',
  '/case-study/delivery-agent',
]

const forbiddenCourseMarkers = ['/labs/', '/capstone/', '标记已读', '加入书签']
const siteBase = '/agent-engineering-for-beginners'
const projectCatalog = loadProjectCatalog(new URL('../sources/project-index.yml', import.meta.url))

export const approvedProjectFiles = new Set([
  'projects/index.html',
  'projects/mcp-python-sdk.html',
  'projects/aider.html',
  'projects/openhands.html',
  'projects/agent-benchmarks.html',
  'projects/dify.html',
  'projects/crewai.html',
  'projects/history-autogpt-flowise.html',
])

const coreProjectFiles = new Set([
  'projects/mcp-python-sdk.html',
  'projects/aider.html',
  'projects/openhands.html',
  'projects/agent-benchmarks.html',
  'projects/dify.html',
  'projects/crewai.html',
])
const dissectionProjectFiles = new Set([
  ...coreProjectFiles,
  'projects/history-autogpt-flowise.html',
])
const coreProjectHeadings = [
  '30 秒结论', '为什么选', '版本与边界', '原创建筑图', '唯一纵向调用链',
  '关键源码入口', '一次请求的数据流', '阅读练习', '失败边界', '生产边界',
  '高频面试点', '升级复核', '来源与归因',
]

export function validatePublishedRouteBoundary(relativeFiles) {
  const forbidden = relativeFiles.filter((file) => {
    const normalized = normalizePublishedOutputPath(file)
    return normalized === null
      || /^(?:labs|capstone|superpowers)(?:\.html|\/)/iu.test(normalized)
      || (/^projects(?:\.html|\/)/iu.test(normalized) && !approvedProjectFiles.has(normalized))
  })
  return forbidden.length === 0
    ? []
    : [`构建产物包含未批准项目、实验或综合实战页面：${forbidden.join(', ')}`]
}

export function validateCourseDist(html) {
  const errors = []
  const contract = extractCourseHtmlContract(html)
  const normalizedHrefs = contract.hrefs.map((href) => normalizeCleanCourseHref(href, siteBase))
  const hasEveryRouteOnce = publishedCourseRoutes.every((route) =>
    normalizedHrefs.filter((href) => href === route).length === 1,
  )

  if (
    normalizedHrefs.length !== 26
    || normalizedHrefs.includes(null)
    || new Set(normalizedHrefs).size !== 26
    || !hasEveryRouteOnce
  ) {
    errors.push('课程页必须包含 26 个唯一的公开课程链接')
  }
  if (!contract.courseText.includes('本地进度将在页面加载后显示')) {
    errors.push('课程页缺少 SSR 中性进度文案')
  }
  for (const stage of courseStages) {
    if (!contract.courseText.includes(stage)) errors.push(`课程页缺少阶段：${stage}`)
  }
  for (const marker of forbiddenCourseMarkers) {
    if (contract.pageText.includes(marker)) errors.push(`课程页包含未发布入口或写操作：${marker}`)
  }

  return errors
}

function projectSourceUrl(subject, sourcePath) {
  const encodedPath = sourcePath.split('/').map(encodeURIComponent).join('/')
  return `https://github.com/${subject.canonical_repo}/blob/${subject.pinned_commit}/${encodedPath}`
}

function expectedProjectHrefs(file) {
  const slug = file.slice('projects/'.length, -'.html'.length)
  const page = projectCatalog.pages.find((candidate) =>
    candidate.page_item_id === `project-${slug}`)
  const subjects = page.subjects.map((subjectId) =>
    projectCatalog.subjects.find((candidate) => candidate.id === subjectId))
  return {
    page,
    subjects,
    sources: subjects.flatMap((subject) => subject.entrypoints.map((entry) =>
      projectSourceUrl(subject, entry.path))),
    licenses: subjects.flatMap((subject) => subject.license_sources.map((source) =>
      projectSourceUrl(subject, source.path))),
  }
}

function expectedProjectDocumentHrefs(file) {
  if (file === 'projects/index.html') {
    const page = projectCatalog.pages.find((candidate) => candidate.page_item_id === 'projects-index')
    const projectLinks = projectCatalog.pages.slice(1).map((candidate) =>
      `${siteBase}/projects/${candidate.page_item_id.slice('project-'.length)}`)
    const watchLinks = page.subjects
      .map((subjectId) => projectCatalog.subjects.find((candidate) => candidate.id === subjectId))
      .filter((subject) => subject.catalog_tier === 'watch-only')
      .map((subject) => subject.canonical_url)
    return [
      ...projectLinks,
      ...watchLinks,
      `${siteBase}/frontier/agent-security-evaluation`,
      `${siteBase}/chapters/09-safety-recovery`,
      `${siteBase}/radar/`,
      `${siteBase}/case-study/delivery-agent`,
    ]
  }

  const expected = expectedProjectHrefs(file)
  const metadata = expected.subjects.flatMap((subject) => [
    subject.canonical_url,
    subject.watch_url,
  ])
  const interview = expected.page.interview_question_ids.map((id) => {
    const chapter = id.match(/^iq-(\d{2})-[a-z]$/u)?.[1]
    const route = publishedCourseRoutes.find((candidate) =>
      candidate.startsWith(`/chapters/${chapter}-`))
    return `${siteBase}${route}#${id}`
  })
  return [...metadata, ...expected.licenses, ...expected.sources, ...interview]
}

function exactPinnedHrefs(actual, expected) {
  return actual.length === expected.length
    && new Set(actual).size === actual.length
    && actual.every((href) => expected.some((candidate) =>
      validatePinnedGithubSourceHref(href, candidate)))
}

function exactHrefs(actual, expected) {
  return actual.length === expected.length
    && new Set(actual).size === actual.length
    && actual.every((href) => expected.includes(href))
}

export function validateDist(distPath) {
  if (!existsSync(distPath)) return [`构建产物不存在：${distPath}`]

  const errors = []
  const indexed = indexDistFiles(distPath)
  const relativeFiles = [...indexed.files.keys()]
  errors.push(...indexed.errors)
  const leaked = relativeFiles.filter((file) =>
    file.split(/[\\/]/).some((segment) => segment.toLowerCase() === 'superpowers'))
  if (leaked.length > 0) errors.push(`构建产物泄露 superpowers 页面：${leaked.join(', ')}`)
  errors.push(...validatePublishedRouteBoundary(indexed.rawFiles))
  for (const file of approvedProjectFiles) {
    if (!relativeFiles.includes(file)) errors.push(`构建产物缺少项目页面：${file}`)
  }
  if (!relativeFiles.includes('index.html')) errors.push('构建产物缺少 index.html')

  const coursePath = indexed.files.get('course/index.html')
  if (coursePath === undefined) {
    errors.push('构建产物缺少 course/index.html')
  } else {
    errors.push(...validateCourseDist(readFileSync(coursePath, 'utf8')))
  }

  for (const route of publishedCourseRoutes) {
    const relativeTarget = route.endsWith('/')
      ? `${route.slice(1)}index.html`
      : `${route.slice(1)}.html`
    if (!relativeFiles.includes(relativeTarget)) {
      errors.push(`构建产物缺少公开课程目标：${relativeTarget}`)
    }
  }

  const projectContracts = new Map()
  for (const file of approvedProjectFiles) {
    const projectPath = indexed.files.get(file)
    if (projectPath === undefined) continue
    const contract = extractProjectHtmlContract(readFileSync(projectPath, 'utf8'))
    projectContracts.set(file, contract)
    if (!exactHrefs(contract.hrefs, expectedProjectDocumentHrefs(file))) {
      errors.push(`项目页链接不符合公开契约：${file}`)
    }
  }

  for (const file of dissectionProjectFiles) {
    const contract = projectContracts.get(file)
    if (contract === undefined) continue
    if (!contract.text.includes('固定版本')) errors.push(`项目页缺少固定版本：${file}`)
    if (!contract.text.includes('关键源码入口')) errors.push(`项目页缺少源码入口：${file}`)
    const projectHrefs = [...contract.sourceHrefs, ...contract.licenseHrefs]
    if (projectHrefs.some((href) => /\/blob\/(?:main|master)\//u.test(href))) {
      errors.push(`项目页包含移动分支源码链接：${file}`)
    }
    if (!projectHrefs.some((href) => /\/blob\/[0-9a-f]{40}\//u.test(href))) {
      errors.push(`项目页缺少固定 commit 源码链接：${file}`)
    }
    if (contract.images.some(isRemoteImageCandidate)) {
      errors.push(`项目页包含外链图片：${file}`)
    }
    const expected = expectedProjectHrefs(file)
    if (
      !exactPinnedHrefs(contract.sourceHrefs, expected.sources)
      || !exactPinnedHrefs(contract.licenseHrefs, expected.licenses)
    ) {
      errors.push(`项目页源码与许可链接不符合 catalog：${file}`)
    }
    if (coreProjectFiles.has(file)) {
      if (
        contract.headings.length !== coreProjectHeadings.length
        || contract.headings.some((heading, index) => heading !== coreProjectHeadings[index])
      ) {
        errors.push(`核心项目页章节结构不匹配：${file}`)
      }
      for (const heading of coreProjectHeadings) {
        if (!contract.headings.includes(heading)) errors.push(`核心项目页缺少章节 ${heading}：${file}`)
      }
    }
  }

  return errors
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : ''
if (invokedPath && pathToFileURL(invokedPath).href === import.meta.url) {
  const distPath = resolve(process.argv[2] ?? 'docs/.vitepress/dist')
  const errors = validateDist(distPath)
  if (errors.length > 0) {
    for (const error of errors) console.error(`- ${error}`)
    process.exitCode = 1
  } else {
    console.log('dist validation passed')
  }
}
```

This keeps the progressive allowlist reusable while the final `validateDist` requires all eight outputs. Every discovered file is canonicalized before validation; comparison remains POSIX and case-sensitive, and symlinks are findings rather than traversal inputs.

- [ ] **Step 5: Add the final regression matrix**

In `tests/content.spec.ts`, extend `createCompleteDistFixture` with catalog-derived metadata, source, license, interview, and overview anchors, and preserve real `h2` elements. The final test groups and cases are:

```text
progressive project publication boundary
  allows any subset of the eight approved project outputs during implementation
  allows every approved project output with POSIX and Windows separators
  still rejects unapproved projects and every lab or capstone output
  rejects absolute paths, Windows drive paths, and NUL bytes
project publication boundary
  returns a structured error for dangling dist symlinks
  canonicalizes Windows-style approved outputs before every dist check
  rejects output paths that collide after POSIX normalization
  requires every approved project output
  rejects extra project, lab, and capstone pages
  requires 26 exact course links and accepts only the eight approved project pages
  ignores comment and script bait instead of treating it as course markup
  accepts only clean root-relative exact course URLs
  enforces immutable, local, and complete static project output
  ignores project contract bait in comments, scripts, styles, and templates
  rejects every remote image candidate in structured project HTML
  allows explicit local, data, and blob image candidates in project HTML
  requires real project sections and h2 elements instead of string bait
  requires the exact catalog-derived project source and license URLs
  rejects missing and unexpected project source or license anchors
  rejects unexpected internal or external anchors anywhere in the project document
project routes and catalog overview
  enforces the project page contract for every reading-only page
  ignores fenced and commented fake Markdown contracts
  normalizes browser-visible text across Markdown and HTML formatting
  collects real Markdown and inline HTML links and images in source order
  collects remote image candidates from Markdown, srcset, picture, and noscript
  classifies image candidates with WHATWG URL semantics and fails closed
  keeps project pages free of remote images for project asset provenance
```

The Markdown tests must construct `const markdown = await createMarkdownRenderer(resolve('docs'))`, call `extractProjectMarkdownContract(text, markdown)`, compare `contract.headings` with the exact 13-heading array, compare `contract.links` in source order, and filter `contract.images` through `isRemoteImageCandidate`.

- [ ] **Step 6: Run the full publication gate**

Run:

```bash
pnpm vitest run tests/content.spec.ts tests/project-pages.spec.ts
pnpm test
pnpm validate
pnpm build
```

Expected: all structured-source and built-output cases pass; `pnpm build` ends with `dist validation passed`.

- [ ] **Step 7: Commit the publication contract**

```bash
git add scripts/publication-contracts.mjs scripts/check-dist.mjs tests/content.spec.ts tests/project-pages.spec.ts package.json pnpm-lock.yaml
git commit -m "test: enforce project publication boundaries"
```

### Task 13: Document and harden the final project-reading release

**Files:**

- Modify: `README.md`
- Modify: `docs/.vitepress/theme/components/ProjectMeta.vue`
- Modify: `docs/.vitepress/theme/components/ProjectSourceLinks.vue`
- Modify: `docs/.vitepress/theme/style.css`
- Modify: `sources/source-index.yml`
- Modify: `tests/content.spec.ts`
- Modify: `tests/project-pages.spec.ts`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Verify only: every file changed by Tasks 1–12

- [ ] **Step 1: Document the project-reading boundary**

Insert this exact README section before “学习入口”:

```md
## 开源项目拆解

`/projects/` 提供六个核心源码拆解：MCP 规范与 Python SDK、Aider、OpenHands、SWE-bench/τ²-bench、Dify、CrewAI。每页固定 commit（上游提交）、许可证作用域和一条纵向调用链；AutoGPT/Flowise 只作为历史反例，Hermes Agent/OpenClaw 只作为高权限观察项。

这些页面是阅读型源码课程，不会安装或运行上游项目。Python Lab Kit 属于下一阶段；在独立设计、离线 fixture、成本上限和清理流程完成前，仓库不会发布 `/labs/`。

```

The README must describe six core dissections, fixed upstream commits, the historical/watch-only split, and the explicit no-Lab boundary without linking to `/labs/`.

- [ ] **Step 2: Record the manually verified source baseline**

Update these two `sources/source-index.yml` records exactly:

```yaml
  - id: pydantic-ai-repository
    title: Pydantic AI
    publisher: Pydantic
    url: https://github.com/pydantic/pydantic-ai
    grade: A
    accessed: '2026-09-25'
    version: rolling
    last_verified: '2026-09-26'
    review_by: '2026-10-26'
    watch_url: https://github.com/pydantic/pydantic-ai/releases/latest
    impact_chapters: ['04', '09']
    note: 人工核验至 Pydantic AI v2.51.0，未改变现有稳定结论；学习类型约束、结构化结果和依赖注入，不把类型安全等同于事实正确。
  - id: google-adk-repository
    title: Agent Development Kit for Python
    publisher: Google
    url: https://github.com/google/adk-python
    grade: A
    accessed: '2026-09-25'
    version: rolling
    last_verified: '2026-09-26'
    review_by: '2026-10-26'
    watch_url: https://github.com/google/adk-python/releases/latest
    impact_chapters: ['07', '08']
    note: 人工核验至 Google ADK v2.10.0，未改变现有稳定结论；学习代码优先的 agent 组合、评测与部署接口；效率指标列入下一期 Radar 候选，当前不改正文。
```

Add exact `tests/content.spec.ts` assertions for every field above. The pre-refresh report had six `repository_updated` findings, including `pydantic-ai-repository` and `google-adk-repository`. After commit `5507d60`, the recorded report is `{ total: 33, healthy: 29, needs_review: 4 }`; only `langgraph-repository`, `crewai-repository`, `langfuse-repository`, and `phoenix-repository` remain, each with exactly `repository_updated`. This refresh updates review metadata only and does not change chapter conclusions.

- [ ] **Step 3: Render explicit print-only source and license URLs**

Use the final `ProjectSourceLinks.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { getProjectPage, getProjectSubject, projectSourceUrl } from '../data/projectCatalog'

const props = defineProps<{ projectId: string }>()
const rows = computed(() => getProjectPage(props.projectId).subjects.flatMap((subjectId) => {
  const subject = getProjectSubject(subjectId)
  return subject.entrypoints.map((entry) => ({
    subjectId,
    repo: subject.canonical_repo,
    path: entry.path,
    symbols: entry.symbols,
    responsibility: entry.responsibility,
    href: projectSourceUrl(subjectId, entry.path),
  }))
}))
</script>

<template>
  <ol class="project-source-links" role="list">
    <li v-for="row in rows" :key="`${row.subjectId}:${row.path}`" role="listitem">
      <a :href="row.href"><code>{{ row.path }}</code></a>
      <strong>{{ row.symbols.join(' · ') }}</strong>
      <span>{{ row.responsibility }}</span>
      <small>{{ row.repo }} · 固定 commit</small>
      <span class="project-source-print-url" aria-hidden="true">{{ row.href }}</span>
    </li>
  </ol>
</template>
```

Use the final `ProjectMeta.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { getProjectPage, getProjectSubject, projectSourceUrl } from '../data/projectCatalog'

const props = defineProps<{ projectId: string }>()
const page = computed(() => getProjectPage(props.projectId))
const subjects = computed(() => page.value.subjects.map(getProjectSubject))
const tierLabel = computed(() => page.value.catalog_tier === 'core' ? '核心拆解' : '历史反例')
const statusLabels: Record<string, string> = { active: '活跃', archived: '已归档', eol: '已停止维护' }
const statusLabel = (status: string) => statusLabels[status] ?? status
</script>

<template>
  <aside class="project-meta" aria-label="项目版本与许可边界">
    <p><strong>教学层级：</strong>{{ tierLabel }}</p>
    <ul role="list">
      <li v-for="subject in subjects" :key="subject.id" role="listitem">
        <a :href="subject.canonical_url">{{ subject.canonical_repo }}</a>
        <span><strong>固定版本：</strong>{{ subject.pinned_ref }} · <code>{{ subject.pinned_commit }}</code></span>
        <span><strong>仓库状态：</strong>{{ statusLabel(subject.repository_status) }}<template v-if="subject.archived"> · GitHub 已归档</template></span>
        <span><strong>核验：</strong>{{ subject.verified_at }}，下次 {{ subject.review_by }}</span>
        <a :href="subject.watch_url">检查上游更新</a>
        <details>
          <summary>许可证边界</summary>
          <p>{{ subject.license_summary }}</p>
          <ul role="list">
            <li
              v-for="scope in subject.license_scopes"
              :key="`${scope.expression}-${scope.path_or_glob ?? scope.selector}`"
              role="listitem"
            >
              <code>{{ scope.basis }}</code> · <code>{{ scope.expression }}</code> ·
              <code>{{ scope.path_or_glob ?? scope.selector }}</code> · {{ scope.scope }} — {{ scope.note }}
            </li>
          </ul>
          <p>
            许可证原文：
            <a
              v-for="source in subject.license_sources"
              :key="source.path"
              :href="projectSourceUrl(subject.id, source.path)"
            ><code>{{ source.path }}</code></a>
          </p>
        </details>
        <div class="project-license-print" aria-hidden="true">
          <p><strong>许可证摘要：</strong>{{ subject.license_summary }}</p>
          <ul>
            <li
              v-for="scope in subject.license_scopes"
              :key="`print-${scope.expression}-${scope.path_or_glob ?? scope.selector}`"
            >
              {{ scope.basis }} · {{ scope.expression }} · {{ scope.path_or_glob ?? scope.selector }} · {{ scope.scope }} — {{ scope.note }}
            </li>
          </ul>
          <p
            v-for="source in subject.license_sources"
            :key="`print-license-${source.path}`"
            class="project-license-print-url"
          >
            许可证原文：{{ projectSourceUrl(subject.id, source.path) }}
          </p>
        </div>
      </li>
    </ul>
  </aside>
</template>
```

The print URL is explicit text (`{{ row.href }}`) with `aria-hidden="true"`; do not recreate URLs with `a[href]::after` or any CSS generated-content pseudo-element.

- [ ] **Step 4: Lock the final responsive and print cascade**

Install the parser dependencies used by the regression guard:

```bash
pnpm add -D postcss@8.5.28 postcss-selector-parser@7.1.6
```

The final project-specific CSS block is:

```css
.project-meta,
.project-chain-section,
.project-overview section {
  margin: 1.5rem 0;
  border: 1px solid var(--reading-rule);
  border-radius: 12px;
  background: var(--reading-bg);
}

.project-meta,
.project-chain-section,
.project-overview section {
  padding: 1rem 1.1rem;
}

.project-meta > ul,
.project-overview ol,
.project-overview ul,
.project-call-chain,
.project-source-links {
  margin: 0;
  padding: 0;
  list-style: none;
}

.project-meta > ul > li,
.project-source-links > li {
  display: grid;
  gap: 0.35rem;
  padding: 0.85rem 0;
  border-top: 1px solid var(--reading-rule);
}

.project-meta > ul > li {
  grid-template-columns: minmax(0, 1fr) !important;
  min-width: 0 !important;
}

.project-meta > ul > li > * {
  min-width: 0 !important;
}

.project-source-links > li {
  grid-template-columns: minmax(0, 1fr);
}

.project-architecture {
  margin: 1rem 0;
}

.project-architecture figcaption {
  color: var(--reading-text);
  font-weight: 750;
  font-size: 1.05rem;
}

.project-architecture-tracks {
  display: grid;
  gap: 1rem;
}

.project-architecture-nodes,
.project-call-chain {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
}

.project-architecture-nodes span {
  position: relative;
  padding: 0.7rem;
  border: 1px solid var(--reading-rule);
  border-radius: 8px;
  background: var(--reading-bg-soft);
  text-align: center;
}

.project-architecture-nodes span:not(:last-child)::after {
  position: absolute;
  inset-inline-end: -0.65rem;
  content: '→';
  color: var(--reading-link);
}

.project-call-chain li {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.4rem;
  min-width: 0;
  padding: 0.85rem;
  border-left: 3px solid var(--reading-link);
  background: var(--reading-bg-soft);
}

.project-meta code,
.project-call-chain code,
.project-source-links code {
  overflow-wrap: anywhere;
  white-space: normal;
}

.project-chain-track-group h4,
.project-meta small,
.project-source-links small {
  color: var(--reading-text-soft);
  font-size: 0.8rem;
}

.project-chain-warning {
  padding-left: 0.8rem;
  border-left: 3px solid var(--reading-risk);
}

.project-risk-tag {
  display: inline-block;
  margin: 0.25rem 0.25rem 0 0;
  padding: 0.15rem 0.45rem;
  border: 1px solid var(--reading-risk);
  border-radius: 999px;
  color: var(--reading-risk);
}

.project-safety-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.project-license-print {
  display: none;
}

.project-license-print-url {
  overflow-wrap: anywhere;
}

.project-source-print-url {
  display: none;
}

.project-meta summary {
  min-height: 44px;
  touch-action: manipulation;
}

.project-overview a,
.project-source-links a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  touch-action: manipulation;
}

.project-meta :focus-visible,
.project-overview :focus-visible,
.project-source-links :focus-visible {
  outline: 3px solid var(--reading-link);
  outline-offset: 3px;
}

@media (max-width: 700px) {
  .project-architecture-nodes,
  .project-call-chain {
    grid-template-columns: 1fr;
  }

  .project-architecture-nodes span:not(:last-child)::after {
    inset-inline-end: auto;
    inset-block-end: -0.8rem;
    inset-inline-start: 50%;
    content: '↓';
  }

  .project-meta,
  .project-chain-section,
  .project-overview section {
    padding: 0.9rem;
  }
}

@media print {
  .course-stage-more,
  .course-stage-more > summary,
  .course-progress progress,
  .course-stage progress {
    display: none;
  }

  .vp-doc ol.course-print-items {
    display: grid;
    grid-column: 2;
    gap: 0.75rem;
    list-style: none;
  }

  .course-print-items li {
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--reading-rule);
  }

  .course-print-items span {
    font-weight: 800;
  }

  .course-stage,
  .course-item {
    break-inside: avoid;
  }

  .project-meta details {
    display: none !important;
  }

  .project-meta > ul,
  .project-source-links,
  .project-call-chain {
    display: block;
  }

  .project-meta > ul > li,
  .project-source-links > li,
  .project-call-chain li {
    display: block;
    break-inside: avoid;
  }

  .project-meta > ul > li > *,
  .project-source-links > li > *,
  .project-call-chain li > * {
    display: block;
  }

  .project-license-print {
    display: block !important;
  }

  .project-architecture {
    display: none !important;
  }

  .project-call-chain {
    grid-template-columns: 1fr;
  }

  .project-source-print-url {
    display: block !important;
    max-width: 100% !important;
    overflow-wrap: anywhere !important;
    white-space: normal !important;
  }
}
```

The `.project-meta > ul > li` mobile-width declarations and the print-only `.project-source-print-url` declarations are deliberately `!important`. The regression test parses selectors and nested media conditions so earlier/later rules, higher specificity, comma branches, `not screen`, comments, and generated `attr(href)` content cannot silently defeat the approved cascade.

- [ ] **Step 5: Add the final presentation regression block**

Use the final `project presentation primitives` test block from `tests/project-pages.spec.ts`:

```ts
describe('project presentation primitives', () => {
  it('loads the validated project catalog and fails closed on inherited IDs', () => {
    expect(getProjectPage('project-aider').subjects).toEqual(['aider'])
    expect(getProjectSubject('aider').pinned_ref).toBe('v0.86.0')
    expect(getProjectSubject('hermes-agent').risk_tags).toEqual(['长期自主', '长期记忆', '外部系统'])
    expect(getProjectSubject('openclaw').risk_tags).toEqual(['长期自主', 'IM', '桌面控制', '外部系统'])
    expect(getProjectChain('aider-repo-to-verified-edit').steps).toHaveLength(21)

    for (const id of ['missing', 'toString', 'constructor', '__proto__']) {
      expect(() => getProjectPage(id)).toThrow(`Unknown project page: ${id}`)
      expect(() => getProjectSubject(id)).toThrow(`Unknown project subject: ${id}`)
      expect(() => getProjectChain(id)).toThrow(`Unknown project chain: ${id}`)
    }
  })

  it('generates immutable source links from the pinned commit', () => {
    expect(projectSourceUrl('aider', 'aider/main.py')).toBe(
      'https://github.com/Aider-AI/aider/blob/a4be6ccd87ebaa59b361f3f028d116ce1761b626/aider/main.py',
    )
    expect(projectSourceUrl('aider', 'LICENSE.txt')).toContain(
      '/blob/a4be6ccd87ebaa59b361f3f028d116ce1761b626/LICENSE.txt',
    )
    expect(() => projectSourceUrl('aider', 'README.md')).toThrow(
      'Undeclared project source: aider/README.md',
    )
  })

  it('URL-encodes each declared source path segment without encoding separators', () => {
    const specialCatalog = structuredClone(projectCatalog)
    const aider = specialCatalog.subjects.find((subject) => subject.id === 'aider')!
    aider.entrypoints.push({
      path: 'docs/path with space/#guide?100%.md',
      symbols: ['render special path'],
      responsibility: 'Exercise reserved URL characters in a declared source path.',
    })
    const specialLookup = createProjectCatalogLookup(specialCatalog)

    expect(specialLookup.projectSourceUrl('aider', 'docs/path with space/#guide?100%.md')).toBe(
      'https://github.com/Aider-AI/aider/blob/a4be6ccd87ebaa59b361f3f028d116ce1761b626/docs/path%20with%20space/%23guide%3F100%25.md',
    )
  })

  it('loads the catalog relative to the loader module instead of the process working directory', () => {
    const loader = readFileSync('docs/.vitepress/theme/data/projectCatalog.data.ts', 'utf8')
    expect(loader).not.toContain('process.cwd()')
    expect(loader).not.toContain('watchedFiles[0]')
    expect(loader).toContain('import.meta.url')
    expect(loader).toContain("new URL('../../../../sources/project-index.yml', import.meta.url)")
  })

  it('registers four SSR-safe components with native list and disclosure semantics', () => {
    const loader = readFileSync('docs/.vitepress/theme/data/projectCatalog.data.ts', 'utf8')
    expect(loader).toContain("import { defineLoader } from 'vitepress'")
    expect(loader).not.toContain('type { Loader }')

    const core = readFileSync('docs/.vitepress/theme/data/projectCatalogCore.ts', 'utf8')
    expect(core).not.toContain('projectCatalog.data')

    const theme = readFileSync('docs/.vitepress/theme/index.ts', 'utf8')
    for (const name of ['ProjectOverview', 'ProjectMeta', 'ProjectCallChain', 'ProjectSourceLinks']) {
      expect(theme).toContain(`'${name}'`)
    }

    const chain = readFileSync('docs/.vitepress/theme/components/ProjectCallChain.vue', 'utf8')
    expect(chain).toContain('<figure')
    expect(chain).toContain('class="project-architecture"')
    expect(chain).toContain('本书归纳 · 原创建筑关系图')
    expect(chain).toContain('<ol')
    expect(chain).toContain('role="list"')
    expect(chain).toContain('role="listitem"')
    expect(chain).toContain('源码事实：')
    expect(chain).toContain('本书归纳：')
    expect(chain).toContain('不要误解')

    const meta = readFileSync('docs/.vitepress/theme/components/ProjectMeta.vue', 'utf8')
    expect(meta).toContain('仓库状态')
    expect(meta).toContain('教学层级')
    expect(meta).toContain('<details')
    expect(meta).toContain('project-license-print')
    expect(meta).not.toContain('pinned_commit.slice')
    expect(meta).toContain('scope.basis')
    expect(meta).toContain('scope.path_or_glob ?? scope.selector')
    expect(meta).toContain('projectSourceUrl(subject.id, source.path)')

    const sources = readFileSync('docs/.vitepress/theme/components/ProjectSourceLinks.vue', 'utf8')
    for (const field of ['row.path', 'row.symbols', 'row.responsibility']) {
      expect(sources).toContain(field)
    }
    expect(sources).not.toContain('row.symbol }}')

    const overview = readFileSync('docs/.vitepress/theme/components/ProjectOverview.vue', 'utf8')
    expect(overview).toContain('subject.risk_tags')
    for (const id of ['frontier-agent-security-evaluation', 'chapter-09-safety-recovery', 'radar']) {
      expect(overview).toContain(id)
    }
  })

  it('parses responsive project rules by media scope and effective cascade', async () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
    expect(pkg.devDependencies.postcss).toBe('8.5.28')
    expect(pkg.devDependencies['postcss-selector-parser']).toBe('7.1.6')

    const sourceComponent = readFileSync(
      'docs/.vitepress/theme/components/ProjectSourceLinks.vue',
      'utf8',
    )
    expect(sourceComponent).toContain('class="project-source-print-url"')
    expect(sourceComponent).toContain('aria-hidden="true"')
    expect(sourceComponent).toContain('{{ row.href }}')
    expect(readFileSync('docs/.vitepress/theme/components/ProjectMeta.vue', 'utf8'))
      .toContain('class="project-license-print-url"')

    const { default: postcss } = await import('postcss')
    const { default: selectorParser } = await import('postcss-selector-parser')
    expect(selectorParser).toBeTypeOf('function')
    const root = postcss.parse(readFileSync('docs/.vitepress/theme/style.css', 'utf8'))
    const rules: any[] = []
    root.walkRules((rule) => rules.push(rule))

    const selectors = (rule: any) => postcss.list.comma(rule.selector).map((value) => value.trim())
    const scope = (rule: any) => {
      let parent = rule.parent
      while (parent && parent !== root) {
        if (parent.type === 'atrule' && parent.name === 'media') {
          return parent.params.replace(/\s+/gu, '').toLowerCase()
        }
        parent = parent.parent
      }
      return 'root'
    }
    const findExactRule = (expectedSelectors: string[], expectedScope: string) => {
      const expected = [...expectedSelectors].sort()
      const matches = rules.filter((rule) =>
        scope(rule) === expectedScope
        && JSON.stringify([...selectors(rule)].sort()) === JSON.stringify(expected))
      expect(matches, `${expectedScope}: ${expectedSelectors.join(', ')}`).toHaveLength(1)
      return matches[0]
    }
    const declarations = (rule: any) => Object.fromEntries(
      rule.nodes
        .filter((node: any) => node.type === 'decl')
        .map((node: any) => [node.prop, { value: node.value, important: Boolean(node.important) }]),
    )
    const expectEffectiveRule = (
      expectedSelectors: string[],
      expectedScope: string,
      expectedDeclarations: Record<string, { value: string, important?: boolean }>,
    ) => {
      const rule = findExactRule(expectedSelectors, expectedScope)
      const actual = declarations(rule)
      for (const [property, expected] of Object.entries(expectedDeclarations)) {
        expect(actual[property], `${rule.selector} ${property}`).toEqual({
          value: expected.value,
          important: expected.important ?? false,
        })
      }
      const laterRules = rules.slice(rules.indexOf(rule) + 1)
      for (const selector of expectedSelectors) {
        for (const property of Object.keys(expectedDeclarations)) {
          const overrides = laterRules.filter((candidate) =>
            scope(candidate) === expectedScope
            && selectors(candidate).includes(selector)
            && Boolean(declarations(candidate)[property]))
          expect(overrides, `later ${expectedScope} override: ${selector} ${property}`).toEqual([])
        }
      }
    }

    expectEffectiveRule(['.project-meta > ul > li'], 'root', {
      'grid-template-columns': { value: 'minmax(0, 1fr)', important: true },
      'min-width': { value: '0', important: true },
    })
    expectEffectiveRule(['.project-meta > ul > li > *'], 'root', {
      'min-width': { value: '0', important: true },
    })
    expectEffectiveRule(['.project-source-links > li'], 'root', {
      'grid-template-columns': { value: 'minmax(0, 1fr)' },
    })
    expectEffectiveRule(['.project-call-chain li'], 'root', {
      'grid-template-columns': { value: 'minmax(0, 1fr)' },
      'min-width': { value: '0' },
    })
    expectEffectiveRule(['.project-license-print-url'], 'root', {
      'overflow-wrap': { value: 'anywhere' },
    })
    expectEffectiveRule(['.project-source-print-url'], 'root', {
      display: { value: 'none' },
    })

    expectEffectiveRule(
      ['.project-architecture-nodes', '.project-call-chain'],
      '(max-width:700px)',
      { 'grid-template-columns': { value: '1fr' } },
    )
    expectEffectiveRule(
      ['.project-meta', '.project-chain-section', '.project-overview section'],
      '(max-width:700px)',
      { padding: { value: '0.9rem' } },
    )

    expectEffectiveRule(
      ['.project-meta > ul', '.project-source-links', '.project-call-chain'],
      'print',
      { display: { value: 'block' } },
    )
    expectEffectiveRule(
      ['.project-meta > ul > li', '.project-source-links > li', '.project-call-chain li'],
      'print',
      { display: { value: 'block' }, 'break-inside': { value: 'avoid' } },
    )
    expectEffectiveRule(
      ['.project-meta > ul > li > *', '.project-source-links > li > *', '.project-call-chain li > *'],
      'print',
      { display: { value: 'block' } },
    )
    expectEffectiveRule(['.project-source-print-url'], 'print', {
      display: { value: 'block', important: true },
      'max-width': { value: '100%', important: true },
      'overflow-wrap': { value: 'anywhere', important: true },
      'white-space': { value: 'normal', important: true },
    })

    const mediaAncestors = (rule: any) => {
      const ancestors: string[] = []
      let parent = rule.parent
      while (parent && parent !== root) {
        if (parent.type === 'atrule' && parent.name === 'media') ancestors.unshift(parent.params)
        parent = parent.parent
      }
      return ancestors
    }
    const mediaBranches = (params: string) => postcss.list.comma(params)
      .map((branch) => branch.trim().toLowerCase())
    const branchAllowsPrint = (branch: string) => {
      if (/\bnot\s+print\b/u.test(branch)) return false
      if (/\b(?:only\s+)?screen\b/u.test(branch) && !/\bnot\s+screen\b/u.test(branch)) return false
      return true
    }
    const branchAllowsMobile = (branch: string, width = 390) => {
      if (/\bnot\s+screen\b/u.test(branch)) return false
      if (/\bprint\b/u.test(branch) && !/\bnot\s+print\b/u.test(branch)) return false
      const min = [...branch.matchAll(/min-width\s*:\s*(\d+)px/gu)].map((match) => Number(match[1]))
      const max = [...branch.matchAll(/max-width\s*:\s*(\d+)px/gu)].map((match) => Number(match[1]))
      return min.every((value) => width >= value) && max.every((value) => width <= value)
    }
    const appliesToPrint = (rule: any) => mediaAncestors(rule)
      .every((params) => mediaBranches(params).some(branchAllowsPrint))
    const appliesToMobile = (rule: any) => mediaAncestors(rule)
      .every((params) => mediaBranches(params).some((branch) => branchAllowsMobile(branch)))
    const selectorAnalysis = (selector: string) => {
      const selectorRoot = selectorParser().astSync(selector)
      const selectorNode: any = selectorRoot.nodes[0]
      const specificity = [0, 0, 0]
      const classes = new Set<string>()
      const tags = new Set<string>()
      const pseudos = new Set<string>()
      selectorNode.walk((node: any) => {
        if (node.type === 'id') specificity[0] += 1
        else if (node.type === 'class' || node.type === 'attribute') specificity[1] += 1
        else if (node.type === 'pseudo') {
          if (node.value.startsWith('::')) specificity[2] += 1
          else specificity[1] += 1
        } else if (node.type === 'tag') specificity[2] += 1
        if (node.type === 'class') classes.add(node.value)
        if (node.type === 'tag') tags.add(node.value)
        if (node.type === 'pseudo') pseudos.add(node.value)
      })
      const nodes = selectorNode.nodes as any[]
      const lastCombinator = nodes.reduce(
        (index, node, candidate) => node.type === 'combinator' ? candidate : index,
        -1,
      )
      const lastCompound = nodes.slice(lastCombinator + 1)
      return {
        classes,
        lastHasLi: lastCompound.some((node) => node.type === 'tag' && node.value === 'li'),
        pseudos,
        specificity,
        tags,
      }
    }
    const compareSpecificity = (left: number[], right: number[]) => {
      for (let index = 0; index < 3; index += 1) {
        if (left[index] !== right[index]) return left[index] - right[index]
      }
      return 0
    }
    const criticalCascadeViolations = (css: string) => {
      const fixtureRoot = postcss.parse(css)
      const fixtureRules: any[] = []
      fixtureRoot.walkRules((rule) => fixtureRules.push(rule))
      const fixtureSelectors = (rule: any) => postcss.list.comma(rule.selector)
        .map((value) => value.trim())
      const fixtureDeclarations = (rule: any) => rule.nodes
        .filter((node: any) => node.type === 'decl')
      const fixtureMediaAncestors = (rule: any) => {
        const ancestors: string[] = []
        let parent = rule.parent
        while (parent && parent !== fixtureRoot) {
          if (parent.type === 'atrule' && parent.name === 'media') ancestors.unshift(parent.params)
          parent = parent.parent
        }
        return ancestors
      }
      const fixtureAppliesToPrint = (rule: any) => fixtureMediaAncestors(rule)
        .every((params) => mediaBranches(params).some(branchAllowsPrint))
      const fixtureAppliesToMobile = (rule: any) => fixtureMediaAncestors(rule)
        .every((params) => mediaBranches(params).some((branch) => branchAllowsMobile(branch)))
      const exactRules = (selector: string, media: 'root' | 'print') => fixtureRules.filter((rule) => {
        const exactSelector = fixtureSelectors(rule).length === 1 && fixtureSelectors(rule)[0] === selector
        if (!exactSelector) return false
        const ancestors = fixtureMediaAncestors(rule).map((value) => value.replace(/\s+/gu, '').toLowerCase())
        return media === 'root' ? ancestors.length === 0 : ancestors.length === 1 && ancestors[0] === 'print'
      })
      const errors: string[] = []
      const metaRules = exactRules('.project-meta > ul > li', 'root')
      const printBaseRules = exactRules('.project-source-print-url', 'root')
      const printRules = exactRules('.project-source-print-url', 'print')
      if (metaRules.length !== 1) errors.push('missing approved mobile meta rule')
      if (printBaseRules.length !== 1) errors.push('missing approved screen-hidden print URL rule')
      if (printRules.length !== 1) errors.push('missing approved print URL rule')

      const metaRule = metaRules[0]
      const printRule = printRules[0]
      const metaIndex = fixtureRules.indexOf(metaRule)
      const printIndex = fixtureRules.indexOf(printRule)
      const metaSpecificity = selectorAnalysis('.project-meta > ul > li').specificity
      const printSpecificity = selectorAnalysis('.project-source-print-url').specificity
      const metaExpected: Record<string, string> = {
        'grid-template-columns': 'minmax(0, 1fr)',
        'min-width': '0',
      }
      const printExpected: Record<string, string> = {
        display: 'block',
        'max-width': '100%',
        'overflow-wrap': 'anywhere',
        'white-space': 'normal',
      }
      if (metaRule) {
        const actual = Object.fromEntries(fixtureDeclarations(metaRule).map((node: any) => [node.prop, node]))
        for (const [property, value] of Object.entries(metaExpected)) {
          if (actual[property]?.value !== value || !actual[property]?.important) {
            errors.push(`approved mobile meta ${property} must be ${value} !important`)
          }
        }
      }
      if (printRule) {
        const actual = Object.fromEntries(fixtureDeclarations(printRule).map((node: any) => [node.prop, node]))
        for (const [property, value] of Object.entries(printExpected)) {
          if (actual[property]?.value !== value || !actual[property]?.important) {
            errors.push(`approved print URL ${property} must be ${value} !important`)
          }
        }
      }

      fixtureRules.forEach((rule, ruleIndex) => {
        fixtureSelectors(rule).forEach((selector) => {
          const analysis = selectorAnalysis(selector)
          const declarationByProperty = Object.fromEntries(
            fixtureDeclarations(rule).map((node: any) => [node.prop, node]),
          )
          const targetsMetaRow = analysis.classes.has('project-meta') && analysis.lastHasLi
          if (targetsMetaRow && fixtureAppliesToMobile(rule)) {
            for (const property of Object.keys(metaExpected)) {
              const declaration = declarationByProperty[property]
              if (!declaration || rule === metaRule) continue
              if (declaration.important) {
                errors.push(`competing mobile !important: ${selector} ${property}`)
              } else if (metaRule && ruleIndex > metaIndex
                && compareSpecificity(analysis.specificity, metaSpecificity) >= 0) {
                errors.push(`later mobile override: ${selector} ${property}`)
              }
            }
          }

          if (analysis.classes.has('project-source-print-url') && fixtureAppliesToPrint(rule)) {
            for (const property of Object.keys(printExpected)) {
              const declaration = declarationByProperty[property]
              if (!declaration || rule === printRule) continue
              const approvedScreenDefault = rule === printBaseRules[0]
                && property === 'display'
                && declaration.value === 'none'
                && !declaration.important
              if (approvedScreenDefault) continue
              if (declaration.important) {
                errors.push(`competing print !important: ${selector} ${property}`)
              } else if (printRule && ruleIndex > printIndex
                && compareSpecificity(analysis.specificity, printSpecificity) >= 0) {
                errors.push(`later print override: ${selector} ${property}`)
              }
            }
          }

          const hasLinkPseudo = analysis.tags.has('a')
            && [...analysis.pseudos].some((pseudo) => pseudo.startsWith('::'))
          if (hasLinkPseudo && fixtureDeclarations(rule).some((node: any) =>
            node.prop === 'content' && /attr\(href\)/u.test(node.value))) {
            errors.push(`link pseudo attr(href): ${selector}`)
          }
        })
      })
      return errors
    }

    const style = readFileSync('docs/.vitepress/theme/style.css', 'utf8')
    expect(criticalCascadeViolations(style)).toEqual([])
    const legacyApprovedRulesRemain = (css: string) => {
      const fixtureRoot = postcss.parse(css)
      let meta = 0
      let printUrl = 0
      fixtureRoot.walkRules((rule) => {
        const actual = postcss.list.comma(rule.selector).map((value) => value.trim())
        if (actual.length === 1 && actual[0] === '.project-meta > ul > li' && rule.parent === fixtureRoot) meta += 1
        if (actual.length === 1 && actual[0] === '.project-source-print-url'
          && rule.parent?.type === 'atrule' && rule.parent.params.replace(/\s+/gu, '') === 'print') printUrl += 1
      })
      return meta === 1 && printUrl === 1
    }
    const ruleWithDeclarations = (
      selector: string,
      values: Array<[string, string, boolean?]>,
    ) => {
      const rule = postcss.rule({ selector })
      for (const [prop, value, important = false] of values) {
        rule.append(postcss.decl({ prop, value, important }))
      }
      return rule
    }

    const earlierPrint = root.clone()
    const earlierPrintMedia = postcss.atRule({ name: 'media', params: 'print' })
    earlierPrintMedia.append(ruleWithDeclarations(
      '.project-source-links .project-source-print-url',
      [['display', 'none', true]],
    ))
    earlierPrint.prepend(earlierPrintMedia)
    expect(legacyApprovedRulesRemain(earlierPrint.toString())).toBe(true)
    expect(criticalCascadeViolations(earlierPrint.toString()))
      .toContain('competing print !important: .project-source-links .project-source-print-url display')

    const laterSame = root.clone()
    const laterPrintMedia = postcss.atRule({ name: 'media', params: 'print' })
    laterPrintMedia.append(ruleWithDeclarations(
      '.project-source-print-url',
      [['display', 'none', true]],
    ))
    laterSame.append(laterPrintMedia)
    expect(criticalCascadeViolations(laterSame.toString()))
      .toContain('missing approved print URL rule')

    const nestedNotScreen = root.clone()
    const notScreenMedia = postcss.atRule({ name: 'media', params: 'not screen' })
    const nestedColorMedia = postcss.atRule({ name: 'media', params: '(color)' })
    nestedColorMedia.append(ruleWithDeclarations(
      '.project-source-links .project-source-print-url',
      [['white-space', 'nowrap', true]],
    ))
    notScreenMedia.append(nestedColorMedia)
    nestedNotScreen.prepend(notScreenMedia)
    expect(legacyApprovedRulesRemain(nestedNotScreen.toString())).toBe(true)
    expect(criticalCascadeViolations(nestedNotScreen.toString()))
      .toContain('competing print !important: .project-source-links .project-source-print-url white-space')

    const mobileOverlap = root.clone()
    const narrowMedia = postcss.atRule({ name: 'media', params: '(max-width: 390px)' })
    narrowMedia.append(ruleWithDeclarations(
      '.project-meta > ul > li.is-tight',
      [['grid-template-columns', 'max-content'], ['min-width', 'max-content']],
    ))
    mobileOverlap.append(narrowMedia)
    expect(legacyApprovedRulesRemain(mobileOverlap.toString())).toBe(true)
    expect(criticalCascadeViolations(mobileOverlap.toString())).toEqual(expect.arrayContaining([
      'later mobile override: .project-meta > ul > li.is-tight grid-template-columns',
      'later mobile override: .project-meta > ul > li.is-tight min-width',
    ]))

    const commentAndWrongMedia = root.clone()
    const commentRules: any[] = []
    commentAndWrongMedia.walkRules((rule) => {
      const actual = postcss.list.comma(rule.selector).map((value) => value.trim())
      if (actual.length === 1 && actual[0] === '.project-meta > ul > li'
        && rule.parent === commentAndWrongMedia) commentRules.push(rule)
    })
    const removedMeta = commentRules[0]
    const wrongMedia = postcss.atRule({ name: 'media', params: '(min-width: 701px)' })
    wrongMedia.append(removedMeta.clone())
    removedMeta.replaceWith(postcss.comment({ text: removedMeta.toString() }))
    commentAndWrongMedia.append(wrongMedia)
    expect(criticalCascadeViolations(commentAndWrongMedia.toString()))
      .toContain('missing approved mobile meta rule')

    const allowedProjectWrapping = new Set([
      '.project-meta code',
      '.project-call-chain code',
      '.project-source-links code',
      '.project-license-print-url',
      '.project-source-print-url',
    ])
    for (const rule of rules) {
      const actual = declarations(rule)
      if (actual['overflow-wrap']?.value === 'anywhere') {
        for (const selector of selectors(rule).filter((value) => value.startsWith('.project'))) {
          expect(allowedProjectWrapping.has(selector), `broad project wrap: ${selector}`).toBe(true)
        }
      }
      if (selectors(rule).includes('.project-license-print p')) {
        expect(actual['word-break']?.value).not.toBe('break-all')
      }
      if (selectors(rule).some((selector) => selector.includes('.project-source-links') && selector.includes('::after'))) {
        expect(actual.content?.value ?? '').not.toMatch(/attr\(href\)/u)
      }
      if (selectors(rule).some((selector) => selector.startsWith('.project'))) {
        for (const declaration of Object.values(actual) as Array<{ value: string }>) {
          expect(declaration.value).not.toMatch(/#[0-9a-f]{6}\b/iu)
        }
      }
    }
  })

  it('enforces the scoped Vue and TypeScript check during production builds', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
    const tsconfig = JSON.parse(readFileSync('tsconfig.projects.json', 'utf8'))
    expect(pkg.scripts['typecheck:projects']).toBe('vue-tsc --noEmit -p tsconfig.projects.json')
    expect(pkg.scripts.build).toContain('pnpm typecheck:projects')
    expect(pkg.devDependencies['vue-tsc']).toBe('^3.3.11')
    expect(pkg.devDependencies.typescript).toBe('^5.9.3')
    expect(pkg.devDependencies['@types/node']).toBe('^24.10.0')
    expect(tsconfig.compilerOptions.types).toEqual(['vitepress/client', 'node'])
  })
})

```

This test is intentionally structural: PostCSS 8.5.28 parses declarations and media scope, `postcss-selector-parser` 7.1.6 computes selector targets/specificity, and mutations prove the guard catches competing `!important`, later same/higher-specificity overrides, wrong media placement, and link pseudo-elements that expose `attr(href)`.

- [ ] **Step 6: Run every automated gate and the refreshed source checks**

Run:

```bash
set -e
pnpm vitest run tests/project-pages.spec.ts tests/content.spec.ts
pnpm test
pnpm validate
pnpm build
GITHUB_TOKEN="$(gh auth token)" pnpm sources:check
node --input-type=module <<'NODE'
import { readFileSync } from 'node:fs'
const report = JSON.parse(readFileSync('reports/source-freshness.json', 'utf8'))
const expected = new Map([
  ['langgraph-repository', ['repository_updated']],
  ['crewai-repository', ['repository_updated']],
  ['langfuse-repository', ['repository_updated']],
  ['phoenix-repository', ['repository_updated']],
])
if (JSON.stringify(report.summary) !== JSON.stringify({ total: 33, healthy: 29, needs_review: 4 })) {
  throw new Error(`Unexpected source summary: ${JSON.stringify(report.summary)}`)
}
const actual = new Map(report.results.filter((result) => result.findings.length > 0)
  .map((result) => [result.id, result.findings]))
if (JSON.stringify([...actual]) !== JSON.stringify([...expected])) {
  throw new Error(`Unexpected source findings: ${JSON.stringify([...actual])}`)
}
console.log(JSON.stringify(report.summary))
NODE
GITHUB_TOKEN="$(gh auth token)" pnpm run projects:check -- --strict
git diff origin/main...HEAD --check
git status --short
```

Expected: all tests, validation, build, and dist checks pass; the source report matches the exact post-`5507d60` four-item review set; the project report has 13 subjects and no blocking finding.

- [ ] **Step 7: Verify all eight pages at mobile and desktop widths**

Start `pnpm preview -- --port 4175` in a persistent terminal. Use a fresh browser session and HAR, then exercise every page at both approved viewports:

```bash
set -e
rm -f /tmp/project-catalog-acceptance.har
agent-browser --session project-catalog-acceptance network har start
routes=(
  projects/
  projects/mcp-python-sdk
  projects/aider
  projects/openhands
  projects/agent-benchmarks
  projects/dify
  projects/crewai
  projects/history-autogpt-flowise
)
for viewport in '1440 1000 light desktop' '390 844 dark mobile'; do
  read -r width height theme label <<< "$viewport"
  agent-browser --session project-catalog-acceptance set viewport "$width" "$height"
  agent-browser --session project-catalog-acceptance set media "$theme"
  for route in "${routes[@]}"; do
    url="http://127.0.0.1:4175/agent-engineering-for-beginners/$route"
    agent-browser --session project-catalog-acceptance open "$url"
    agent-browser --session project-catalog-acceptance wait --load networkidle
    agent-browser --session project-catalog-acceptance eval --stdin <<'EVALEOF'
(() => {
  const text = document.querySelector('.vp-doc')?.textContent ?? ''
  const isIndex = location.pathname.endsWith('/projects/')
  const required = isIndex
    ? ['核心源码拆解', '历史反例', '前沿高权限观察区', '不是初学者默认安装步骤']
    : ['固定版本', '仓库状态', '教学层级', '许可证边界', '源码事实', '本书归纳', '关键源码入口', '失败边界']
  const result = {
    url: location.href,
    width: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    missing: required.filter((item) => !text.includes(item)),
  }
  if (result.width !== result.scrollWidth || result.missing.length > 0) throw new Error(JSON.stringify(result))
  return JSON.stringify(result)
})()
EVALEOF
    agent-browser --session project-catalog-acceptance screenshot "/tmp/${route//\//-}-${label}.png" --full
  done
done
```

Verify keyboard order with real key events:

```bash
agent-browser --session project-catalog-acceptance open http://127.0.0.1:4175/agent-engineering-for-beginners/projects/
agent-browser --session project-catalog-acceptance press Tab
agent-browser --session project-catalog-acceptance press Enter
agent-browser --session project-catalog-acceptance press Tab
focus_log=$(mktemp)
for step in $(seq 1 16); do
  agent-browser --session project-catalog-acceptance eval 'const el=document.activeElement;const r={tag:el?.tagName,text:el?.textContent?.trim(),outline:getComputedStyle(el).outline};if(!["A","SUMMARY"].includes(r.tag)||r.outline.includes("none")||r.outline.startsWith("0px"))throw new Error(JSON.stringify(r));JSON.stringify(r)' >> "$focus_log"
  agent-browser --session project-catalog-acceptance press Tab
done
for label in 'MCP 规范与 Python SDK' 'Aider 源码拆解' 'OpenHands 源码拆解' 'Agent 评测基准' 'Dify 源码拆解' 'CrewAI 源码拆解' 'AutoGPT 与 Flowise' 'NousResearch/hermes-agent' 'openclaw/openclaw'; do
  rg -Fq "$label" "$focus_log"
done
```

Expected: all 16 page/viewport combinations have `scrollWidth === innerWidth`, all required visible text, and no console or page errors; focus follows DOM/visual order, reaches all internal and watch-only links, and has a non-zero outline.

- [ ] **Step 8: Verify all seven dissection PDFs**

Generate a PDF for each non-index project page while on-screen license disclosures remain closed. Then validate page text with the seven Unicode ligature replacements `ﬀ/ﬁ/ﬂ/ﬃ/ﬄ/ﬅ/ﬆ`:

```bash
set -e
pdf_routes=(mcp-python-sdk aider openhands agent-benchmarks dify crewai history-autogpt-flowise)
for route in "${pdf_routes[@]}"; do
  agent-browser --session project-catalog-acceptance open "http://127.0.0.1:4175/agent-engineering-for-beginners/projects/$route"
  agent-browser --session project-catalog-acceptance eval 'const open=Array.from(document.querySelectorAll(".project-meta details")).filter((node)=>node.open).length;if(open!==0)throw new Error(String(open));"0 open disclosures"'
  agent-browser --session project-catalog-acceptance pdf "/tmp/project-$route.pdf"
done
node --input-type=module <<'NODE'
import { readFileSync, writeFileSync } from 'node:fs'
import { parse } from 'yaml'
const catalog = parse(readFileSync('sources/project-index.yml', 'utf8'))
const subjects = Object.fromEntries(catalog.subjects.map((subject) => [subject.id, subject]))
const expected = Object.fromEntries(catalog.pages.slice(1).map((page) => [
  page.page_item_id.slice('project-'.length),
  page.subjects.flatMap((subjectId) => {
    const subject = subjects[subjectId]
    const url = (path) => `${subject.canonical_url}/blob/${subject.pinned_commit}/${path.split('/').map(encodeURIComponent).join('/')}`
    return [
      subject.pinned_commit,
      ...subject.entrypoints.flatMap((entry) => [entry.path, ...entry.symbols, entry.responsibility, url(entry.path)]),
      ...subject.license_sources.flatMap((source) => [source.path, url(source.path)]),
    ]
  }),
]))
writeFileSync('/tmp/project-pdf-expectations.json', JSON.stringify(expected))
NODE
python3 - <<'PY'
import json
from pathlib import Path
from pypdf import PdfReader
ligatures = str.maketrans({
    'ﬀ': 'ff', 'ﬁ': 'fi', 'ﬂ': 'fl', 'ﬃ': 'ffi', 'ﬄ': 'ffl', 'ﬅ': 'ft', 'ﬆ': 'st',
})
expected = json.loads(Path('/tmp/project-pdf-expectations.json').read_text(encoding='utf-8'))
blank_pages = 0
for route, required in expected.items():
    reader = PdfReader(f'/tmp/project-{route}.pdf')
    pages = [(page.extract_text() or '').translate(ligatures) for page in reader.pages]
    blank_pages += sum(not page.strip() for page in pages)
    compact = ''.join('\n'.join(pages).split())
    missing = [item for item in required if ''.join(item.translate(ligatures).split()) not in compact]
    assert not missing, f'{route} missing: {missing}'
assert blank_pages == 0, f'blank PDF pages: {blank_pages}'
print({'pdfs': len(expected), 'blank_pages': blank_pages, 'ligature_mappings': len(ligatures)})
PY
```

Expected: `{'pdfs': 7, 'blank_pages': 0, 'ligature_mappings': 7}`; every fixed source and license URL is present in extracted text, with no CSS pseudo-element URL reconstruction.

- [ ] **Step 9: Validate fresh HARs and no-JavaScript SSR**

Start the no-JavaScript route only after starting a new HAR, and remove prior artifacts so request counts cannot be inherited from earlier navigation:

```bash
set -e
rm -f /tmp/project-catalog-nojs.har
agent-browser --session project-catalog-nojs network har start
agent-browser --session project-catalog-nojs network route '**/*.js' --abort
for route in projects/ projects/mcp-python-sdk projects/aider projects/openhands projects/agent-benchmarks projects/dify projects/crewai projects/history-autogpt-flowise; do
  agent-browser --session project-catalog-nojs open "http://127.0.0.1:4175/agent-engineering-for-beginners/$route"
  agent-browser --session project-catalog-nojs eval --stdin <<'EVALEOF'
(() => {
  const text = document.querySelector('.vp-doc')?.textContent ?? ''
  const anchors = document.querySelectorAll('.vp-doc a').length
  const isIndex = location.pathname.endsWith('/projects/')
  const required = isIndex
    ? ['核心源码拆解', '历史反例', '前沿高权限观察区', '不是初学者默认安装步骤']
    : ['固定版本', '仓库状态', '教学层级', '许可证边界', '源码事实', '本书归纳', '关键源码入口', '失败边界']
  const missing = required.filter((item) => !text.includes(item))
  const pinnedSourceLinks = Array.from(document.querySelectorAll('.project-source-links a'))
  if (!text.trim() || anchors === 0 || missing.length
    || (!isIndex && (pinnedSourceLinks.length === 0
      || pinnedSourceLinks.some((anchor) => !/\/blob\/[0-9a-f]{40}\//u.test(anchor.href))))) {
    throw new Error(JSON.stringify({ url: location.href, anchors, missing }))
  }
  return JSON.stringify({ url: location.href, anchors, missing })
})()
EVALEOF
done
agent-browser --session project-catalog-acceptance network har stop /tmp/project-catalog-acceptance.har
agent-browser --session project-catalog-nojs network har stop /tmp/project-catalog-nojs.har
node --input-type=module <<'NODE'
import { readFileSync } from 'node:fs'
const sessions = [
  { path: '/tmp/project-catalog-acceptance.har', allowAbortedJavaScript: false },
  { path: '/tmp/project-catalog-nojs.har', allowAbortedJavaScript: true },
]
const failures = []
const counts = []
for (const session of sessions) {
  const entries = JSON.parse(readFileSync(session.path, 'utf8'))?.log?.entries
  if (!Array.isArray(entries) || entries.length === 0) {
    failures.push(`${session.path}: HAR contains no request entries`)
    continue
  }
  let allowedAbortCount = 0
  for (const entry of entries) {
    const url = String(entry?.request?.url ?? '')
    const status = Number(entry?.response?.status)
    let isJavaScript = false
    try { isJavaScript = /\.m?js$/iu.test(new URL(url).pathname) } catch {}
    const allowedAbort = session.allowAbortedJavaScript && status <= 0 && isJavaScript
    if (allowedAbort) allowedAbortCount += 1
    if (!Number.isFinite(status) || status >= 400 || (status <= 0 && !allowedAbort)) {
      failures.push(`${session.path}: ${status} ${url}`)
    }
  }
  if (session.allowAbortedJavaScript && allowedAbortCount === 0) {
    failures.push(`${session.path}: no actively aborted JavaScript request was captured`)
  }
  counts.push({ path: session.path, requests: entries.length, allowedAbortCount })
}
if (failures.length > 0) throw new Error(`HAR network failures:\n${failures.join('\n')}`)
console.log(JSON.stringify(counts))
NODE
test -z "$(agent-browser --session project-catalog-acceptance console)"
test -z "$(agent-browser --session project-catalog-acceptance errors)"
test -z "$(agent-browser --session project-catalog-nojs console)"
test -z "$(agent-browser --session project-catalog-nojs errors)"
```

Expected: both fresh HARs contain at least one request; the normal session has no missing/zero status or response `>=400`; the no-JavaScript session has at least one intentionally aborted `.js`/`.mjs` request and no other missing/zero status or response `>=400`. Report the freshly measured `requests` and `allowedAbortCount`; do not reuse historical network counts.

- [ ] **Step 10: Verify route and public boundaries, then stop local processes**

Retain the 79 positive clean/trailing-slash requests and five negative requests from the existing route matrix. Then run:

```bash
set -e
if find docs/.vitepress/dist -type f | rg -q '/(?:superpowers|labs|capstone)/'; then
  echo 'unexpected private or future-stage output'
  exit 1
fi
if [ -d docs/public/project-assets ] && find docs/public/project-assets -type f | grep -q .; then
  echo 'unexpected direct project asset in the no-asset baseline'
  exit 1
fi
git diff origin/main...HEAD --check
git status --short --branch
agent-browser --session project-catalog-acceptance close
agent-browser --session project-catalog-nojs close
lsof -nP -iTCP:4175 -sTCP:LISTEN
```

Send Ctrl-C only to the exact persistent preview session, then rerun `lsof`; expected output is empty.

- [ ] **Step 11: Push the feature branch and request final review; do not merge**

```bash
set -e
git push -u origin feat/open-source-project-dissections
git rev-parse HEAD
```

Send the final immutable feature HEAD, commit list, test counts, source/project freshness summaries, 79/5 route matrix, all 16 responsive page checks, seven PDF results, fresh HAR counts, and screenshots to the reviewer. Wait for explicit review approval before Task 14.

### Task 14: Merge the approved branch, deploy Pages, and verify production

**Files:**

- No repository file changes are expected.
- Remote changes: push `feat/open-source-project-dissections` and fast-forward `main` only after reviewer approval.

- [ ] **Step 1: Reconfirm the approved immutable state**

Run:

```bash
set -e
git fetch origin --prune
git status --short --branch
git diff origin/main...HEAD --check
git merge-base --is-ancestor origin/main HEAD
git rev-parse HEAD
```

Expected: clean worktree, empty range check, ancestor exit 0, and HEAD exactly matches the reviewer-approved commit. If `origin/main` moved, stop and rebase or merge only after rerunning the complete Task 13 acceptance; never force push.

- [ ] **Step 2: Push the approved feature branch and fast-forward main**

```bash
set -e
git push -u origin feat/open-source-project-dissections
git push origin feat/open-source-project-dissections:main
git ls-remote origin refs/heads/main refs/heads/feat/open-source-project-dissections
```

Expected: both refs resolve to the same approved 40-character commit. Use a normal push; never use `--force`.

- [ ] **Step 3: Find and wait for the exact Pages run**

```bash
set -e
head_sha=$(git rev-parse HEAD)
run_id=''
for attempt in $(seq 1 12); do
  run_id=$(gh run list --repo MengEn-Ink/agent-engineering-for-beginners --branch main --workflow 'Deploy book to GitHub Pages' --limit 10 --json databaseId,headSha --jq ".[] | select(.headSha == \"$head_sha\") | .databaseId" | head -n 1)
  if [ -n "$run_id" ]; then break; fi
  sleep 5
done
test -n "$run_id"
gh run watch "$run_id" --repo MengEn-Ink/agent-engineering-for-beginners --exit-status
run_sha=$(gh run view "$run_id" --repo MengEn-Ink/agent-engineering-for-beginners --json headSha --jq .headSha)
run_conclusion=$(gh run view "$run_id" --repo MengEn-Ink/agent-engineering-for-beginners --json conclusion --jq .conclusion)
test "$run_sha" = "$head_sha"
test "$run_conclusion" = 'success'
gh run view "$run_id" --repo MengEn-Ink/agent-engineering-for-beginners --json status,conclusion,headSha,url,jobs
```

Expected: build and deploy jobs both conclude `success`, and `headSha` equals the approved commit.

- [ ] **Step 4: Run the production HTTP matrix**

```bash
set -e
site_root='https://mengen-ink.github.io/agent-engineering-for-beginners'
cdn_ready=0
for attempt in $(seq 1 12); do
  course_code=$(curl -L -sS -o /tmp/course-production.html -w '%{http_code}' "$site_root/course/")
  projects_code=$(curl -L -sS -o /tmp/projects-production.html -w '%{http_code}' "$site_root/projects/")
  if [ "$course_code" = '200' ] && [ "$projects_code" = '200' ] \
    && rg -q '/agent-engineering-for-beginners/projects/aider' /tmp/course-production.html \
    && rg -q '六个核心源码拆解' /tmp/projects-production.html; then
    cdn_ready=1
    break
  fi
  sleep 5
done
test "$cdn_ready" -eq 1
routes=(
  course paths preface
  chapters/01-ai-native chapters/02-workflow-agent chapters/03-react
  chapters/04-tools-mcp chapters/05-state-memory chapters/06-loop-graph
  chapters/07-multi-agent chapters/08-evaluation chapters/09-safety-recovery
  chapters/10-production chapters/11-research-agent chapters/12-service-operations-agent
  chapters/13-coding-agent chapters/14-computer-use
  frontier/context-engineering frontier/interoperability-identity
  frontier/durable-execution frontier/agent-security-evaluation
  case-study/delivery-agent radar radar/2026-09
  appendix/glossary appendix/review-checklist appendix/reading
  appendix/application-matrix appendix/chapter-template appendix/interview
  appendix/interview-training
  projects projects/mcp-python-sdk projects/aider projects/openhands
  projects/agent-benchmarks projects/dify projects/crewai
  projects/history-autogpt-flowise
)
failures=()
for route in "${routes[@]}"; do
  for suffix in "" "/"; do
    url="$site_root/$route$suffix"
    code=$(curl -L -sS -o /dev/null -w '%{http_code}' "$url")
    if [ "$code" != '200' ]; then failures+=("$code $url"); fi
  done
done
root_code=$(curl -L -sS -o /dev/null -w '%{http_code}' "$site_root/")
if [ "$root_code" != '200' ]; then failures+=("$root_code $site_root/"); fi
for route in labs labs/example capstone capstone/example projects/unreviewed; do
  url="$site_root/$route/"
  code=$(curl -L -sS -o /dev/null -w '%{http_code}' "$url")
  if [ "$code" != '404' ]; then failures+=("$code $url"); fi
done
printf '%s\n' "${failures[@]}"
test "${#failures[@]}" -eq 0
```

Expected: all 79 positive requests return 200, all five negative requests return 404, and the failure array is empty.

- [ ] **Step 5: Run production browser, no-JavaScript, PDF, and HAR checks**

Before the page matrix, verify the deployed course and engineering-path contracts:

```bash
set -e
site_root='https://mengen-ink.github.io/agent-engineering-for-beginners'
agent-browser --session project-catalog-production open "$site_root/course/"
agent-browser --session project-catalog-production wait --load networkidle
agent-browser --session project-catalog-production eval 'const r={links:document.querySelectorAll(".course-map a").length,projectItems:document.querySelectorAll(".course-stage:nth-child(5) .course-item").length,overflow:document.documentElement.scrollWidth-innerWidth};if(r.links!==26||r.projectItems!==7||r.overflow!==0)throw new Error(JSON.stringify(r));JSON.stringify(r)'
agent-browser --session project-catalog-production open "$site_root/paths/"
agent-browser --session project-catalog-production find role button click --name '工程实战'
agent-browser --session project-catalog-production eval 'if(document.querySelectorAll(".path-step").length!==17||document.documentElement.scrollWidth!==innerWidth)throw new Error("engineering path mismatch");"17 steps"'
```

#### Responsive matrix

Use fresh production browser sessions and HARs, then exercise every page at both approved viewports:

```bash
set -e
rm -f /tmp/production-project-catalog-production.har
agent-browser --session project-catalog-production network har start
routes=(
  projects/
  projects/mcp-python-sdk
  projects/aider
  projects/openhands
  projects/agent-benchmarks
  projects/dify
  projects/crewai
  projects/history-autogpt-flowise
)
for viewport in '1440 1000 light desktop' '390 844 dark mobile'; do
  read -r width height theme label <<< "$viewport"
  agent-browser --session project-catalog-production set viewport "$width" "$height"
  agent-browser --session project-catalog-production set media "$theme"
  for route in "${routes[@]}"; do
    url="https://mengen-ink.github.io/agent-engineering-for-beginners/$route"
    agent-browser --session project-catalog-production open "$url"
    agent-browser --session project-catalog-production wait --load networkidle
    agent-browser --session project-catalog-production eval --stdin <<'EVALEOF'
(() => {
  const text = document.querySelector('.vp-doc')?.textContent ?? ''
  const isIndex = location.pathname.endsWith('/projects/')
  const required = isIndex
    ? ['核心源码拆解', '历史反例', '前沿高权限观察区', '不是初学者默认安装步骤']
    : ['固定版本', '仓库状态', '教学层级', '许可证边界', '源码事实', '本书归纳', '关键源码入口', '失败边界']
  const result = {
    url: location.href,
    width: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    missing: required.filter((item) => !text.includes(item)),
  }
  if (result.width !== result.scrollWidth || result.missing.length > 0) throw new Error(JSON.stringify(result))
  return JSON.stringify(result)
})()
EVALEOF
    agent-browser --session project-catalog-production screenshot "/tmp/${route//\//-}-${label}.png" --full
  done
done
```

Verify production keyboard order with real key events:

```bash
agent-browser --session project-catalog-production open https://mengen-ink.github.io/agent-engineering-for-beginners/projects/
agent-browser --session project-catalog-production press Tab
agent-browser --session project-catalog-production press Enter
agent-browser --session project-catalog-production press Tab
focus_log=$(mktemp)
for step in $(seq 1 16); do
  agent-browser --session project-catalog-production eval 'const el=document.activeElement;const r={tag:el?.tagName,text:el?.textContent?.trim(),outline:getComputedStyle(el).outline};if(!["A","SUMMARY"].includes(r.tag)||r.outline.includes("none")||r.outline.startsWith("0px"))throw new Error(JSON.stringify(r));JSON.stringify(r)' >> "$focus_log"
  agent-browser --session project-catalog-production press Tab
done
for label in 'MCP 规范与 Python SDK' 'Aider 源码拆解' 'OpenHands 源码拆解' 'Agent 评测基准' 'Dify 源码拆解' 'CrewAI 源码拆解' 'AutoGPT 与 Flowise' 'NousResearch/hermes-agent' 'openclaw/openclaw'; do
  rg -Fq "$label" "$focus_log"
done
```

Expected: all 16 page/viewport combinations have `scrollWidth === innerWidth`, all required visible text, and no console or page errors; focus follows DOM/visual order, reaches all internal and watch-only links, and has a non-zero outline.

#### Seven-PDF matrix

Generate a PDF for each non-index project page while on-screen license disclosures remain closed. Then validate page text with the seven Unicode ligature replacements `ﬀ/ﬁ/ﬂ/ﬃ/ﬄ/ﬅ/ﬆ`:

```bash
set -e
pdf_routes=(mcp-python-sdk aider openhands agent-benchmarks dify crewai history-autogpt-flowise)
for route in "${pdf_routes[@]}"; do
  agent-browser --session project-catalog-production open "https://mengen-ink.github.io/agent-engineering-for-beginners/projects/$route"
  agent-browser --session project-catalog-production eval 'const open=Array.from(document.querySelectorAll(".project-meta details")).filter((node)=>node.open).length;if(open!==0)throw new Error(String(open));"0 open disclosures"'
  agent-browser --session project-catalog-production pdf "/tmp/production-project-$route.pdf"
done
node --input-type=module <<'NODE'
import { readFileSync, writeFileSync } from 'node:fs'
import { parse } from 'yaml'
const catalog = parse(readFileSync('sources/project-index.yml', 'utf8'))
const subjects = Object.fromEntries(catalog.subjects.map((subject) => [subject.id, subject]))
const expected = Object.fromEntries(catalog.pages.slice(1).map((page) => [
  page.page_item_id.slice('project-'.length),
  page.subjects.flatMap((subjectId) => {
    const subject = subjects[subjectId]
    const url = (path) => `${subject.canonical_url}/blob/${subject.pinned_commit}/${path.split('/').map(encodeURIComponent).join('/')}`
    return [
      subject.pinned_commit,
      ...subject.entrypoints.flatMap((entry) => [entry.path, ...entry.symbols, entry.responsibility, url(entry.path)]),
      ...subject.license_sources.flatMap((source) => [source.path, url(source.path)]),
    ]
  }),
]))
writeFileSync('/tmp/production-project-pdf-expectations.json', JSON.stringify(expected))
NODE
python3 - <<'PY'
import json
from pathlib import Path
from pypdf import PdfReader
ligatures = str.maketrans({
    'ﬀ': 'ff', 'ﬁ': 'fi', 'ﬂ': 'fl', 'ﬃ': 'ffi', 'ﬄ': 'ffl', 'ﬅ': 'ft', 'ﬆ': 'st',
})
expected = json.loads(Path('/tmp/production-project-pdf-expectations.json').read_text(encoding='utf-8'))
blank_pages = 0
for route, required in expected.items():
    reader = PdfReader(f'/tmp/production-project-{route}.pdf')
    pages = [(page.extract_text() or '').translate(ligatures) for page in reader.pages]
    blank_pages += sum(not page.strip() for page in pages)
    compact = ''.join('\n'.join(pages).split())
    missing = [item for item in required if ''.join(item.translate(ligatures).split()) not in compact]
    assert not missing, f'{route} missing: {missing}'
assert blank_pages == 0, f'blank PDF pages: {blank_pages}'
print({'pdfs': len(expected), 'blank_pages': blank_pages, 'ligature_mappings': len(ligatures)})
PY
```

Expected: `{'pdfs': 7, 'blank_pages': 0, 'ligature_mappings': 7}`; every fixed source and license URL is present in extracted text, with no CSS pseudo-element URL reconstruction.

#### Fresh HAR and no-JavaScript matrix

Start the no-JavaScript route only after starting a new HAR, and remove prior artifacts so request counts cannot be inherited from earlier navigation:

```bash
set -e
rm -f /tmp/production-project-catalog-production-nojs.har
agent-browser --session project-catalog-production-nojs network har start
agent-browser --session project-catalog-production-nojs network route '**/*.js' --abort
for route in projects/ projects/mcp-python-sdk projects/aider projects/openhands projects/agent-benchmarks projects/dify projects/crewai projects/history-autogpt-flowise; do
  agent-browser --session project-catalog-production-nojs open "https://mengen-ink.github.io/agent-engineering-for-beginners/$route"
  agent-browser --session project-catalog-production-nojs eval --stdin <<'EVALEOF'
(() => {
  const text = document.querySelector('.vp-doc')?.textContent ?? ''
  const anchors = document.querySelectorAll('.vp-doc a').length
  const isIndex = location.pathname.endsWith('/projects/')
  const required = isIndex
    ? ['核心源码拆解', '历史反例', '前沿高权限观察区', '不是初学者默认安装步骤']
    : ['固定版本', '仓库状态', '教学层级', '许可证边界', '源码事实', '本书归纳', '关键源码入口', '失败边界']
  const missing = required.filter((item) => !text.includes(item))
  const pinnedSourceLinks = Array.from(document.querySelectorAll('.project-source-links a'))
  if (!text.trim() || anchors === 0 || missing.length
    || (!isIndex && (pinnedSourceLinks.length === 0
      || pinnedSourceLinks.some((anchor) => !/\/blob\/[0-9a-f]{40}\//u.test(anchor.href))))) {
    throw new Error(JSON.stringify({ url: location.href, anchors, missing }))
  }
  return JSON.stringify({ url: location.href, anchors, missing })
})()
EVALEOF
done
agent-browser --session project-catalog-production network har stop /tmp/production-project-catalog-production.har
agent-browser --session project-catalog-production-nojs network har stop /tmp/production-project-catalog-production-nojs.har
node --input-type=module <<'NODE'
import { readFileSync } from 'node:fs'
const sessions = [
  { path: '/tmp/production-project-catalog-production.har', allowAbortedJavaScript: false },
  { path: '/tmp/production-project-catalog-production-nojs.har', allowAbortedJavaScript: true },
]
const failures = []
const counts = []
for (const session of sessions) {
  const entries = JSON.parse(readFileSync(session.path, 'utf8'))?.log?.entries
  if (!Array.isArray(entries) || entries.length === 0) {
    failures.push(`${session.path}: HAR contains no request entries`)
    continue
  }
  let allowedAbortCount = 0
  for (const entry of entries) {
    const url = String(entry?.request?.url ?? '')
    const status = Number(entry?.response?.status)
    let isJavaScript = false
    try { isJavaScript = /\.m?js$/iu.test(new URL(url).pathname) } catch {}
    const allowedAbort = session.allowAbortedJavaScript && status <= 0 && isJavaScript
    if (allowedAbort) allowedAbortCount += 1
    if (!Number.isFinite(status) || status >= 400 || (status <= 0 && !allowedAbort)) {
      failures.push(`${session.path}: ${status} ${url}`)
    }
  }
  if (session.allowAbortedJavaScript && allowedAbortCount === 0) {
    failures.push(`${session.path}: no actively aborted JavaScript request was captured`)
  }
  counts.push({ path: session.path, requests: entries.length, allowedAbortCount })
}
if (failures.length > 0) throw new Error(`HAR network failures:\n${failures.join('\n')}`)
console.log(JSON.stringify(counts))
NODE
test -z "$(agent-browser --session project-catalog-production console)"
test -z "$(agent-browser --session project-catalog-production errors)"
test -z "$(agent-browser --session project-catalog-production-nojs console)"
test -z "$(agent-browser --session project-catalog-production-nojs errors)"
```

Expected: both fresh HARs contain at least one request; the normal session has no missing/zero status or response `>=400`; the no-JavaScript session has at least one intentionally aborted `.js`/`.mjs` request and no other missing/zero status or response `>=400`. Report the freshly measured `requests` and `allowedAbortCount`; do not reuse historical network counts.


Expected: course map reports 26 links and 7 project items; engineering path reports 17 steps; all 16 project page/viewport combinations have no overflow; all seven PDFs have zero blank pages and retain every full source/license URL after seven-ligature normalization; both fresh HARs satisfy the same status/abort policy as local acceptance; console and page-error outputs are empty.
- [ ] **Step 6: Report final evidence and close sessions**

```bash
set -e
agent-browser --session project-catalog-production close
agent-browser --session project-catalog-production-nojs close
git ls-remote origin refs/heads/main
git status --short --branch
```

Send the production site URL, `/projects/` URL, six core URLs, historical URL, commit SHA, Actions run URL, HTTP matrix result, browser/mobile/no-JS/print evidence, and any non-blocking freshness findings to the user and reviewer. This is the first step allowed to say that the second stage is deployed.

---

## Final acceptance checklist

- [ ] Eight exact project routes exist; no additional project, Lab, or capstone route is published.
- [ ] Six core pages follow all 13 sections and link only to pinned commits.
- [ ] The overview maps all 13 subjects; watch-only subjects appear nowhere else.
- [ ] AutoGPT is `active + historical`; Hermes/OpenClaw are `active + watch-only`; Flowise is `eol + archived:true + historical`.
- [ ] MCP contribution scopes coexist without path-conflict errors; Dify, AutoGPT, and Flowise path scopes resolve by specificity.
- [ ] Sixty-six file-level source entrypoints exist at their pinned commits.
- [ ] Course denominator is 26; project stage has seven items; engineering path has 17 steps; localStorage keys and old routes are unchanged.
- [ ] All diagrams are original; direct assets, if any, have exact provenance records.
- [ ] Source automation reports changes but never edits or publishes content.
- [ ] 1440px, 390px, light, dark, keyboard, screen-reader tree, no-JS, and print checks pass.
- [ ] `pnpm test`, `pnpm validate`, `pnpm build`, source report policy parsing, strict project freshness, and `git diff origin/main...HEAD --check` pass.
- [ ] Third-stage Python Lab and fourth-stage capstone remain absent.

## Delivery handoff

After the plan passes review, execute Tasks 1–13 from a fresh implementation worktree based on `main@815d761`. Use a fresh implementation agent for each task, then run both a specification review and a code-quality review before moving to the next task. Execute Task 14 only after explicit final reviewer approval.
