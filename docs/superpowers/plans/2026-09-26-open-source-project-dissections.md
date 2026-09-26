# Open Source Project Dissections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish one project overview, six version-pinned open-source project dissections, and one historical counterexample page while preserving source truth, license boundaries, existing URLs, local progress, and the separation from the future Python Lab Kit.

**Architecture:** `contentRegistry` remains the only owner of public page identity. A new `sources/project-index.yml` owns repository pins, repository status, catalog tier, license scopes, source entrypoints, page-to-subject mappings, and call-chain data; a Node loader validates it for tests, builds, and weekly freshness checks, while a VitePress data loader exposes the same serializable data to four SSR-safe Vue components. Markdown owns teaching prose, course/navigation files reference stable item IDs, and automation may report upstream changes but never rewrite or publish content.

**Tech Stack:** VitePress 1.6, Vue 3, TypeScript, JavaScript ESM, YAML 2.8, Vitest 3.2, GitHub Actions, GitHub REST API, GitHub Pages

---

## Scope and file map

**Create:**

- `sources/project-index.yml` — canonical project-page mapping, 13 pinned subjects, license scopes, 57 file-level source entrypoints, and seven primary chains.
- `scripts/project-catalog.mjs` — schema parser, discriminated license validation, cross-reference validation, and build-time loader.
- `scripts/project-catalog.d.mts` — TypeScript declaration for the Node catalog loader.
- `scripts/check-projects.mjs` — bounded GitHub freshness scan that writes project review reports without editing content.
- `scripts/validate-provenance.mjs` — allowlist gate for any future file in `docs/public/project-assets/`.
- `assets/provenance.yml` — empty versioned registry; no external asset is added in this phase.
- `docs/.vitepress/theme/data/projectCatalog.data.ts` — VitePress build-time loader for the validated YAML catalog.
- `docs/.vitepress/theme/data/projectCatalogTypes.ts` — serializable catalog types shared by the loader, pure lookup, and components.
- `docs/.vitepress/theme/data/projectCatalogCore.ts` — pure injectable lookup factory used by Vitest without VitePress virtual data.
- `docs/.vitepress/theme/data/projectCatalog.ts` — typed, fail-closed page/subject/chain lookup helpers.
- `docs/.vitepress/theme/components/ProjectOverview.vue` — SSR index for core, historical, and watch-only entries.
- `docs/.vitepress/theme/components/ProjectMeta.vue` — fixed pin, repository status, catalog tier, and license summary.
- `docs/.vitepress/theme/components/ProjectCallChain.vue` — one primary call chain with native list semantics and a text fallback.
- `docs/.vitepress/theme/components/ProjectSourceLinks.vue` — fixed-commit GitHub source links.
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
- `docs/.vitepress/theme/style.css` — restrained metadata, call-chain, mobile, focus, dark, and print rules.
- `docs/.vitepress/config.mts` — add project overview to the top nav and the exact eight-item project sidebar group.
- `scripts/validate-content.mjs` — include project catalog and provenance validation.
- `scripts/check-dist.mjs` — allow exactly eight project outputs, require 26 course targets, and keep all labs/capstone outputs forbidden.
- `tests/course-map.spec.ts` — exact 39-item registry, 26-item course graph, and 17-step engineering path.
- `tests/content.spec.ts` — project page template, public boundary, route, and component registration assertions.
- `tests/source-freshness.spec.ts` — project freshness failure classification and token-scope regressions.
- `.github/workflows/source-freshness.yml` — run the project scan in the read-only job and report from the token-isolated job.
- `package.json` — add scoped Vue type checking, make build invoke it, and add `projects:check`.
- `pnpm-lock.yaml` — lock `vue-tsc@3.3.11` added by the package manager.
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
| 8 page mappings, 13 exact subjects, 57 exact file-level source entries, 7 chains | Task 2 |
| VitePress loader, pure Vitest lookup, Vue type gate | Task 3 |
| Separate architecture graph, text call chain, source facts, print fallback | Task 3 |
| Intermediate commits remain buildable while pages arrive | Task 4 and every task-level full gate |
| Six core narratives, history page, watch-only safety zone | Tasks 5–8 |
| 26-item course, 29 tracked routes, 17-step engineering path, full nav | Task 9 |
| Strict host/repo/ref/path/license provenance | Task 10 |
| Default-branch HEAD, release, pin, path, license digest, permissions | Task 11 |
| Exact eight-page dist allowlist and complete SSR contract | Task 12 |
| Local mobile, keyboard, screen reader, no-JS, print and route evidence | Task 13 |
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
      contentRegistryText: "export const contentItems = [{ id: 'other' }]",
      interviewQuestionsText: "question('iq-other', 1, 'x', '工程', '基础', 'x', 'x', [], [], 'x')",
    })).toEqual([
      'Project page is missing from contentRegistry: project-aider',
      'Project page project-aider references unknown interview question: iq-13-a',
    ])
    expect(validateProjectCatalogIntegration(validCatalog, {
      contentRegistryText: "export const contentItems = [{ id: 'project-aider' }]",
      interviewQuestionsText: "question('iq-13-a', 13, 'x', '工程', '基础', 'x', 'x', [], [], 'x')",
    })).toEqual([])
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

export function validateProjectCatalogIntegration(data, { contentRegistryText, interviewQuestionsText }) {
  const errors = []
  const contentIds = new Set(Array.from(
    contentRegistryText.matchAll(/\{\s*id:\s*'([^']+)'/gu),
    (match) => match[1],
  ))
  const questionIds = new Set(Array.from(
    interviewQuestionsText.matchAll(/question\(\s*'([^']+)'/gu),
    (match) => match[1],
  ))
  for (const page of data.pages ?? []) {
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
export function validateProjectCatalogIntegration(data: unknown, sources: { contentRegistryText: string; interviewQuestionsText: string }): string[]
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

Expected: 7 focused tests pass, followed by a green full suite, validation, and production build.

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
  dify: ['api/controllers/service_api/app/workflow.py', 'api/core/app/apps/workflow/app_generator.py', 'api/core/app/apps/workflow/app_runner.py', 'api/core/workflow/workflow_entry.py', 'api/core/workflow/node_factory.py', 'api/core/workflow/nodes/agent_v2/agent_node.py', 'api/core/app/apps/common/workflow_response_converter.py'],
  crewai: ['lib/crewai/src/crewai/crew.py', 'lib/crewai/src/crewai/process.py', 'lib/crewai/src/crewai/execution.py', 'lib/crewai/src/crewai/task.py', 'lib/crewai/src/crewai/agent/core.py', 'lib/crewai/src/crewai/agents/crew_agent_executor.py', 'lib/crewai/src/crewai/agents/step_executor.py', 'lib/crewai/src/crewai/tools/tool_usage.py'],
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
    'openhands-agent-server/openhands/agent_server/event_service.py': ['EventService.send_message', 'EventService.run', 'EventService.subscribe_to_events', 'AsyncCallbackWrapper.__call__', 'EventService._pub_sub'],
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
}
const expectedChains = {
  'mcp-tool-call': ['schema:mcp-spec:schema/2026-07-28/schema.json:CallToolRequest', 'host-run:mcp-python-sdk:src/mcp/server/mcpserver/server.py:MCPServer.run', 'transport:mcp-python-sdk:src/mcp/server/stdio.py:stdio_server', 'server-run:mcp-python-sdk:src/mcp/server/lowlevel/server.py:Server.run', 'runner-loop:mcp-python-sdk:src/mcp/server/runner.py:serve_dual_era_loop', 'dispatcher-loop:mcp-python-sdk:src/mcp/shared/jsonrpc_dispatcher.py:JSONRPCDispatcher.run', 'dispatcher-request:mcp-python-sdk:src/mcp/shared/jsonrpc_dispatcher.py:JSONRPCDispatcher._dispatch_request', 'request:mcp-python-sdk:src/mcp/server/runner.py:ServerRunner._on_request', 'dispatch:mcp-python-sdk:src/mcp/server/lowlevel/server.py:get_request_handler', 'mcp-handler:mcp-python-sdk:src/mcp/server/mcpserver/server.py:MCPServer._handle_call_tool', 'mcp-call:mcp-python-sdk:src/mcp/server/mcpserver/server.py:MCPServer.call_tool', 'tool-lookup:mcp-python-sdk:src/mcp/server/mcpserver/tools/tool_manager.py:ToolManager.call_tool', 'tool-run:mcp-python-sdk:src/mcp/server/mcpserver/tools/base.py:Tool.run', 'tool-function:mcp-python-sdk:examples/snippets/servers/basic_tool.py:sum', 'serialize:mcp-python-sdk:src/mcp/server/runner.py:ServerRunner._serialize', 'dispatcher-response:mcp-python-sdk:src/mcp/shared/jsonrpc_dispatcher.py:JSONRPCDispatcher._write_result', 'stdout:mcp-python-sdk:src/mcp/server/stdio.py:stdio_server'],
  'aider-repo-to-verified-edit': ['cli:aider:aider/main.py:main', 'run:aider:aider/coders/base_coder.py:Coder.run', 'turn:aider:aider/coders/base_coder.py:Coder.run_one', 'context:aider:aider/coders/base_coder.py:Coder.send_message', 'repo-map:aider:aider/repomap.py:RepoMap.get_repo_map', 'send:aider:aider/coders/base_coder.py:Coder.send', 'completion:aider:aider/models.py:Model.send_completion', 'parse:aider:aider/coders/editblock_coder.py:EditBlockCoder.get_edits', 'apply-updates:aider:aider/coders/base_coder.py:Coder.apply_updates', 'dry-run:aider:aider/coders/editblock_coder.py:EditBlockCoder.apply_edits_dry_run', 'prepare:aider:aider/coders/base_coder.py:Coder.prepare_to_edit', 'apply:aider:aider/coders/editblock_coder.py:EditBlockCoder.apply_edits', 'write:aider:aider/io.py:InputOutput.write_text', 'auto-commit:aider:aider/coders/base_coder.py:Coder.auto_commit', 'commit:aider:aider/repo.py:GitRepo.commit', 'auto-lint:aider:aider/coders/base_coder.py:Coder.lint_edited', 'lint-commit:aider:aider/coders/base_coder.py:Coder.auto_commit', 'shell-confirm:aider:aider/io.py:InputOutput.confirm_ask', 'shell-run:aider:aider/coders/base_coder.py:Coder.handle_shell_commands', 'auto-test:aider:aider/commands.py:Commands.cmd_test', 'reflection:aider:aider/coders/base_coder.py:Coder.run_one'],
  'openhands-canvas-to-workspace-event': ['chat-submit:openhands-canvas:src/components/features/chat/chat-interface.tsx:handleSendMessage', 'hook-send:openhands-canvas:src/hooks/use-send-message.ts:useSendMessage().send', 'canvas-send:openhands-canvas:src/contexts/conversation-websocket-context.tsx:ConversationWebSocketProvider.sendMessage', 'socket-receive:openhands-sdk:openhands-agent-server/openhands/agent_server/sockets.py:events_socket', 'service-message:openhands-sdk:openhands-agent-server/openhands/agent_server/event_service.py:EventService.send_message', 'conversation-message:openhands-sdk:openhands-sdk/openhands/sdk/conversation/impl/local_conversation.py:LocalConversation.send_message', 'service-run:openhands-sdk:openhands-agent-server/openhands/agent_server/event_service.py:EventService.run', 'conversation-run:openhands-sdk:openhands-sdk/openhands/sdk/conversation/impl/local_conversation.py:LocalConversation.arun', 'agent-step:openhands-sdk:openhands-sdk/openhands/sdk/agent/agent.py:Agent.astep', 'dispatch-tool-calls:openhands-sdk:openhands-sdk/openhands/sdk/agent/response_dispatch.py:_ahandle_tool_calls', 'execute-actions:openhands-sdk:openhands-sdk/openhands/sdk/agent/agent.py:Agent._aexecute_actions', 'tool-call:openhands-sdk:openhands-sdk/openhands/sdk/tool/tool.py:ToolDefinition.__call__', 'persist-event:openhands-sdk:openhands-sdk/openhands/sdk/conversation/impl/local_conversation.py:LocalConversation.__init__', 'async-callback:openhands-sdk:openhands-agent-server/openhands/agent_server/event_service.py:AsyncCallbackWrapper.__call__', 'publish-event:openhands-sdk:openhands-agent-server/openhands/agent_server/event_service.py:EventService._pub_sub', 'subscriber-event:openhands-sdk:openhands-agent-server/openhands/agent_server/sockets.py:_WebSocketSubscriber.__call__', 'socket-send:openhands-sdk:openhands-agent-server/openhands/agent_server/sockets.py:_send_event', 'canvas-receive:openhands-canvas:src/contexts/conversation-websocket-context.tsx:ConversationWebSocketProvider.handleMainMessage'],
  'benchmark-task-to-score': ['swe-input:swe-bench:swebench/harness/run_evaluation.py:main', 'swe-env:swe-bench:swebench/harness/docker_utils.py:exec_run_with_timeout', 'swe-grade:swe-bench:swebench/harness/grading.py:get_eval_report', 'swe-report:swe-bench:swebench/harness/reporting.py:make_run_report', 'tau-cli:tau2-bench:src/tau2/cli.py:main', 'tau-domain:tau2-bench:src/tau2/runner/batch.py:run_domain', 'tau-load:tau2-bench:src/tau2/runner/helpers.py:get_tasks', 'tau-batch:tau2-bench:src/tau2/runner/batch.py:run_tasks', 'tau-task:tau2-bench:src/tau2/runner/batch.py:run_single_task', 'tau-build:tau2-bench:src/tau2/runner/build.py:build_orchestrator', 'tau-sim:tau2-bench:src/tau2/runner/simulation.py:run_simulation', 'tau-orchestrator:tau2-bench:src/tau2/orchestrator/orchestrator.py:BaseOrchestrator.run', 'tau-environment:tau2-bench:src/tau2/environment/environment.py:Environment.make_tool_call', 'tau-trajectory:tau2-bench:src/tau2/runner/simulation.py:run_simulation', 'tau-evaluate:tau2-bench:src/tau2/evaluator/evaluator.py:evaluate_simulation', 'tau-reward:tau2-bench:src/tau2/evaluator/evaluator.py:evaluate_simulation'],
  'dify-request-to-graph-events': ['controller:dify:api/controllers/service_api/app/workflow.py:WorkflowRunApi.post', 'generator:dify:api/core/app/apps/workflow/app_generator.py:WorkflowAppGenerator', 'runner:dify:api/core/app/apps/workflow/app_runner.py:WorkflowAppRunner', 'entry:dify:api/core/workflow/workflow_entry.py:WorkflowEntry', 'factory:dify:api/core/workflow/node_factory.py:DifyNodeFactory', 'agent-node:dify:api/core/workflow/nodes/agent_v2/agent_node.py:DifyAgentNode', 'response:dify:api/core/app/apps/common/workflow_response_converter.py:WorkflowResponseConverter'],
  'crewai-kickoff-to-task-output': ['kickoff:crewai:lib/crewai/src/crewai/crew.py:Crew.kickoff', 'process:crewai:lib/crewai/src/crewai/process.py:Process', 'execution:crewai:lib/crewai/src/crewai/execution.py:begin_execution', 'task:crewai:lib/crewai/src/crewai/task.py:Task.execute_sync', 'agent:crewai:lib/crewai/src/crewai/agent/core.py:Agent.execute_task', 'executor:crewai:lib/crewai/src/crewai/agents/crew_agent_executor.py:CrewAgentExecutor.invoke', 'step:crewai:lib/crewai/src/crewai/agents/step_executor.py:StepExecutor.execute', 'tool:crewai:lib/crewai/src/crewai/tools/tool_usage.py:ToolUsage.use', 'output:crewai:lib/crewai/src/crewai/task.py:Task._export_output'],
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
const expectedSubjectDigests = {
  'mcp-spec': '492729a2b1d5e3690d4d4eb8ffb8a6f9089a8d3e21b7a284d49b6c9100788801',
  'mcp-python-sdk': '21a74ad2294a17ef639fb92539bee85e299dd9cc71fea3e6db72d615da7db867',
  aider: '5e52014bcd913a55fbbaed8dcdf44cff28bcf19d6d6af5b33264c0bb1caec388',
  'openhands-canvas': '05fb380eafe106924eb9bb17f712d73b75c8b0c7e8d0cd10696cb830798c5ed4',
  'openhands-sdk': '49b57ad1cb32ce8084c8c0fa75ae6976543e76ca70893e858403699410bea8f8',
  'swe-bench': 'e356c00937817246deae70028e1d8068a2e9426e33f5d77e5b44e485adb3efaa',
  'tau2-bench': '9ce153cca427f514e1d8b1b727931efa4ab2f8767fac1019117219ef17bb99d9',
  dify: '6881c250b6f94d1ff50aa54d77a493cacb672796350e9c8281b2cc639563d683',
  crewai: 'c08cfcd2380dbb33b118271457a61aa9b716325f29e25613cc1ddb94a6bd7b56',
  autogpt: '33d5cf4286bca6be740451dc94daf9c77d633318e95f38760b980c5699d66bf4',
  flowise: '4c2438da4a88f32b9f6089b64b35bbb383bf60d6b8a9258a5af1e2f5a3b360f5',
  'hermes-agent': 'b1e7efda63633c8af2b155954e2a0145428c19795399837ac745f3681e0a66c4',
  openclaw: '9eb64f3e66b9ca1449a291d1abcdd39493e1ab262467c7b86dceae6792bded62',
}
const expectedChainDigests = {
  'mcp-tool-call': '54b46cce64ce2559ae2656a61335d2b92df9df99fdf87e1b7215efe76d4a1ab4',
  'aider-repo-to-verified-edit': '222bc344a8184b8ff7cac95a1e36f620a50a58cacb0f61b459132238164486ce',
  'openhands-canvas-to-workspace-event': 'e28817b291e43fa1371c2e2174421af65921b4a8e5c7089216b69d475fbb702e',
  'benchmark-task-to-score': 'fc1b273a3f59963d7e35c73718ca408b468dc92ad999dc179faf736cffc1df89',
  'dify-request-to-graph-events': '060d82f9c004cfb20a95ccf3a951383bb7715b47ba25abb1232dcfc9034b6a50',
  'crewai-kickoff-to-task-output': '4a3711ad6debf20e72f0732a6719b0bf9a7e2ae9153cc141a8bb800eb9d9c058',
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
    expect(digest(catalog)).toBe('0f46cd636fafd2e62a593558aa0efc8ed700cfe2326197104333f4d9e7b549c5')
    expect(catalog.pages.map((page: { page_item_id: string }) => page.page_item_id)).toEqual(pageIds)
    expect(catalog.subjects.map((subject: { id: string }) => subject.id)).toEqual(subjectIds)
    expect(Object.fromEntries(catalog.subjects.map((subject: any) => [subject.id, [
      subject.canonical_repo, subject.pinned_ref, subject.pinned_commit,
      subject.repository_status, subject.archived, subject.catalog_tier,
      subject.license_sources.map((source: { path: string; sha256: string }) => `${source.path}:${source.sha256}`).join('|'),
    ]]))).toEqual(expectedSubjectFacts)
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
    expect(sourceEntries).toHaveLength(57)
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
    const openHandsChain = catalog.chains.find((chain: { id: string }) => chain.id === 'openhands-canvas-to-workspace-event')
    expect(openHandsChain.misconception).toContain('environment and configuration source')
    expect(JSON.stringify(openHandsChain)).not.toMatch(/owns tool resources|owner boundary/iu)
    expect(openHandsChain.steps.map((step: { track?: string }) => step.track)).toEqual([
      ...Array(6).fill('message 入站'),
      ...Array(6).fill('action / observation 执行'),
      ...Array(6).fill('durable event 回流'),
    ])
    const benchmarkChain = catalog.chains.find((chain: { id: string }) => chain.id === 'benchmark-task-to-score')
    const trackSizes = Object.values(Object.groupBy(
      benchmarkChain.steps,
      (step: { track?: string }) => step.track ?? 'main',
    )).map((steps) => steps?.length ?? 0)
    expect(Math.max(...trackSizes)).toBeLessThanOrEqual(12)
    const aiderChain = catalog.chains.find((chain: { id: string }) => chain.id === 'aider-repo-to-verified-edit')
    expect(aiderChain.steps.map((step: { id: string; track?: string; label: string }) =>
      [step.id, step.track, step.label],
    )).toEqual(expectedAiderTracksAndLabels)
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

The full-catalog SHA-256 assertion covers exact top-level structure and ordering. The per-subject assertion covers the complete parsed subject object, including `pin_kind`, `license_summary`, ordered `license_scopes`, `watch_url`, `license_sources`, and every entrypoint `path/symbols/responsibility`. The per-chain digest covers `page_item_id`, label, reading hint, misconception, and every ordered step field; changing any value requires an intentional expected-digest review. All three digest layers must be computed from the concatenated YAML snippets below after parsing; never hand-edit or guess a digest.

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
    repository_status: active
    archived: false
    catalog_tier: core
    license_summary: MIT; the pinned Canvas release consumes the matching TypeScript client version 1.49.6.
    license_scopes: *mit_scope
    license_sources: [{ path: LICENSE, sha256: 14a9b631c658eee682c6c2973525fbdf808c3457176bc47513052c559cc5ce86 }]
    watch_url: https://github.com/OpenHands/software-agent-sdk/releases/latest
    entrypoints:
      - { path: openhands-agent-server/openhands/agent_server/sockets.py, symbols: [events_socket, _WebSocketSubscriber.__call__, _send_event], responsibility: Subscribe the WebSocket to an existing conversation and send published events back to Canvas. }
      - { path: openhands-agent-server/openhands/agent_server/event_service.py, symbols: [EventService.send_message, EventService.run, EventService.subscribe_to_events, AsyncCallbackWrapper.__call__, EventService._pub_sub], responsibility: Forward messages to LocalConversation and bridge its durable callback through PubSub. }
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
      - { path: api/controllers/service_api/app/workflow.py, symbols: [WorkflowRunApi.post], responsibility: Validate and admit a workflow request. }
      - { path: api/core/app/apps/workflow/app_generator.py, symbols: [WorkflowAppGenerator], responsibility: Build the application execution context. }
      - { path: api/core/app/apps/workflow/app_runner.py, symbols: [WorkflowAppRunner], responsibility: Start and supervise workflow execution. }
      - { path: api/core/workflow/workflow_entry.py, symbols: [WorkflowEntry], responsibility: Configure Graphon and execution layers. }
      - { path: api/core/workflow/node_factory.py, symbols: [DifyNodeFactory], responsibility: Resolve versioned node implementations. }
      - { path: api/core/workflow/nodes/agent_v2/agent_node.py, symbols: [DifyAgentNode], responsibility: Execute the agent-specific node contract. }
      - { path: api/core/app/apps/common/workflow_response_converter.py, symbols: [WorkflowResponseConverter], responsibility: Convert graph events to the public response stream. }

  - id: crewai
    canonical_repo: crewAIInc/crewAI
    canonical_url: https://github.com/crewAIInc/crewAI
    pin_kind: release
    pinned_ref: 1.15.22
    pinned_commit: 7a01af27912c2b142d8bac70d1894343f8b91bd1
    repository_status: active
    archived: false
    catalog_tier: core
    license_summary: MIT; current source paths live under the lib/crewai monorepo package.
    license_scopes: *mit_scope
    license_sources: [{ path: LICENSE, sha256: 28868731966f4aa37f02879839aabc797137e27ddde4e274ef9cf965f9a71774 }]
    watch_url: https://github.com/crewAIInc/crewAI/releases/latest
    entrypoints:
      - { path: lib/crewai/src/crewai/crew.py, symbols: [Crew.kickoff], responsibility: Initialize crew execution and choose a process. }
      - { path: lib/crewai/src/crewai/process.py, symbols: [Process], responsibility: Define the orchestration mode. }
      - { path: lib/crewai/src/crewai/execution.py, symbols: [begin_execution], responsibility: Establish shared execution and tracing state. }
      - { path: lib/crewai/src/crewai/task.py, symbols: [Task.execute_sync, Task._export_output], responsibility: Bind expected output and delegate work to an agent. }
      - { path: lib/crewai/src/crewai/agent/core.py, symbols: [Agent.execute_task], responsibility: Prepare and launch task-specific agent execution. }
      - { path: lib/crewai/src/crewai/agents/crew_agent_executor.py, symbols: [CrewAgentExecutor.invoke], responsibility: Run the reasoning and tool loop. }
      - { path: lib/crewai/src/crewai/agents/step_executor.py, symbols: [StepExecutor.execute], responsibility: Execute one parsed agent step. }
      - { path: lib/crewai/src/crewai/tools/tool_usage.py, symbols: [ToolUsage.use], responsibility: Invoke a selected tool and record its outcome. }
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
      - { id: async-callback, track: durable event 回流, label: Async callback bridge, subject_id: openhands-sdk, source_path: openhands-agent-server/openhands/agent_server/event_service.py, symbol: AsyncCallbackWrapper.__call__, responsibility: Schedule the EventService PubSub callback on its event loop after persistence. }
      - { id: publish-event, track: durable event 回流, label: EventService PubSub, subject_id: openhands-sdk, source_path: openhands-agent-server/openhands/agent_server/event_service.py, symbol: EventService._pub_sub, responsibility: Publish through PubSub to the subscribers registered by EventService.subscribe_to_events. }
      - { id: subscriber-event, track: durable event 回流, label: WebSocket subscriber, subject_id: openhands-sdk, source_path: openhands-agent-server/openhands/agent_server/sockets.py, symbol: _WebSocketSubscriber.__call__, responsibility: Receive the published event and delegate WebSocket serialization. }
      - { id: socket-send, track: durable event 回流, label: WebSocket event send, subject_id: openhands-sdk, source_path: openhands-agent-server/openhands/agent_server/sockets.py, symbol: _send_event, responsibility: Serialize and send the subscribed event to Canvas. }
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
      - { id: tau-evaluate, track: tau2-bench, label: Evaluation branch, subject_id: tau2-bench, source_path: src/tau2/evaluator/evaluator.py, symbol: evaluate_simulation, responsibility: Separate single evaluation types and *_IGNORE_BASIS modes from the default EvaluationType.ALL basis-aware branch. }
      - { id: tau-reward, track: tau2-bench, label: Reward info, subject_id: tau2-bench, source_path: src/tau2/evaluator/evaluator.py, symbol: evaluate_simulation, responsibility: For default ALL multiply only task.reward_basis components so ACTION gates only when selected; premature termination returns 0.0 and missing criteria returns 1.0. }

  - id: dify-request-to-graph-events
    page_item_id: project-dify
    label: Service API request to graph events
    reading_hint: Follow one workflow execution path and ignore unrelated platform subsystems.
    misconception: A visual node graph does not remove runtime, authorization, or persistence complexity.
    steps:
      - { id: controller, label: Service API, subject_id: dify, source_path: api/controllers/service_api/app/workflow.py, symbol: WorkflowRunApi.post, responsibility: Validate and admit the workflow request. }
      - { id: generator, label: App generator, subject_id: dify, source_path: api/core/app/apps/workflow/app_generator.py, symbol: WorkflowAppGenerator, responsibility: Build the application execution context. }
      - { id: runner, label: App runner, subject_id: dify, source_path: api/core/app/apps/workflow/app_runner.py, symbol: WorkflowAppRunner, responsibility: Start and supervise the workflow execution. }
      - { id: entry, label: Workflow entry, subject_id: dify, source_path: api/core/workflow/workflow_entry.py, symbol: WorkflowEntry, responsibility: Configure Graphon and execution layers. }
      - { id: factory, label: Node factory, subject_id: dify, source_path: api/core/workflow/node_factory.py, symbol: DifyNodeFactory, responsibility: Resolve versioned node implementations. }
      - { id: agent-node, label: Agent node, subject_id: dify, source_path: api/core/workflow/nodes/agent_v2/agent_node.py, symbol: DifyAgentNode, responsibility: Execute the agent-specific node contract. }
      - { id: response, label: Event response, subject_id: dify, source_path: api/core/app/apps/common/workflow_response_converter.py, symbol: WorkflowResponseConverter, responsibility: Convert runtime events into the public response stream. }

  - id: crewai-kickoff-to-task-output
    page_item_id: project-crewai
    label: Crew kickoff to task output
    reading_hint: Use the sequential process as one concrete chain, not as a claim about every mode.
    misconception: Named roles do not create permission isolation or measurable quality by themselves.
    steps:
      - { id: kickoff, label: Crew kickoff, subject_id: crewai, source_path: lib/crewai/src/crewai/crew.py, symbol: Crew.kickoff, responsibility: Initialize crew execution and inputs. }
      - { id: process, label: Process choice, subject_id: crewai, source_path: lib/crewai/src/crewai/process.py, symbol: Process, responsibility: Select the orchestration policy. }
      - { id: execution, label: Execution state, subject_id: crewai, source_path: lib/crewai/src/crewai/execution.py, symbol: begin_execution, responsibility: Carry shared execution and tracing state. }
      - { id: task, label: Task, subject_id: crewai, source_path: lib/crewai/src/crewai/task.py, symbol: Task.execute_sync, responsibility: Bind expected output and delegate work to an agent. }
      - { id: agent, label: Agent, subject_id: crewai, source_path: lib/crewai/src/crewai/agent/core.py, symbol: Agent.execute_task, responsibility: Prepare and launch task-specific execution. }
      - { id: executor, label: Agent executor, subject_id: crewai, source_path: lib/crewai/src/crewai/agents/crew_agent_executor.py, symbol: CrewAgentExecutor.invoke, responsibility: Run the reasoning and tool loop. }
      - { id: step, label: Step executor, subject_id: crewai, source_path: lib/crewai/src/crewai/agents/step_executor.py, symbol: StepExecutor.execute, responsibility: Execute one parsed agent step. }
      - { id: tool, label: Tool usage, subject_id: crewai, source_path: lib/crewai/src/crewai/tools/tool_usage.py, symbol: ToolUsage.use, responsibility: Invoke a tool and record its outcome. }
      - { id: output, label: Task output, subject_id: crewai, source_path: lib/crewai/src/crewai/task.py, symbol: Task._export_output, responsibility: Return the normalized task result to crew orchestration. }

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

  it('registers four components with native list and disclosure semantics', () => {
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
    for (const field of ['row.path', 'row.symbols', 'row.responsibility']) expect(sources).toContain(field)
    expect(sources).toContain("row.symbols.join(' · ')")
    const overview = readFileSync('docs/.vitepress/theme/components/ProjectOverview.vue', 'utf8')
    expect(overview).toContain('subject.risk_tags')
    for (const id of ['frontier-agent-security-evaluation', 'chapter-09-safety-recovery', 'radar']) {
      expect(overview).toContain(id)
    }
  })

  it('uses only local theme tokens and includes mobile, focus, dark, and print rules', () => {
    const style = readFileSync('docs/.vitepress/theme/style.css', 'utf8')
    expect(style).toContain('.project-meta')
    expect(style).toContain('.project-call-chain')
    expect(style).toContain('.project-overview')
    expect(style).toContain('@media (max-width: 700px)')
    expect(style).toContain('@media print')
    expect(style).toContain(':focus-visible')
    expect(style).not.toMatch(/project-[^{]+\{[^}]*#[0-9a-f]{6}/isu)
  })

  it('enforces the scoped Vue and TypeScript check during production builds', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
    expect(pkg.scripts['typecheck:projects']).toBe('vue-tsc --noEmit -p tsconfig.projects.json')
    expect(pkg.scripts.build).toContain('pnpm typecheck:projects')
    expect(pkg.devDependencies['vue-tsc']).toBe('^3.3.11')
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

Run `pnpm add -D vue-tsc@3.3.11`. Add these scripts:

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
            <li v-for="scope in subject.license_scopes" :key="`${scope.expression}-${scope.path_or_glob ?? scope.selector}`" role="listitem">
              <code>{{ scope.basis }}</code> · <code>{{ scope.expression }}</code> ·
              <code>{{ scope.path_or_glob ?? scope.selector }}</code> · {{ scope.scope }} — {{ scope.note }}
            </li>
          </ul>
          <p>
            许可证原文：
            <a v-for="source in subject.license_sources" :key="source.path" :href="projectSourceUrl(subject.id, source.path)"><code>{{ source.path }}</code></a>
          </p>
        </details>
        <div class="project-license-print" aria-hidden="true">
          <p><strong>许可证摘要：</strong>{{ subject.license_summary }}</p>
          <ul>
            <li v-for="scope in subject.license_scopes" :key="`print-${scope.expression}-${scope.path_or_glob ?? scope.selector}`">
              {{ scope.basis }} · {{ scope.expression }} · {{ scope.path_or_glob ?? scope.selector }} · {{ scope.scope }} — {{ scope.note }}
            </li>
          </ul>
          <p v-for="source in subject.license_sources" :key="`print-license-${source.path}`">
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
  content: '→';
  position: absolute;
  inset-inline-end: -0.65rem;
  color: var(--reading-link);
}

.project-call-chain li {
  display: grid;
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
  border-left: 3px solid var(--reading-risk);
  padding-left: 0.8rem;
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
  .project-call-chain { grid-template-columns: 1fr; }
  .project-architecture-nodes span:not(:last-child)::after {
    content: '↓';
    inset-inline-end: auto;
    inset-block-end: -0.8rem;
    inset-inline-start: 50%;
  }
  .project-meta,
  .project-chain-section,
  .project-overview section { padding: 0.9rem; }
}

@media print {
  .project-meta details { display: none !important; }
  .project-license-print { display: block !important; }
  .project-architecture { display: none !important; }
  .project-call-chain { grid-template-columns: 1fr; }
  .project-source-links a[href]::after { content: " (" attr(href) ")"; overflow-wrap: anywhere; }
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
    expect(text).toContain('`EventService.subscribe_to_events`')
    expect(text).toContain('`_WebSocketSubscriber.__call__`')
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
    expect(text).toContain('按 `task.reward_basis` 选择分量后相乘')
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

从 `handleSendMessage` 与 `useSendMessage().send` 进入 WebSocket 后，`events_socket` 通过 `EventService.subscribe_to_events` 注册订阅，并把消息交给 `EventService.send_message`，后者直接调用 `LocalConversation.send_message` 写入用户 `MessageEvent`。`EventService.run` 只启动已有 conversation 的执行，不拥有订阅；执行侧再由 `LocalConversation.arun` 和 `Agent.astep` 推进，tool call 被转成 `ActionEvent`，工具结果形成 `Observation`。事件回流由 `LocalConversation.__init__` 组装的 callback 保证持久化 append 先发生，再依次经过 `AsyncCallbackWrapper.__call__`、EventService `_pub_sub`/PubSub、`_WebSocketSubscriber.__call__` 与 `_send_event` 回到 Canvas event store。图中的三条 track 不是一条跨异步边界的同步调用栈。

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

SWE-bench 将实例和预测 patch 放入隔离环境，运行目标测试并由 grading 生成解决状态。τ²-bench 由当前 CLI 调用 batch runner，构建 agent、user、environment 与 orchestrator；simulation 保留 trajectory。只有默认 `EvaluationType.ALL` 按 `task.reward_basis` 选择分量后相乘，ACTION 只有被选中时才是硬门禁；单项类型与 `*_IGNORE_BASIS` 各走自己的分支。early termination 返回 `0.0`，没有 criteria 时返回 `1.0`，这些短路结果不能冒充默认 ALL 分支的乘积。

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
    expect(dify).toContain('修改版 Apache-2.0')
    expect(dify).toContain('Graphon')
    const crew = readFileSync('docs/projects/crewai.md', 'utf8')
    expect(crew).toContain('sequential process')
    expect(crew).toContain('角色名称不会自动形成权限隔离')
    expect(`${dify}\n${crew}`).not.toMatch(/最佳框架|生产级首选|Star 数/u)
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
title: Dify：一次请求怎样进入工作流图
description: 只追踪 service API、AppRunner、WorkflowEntry、Graphon、节点和响应事件这一条链。
---

# Dify：一次请求怎样进入工作流图

## 30 秒结论

Dify 把应用配置、模型、工具、知识与工作流组织成平台。真正执行不是“画布自己跑起来”，而是请求进入 AppRunner，由 WorkflowEntry 配置 Graphon，引擎调度节点并把事件转换成响应。

## 为什么选

它适合观察低代码平台如何把编辑态配置变成运行态控制流，以及多租户、插件、持久化和可观测层为什么不能被一张画布替代。

## 版本与边界

<ProjectMeta project-id="project-dify" />

本页固定在 1.17.1，只追踪 service API 的 workflow 执行。数据集、插件市场、计费、前端编辑器和云服务不展开。

## 原创建筑图

<ProjectCallChain project-id="project-dify" />

Graphon 是固定版本中实际的图执行依赖；页面必须把 Dify 的适配层与 Graphon 引擎分开标注。

## 唯一纵向调用链

从 workflow controller 进入 AppGenerator/AppRunner，再到 WorkflowEntry、GraphEngine、NodeFactory、AgentNode 和 response converter。只追这一条链，不从头解释整个仓库。

## 关键源码入口

<ProjectSourceLinks project-id="project-dify" />

## 一次请求的数据流

请求先经过应用与访问校验，生成运行配置和变量池。WorkflowEntry 创建 GraphEngine 并叠加执行限制、可观测与持久化层；NodeFactory 按版本解析节点，节点产生事件，响应转换器再把内部事件变成调用方可消费的输出。

## 阅读练习

1. 从 controller 找到 AppRunner 的创建位置。
2. 在 WorkflowEntry 中列出 GraphEngine 之外叠加的三个工程层。
3. 找出节点类型和版本如何进入 NodeFactory。

## 失败边界

节点执行失败、人工输入暂停、执行上限和响应流中断是不同状态。不能把“前端仍显示流程图”当作运行继续，也不能在恢复时忽略已经发生的外部副作用。

## 生产边界

平台封装不自动保证工作流适合 Agent、工具最小权限、数据隔离或结果正确。Dify 使用修改版 Apache-2.0，多租户服务与前端标识复用必须先读根许可证。

## 高频面试点

- [IQ-02-B：何时从 Workflow 升级为 Agent](/chapters/02-workflow-agent#iq-02-b)
- [IQ-06-A：什么时候需要显式 Graph](/chapters/06-loop-graph#iq-06-a)
- [IQ-10-A：从 Demo 到生产](/chapters/10-production#iq-10-a)

## 升级复核

比较 controller、AppRunner、WorkflowEntry、Graphon 版本、NodeFactory、AgentNode 和事件转换。许可证文本或 Graphon 主版本变化必须触发人工复核。

## 来源与归因

执行图为本书原创重绘，依据固定 commit 的 Dify 源码。页面不复用 Dify Logo、产品截图或受外观专利保护的视觉表达。
```

- [ ] **Step 4: Create the CrewAI page**

Create `docs/projects/crewai.md`:

```md
---
title: CrewAI：角色协作怎样落到任务执行
description: 沿 sequential process 追踪 Crew、Task、Agent、Executor、Tool 与输出，不把角色扮演当工程隔离。
---

# CrewAI：角色协作怎样落到任务执行

## 30 秒结论

CrewAI 用 Crew、Process、Task 与 Agent 组织协作，再由 executor 和 tool usage 完成具体循环。角色名称不会自动形成权限隔离，也不会自动带来质量增益。

## 为什么选

它能把第 7 章的 handoff、共享状态、协调成本和角色消融落到源码。页面选择 sequential process，保证调用链可追踪，而不是罗列所有模式。

## 版本与边界

<ProjectMeta project-id="project-crewai" />

固定版本已采用 `lib/crewai/...` monorepo 路径。Flow、A2A、企业平台和全部工具集合不进入本页主链。

## 原创建筑图

<ProjectCallChain project-id="project-crewai" />

图中 Task 是可验证工作单元，Agent 是执行主体，Process 决定编排；三者不能只靠自然语言角色名连接。

## 唯一纵向调用链

从 `Crew.kickoff` 进入 process 选择和共享执行状态，再由 Task 分配 Agent，CrewAgentExecutor/StepExecutor 驱动工具循环，最后返回 TaskOutput。

## 关键源码入口

<ProjectSourceLinks project-id="project-crewai" />

## 一次请求的数据流

输入进入 Crew 后被绑定到任务。sequential process 选择当前 Task，Agent 构造任务上下文，executor 推进模型与工具步骤，ToolUsage 记录调用结果，TaskOutput 回到 Crew 供下一项任务使用。

## 阅读练习

1. 找出 `kickoff` 如何选择 process。
2. 记录 Task、Agent 和 executor 各自拥有的状态。
3. 设计一个移除第二个角色的消融实验，并写明比较指标。

## 失败边界

工具失败、Agent 无进展、Task 输出不满足预期和跨角色信息丢失必须分别处理。把完整聊天转交给下一个角色既会复制噪声，也不能证明 handoff 正确。

## 生产边界

多 Agent 会增加调用、等待、共享状态和评测组合。只有当权限、上下文或可并行工作确实分离，并且消融实验显示增益时，才值得保留多个角色。

## 高频面试点

- [IQ-07-A：多 Agent 的价值和成本](/chapters/07-multi-agent#iq-07-a)
- [IQ-07-B：可靠 handoff 包含什么](/chapters/07-multi-agent#iq-07-b)
- [IQ-07-C：怎样识别昂贵角色扮演](/chapters/07-multi-agent#iq-07-c)

## 升级复核

检查 monorepo 路径、`Crew.kickoff`、Process、Task、Agent core、executor、step executor 和 ToolUsage。新增模式先进入 Radar，不自动替换本页 sequential 主链。

## 来源与归因

调用链图为本书原创重绘，依据固定 commit 的 MIT 源码。页面不复用 CrewAI Logo、官网截图或营销对比图。
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

```ts
import {
  loadProjectCatalog,
  validateProjectCatalogIntegration,
} from '../scripts/project-catalog.mjs'

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
      contentRegistryText: readFileSync('docs/.vitepress/theme/data/contentRegistry.ts', 'utf8'),
      interviewQuestionsText: readFileSync('docs/.vitepress/theme/data/interviewQuestions.ts', 'utf8'),
    })).toEqual([])
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
    cwd: process.cwd(), stdio: 'pipe', encoding: 'utf8',
  })
}, 120_000)

afterAll(() => rmSync(outputRoot, { recursive: true, force: true }))

describe('actual project SSR', () => {
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

In `scripts/validate-content.mjs`, extend the Task 2 import to include `loadProjectCatalog` and `validateProjectCatalogIntegration`, then replace the Task 2 `validateBook` body with the complete integrated version below. Keeping the entire function here avoids an undefined `projectCatalogErrors` variable or a path computed outside `root`:

```js
import {
  loadProjectCatalog,
  validateProjectCatalogFile,
  validateProjectCatalogIntegration,
} from './project-catalog.mjs'

export function validateBook(root = process.cwd(), options = {}) {
  const sourcePath = join(root, 'sources/source-index.yml')
  const projectCatalogPath = resolve(root, options.projectCatalogPath ?? 'sources/project-index.yml')
  const projectCatalogErrors = validateProjectCatalogFile(projectCatalogPath)
  const projectIntegrationErrors = projectCatalogErrors.length === 0
    ? validateProjectCatalogIntegration(loadProjectCatalog(projectCatalogPath), {
        contentRegistryText: readFileSync(resolve(root, 'docs/.vitepress/theme/data/contentRegistry.ts'), 'utf8'),
        interviewQuestionsText: readFileSync(resolve(root, 'docs/.vitepress/theme/data/interviewQuestions.ts'), 'utf8'),
      })
    : []
  return [
    ...validateSourceRegistry(sourcePath),
    ...projectCatalogErrors,
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

- Create: `scripts/check-projects.mjs`
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
  repository_status: 'active',
  archived: false,
  catalog_tier: 'core',
  watch_url: 'https://github.com/Aider-AI/aider/releases/latest',
  verified_at: '2026-09-26',
  review_by: '2026-10-26',
  license_sources: [{ path: 'LICENSE.txt', sha256: licenseDigest }],
  entrypoints: [{ path: 'aider/main.py', symbols: ['main'], responsibility: 'Validate repository arguments.' }],
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
        if (url.includes('/contents/LICENSE.txt')) return { status: 200, url, json: async () => ({ encoding: 'base64', content: Buffer.from(licenseText).toString('base64') }) }
        if (url.includes('/contents/')) return { status: 200, url, json: async () => ({ path: 'aider/main.py' }) }
        if (url.endsWith('/releases/latest')) return { status: 200, url, json: async () => ({ tag_name: 'v0.86.0' }) }
        return { status: 200, url, json: async () => ({ full_name: 'Aider-AI/aider', archived: false, default_branch: 'main', pushed_at: '2020-01-01T00:00:00Z' }) }
      },
    })
    expect(result.findings).toEqual(['project_update_available'])
  })

  it('uses the shared Shanghai date boundary and escalates an expired review', async () => {
    const result = await checkProjectSubject(projectSubject, {
      retryAttempts: 1,
      now: new Date('2026-10-26T16:30:00Z'),
      fetchImpl: async (url: string) => {
        if (url.endsWith('/commits/v0.86.0')) return { status: 200, url, json: async () => ({ sha: 'a'.repeat(40) }) }
        if (url.endsWith('/commits/main')) return { status: 200, url, json: async () => ({ sha: 'a'.repeat(40), commit: { committer: { date: '2026-09-26T00:00:00Z' } } }) }
        if (url.includes('/contents/LICENSE.txt')) return { status: 200, url, json: async () => ({ encoding: 'base64', content: Buffer.from(licenseText).toString('base64') }) }
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

  it('escalates a changed license digest to manual review', async () => {
    const result = await checkProjectSubject(projectSubject, {
      retryAttempts: 1,
      now: new Date('2026-09-26T00:00:00Z'),
      fetchImpl: async (url: string) => {
        if (url.endsWith('/commits/v0.86.0')) return { status: 200, url, json: async () => ({ sha: 'a'.repeat(40) }) }
        if (url.endsWith('/commits/main')) return { status: 200, url, json: async () => ({ sha: 'a'.repeat(40), commit: { committer: { date: '2026-09-26T00:00:00Z' } } }) }
        if (url.includes('/contents/LICENSE.txt')) return { status: 200, url, json: async () => ({ encoding: 'base64', content: Buffer.from('changed license').toString('base64') }) }
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

export async function requestProjectJson(url, { fetchImpl, githubToken, retryAttempts, retryDelayMs }) {
  for (let attempt = 1; attempt <= retryAttempts; attempt += 1) {
    try {
      const response = await fetchImpl(url, {
        signal: AbortSignal.timeout(12_000),
        headers: {
          accept: 'application/vnd.github+json',
          'user-agent': 'agent-engineering-handbook-project-check/1.0',
          ...(githubToken ? { authorization: `Bearer ${githubToken}` } : {}),
        },
      })
      if (retryable.has(response.status) && attempt < retryAttempts) {
        await new Promise((done) => setTimeout(done, retryDelayMs * attempt))
        continue
      }
      if (response.status >= 400) return { status: response.status, data: null, failure: retryable.has(response.status) ? 'transient' : 'http' }
      try { return { status: response.status, data: await response.json(), failure: null } }
      catch {
        if (attempt === retryAttempts) return { status: response.status, data: null, failure: 'parse' }
        await new Promise((done) => setTimeout(done, retryDelayMs * attempt))
      }
    } catch {
      if (attempt === retryAttempts) return { status: 0, data: null, failure: 'network' }
      await new Promise((done) => setTimeout(done, retryDelayMs * attempt))
    }
  }
  return { status: 0, data: null, failure: 'network' }
}

function recordFailure(findings, response) {
  if (response.failure === 'transient') findings.push('project_transient_error')
  else if (response.failure === 'network') findings.push('project_network_error')
  else if (response.failure === 'parse') findings.push('project_parse_error')
  else if (response.failure === 'http') findings.push('project_http_error')
}

function requireReview(findings, detail) {
  findings.push(detail, 'project_review_required')
}

function githubContentSha256(data) {
  if (data?.encoding !== 'base64' || typeof data?.content !== 'string') return null
  return createHash('sha256').update(Buffer.from(data.content.replace(/\n/gu, ''), 'base64')).digest('hex')
}

export async function checkProjectSubject(subject, {
  fetchImpl = fetch,
  githubToken = process.env.GITHUB_TOKEN,
  now = new Date(),
  retryAttempts = 3,
  retryDelayMs = 250,
} = {}) {
  const api = `https://api.github.com/repos/${subject.canonical_repo}`
  const options = { fetchImpl, githubToken, retryAttempts, retryDelayMs }
  const findings = []
  let defaultBranch = null
  const metadata = await requestProjectJson(api, options)
  if (metadata.failure) recordFailure(findings, metadata)
  else {
    defaultBranch = metadata.data.default_branch
    if (typeof metadata.data.full_name !== 'string'
      || typeof metadata.data.archived !== 'boolean'
      || typeof defaultBranch !== 'string' || defaultBranch === '') {
      requireReview(findings, 'repository_metadata_invalid')
    }
    if (metadata.data.full_name !== subject.canonical_repo) requireReview(findings, 'canonical_repo_changed')
    if (Boolean(metadata.data.archived) !== subject.archived) requireReview(findings, 'repository_status_changed')
  }

  if (defaultBranch) {
    const head = await requestProjectJson(`${api}/commits/${encodeURIComponent(defaultBranch)}`, options)
    if (head.failure) recordFailure(findings, head)
    else if (head.data.sha !== subject.pinned_commit
      && head.data.commit?.committer?.date
      && reviewDateInTimeZone(new Date(head.data.commit.committer.date)) > subject.verified_at) {
      findings.push('project_update_available')
    }
  }

  const ref = await requestProjectJson(`${api}/commits/${encodeURIComponent(subject.pinned_ref)}`, options)
  if (ref.failure) recordFailure(findings, ref)
  else if (ref.data.sha !== subject.pinned_commit) requireReview(findings, 'pin_ref_mismatch')

  for (const entrypoint of subject.entrypoints) {
    const encodedPath = entrypoint.path.split('/').map(encodeURIComponent).join('/')
    const entry = await requestProjectJson(`${api}/contents/${encodedPath}?ref=${subject.pinned_commit}`, options)
    if (entry.failure === 'http' && entry.status === 404) requireReview(findings, 'entrypoint_missing')
    else if (entry.failure) recordFailure(findings, entry)
    else if (entry.data.path !== entrypoint.path) requireReview(findings, 'entrypoint_response_invalid')
  }

  for (const source of subject.license_sources) {
    const encodedPath = source.path.split('/').map(encodeURIComponent).join('/')
    const refs = [...new Set([subject.pinned_commit, defaultBranch].filter(Boolean))]
    for (const refName of refs) {
      const license = await requestProjectJson(`${api}/contents/${encodedPath}?ref=${encodeURIComponent(refName)}`, options)
      if (license.failure === 'http' && license.status === 404) {
        requireReview(findings, 'license_source_missing')
      } else if (license.failure) {
        recordFailure(findings, license)
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
    } else {
      const latestRef = subject.pin_kind === 'tag' ? latest.data[0]?.name : latest.data.tag_name
      if (!latestRef) requireReview(findings, 'project_release_missing')
      else if (latestRef !== subject.pinned_ref) findings.push('project_update_available')
    }
  }
  if (subject.review_by < reviewDateInTimeZone(now)) requireReview(findings, 'project_review_due')
  return {
    id: subject.id,
    license_source_paths: subject.license_sources.map((source) => source.path),
    findings: [...new Set(findings)],
  }
}

export function buildProjectFreshnessReport(results, generatedAt = new Date().toISOString()) {
  const flagged = results.filter((result) => result.findings.length > 0)
  return {
    generated_at: generatedAt,
    summary: { total: results.length, healthy: results.length - flagged.length, needs_review: flagged.length },
    needs_review: flagged.length > 0,
    results,
  }
}

const blockingFindings = new Set([
  'project_review_required', 'project_transient_error', 'project_network_error',
  'project_parse_error', 'project_http_error', 'project_schema_invalid',
])

export function isProjectReportBlocking(report) {
  return report.results.some((result) => result.findings.some((finding) => blockingFindings.has(finding)))
}

function renderProjectReport(report) {
  const lines = ['# Project freshness report', '', `Generated: ${report.generated_at}`, '']
  for (const result of report.results.filter((item) => item.findings.length > 0)) {
    lines.push(`- ${result.id}: ${result.findings.join(', ')}`)
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
    const results = []
    for (const subject of subjects) results.push(await checkProjectSubject(subject, { fetchImpl, githubToken, now }))
    report = buildProjectFreshnessReport(results, now.toISOString())
  }
  mkdirSync(dirname(outputJson), { recursive: true })
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

Expected: unit tests pass; real report has 13 results; ordinary upstream changes appear only as `project_update_available`, and no schema, canonical, pin-ref, entrypoint, license-source, or license-digest failure appears.

- [ ] **Step 6: Commit project freshness automation**

```bash
git add scripts/check-projects.mjs tests/source-freshness.spec.ts package.json .github/workflows/source-freshness.yml
git commit -m "feat: monitor pinned project sources"
```

### Task 12: Require the complete approved project publication set

**Files:**

- Modify: `scripts/check-dist.mjs`
- Modify: `tests/content.spec.ts`
- Modify: `tests/project-pages.spec.ts`

- [ ] **Step 1: Write failing dist fixtures for missing, extra, and complete project output**

Extend the existing dist fixture helper so it can create all current public targets. Add:

```ts
const expectedProjectOutputs = [
  'projects/index.html',
  'projects/mcp-python-sdk.html',
  'projects/aider.html',
  'projects/openhands.html',
  'projects/agent-benchmarks.html',
  'projects/dify.html',
  'projects/crewai.html',
  'projects/history-autogpt-flowise.html',
]
const fixtureCoreProjectFiles = new Set(expectedProjectOutputs.slice(1, 7))
const fixtureProjectHeadings = [
  '30 秒结论', '为什么选', '版本与边界', '原创建筑图', '唯一纵向调用链',
  '关键源码入口', '一次请求的数据流', '阅读练习', '失败边界', '生产边界',
  '高频面试点', '升级复核', '来源与归因',
]

function createCompleteDistFixture() {
  const dist = mkdtempSync(join(tmpdir(), 'agent-book-project-dist-'))
  const stages = ['基础认知', '核心机制', '生产工程', '应用模式', '项目拆解', '综合实战']
  const links = publishedCourseItems.map(({ itemId }) => {
    const route = getContentItem(itemId).route
    return `<a href="/agent-engineering-for-beginners${route}">${itemId}</a>`
  })
  writeFileSync(join(dist, 'index.html'), '<h1>public book</h1>')
  mkdirSync(join(dist, 'course'), { recursive: true })
  writeFileSync(
    join(dist, 'course/index.html'),
    `<nav class="course-map">${stages.join('')}本地进度将在页面加载后显示${links.join('')}</nav>`,
  )
  for (const { itemId } of publishedCourseItems) {
    const route = getContentItem(itemId).route
    const target = route.endsWith('/')
      ? join(dist, route, 'index.html')
      : join(dist, `${route}.html`)
    mkdirSync(dirname(target), { recursive: true })
    writeFileSync(target, `<h1>${itemId}</h1>`)
  }
  for (const relative of expectedProjectOutputs) {
    const target = join(dist, relative)
    mkdirSync(dirname(target), { recursive: true })
    const isOverview = relative === 'projects/index.html'
    const coreHeadings = fixtureCoreProjectFiles.has(relative) ? fixtureProjectHeadings.join('') : ''
    writeFileSync(target, isOverview
      ? '<main class="project-overview">开源项目拆解</main>'
      : `<main>固定版本 关键源码入口 ${coreHeadings}</main>`)
  }
  return dist
}

describe('project publication boundary', () => {
  it('requires every approved project output', () => {
    const dist = createCompleteDistFixture()
    try {
      rmSync(join(dist, 'projects/aider.html'))
      expect(validateDist(dist)).toContain('构建产物缺少项目页面：projects/aider.html')
    } finally {
      rmSync(dist, { recursive: true, force: true })
    }
  })

  it('rejects extra project, lab, and capstone pages', () => {
    const dist = createCompleteDistFixture()
    try {
      for (const relative of ['projects/unreviewed.html', 'labs/index.html', 'capstone/index.html']) {
        mkdirSync(dirname(join(dist, relative)), { recursive: true })
        writeFileSync(join(dist, relative), '<html></html>')
      }
      expect(validateDist(dist)).toEqual(expect.arrayContaining([
        expect.stringContaining('projects/unreviewed.html'),
        expect.stringContaining('labs/index.html'),
        expect.stringContaining('capstone/index.html'),
      ]))
    } finally {
      rmSync(dist, { recursive: true, force: true })
    }
  })

  it('requires 26 exact course links and accepts only the eight approved project pages', () => {
    const dist = createCompleteDistFixture()
    try {
      expect(validateDist(dist)).toEqual([])
      const html = readFileSync(join(dist, 'course/index.html'), 'utf8')
      expect(validateCourseDist(html)).toEqual([])
    } finally {
      rmSync(dist, { recursive: true, force: true })
    }
  })
})
```

Add this exact content test:

```ts
import { interviewQuestions } from '../docs/.vitepress/theme/data/interviewQuestions'

it('enforces the project page contract for every reading-only page', () => {
  const coreIds = projectRouteRecords.slice(1, 7).map(([id]) => id)
  for (const [id, route] of projectRouteRecords) {
    const file = `docs${route.endsWith('/') ? `${route}index` : route}.md`
    const text = readFileSync(file, 'utf8')
    expect(text, file).not.toMatch(/npm install|pip install|docker run|API_KEY/u)
    expect(text, file).not.toMatch(/!\[[^\]]*\]\(https?:\/\//u)
    if (coreIds.includes(id)) {
      const h2s = Array.from(text.matchAll(/^## (.+)$/gmu), (match) => match[1])
      expect(h2s, file).toEqual(requiredProjectHeadings)
      expect(new Set(h2s).size, `${file}: duplicate H2`).toBe(requiredProjectHeadings.length)
      expect(text).toContain(`<ProjectMeta project-id="${id}" />`)
      expect(text).toContain(`<ProjectCallChain project-id="${id}" />`)
      expect(text).toContain(`<ProjectSourceLinks project-id="${id}" />`)
    }
  }
  const questionIds = new Set(interviewQuestions.map((question) => question.id))
  for (const page of projectCatalog.pages) {
    for (const id of page.interview_question_ids) expect(questionIds.has(id), `${page.page_item_id}:${id}`).toBe(true)
    const route = getContentItem(page.page_item_id).route
    const file = `docs${route.endsWith('/') ? `${route}index` : route}.md`
    const text = readFileSync(file, 'utf8')
    const actualLinks = Array.from(text.matchAll(/\]\((\/chapters\/[^)#]+#iq-[^)]+)\)/gu), (match) => match[1])
    const expectedLinks = page.interview_question_ids.map((id) => {
      const question = interviewQuestions.find((candidate) => candidate.id === id)!
      return `${question.path}#${id}`
    })
    expect(actualLinks, page.page_item_id).toEqual(expectedLinks)
  }
})
```

- [ ] **Step 2: Run dist tests and verify RED**

Run: `pnpm vitest run tests/content.spec.ts tests/project-pages.spec.ts -t 'project publication boundary|project page contract'`

Expected: FAIL only because the progressive gate does not yet require all eight approved outputs; the 26-link course contract already passes from Task 9.

- [ ] **Step 3: Require the complete approved output allowlist**

Do not modify `publishedCourseRoutes`; Task 9 already added the six project routes exactly once. Reuse `approvedProjectFiles` from Task 4 and add only the two classification sets:

```js
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
```

Keep `validatePublishedRouteBoundary(relativeFiles)` from Task 4 and add the final completeness check:

```js
for (const file of approvedProjectFiles) {
  if (!relativeFiles.includes(file)) errors.push(`构建产物缺少项目页面：${file}`)
}
```

The progressive boundary and its legacy fixture were finalized in Task 4; the 26-link course contract and `/projects/` course-marker change were finalized in Task 9. Do not rewrite those assertions here. This task adds only the eight-file completeness requirement and static page contracts.

- [ ] **Step 4: Add static project-page checks**

For each file in `dissectionProjectFiles`, run these exact checks:

```js
const coreProjectHeadings = [
  '30 秒结论', '为什么选', '版本与边界', '原创建筑图', '唯一纵向调用链',
  '关键源码入口', '一次请求的数据流', '阅读练习', '失败边界', '生产边界',
  '高频面试点', '升级复核', '来源与归因',
]
for (const file of dissectionProjectFiles) {
  if (!relativeFiles.includes(file)) continue
  const projectHtml = readFileSync(join(distPath, file), 'utf8')
  if (!projectHtml.includes('固定版本')) errors.push(`项目页缺少固定版本：${file}`)
  if (!projectHtml.includes('关键源码入口')) errors.push(`项目页缺少源码入口：${file}`)
  if (/blob\/(?:main|master)\//u.test(projectHtml)) errors.push(`项目页包含移动分支源码链接：${file}`)
  if (!/github\.com\/[^/]+\/[^/]+\/blob\/[0-9a-f]{40}\//u.test(projectHtml)) errors.push(`项目页缺少固定 commit 源码链接：${file}`)
  if (/<img\b[^>]*src=["']https?:\/\//iu.test(projectHtml)) errors.push(`项目页包含外链图片：${file}`)
  if (coreProjectFiles.has(file)) {
    for (const heading of coreProjectHeadings) {
      if (!projectHtml.includes(heading)) errors.push(`核心项目页缺少章节 ${heading}：${file}`)
    }
  }
}
```

Apply the full 13-heading check only to `coreProjectFiles`. The overview and historical page use their own contracts from Task 8; `projects/index.html` must not be forced to contain a source list.

- [ ] **Step 5: Run test, validation, and production build gates**

Run:

```bash
pnpm vitest run tests/content.spec.ts tests/project-pages.spec.ts -t 'project publication boundary|project page contract'
pnpm test && pnpm validate && pnpm build
```

Expected: complete fixture and real dist pass; missing or extra page fixtures fail with the exact assertions; course SSR contains 26 unique targets.

- [ ] **Step 6: Commit the publication contract**

```bash
git add scripts/check-dist.mjs tests/content.spec.ts tests/project-pages.spec.ts
git commit -m "test: enforce project publication boundaries"
```

### Task 13: Document the project-reading layer and run pre-merge acceptance

**Files:**

- Modify: `README.md`
- Modify: `tests/project-pages.spec.ts`
- Verify only: all files changed by Tasks 1–11

- [ ] **Step 1: Write the failing README boundary test**

```ts
describe('project documentation handoff', () => {
  it('documents the project catalog without claiming labs exist', () => {
    const readme = readFileSync('README.md', 'utf8')
    expect(readme).toContain('/projects/')
    expect(readme).toContain('六个核心源码拆解')
    expect(readme).toContain('固定 commit')
    expect(readme).toContain('Python Lab Kit 属于下一阶段')
    expect(readme).toContain('仓库不会发布 `/labs/`')
    expect(readme).not.toMatch(/\]\([^)]*\/labs\//u)
  })
})
```

- [ ] **Step 2: Run the README test and verify RED**

Run: `pnpm vitest run tests/project-pages.spec.ts -t 'project documentation handoff'`

Expected: FAIL because the README does not yet describe the second-stage project layer.

- [ ] **Step 3: Add the exact README section**

Insert after the course-map description:

```md
## 开源项目拆解

`/projects/` 提供六个核心源码拆解：MCP 规范与 Python SDK、Aider、OpenHands、SWE-bench/τ²-bench、Dify、CrewAI。每页固定上游 commit、许可证作用域和一条纵向调用链；AutoGPT/Flowise 只作为历史反例，Hermes Agent/OpenClaw 只作为高权限观察项。

这些页面是阅读型源码课程，不会安装或运行上游项目。Python Lab Kit 属于下一阶段；在独立设计、离线 fixture、成本上限和清理流程完成前，仓库不会发布 `/labs/`。
```

- [ ] **Step 4: Run every automated gate**

Run:

```bash
set -e
pnpm vitest run tests/project-pages.spec.ts -t 'project documentation handoff'
pnpm test && pnpm validate && pnpm build
GITHUB_TOKEN="$(gh auth token)" pnpm sources:check
node --input-type=module <<'NODE'
import { readFileSync } from 'node:fs'
const report = JSON.parse(readFileSync('reports/source-freshness.json', 'utf8'))
const allowed = new Set(['repository_updated'])
const blocking = report.results.flatMap((result) =>
  result.findings.filter((finding) => !allowed.has(finding)).map((finding) => `${result.id}:${finding}`),
)
if (report.schema_errors?.length) blocking.push(...report.schema_errors.map((error) => `schema:${error}`))
if (blocking.length) throw new Error(`Blocking source findings:\n${blocking.join('\n')}`)
console.log(JSON.stringify(report.summary))
NODE
GITHUB_TOKEN="$(gh auth token)" pnpm run projects:check -- --strict
git diff origin/main...HEAD --check
git status --short
```

Expected:

- all tests pass;
- content, provenance, project schema, build, and dist gates pass;
- source report contains the existing source inventory and the explicit parser allows only `repository_updated`; every network, parse, HTTP, schema, redirect, version, or archive finding blocks release;
- project report contains 13 subjects with no schema, canonical, pin-ref, entrypoint, license-source, or license-digest failure; ordinary update notices may remain non-blocking;
- range diff check prints nothing;
- only the intended README/test changes remain before commit.

- [ ] **Step 5: Commit the README**

```bash
git add README.md tests/project-pages.spec.ts
git commit -m "docs: describe the project reading layer"
```

- [ ] **Step 6: Start the built preview and verify route status**

Run `pnpm preview -- --port 4175` in a persistent terminal. In another terminal, run this accumulating matrix; it checks all 39 registered routes in both clean and trailing-slash forms instead of exiting on the first failure:

```bash
set -e
site_root='http://127.0.0.1:4175/agent-engineering-for-beginners'
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
printf '%s\n' "${failures[@]}"
test "${#failures[@]}" -eq 0
```

Then run the negative matrix:

```bash
set -e
failures=()
for route in labs labs/example capstone capstone/example projects/unreviewed; do
  url="$site_root/$route/"
  code=$(curl -L -sS -o /dev/null -w '%{http_code}' "$url")
  if [ "$code" != '404' ]; then failures+=("$code $url"); fi
done
printf '%s\n' "${failures[@]}"
test "${#failures[@]}" -eq 0
```

Expected: all positive variants return 200; every negative route returns 404; both failure arrays are empty.

- [ ] **Step 7: Run browser acceptance with named sessions**

Use `agent-browser --session project-catalog-acceptance` and complete all checks:

1. At both 1440×1000 light and 390×844 dark, `/projects/` shows six core links, one historical link, two watch-only external subjects, no Lab action, and no page-level overflow.
2. At 390×844 dark, open `/projects/openhands`, `/projects/agent-benchmarks`, and `/projects/history-autogpt-flowise`; at 1440×1000 light, repeat OpenHands and benchmarks. Verify `scrollWidth === innerWidth`, source paths wrap or scroll only inside their container, and focus uses a visible outline.
3. Snapshot each complex page without `-i`; verify repository status, catalog tier, fixed ref/SHA, license scope, ordered call chain, “怎么看”, “不要误解”, failure boundary, and interview links are present in the accessibility tree.
4. In a separate `project-catalog-nojs` session, run `agent-browser --session project-catalog-nojs network route "**/*.js" --abort` before opening a project page. Verify all eight routes: the overview must retain its core/history/watch-only taxonomy and safety boundary; the other seven pages must retain metadata, full SHA, license scope, call chain, source links, and failure boundary in server-rendered HTML.
5. Confirm `.project-overview` and project pages contain no write controls, network-driven data loaders, login prompts, or model execution buttons.
6. On each core page, click one fixed source link and confirm the destination URL contains the exact 40-character pinned commit, then return and re-snapshot before using another ref.
7. Confirm console and page error lists are empty.

Run the desktop overview check:

```bash
set -e
agent-browser --session project-catalog-acceptance network har start
agent-browser --session project-catalog-acceptance set viewport 1440 1000
agent-browser --session project-catalog-acceptance set media light
agent-browser --session project-catalog-acceptance open http://127.0.0.1:4175/agent-engineering-for-beginners/projects/
agent-browser --session project-catalog-acceptance wait --load networkidle
agent-browser --session project-catalog-acceptance snapshot -s '.project-overview'
agent-browser --session project-catalog-acceptance eval --stdin <<'EVALEOF'
(() => {
  const root = document.querySelector('.project-overview')
  const result = {
    width: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    coreLinks: root?.querySelectorAll('[aria-labelledby="project-core-title"] a').length,
    historyLinks: root?.querySelectorAll('[aria-labelledby="project-history-title"] a').length,
    watchLinks: root?.querySelectorAll('[aria-labelledby="project-watch-title"] > ul a').length,
    riskTags: Array.from(root?.querySelectorAll('.project-risk-tag') ?? []).map((node) => node.textContent?.trim()),
    labActions: Array.from(root?.querySelectorAll('a,button') ?? []).filter((node) => /lab|实验/i.test(node.textContent ?? '')).length,
  }
  if (result.scrollWidth !== result.width || result.coreLinks !== 6 || result.historyLinks !== 1 || result.watchLinks !== 2 || result.labActions !== 0) throw new Error(JSON.stringify(result))
  return JSON.stringify(result)
})()
EVALEOF
agent-browser --session project-catalog-acceptance screenshot /tmp/projects-index-1440-light.png --full
agent-browser --session project-catalog-acceptance set viewport 390 844
agent-browser --session project-catalog-acceptance set media dark
agent-browser --session project-catalog-acceptance open http://127.0.0.1:4175/agent-engineering-for-beginners/projects/
agent-browser --session project-catalog-acceptance eval 'if(document.documentElement.scrollWidth!==innerWidth)throw new Error(JSON.stringify({url:location.href,width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));location.href'
agent-browser --session project-catalog-acceptance screenshot /tmp/projects-index-390-dark.png --full
```

Run the 390px dark checks for all complex layouts:

```bash
set -e
agent-browser --session project-catalog-acceptance set viewport 390 844
agent-browser --session project-catalog-acceptance set media dark
for route in projects/openhands projects/agent-benchmarks projects/history-autogpt-flowise; do
  agent-browser --session project-catalog-acceptance open "http://127.0.0.1:4175/agent-engineering-for-beginners/$route"
  agent-browser --session project-catalog-acceptance wait --load networkidle
  agent-browser --session project-catalog-acceptance snapshot -s '.vp-doc'
  agent-browser --session project-catalog-acceptance eval --stdin <<'EVALEOF'
(() => {
  const required = ['固定版本', '仓库状态', '教学层级', '源码事实', '本书归纳', '怎么看', '不要误解', '失败边界']
  const text = document.querySelector('.vp-doc')?.textContent ?? ''
  const result = { width: innerWidth, scrollWidth: document.documentElement.scrollWidth, missing: required.filter((item) => !text.includes(item)) }
  if (result.width !== result.scrollWidth || result.missing.length) throw new Error(JSON.stringify(result))
  return JSON.stringify(result)
})()
EVALEOF
done
agent-browser --session project-catalog-acceptance open http://127.0.0.1:4175/agent-engineering-for-beginners/projects/openhands
agent-browser --session project-catalog-acceptance screenshot /tmp/project-openhands-390-dark.png --full
agent-browser --session project-catalog-acceptance open http://127.0.0.1:4175/agent-engineering-for-beginners/projects/agent-benchmarks
agent-browser --session project-catalog-acceptance screenshot /tmp/project-benchmarks-390-dark.png --full
agent-browser --session project-catalog-acceptance set viewport 1440 1000
agent-browser --session project-catalog-acceptance set media light
for route in projects/openhands projects/agent-benchmarks; do
  agent-browser --session project-catalog-acceptance open "http://127.0.0.1:4175/agent-engineering-for-beginners/$route"
  agent-browser --session project-catalog-acceptance wait --load networkidle
  agent-browser --session project-catalog-acceptance eval 'if(document.documentElement.scrollWidth!==innerWidth)throw new Error(JSON.stringify({url:location.href,width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));location.href'
done
agent-browser --session project-catalog-acceptance open http://127.0.0.1:4175/agent-engineering-for-beginners/projects/openhands
agent-browser --session project-catalog-acceptance screenshot /tmp/project-openhands-1440-light.png --full
agent-browser --session project-catalog-acceptance open http://127.0.0.1:4175/agent-engineering-for-beginners/projects/agent-benchmarks
agent-browser --session project-catalog-acceptance screenshot /tmp/project-benchmarks-1440-light.png --full
```

Use actual keyboard events and collect the focused link text:

```bash
set -e
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

Expected: focus follows DOM/visual order, reaches every internal project link and watch-only external link, and each focused interactive element has a non-zero visible outline.

Verify all eight routes without JavaScript:

```bash
set -e
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
  const hasFullSha = isIndex || /\b[0-9a-f]{40}\b/u.test(text)
  const pinnedSourceLinks = Array.from(document.querySelectorAll('.project-source-links a'))
  const contract = isIndex ? {} : {
    metadata: Boolean(document.querySelector('.project-meta')),
    licenseScopes: document.querySelectorAll('.project-meta details li[role="listitem"]').length > 0,
    callChain: document.querySelectorAll('.project-call-chain [role="listitem"]').length > 0,
    sourceEntries: document.querySelectorAll('.project-source-links [role="listitem"]').length > 0,
    pinnedSources: pinnedSourceLinks.length > 0 && pinnedSourceLinks.every((a) => /\/blob\/[0-9a-f]{40}\//u.test(a.href)),
    interviewLinks: document.querySelectorAll('.vp-doc a[href*="#iq-"]').length > 0,
  }
  const invalidContract = Object.entries(contract).filter(([, valid]) => !valid).map(([key]) => key)
  if (!text.trim() || anchors === 0 || missing.length || !hasFullSha || invalidContract.length) {
    throw new Error(JSON.stringify({ url: location.href, anchors, missing, hasFullSha, invalidContract }))
  }
  return JSON.stringify({ url: location.href, anchors, missing, hasFullSha, invalidContract })
})()
EVALEOF
done
```

Finally run:

```bash
set -e
agent-browser --session project-catalog-acceptance network har stop /tmp/project-catalog-acceptance.har
agent-browser --session project-catalog-nojs network har stop /tmp/project-catalog-nojs.har
node --input-type=module <<'NODE'
import { readFileSync } from 'node:fs'

const sessions = [
  { path: '/tmp/project-catalog-acceptance.har', allowAbortedJavaScript: false },
  { path: '/tmp/project-catalog-nojs.har', allowAbortedJavaScript: true },
]
const failures = []
for (const session of sessions) {
  const har = JSON.parse(readFileSync(session.path, 'utf8'))
  const entries = har?.log?.entries
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
    const isAllowedAbort = session.allowAbortedJavaScript && status <= 0 && isJavaScript
    if (isAllowedAbort) allowedAbortCount += 1
    if (!Number.isFinite(status) || status >= 400 || (status <= 0 && !isAllowedAbort)) {
      failures.push(`${session.path}: ${status} ${url}`)
    }
  }
  if (session.allowAbortedJavaScript && allowedAbortCount === 0) {
    failures.push(`${session.path}: no actively aborted JavaScript request was captured`)
  }
}
if (failures.length > 0) throw new Error(`HAR network failures:\n${failures.join('\n')}`)
console.log('HAR network gate passed')
NODE
test -z "$(agent-browser --session project-catalog-acceptance console)"
test -z "$(agent-browser --session project-catalog-acceptance errors)"
test -z "$(agent-browser --session project-catalog-nojs console)"
test -z "$(agent-browser --session project-catalog-nojs errors)"
```

Expected: both HAR files contain request entries; the normal session has no missing/zero status and no response `>=400`; the no-JavaScript session captures at least one actively aborted `.js`/`.mjs` request and has no other missing/zero status or response `>=400`. Console and page-error outputs remain empty.

Save screenshots:

```text
/tmp/projects-index-1440-light.png
/tmp/projects-index-390-dark.png
/tmp/project-openhands-390-dark.png
/tmp/project-benchmarks-390-dark.png
/tmp/project-openhands-1440-light.png
/tmp/project-benchmarks-1440-light.png
```

- [ ] **Step 8: Verify print output**

Generate PDFs for `/projects/openhands` and `/projects/agent-benchmarks` while license details are closed on screen:

```bash
set -e
agent-browser --session project-catalog-acceptance open http://127.0.0.1:4175/agent-engineering-for-beginners/projects/openhands
agent-browser --session project-catalog-acceptance eval 'JSON.stringify(Array.from(document.querySelectorAll(".project-meta details")).map((node)=>node.open))'
agent-browser --session project-catalog-acceptance pdf /tmp/project-openhands.pdf
agent-browser --session project-catalog-acceptance open http://127.0.0.1:4175/agent-engineering-for-beginners/projects/agent-benchmarks
agent-browser --session project-catalog-acceptance eval 'JSON.stringify(Array.from(document.querySelectorAll(".project-meta details")).map((node)=>node.open))'
agent-browser --session project-catalog-acceptance pdf /tmp/project-benchmarks.pdf
```

Both `eval` commands must return only `false` values. Extract and assert content with:

```bash
set -e
if command -v pdftotext >/dev/null 2>&1; then
  pdftotext /tmp/project-openhands.pdf /tmp/project-openhands.txt
  pdftotext /tmp/project-benchmarks.pdf /tmp/project-benchmarks.txt
else
  python3 - <<'PY'
from pathlib import Path
from pypdf import PdfReader
for stem in ('project-openhands', 'project-benchmarks'):
    text = '\n'.join(page.extract_text() or '' for page in PdfReader(f'/tmp/{stem}.pdf').pages)
    Path(f'/tmp/{stem}.txt').write_text(text, encoding='utf-8')
PY
fi
node --input-type=module <<'NODE'
import { readFileSync, writeFileSync } from 'node:fs'
import { parse } from 'yaml'
const catalog = parse(readFileSync('sources/project-index.yml', 'utf8'))
const subjects = Object.fromEntries(catalog.subjects.map((subject) => [subject.id, subject]))
const chains = Object.fromEntries(catalog.chains.map((chain) => [chain.id, chain]))
const pageIds = ['project-openhands', 'project-agent-benchmarks']
const expected = Object.fromEntries(pageIds.map((pageId) => {
  const page = catalog.pages.find((candidate) => candidate.page_item_id === pageId)
  const chain = chains[page.primary_chain_id]
  const values = page.subjects.flatMap((subjectId) => {
    const subject = subjects[subjectId]
    return [
      subject.pinned_commit,
      ...subject.entrypoints.flatMap((entry) => [entry.path, ...entry.symbols, entry.responsibility]),
      ...subject.license_sources.map((source) => `${subject.canonical_url}/blob/${subject.pinned_commit}/${source.path}`),
    ]
  })
  values.push(...chain.steps.flatMap((step) => [step.label, step.source_path, step.symbol, step.responsibility]))
  return [pageId, [...new Set(values)]]
}))
writeFileSync('/tmp/project-pdf-expectations.json', JSON.stringify(expected))
NODE
python3 - <<'PY'
import json
from pathlib import Path
expected = json.loads(Path('/tmp/project-pdf-expectations.json').read_text(encoding='utf-8'))
for page_id, required in expected.items():
    stem = 'project-benchmarks' if page_id == 'project-agent-benchmarks' else page_id
    text = Path(f'/tmp/{stem}.txt').read_text(encoding='utf-8')
    compact = ''.join(text.split())
    missing = [item for item in required if ''.join(item.split()) not in compact]
    assert not missing, f'{stem} missing: {missing}'
    assert '许可证边界' not in text, f'{stem} printed the closed disclosure summary'
PY
```

Expected: the PDFs contain complete primary chains, source paths, and full commit SHAs; the closed disclosure summary is absent because the print-only license fallback supplies the content.

- [ ] **Step 9: Verify public and copyright boundaries**

Run:

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
if rg -n "!\\[[^]]*\\]\\(https?://|<img[^>]+src=['\"]https?://" docs/projects; then
  echo 'unexpected remote image embedding'
  exit 1
fi
git diff origin/main...HEAD --check
git status --short --branch
```

Expected: no process/Lab/capstone output, no unregistered project asset, no remote image embedding, no range whitespace error, and a clean worktree.

- [ ] **Step 10: Close browser sessions and the preview server**

```bash
agent-browser --session project-catalog-acceptance close
agent-browser --session project-catalog-nojs close
lsof -nP -iTCP:4175 -sTCP:LISTEN
```

Send Ctrl-C to the exact persistent preview terminal session, then rerun the `lsof` command. Expected: the final `lsof` output is empty; do not use a broad process kill.

- [ ] **Step 11: Push the feature branch and request final review; do not merge**

```bash
set -e
git push -u origin feat/open-source-project-dissections
```

Send the final branch HEAD, commit list, test counts, real project freshness summary, preview route matrix, accessibility evidence, PDF evidence, and screenshots to the user and reviewer. Wait for explicit review approval before merging `main` or deploying Pages.

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

- [ ] **Step 5: Run production browser and no-JavaScript checks**

```bash
set -e
agent-browser --session project-catalog-production network har start
agent-browser --session project-catalog-production set viewport 390 844
agent-browser --session project-catalog-production set media dark
agent-browser --session project-catalog-production open https://mengen-ink.github.io/agent-engineering-for-beginners/course/
agent-browser --session project-catalog-production wait --load networkidle
agent-browser --session project-catalog-production eval --stdin <<'EVALEOF'
(() => {
  const result = {
    width: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    links: document.querySelectorAll('.course-map a').length,
    projectItems: document.querySelectorAll('.course-stage:nth-child(5) .course-item').length,
  }
  if (result.width !== result.scrollWidth || result.links !== 26 || result.projectItems !== 7) throw new Error(JSON.stringify(result))
  return JSON.stringify(result)
})()
EVALEOF
agent-browser --session project-catalog-production screenshot /tmp/course-map-projects-production-390-dark.png --full

for route in projects/openhands projects/agent-benchmarks projects/history-autogpt-flowise; do
  agent-browser --session project-catalog-production open "https://mengen-ink.github.io/agent-engineering-for-beginners/$route"
  agent-browser --session project-catalog-production eval 'if(document.documentElement.scrollWidth!==innerWidth)throw new Error(JSON.stringify({url:location.href,width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));location.href'
done
agent-browser --session project-catalog-production screenshot /tmp/project-history-production-390-dark.png --full
agent-browser --session project-catalog-production open https://mengen-ink.github.io/agent-engineering-for-beginners/projects/
agent-browser --session project-catalog-production eval 'const r={core:document.querySelectorAll("[aria-labelledby=project-core-title] a").length,history:document.querySelectorAll("[aria-labelledby=project-history-title] a").length,watch:document.querySelectorAll("[aria-labelledby=project-watch-title] > ul a").length,overflow:document.documentElement.scrollWidth-innerWidth};if(r.core!==6||r.history!==1||r.watch!==2||r.overflow!==0)throw new Error(JSON.stringify(r));JSON.stringify(r)'
agent-browser --session project-catalog-production screenshot /tmp/projects-index-production-390-dark.png --full

agent-browser --session project-catalog-production open https://mengen-ink.github.io/agent-engineering-for-beginners/paths/
agent-browser --session project-catalog-production find role button click --name '工程实战'
agent-browser --session project-catalog-production eval 'if(document.querySelectorAll(".path-step").length!==17||document.documentElement.scrollWidth!==innerWidth)throw new Error("engineering path mismatch");"17 steps"'

agent-browser --session project-catalog-production open https://mengen-ink.github.io/agent-engineering-for-beginners/projects/
agent-browser --session project-catalog-production set viewport 1440 1000
agent-browser --session project-catalog-production set media light
agent-browser --session project-catalog-production snapshot -s '.project-overview'
agent-browser --session project-catalog-production eval 'const r={core:document.querySelectorAll("[aria-labelledby=project-core-title] a").length,history:document.querySelectorAll("[aria-labelledby=project-history-title] a").length,watch:document.querySelectorAll("[aria-labelledby=project-watch-title] > ul a").length,overflow:document.documentElement.scrollWidth-innerWidth};if(r.core!==6||r.history!==1||r.watch!==2||r.overflow!==0)throw new Error(JSON.stringify(r));JSON.stringify(r)'
agent-browser --session project-catalog-production screenshot /tmp/projects-index-production-1440-light.png --full
for route in projects/openhands projects/agent-benchmarks; do
  agent-browser --session project-catalog-production open "https://mengen-ink.github.io/agent-engineering-for-beginners/$route"
  agent-browser --session project-catalog-production wait --load networkidle
  agent-browser --session project-catalog-production eval 'if(document.documentElement.scrollWidth!==innerWidth)throw new Error(JSON.stringify({url:location.href,width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));location.href'
done
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
  const hasFullSha = isIndex || /\b[0-9a-f]{40}\b/u.test(text)
  const pinnedSourceLinks = Array.from(document.querySelectorAll('.project-source-links a'))
  const contract = isIndex ? {} : {
    metadata: Boolean(document.querySelector('.project-meta')),
    licenseScopes: document.querySelectorAll('.project-meta details li[role="listitem"]').length > 0,
    callChain: document.querySelectorAll('.project-call-chain [role="listitem"]').length > 0,
    sourceEntries: document.querySelectorAll('.project-source-links [role="listitem"]').length > 0,
    pinnedSources: pinnedSourceLinks.length > 0 && pinnedSourceLinks.every((a) => /\/blob\/[0-9a-f]{40}\//u.test(a.href)),
    interviewLinks: document.querySelectorAll('.vp-doc a[href*="#iq-"]').length > 0,
  }
  const invalidContract = Object.entries(contract).filter(([, valid]) => !valid).map(([key]) => key)
  if (!text.trim() || anchors === 0 || missing.length || !hasFullSha || invalidContract.length) {
    throw new Error(JSON.stringify({ url: location.href, anchors, missing, hasFullSha, invalidContract }))
  }
  return JSON.stringify({ url: location.href, anchors, missing, hasFullSha, invalidContract })
})()
EVALEOF
done

agent-browser --session project-catalog-production open https://mengen-ink.github.io/agent-engineering-for-beginners/projects/openhands
agent-browser --session project-catalog-production pdf /tmp/project-openhands-production.pdf
agent-browser --session project-catalog-production open https://mengen-ink.github.io/agent-engineering-for-beginners/projects/agent-benchmarks
agent-browser --session project-catalog-production pdf /tmp/project-benchmarks-production.pdf
node --input-type=module <<'NODE'
import { readFileSync, writeFileSync } from 'node:fs'
import { parse } from 'yaml'
const catalog = parse(readFileSync('sources/project-index.yml', 'utf8'))
const subjects = Object.fromEntries(catalog.subjects.map((subject) => [subject.id, subject]))
const chains = Object.fromEntries(catalog.chains.map((chain) => [chain.id, chain]))
const expected = Object.fromEntries(['project-openhands', 'project-agent-benchmarks'].map((pageId) => {
  const page = catalog.pages.find((candidate) => candidate.page_item_id === pageId)
  const chain = chains[page.primary_chain_id]
  const values = page.subjects.flatMap((subjectId) => {
    const subject = subjects[subjectId]
    return [
      subject.pinned_commit,
      ...subject.entrypoints.flatMap((entry) => [entry.path, entry.symbol, entry.responsibility]),
      ...subject.license_sources.map((source) => `${subject.canonical_url}/blob/${subject.pinned_commit}/${source.path}`),
    ]
  })
  values.push(...chain.steps.flatMap((step) => [step.label, step.source_path, step.symbol, step.responsibility]))
  return [pageId, [...new Set(values)]]
}))
writeFileSync('/tmp/project-production-pdf-expectations.json', JSON.stringify(expected))
NODE
python3 - <<'PY'
import json
from pathlib import Path
from pypdf import PdfReader
expected = json.loads(Path('/tmp/project-production-pdf-expectations.json').read_text(encoding='utf-8'))
for page_id, required in expected.items():
    stem = 'project-benchmarks-production' if page_id == 'project-agent-benchmarks' else f'{page_id}-production'
    text = '\n'.join(page.extract_text() or '' for page in PdfReader(f'/tmp/{stem}.pdf').pages)
    compact = ''.join(text.split())
    missing = [item for item in required if ''.join(item.split()) not in compact]
    assert not missing, f'{stem} missing: {missing}'
    assert '许可证边界' not in text, f'{stem} printed the closed disclosure summary'
    Path(f'/tmp/{stem}.txt').write_text(text, encoding='utf-8')
PY
agent-browser --session project-catalog-production network har stop /tmp/project-catalog-production.har
agent-browser --session project-catalog-production-nojs network har stop /tmp/project-catalog-production-nojs.har
node --input-type=module <<'NODE'
import { readFileSync } from 'node:fs'

const sessions = [
  { path: '/tmp/project-catalog-production.har', allowAbortedJavaScript: false },
  { path: '/tmp/project-catalog-production-nojs.har', allowAbortedJavaScript: true },
]
const failures = []
for (const session of sessions) {
  const har = JSON.parse(readFileSync(session.path, 'utf8'))
  const entries = har?.log?.entries
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
    const isAllowedAbort = session.allowAbortedJavaScript && status <= 0 && isJavaScript
    if (isAllowedAbort) allowedAbortCount += 1
    if (!Number.isFinite(status) || status >= 400 || (status <= 0 && !isAllowedAbort)) {
      failures.push(`${session.path}: ${status} ${url}`)
    }
  }
  if (session.allowAbortedJavaScript && allowedAbortCount === 0) {
    failures.push(`${session.path}: no actively aborted JavaScript request was captured`)
  }
}
if (failures.length > 0) throw new Error(`HAR network failures:\n${failures.join('\n')}`)
console.log('HAR network gate passed')
NODE
test -z "$(agent-browser --session project-catalog-production console)"
test -z "$(agent-browser --session project-catalog-production errors)"
test -z "$(agent-browser --session project-catalog-production-nojs console)"
test -z "$(agent-browser --session project-catalog-production-nojs errors)"
```

Expected: course map reports 26 links and 7 project items with zero overflow; engineering path reports 17 steps; project index reports 6 core, 1 history, 2 watch links; the no-JS overview meets its taxonomy contract and the other seven no-JS pages retain metadata, full SHA, licenses, chain, source entries, and failure boundary; the inline Python block validates both PDFs. Both production HAR files are non-empty; the normal session has no missing/zero status or response `>=400`, and the no-JS session contains at least one actively aborted JavaScript request but no other missing/zero status or response `>=400`; console and page-error outputs are empty.

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
- [ ] Fifty-seven file-level source entrypoints exist at their pinned commits.
- [ ] Course denominator is 26; project stage has seven items; engineering path has 17 steps; localStorage keys and old routes are unchanged.
- [ ] All diagrams are original; direct assets, if any, have exact provenance records.
- [ ] Source automation reports changes but never edits or publishes content.
- [ ] 1440px, 390px, light, dark, keyboard, screen-reader tree, no-JS, and print checks pass.
- [ ] `pnpm test`, `pnpm validate`, `pnpm build`, source report policy parsing, strict project freshness, and `git diff origin/main...HEAD --check` pass.
- [ ] Third-stage Python Lab and fourth-stage capstone remain absent.

## Delivery handoff

After the plan passes review, execute Tasks 1–13 from a fresh implementation worktree based on `main@815d761`. Use a fresh implementation agent for each task, then run both a specification review and a code-quality review before moving to the next task. Execute Task 14 only after explicit final reviewer approval.
