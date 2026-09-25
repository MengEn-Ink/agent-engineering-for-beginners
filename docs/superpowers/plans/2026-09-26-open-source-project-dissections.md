# Open Source Project Dissections Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish one project overview, six version-pinned open-source project dissections, and one historical counterexample page while preserving source truth, license boundaries, existing URLs, local progress, and the separation from the future Python Lab Kit.

**Architecture:** `contentRegistry` remains the only owner of public page identity. A new `sources/project-index.yml` owns repository pins, repository status, catalog tier, license scopes, source entrypoints, page-to-subject mappings, and call-chain data; a Node loader validates it for tests, builds, and weekly freshness checks, while a VitePress data loader exposes the same serializable data to four SSR-safe Vue components. Markdown owns teaching prose, course/navigation files reference stable item IDs, and automation may report upstream changes but never rewrite or publish content.

**Tech Stack:** VitePress 1.6, Vue 3, TypeScript, JavaScript ESM, YAML 2.8, Vitest 3.2, GitHub Actions, GitHub REST API, GitHub Pages

---

## Scope and file map

**Create:**

- `sources/project-index.yml` — canonical project-page mapping, 13 pinned subjects, license scopes, 49 source entrypoints, and seven primary chains.
- `scripts/project-catalog.mjs` — schema parser, discriminated license validation, cross-reference validation, and build-time loader.
- `scripts/check-projects.mjs` — bounded GitHub freshness scan that writes project review reports without editing content.
- `scripts/validate-provenance.mjs` — allowlist gate for any future file in `docs/public/project-assets/`.
- `assets/provenance.yml` — empty versioned registry; no external asset is added in this phase.
- `docs/.vitepress/theme/data/projectCatalog.data.ts` — VitePress build-time loader for the validated YAML catalog.
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
- `package.json` — add `projects:check`; keep existing scripts unchanged.
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

### Task 1: Add the project catalog parser and schema validator

**Files:**

- Create: `scripts/project-catalog.mjs`
- Create: `tests/project-catalog.spec.ts`

- [ ] **Step 1: Write failing parser and schema tests**

Create `tests/project-catalog.spec.ts` with a minimal valid fixture and the required negative cases:

```ts
import { describe, expect, it } from 'vitest'
import {
  parseProjectCatalog,
  validateProjectCatalog,
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
    license_source_paths: ['LICENSE.txt'],
    watch_url: 'https://github.com/Aider-AI/aider/releases/latest',
    entrypoints: ['aider/main.py'],
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
      || !Array.isArray(subject.license_source_paths) || subject.license_source_paths.length === 0) {
      errors.push(`Subject ${subject.id} requires HTTPS watch_url, entrypoints, and license_source_paths`)
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
    for (const step of chain.steps ?? []) {
      const subject = subjectById.get(step.subject_id)
      if (!subject) {
        errors.push(`Chain ${chain.id} step ${step.id} references unknown subject: ${step.subject_id}`)
      } else if (!(subject.entrypoints ?? []).includes(step.source_path)) {
        errors.push(`Chain ${chain.id} step ${step.id} references an undeclared entrypoint: ${step.subject_id}/${step.source_path}`)
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

The accepted path-scope grammar is deliberately small: `**`, one exact repository-relative file, or one repository-relative `prefix/**`. This makes “most specific wins” deterministic; equal-specificity overlaps reduce to identical selectors and are rejected when their expressions differ.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run: `pnpm vitest run tests/project-catalog.spec.ts -t 'project catalog schema'`

Expected: 5 tests pass.

- [ ] **Step 5: Commit the parser**

```bash
git add scripts/project-catalog.mjs tests/project-catalog.spec.ts
git commit -m "feat: validate project catalog contracts"
```

### Task 2: Populate the exact 13-subject catalog and wire content validation

**Files:**

- Create: `sources/project-index.yml`
- Modify: `scripts/validate-content.mjs`
- Modify: `tests/project-catalog.spec.ts`

- [ ] **Step 1: Add failing exact-inventory and cross-reference tests**

Append tests that load the real file and assert the approved inventory:

```ts
import { readFileSync } from 'node:fs'
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

describe('real project catalog', () => {
  const catalog = parse(readFileSync('sources/project-index.yml', 'utf8'))

  it('contains the exact approved pages, subjects, and source paths', () => {
    expect(catalog.pages.map((page: { page_item_id: string }) => page.page_item_id)).toEqual(pageIds)
    expect(catalog.subjects.map((subject: { id: string }) => subject.id)).toEqual(subjectIds)
    expect(catalog.subjects.flatMap((subject: { entrypoints: string[] }) => subject.entrypoints)).toHaveLength(49)
    expect(catalog.chains).toHaveLength(7)
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

- [ ] **Step 2: Run the exact catalog tests and verify RED**

Run: `pnpm vitest run tests/project-catalog.spec.ts -t 'real project catalog'`

Expected: FAIL because `sources/project-index.yml` is absent and `validateBook` has no project-catalog option.

- [ ] **Step 3: Create the canonical catalog data**

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

Append the exact 13 subjects. Reuse the YAML anchor only for the repeated standard MIT scope; do not use it for mixed licenses:

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
    license_source_paths: [LICENSE]
    watch_url: https://github.com/modelcontextprotocol/modelcontextprotocol/releases/latest
    entrypoints:
      - schema/2026-07-28/schema.json
      - docs/docs/2026-07-28/learn/architecture.mdx

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
    license_source_paths: [LICENSE]
    watch_url: https://github.com/modelcontextprotocol/python-sdk/releases/latest
    entrypoints:
      - examples/snippets/servers/basic_tool.py
      - src/mcp/server/mcpserver/server.py
      - src/mcp/server/mcpserver/tools/tool_manager.py
      - src/mcp/server/lowlevel/server.py
      - src/mcp/server/session.py
      - src/mcp/server/stdio.py

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
    license_source_paths: [LICENSE.txt]
    watch_url: https://github.com/Aider-AI/aider/releases/latest
    entrypoints:
      - aider/main.py
      - aider/coders/base_coder.py
      - aider/repomap.py
      - aider/coders/editblock_coder.py
      - aider/repo.py
      - aider/run_cmd.py

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
    license_source_paths: [LICENSE]
    watch_url: https://github.com/OpenHands/OpenHands/releases/latest
    entrypoints:
      - src/api/conversation-service/agent-server-conversation-service.api.ts
      - src/api/agent-server-adapter.ts

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
    license_source_paths: [LICENSE]
    watch_url: https://github.com/OpenHands/software-agent-sdk/releases/latest
    entrypoints:
      - openhands-agent-server/openhands/agent_server/conversation_router.py
      - openhands-agent-server/openhands/agent_server/conversation_service.py
      - openhands-sdk/openhands/sdk/conversation/conversation.py
      - openhands-sdk/openhands/sdk/agent/agent.py
      - openhands-sdk/openhands/sdk/tool/tool.py
      - openhands-sdk/openhands/sdk/workspace/workspace.py

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
    license_source_paths: [LICENSE]
    watch_url: https://github.com/SWE-bench/SWE-bench/tags
    entrypoints:
      - swebench/harness/run_evaluation.py
      - swebench/harness/docker_utils.py
      - swebench/harness/grading.py
      - swebench/harness/reporting.py

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
    license_source_paths: [LICENSE]
    watch_url: https://github.com/sierra-research/tau2-bench/releases/latest
    entrypoints:
      - src/tau2/run.py
      - src/tau2/runner/simulation.py
      - src/tau2/environment/environment.py
      - src/tau2/evaluator/evaluator.py

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
    license_source_paths: [LICENSE]
    watch_url: https://github.com/langgenius/dify/releases/latest
    entrypoints:
      - api/controllers/service_api/app/workflow.py
      - api/core/app/apps/workflow/app_generator.py
      - api/core/app/apps/workflow/app_runner.py
      - api/core/workflow/workflow_entry.py
      - api/core/workflow/node_factory.py
      - api/core/workflow/nodes/agent_v2/agent_node.py
      - api/core/app/apps/common/workflow_response_converter.py

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
    license_source_paths: [LICENSE]
    watch_url: https://github.com/crewAIInc/crewAI/releases/latest
    entrypoints:
      - lib/crewai/src/crewai/crew.py
      - lib/crewai/src/crewai/process.py
      - lib/crewai/src/crewai/execution.py
      - lib/crewai/src/crewai/task.py
      - lib/crewai/src/crewai/agent/core.py
      - lib/crewai/src/crewai/agents/crew_agent_executor.py
      - lib/crewai/src/crewai/agents/step_executor.py
      - lib/crewai/src/crewai/tools/tool_usage.py

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
    license_source_paths: [LICENSE]
    watch_url: https://github.com/Significant-Gravitas/AutoGPT/releases/latest
    entrypoints:
      - classic/original_autogpt/autogpt/app/main.py
      - classic/original_autogpt/autogpt/agents/agent.py

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
    license_source_paths: [LICENSE.md]
    watch_url: https://github.com/FlowiseAI/Flowise/discussions/6727
    entrypoints:
      - packages/server/src/controllers/predictions/index.ts
      - packages/server/src/services/predictions/index.ts

  - id: hermes-agent
    canonical_repo: NousResearch/hermes-agent
    canonical_url: https://github.com/NousResearch/hermes-agent
    pin_kind: release
    pinned_ref: v2026.9.24
    pinned_commit: f97608f178d1ffeca59860195ab7da295f7c8e5f
    repository_status: active
    archived: false
    catalog_tier: watch-only
    license_summary: MIT; high-permission behavior remains outside the beginner execution path.
    license_scopes: *mit_scope
    license_source_paths: [LICENSE]
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
    license_summary: MIT plus THIRD_PARTY_NOTICES.md; high-permission behavior remains watch-only.
    license_scopes: *mit_scope
    license_source_paths: [LICENSE, THIRD_PARTY_NOTICES.md]
    watch_url: https://github.com/openclaw/openclaw/releases/latest
    entrypoints: []
```

Append the seven exact primary chains:

```yaml
chains:
  - id: mcp-tool-call
    page_item_id: project-mcp-python-sdk
    label: One tools/call request through the Python SDK
    reading_hint: Follow the protocol envelope separately from business authorization.
    misconception: SDK dispatch does not prove that a business action is authorized or correct.
    steps:
      - { id: schema, label: Protocol schema, subject_id: mcp-spec, source_path: schema/2026-07-28/schema.json, symbol: CallToolRequest, responsibility: Define the versioned request and result contract. }
      - { id: decorator, label: Tool registration, subject_id: mcp-python-sdk, source_path: examples/snippets/servers/basic_tool.py, symbol: mcp.tool, responsibility: Register a narrow Python capability. }
      - { id: registry, label: Tool manager, subject_id: mcp-python-sdk, source_path: src/mcp/server/mcpserver/tools/tool_manager.py, symbol: ToolManager, responsibility: Resolve and invoke the registered tool. }
      - { id: handler, label: Protocol handler, subject_id: mcp-python-sdk, source_path: src/mcp/server/lowlevel/server.py, symbol: Server, responsibility: Dispatch tools/call and normalize errors. }
      - { id: session, label: Session, subject_id: mcp-python-sdk, source_path: src/mcp/server/session.py, symbol: ServerSession, responsibility: Carry messages and lifecycle state. }
      - { id: transport, label: Transport, subject_id: mcp-python-sdk, source_path: src/mcp/server/stdio.py, symbol: stdio_server, responsibility: Move framed protocol messages without adding business authority. }

  - id: aider-repo-to-verified-edit
    page_item_id: project-aider
    label: Repository request to reviewable edit
    reading_hint: Track what context is selected and where edits become filesystem changes.
    misconception: A generated patch or automatic commit is not proof that the task is correct.
    steps:
      - { id: cli, label: Repository preflight, subject_id: aider, source_path: aider/main.py, symbol: main, responsibility: Parse options and identify the working repository. }
      - { id: coder, label: Coder lifecycle, subject_id: aider, source_path: aider/coders/base_coder.py, symbol: Coder.run, responsibility: Own the request and iterative response loop. }
      - { id: map, label: Repository map, subject_id: aider, source_path: aider/repomap.py, symbol: RepoMap.get_repo_map, responsibility: Select a bounded structural context. }
      - { id: edit, label: Edit parsing, subject_id: aider, source_path: aider/coders/editblock_coder.py, symbol: EditBlockCoder, responsibility: Turn model output into explicit edit operations. }
      - { id: apply, label: Apply and verify, subject_id: aider, source_path: aider/coders/base_coder.py, symbol: Coder.apply_updates, responsibility: Apply edits and surface lint or command evidence. }
      - { id: git, label: Repository evidence, subject_id: aider, source_path: aider/repo.py, symbol: GitRepo.commit, responsibility: Record a bounded diff without claiming business completion. }

  - id: openhands-canvas-to-workspace-event
    page_item_id: project-openhands
    label: Canvas request to workspace event
    reading_hint: Cross the repository boundary explicitly instead of treating OpenHands as one process.
    misconception: A UI backend selector is not the execution sandbox itself.
    steps:
      - { id: canvas, label: Canvas conversation API, subject_id: openhands-canvas, source_path: src/api/conversation-service/agent-server-conversation-service.api.ts, symbol: AgentServerConversationService, responsibility: Translate UI actions into Agent Server requests. }
      - { id: adapter, label: Server adapter, subject_id: openhands-canvas, source_path: src/api/agent-server-adapter.ts, symbol: toAppConversation, responsibility: Normalize server conversation data for the Canvas. }
      - { id: router, label: Conversation endpoint, subject_id: openhands-sdk, source_path: openhands-agent-server/openhands/agent_server/conversation_router.py, symbol: router, responsibility: Admit and route conversation operations. }
      - { id: service, label: Conversation service, subject_id: openhands-sdk, source_path: openhands-agent-server/openhands/agent_server/conversation_service.py, symbol: ConversationService, responsibility: Create and coordinate SDK conversations. }
      - { id: agent, label: Agent decision, subject_id: openhands-sdk, source_path: openhands-sdk/openhands/sdk/agent/agent.py, symbol: Agent, responsibility: Produce actions from conversation state. }
      - { id: workspace, label: Workspace boundary, subject_id: openhands-sdk, source_path: openhands-sdk/openhands/sdk/workspace/workspace.py, symbol: Workspace, responsibility: Execute bounded environment operations and return events. }

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
      - { id: tau-input, track: tau2-bench, label: Task and participants, subject_id: tau2-bench, source_path: src/tau2/run.py, symbol: run_task, responsibility: Select task, agent, user, and domain. }
      - { id: tau-sim, track: tau2-bench, label: Simulation, subject_id: tau2-bench, source_path: src/tau2/runner/simulation.py, symbol: run_simulation, responsibility: Coordinate the multi-turn trajectory. }
      - { id: tau-env, track: tau2-bench, label: Environment tools, subject_id: tau2-bench, source_path: src/tau2/environment/environment.py, symbol: Environment, responsibility: Apply tool actions to authoritative state. }
      - { id: tau-score, track: tau2-bench, label: Evaluator and reward, subject_id: tau2-bench, source_path: src/tau2/evaluator/evaluator.py, symbol: evaluate_simulation, responsibility: Judge task outcomes and produce reward evidence. }

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
      - { id: execution, label: Execution state, subject_id: crewai, source_path: lib/crewai/src/crewai/execution.py, symbol: execution helpers, responsibility: Carry shared execution state. }
      - { id: task, label: Task, subject_id: crewai, source_path: lib/crewai/src/crewai/task.py, symbol: Task, responsibility: Bind description, expected output, and assigned agent. }
      - { id: agent, label: Agent, subject_id: crewai, source_path: lib/crewai/src/crewai/agent/core.py, symbol: Agent, responsibility: Prepare the task-specific agent context. }
      - { id: executor, label: Agent executor, subject_id: crewai, source_path: lib/crewai/src/crewai/agents/crew_agent_executor.py, symbol: CrewAgentExecutor, responsibility: Run the reasoning and tool loop. }
      - { id: tool, label: Tool usage, subject_id: crewai, source_path: lib/crewai/src/crewai/tools/tool_usage.py, symbol: ToolUsage, responsibility: Invoke a tool and record its outcome. }
      - { id: output, label: Task output, subject_id: crewai, source_path: lib/crewai/src/crewai/task.py, symbol: Task._export_output, responsibility: Return the normalized task result to crew orchestration. }

  - id: autogpt-flowise-evolution
    page_item_id: project-history-autogpt-flowise
    label: Early autonomy and visual-flow assumptions to current boundaries
    reading_hint: Read the page as a migration lesson, not a production recommendation.
    misconception: An active repository or a visible canvas does not prove that an older architecture is maintained or suitable.
    steps:
      - { id: autogpt-entry, track: autogpt, label: Classic entry, subject_id: autogpt, source_path: classic/original_autogpt/autogpt/app/main.py, symbol: run_auto_gpt, responsibility: Show the original autonomous-loop product boundary. }
      - { id: autogpt-agent, track: autogpt, label: Classic agent, subject_id: autogpt, source_path: classic/original_autogpt/autogpt/agents/agent.py, symbol: Agent, responsibility: Expose the loop and prompt-strategy assumptions. }
      - { id: flowise-entry, track: flowise, label: Prediction controller, subject_id: flowise, source_path: packages/server/src/controllers/predictions/index.ts, symbol: createPrediction, responsibility: Admit a visual-flow prediction request. }
      - { id: flowise-service, track: flowise, label: Prediction service, subject_id: flowise, source_path: packages/server/src/services/predictions/index.ts, symbol: prediction service, responsibility: Execute the configured flow before the archived EOL boundary. }
```

- [ ] **Step 4: Wire the project catalog into content validation**

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

Task 9 adds provenance validation after its module and registry exist.

- [ ] **Step 5: Run exact inventory tests and full validation**

Run:

```bash
pnpm vitest run tests/project-catalog.spec.ts
pnpm validate
pnpm test
```

Expected: project catalog tests pass, content validation passes, and the full suite remains green.

- [ ] **Step 6: Commit the canonical project data**

```bash
git add sources/project-index.yml scripts/validate-content.mjs tests/project-catalog.spec.ts
git commit -m "feat: add pinned project source catalog"
```

### Task 3: Add the build-time catalog loader and four SSR-safe components

**Files:**

- Create: `docs/.vitepress/theme/data/projectCatalog.data.ts`
- Create: `docs/.vitepress/theme/data/projectCatalog.ts`
- Create: `docs/.vitepress/theme/components/ProjectOverview.vue`
- Create: `docs/.vitepress/theme/components/ProjectMeta.vue`
- Create: `docs/.vitepress/theme/components/ProjectCallChain.vue`
- Create: `docs/.vitepress/theme/components/ProjectSourceLinks.vue`
- Modify: `docs/.vitepress/theme/index.ts`
- Modify: `docs/.vitepress/theme/style.css`
- Create: `tests/project-pages.spec.ts`

- [ ] **Step 1: Write failing loader, lookup, SSR, and semantic tests**

Create `tests/project-pages.spec.ts` with these first contracts:

```ts
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  getProjectChain,
  getProjectPage,
  getProjectSubject,
  projectCatalog,
  projectSourceUrl,
} from '../docs/.vitepress/theme/data/projectCatalog'

describe('project presentation primitives', () => {
  it('loads the validated project catalog and fails closed on inherited IDs', () => {
    expect(getProjectPage('project-aider').subjects).toEqual(['aider'])
    expect(getProjectSubject('aider').pinned_ref).toBe('v0.86.0')
    expect(getProjectChain('aider-repo-to-verified-edit').steps).toHaveLength(6)
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
      'Undeclared project entrypoint: aider/README.md',
    )
  })

  it('registers four components with native list and disclosure semantics', () => {
    const theme = readFileSync('docs/.vitepress/theme/index.ts', 'utf8')
    for (const name of ['ProjectOverview', 'ProjectMeta', 'ProjectCallChain', 'ProjectSourceLinks']) {
      expect(theme).toContain(`'${name}'`)
    }
    const chain = readFileSync('docs/.vitepress/theme/components/ProjectCallChain.vue', 'utf8')
    expect(chain).toContain('<figure')
    expect(chain).toContain('<ol')
    expect(chain).toContain('role="list"')
    expect(chain).toContain('不要误解')
    const meta = readFileSync('docs/.vitepress/theme/components/ProjectMeta.vue', 'utf8')
    expect(meta).toContain('仓库状态')
    expect(meta).toContain('教学层级')
    expect(meta).toContain('<details')
    expect(meta).toContain('project-license-print')
    expect(meta).not.toContain('pinned_commit.slice')
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
})
```

- [ ] **Step 2: Run the component tests and verify RED**

Run: `pnpm vitest run tests/project-pages.spec.ts -t 'project presentation primitives'`

Expected: FAIL because the loader, lookup module, and components do not exist.

- [ ] **Step 3: Add the VitePress data loader and fail-closed lookups**

Create `docs/.vitepress/theme/data/projectCatalog.data.ts`:

```ts
import { resolve } from 'node:path'
import type { Loader } from 'vitepress'
import { loadProjectCatalog } from '../../../../scripts/project-catalog.mjs'

export interface LicenseScope {
  basis: 'path' | 'contribution'
  expression: string
  path_or_glob?: string
  selector?: string
  scope: string
  note: string
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
  license_summary: string
  license_scopes: LicenseScope[]
  license_source_paths: string[]
  watch_url: string
  entrypoints: string[]
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

declare const data: ProjectCatalog
export { data }

export default {
  watch: ['../../../../sources/project-index.yml'],
  load() {
    return loadProjectCatalog(resolve(process.cwd(), 'sources/project-index.yml'))
  },
} satisfies Loader
```

Create `docs/.vitepress/theme/data/projectCatalog.ts`:

```ts
import { data } from './projectCatalog.data'

const pageById = Object.fromEntries(data.pages.map((page) => [page.page_item_id, page]))
const subjectById = Object.fromEntries(data.subjects.map((subject) => [subject.id, subject]))
const chainById = Object.fromEntries(data.chains.map((chain) => [chain.id, chain]))

function own<T>(record: Record<string, T>, id: string, label: string): T {
  if (!Object.hasOwn(record, id)) throw new Error(`Unknown ${label}: ${id}`)
  return record[id]
}

export const projectCatalog = data
export const getProjectPage = (id: string) => own(pageById, id, 'project page')
export const getProjectSubject = (id: string) => own(subjectById, id, 'project subject')
export const getProjectChain = (id: string) => own(chainById, id, 'project chain')

export function projectSourceUrl(subjectId: string, sourcePath: string): string {
  const subject = getProjectSubject(subjectId)
  if (![...subject.entrypoints, ...subject.license_source_paths].includes(sourcePath)) {
    throw new Error(`Undeclared project entrypoint: ${subjectId}/${sourcePath}`)
  }
  return `${subject.canonical_url}/blob/${subject.pinned_commit}/${sourcePath}`
}
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
      <li v-for="subject in subjects" :key="subject.id">
        <a :href="subject.canonical_url">{{ subject.canonical_repo }}</a>
        <span><strong>固定版本：</strong>{{ subject.pinned_ref }} · <code>{{ subject.pinned_commit }}</code></span>
        <span><strong>仓库状态：</strong>{{ statusLabel(subject.repository_status) }}<template v-if="subject.archived"> · GitHub 已归档</template></span>
        <span><strong>核验：</strong>{{ subject.verified_at }}，下次 {{ subject.review_by }}</span>
        <a :href="subject.watch_url">检查上游更新</a>
        <details>
          <summary>许可证边界</summary>
          <p>{{ subject.license_summary }}</p>
          <ul role="list">
            <li v-for="scope in subject.license_scopes" :key="`${scope.expression}-${scope.path_or_glob ?? scope.selector}`">
              <code>{{ scope.expression }}</code> · {{ scope.scope }} — {{ scope.note }}
            </li>
          </ul>
          <p>
            许可证原文：
            <a v-for="path in subject.license_source_paths" :key="path" :href="projectSourceUrl(subject.id, path)"><code>{{ path }}</code></a>
          </p>
        </details>
        <div class="project-license-print" aria-hidden="true">
          <p><strong>许可证摘要：</strong>{{ subject.license_summary }}</p>
          <ul>
            <li v-for="scope in subject.license_scopes" :key="`print-${scope.expression}-${scope.path_or_glob ?? scope.selector}`">
              {{ scope.expression }} · {{ scope.scope }} — {{ scope.note }}
            </li>
          </ul>
          <p>许可证原文：{{ subject.license_source_paths.join('、') }} · {{ subject.pinned_commit }}</p>
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

const props = defineProps<{ projectId: string }>()
const page = computed(() => getProjectPage(props.projectId))
const chain = computed(() => getProjectChain(page.value.primary_chain_id!))
</script>

<template>
  <figure class="project-call-chain" :aria-labelledby="`${projectId}-chain-title`">
    <figcaption :id="`${projectId}-chain-title`">{{ chain.label }}</figcaption>
    <p class="project-chain-reading"><strong>怎么看：</strong>{{ chain.reading_hint }}</p>
    <ol role="list">
      <li v-for="step in chain.steps" :key="step.id" role="listitem">
        <span v-if="step.track" class="project-chain-track">{{ step.track }}</span>
        <strong>{{ step.label }}</strong>
        <span>{{ step.responsibility }}</span>
        <code>{{ step.source_path }} · {{ step.symbol }}</code>
      </li>
    </ol>
    <p class="project-chain-warning"><strong>不要误解：</strong>{{ chain.misconception }}</p>
  </figure>
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
  return subject.entrypoints.map((path) => ({
    subjectId,
    repo: subject.canonical_repo,
    path,
    href: projectSourceUrl(subjectId, path),
  }))
}))
</script>

<template>
  <ol class="project-source-links" role="list">
    <li v-for="row in rows" :key="`${row.subjectId}:${row.path}`">
      <a :href="row.href"><code>{{ row.path }}</code></a>
      <small>{{ row.repo }} · 固定 commit</small>
    </li>
  </ol>
</template>
```

Create `ProjectOverview.vue`; its setup remains lazy so Task 3 builds before Task 7 adds the project IDs:

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
</script>

<template>
  <nav class="project-overview" aria-label="开源项目拆解目录">
    <section aria-labelledby="project-core-title">
      <h2 id="project-core-title">核心源码拆解</h2>
      <ol role="list">
        <li v-for="page in corePages" :key="page.page_item_id">
          <a :href="withBase(getContentItem(page.page_item_id).route)">{{ getContentItem(page.page_item_id).title }}</a>
          <span>{{ page.subjects.map(subjectStatus).join('；') }}</span>
          <p v-if="courseItemFor(page.page_item_id)">{{ courseItemFor(page.page_item_id)?.outcome }}</p>
          <small v-if="prerequisiteText(page.page_item_id)">先修：{{ prerequisiteText(page.page_item_id) }}</small>
        </li>
      </ol>
    </section>
    <section aria-labelledby="project-history-title">
      <h2 id="project-history-title">历史反例</h2>
      <ul role="list"><li v-for="page in historicalPages" :key="page.page_item_id"><a :href="withBase(getContentItem(page.page_item_id).route)">{{ getContentItem(page.page_item_id).title }}</a></li></ul>
    </section>
    <section aria-labelledby="project-watch-title">
      <h2 id="project-watch-title">前沿高权限观察区</h2>
      <p>这些项目不是初学者默认安装步骤，也不计入课程完成度。</p>
      <ul role="list"><li v-for="subject in watchSubjects" :key="subject.id"><a :href="subject.canonical_url">{{ subject.canonical_repo }}</a> · {{ subject.pinned_ref }} · watch-only</li></ul>
    </section>
  </nav>
</template>
```

- [ ] **Step 5: Register components and add the exact style block**

Import and register the four components in `docs/.vitepress/theme/index.ts`. Append this scoped block to `style.css`:

```css
.project-meta,
.project-call-chain,
.project-overview section {
  margin: 1.5rem 0;
  border: 1px solid var(--reading-rule);
  border-radius: 12px;
  background: var(--reading-bg);
}

.project-meta,
.project-overview section {
  padding: 1rem 1.1rem;
}

.project-meta > ul,
.project-overview ol,
.project-overview ul,
.project-call-chain ol,
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

.project-call-chain {
  padding: 1.1rem;
}

.project-call-chain figcaption {
  color: var(--reading-text);
  font-weight: 750;
  font-size: 1.05rem;
}

.project-call-chain ol {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
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

.project-chain-track,
.project-meta small,
.project-source-links small {
  color: var(--reading-muted);
  font-size: 0.8rem;
}

.project-chain-warning {
  border-left: 3px solid var(--reading-risk);
  padding-left: 0.8rem;
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
  .project-call-chain ol { grid-template-columns: 1fr; }
  .project-meta,
  .project-call-chain,
  .project-overview section { padding: 0.9rem; }
}

@media print {
  .project-meta details { display: none !important; }
  .project-license-print { display: block !important; }
  .project-call-chain ol { grid-template-columns: 1fr; }
  .project-source-links a[href]::after { content: " (" attr(href) ")"; overflow-wrap: anywhere; }
}
```

Use only the existing `--reading-bg`, `--reading-bg-soft`, `--reading-text`, `--reading-text-soft`, `--reading-link`, `--reading-risk`, and `--reading-rule` variables; do not insert literal colors inside project selectors.

- [ ] **Step 6: Run component tests and build**

Run:

```bash
pnpm vitest run tests/project-pages.spec.ts -t 'project presentation primitives'
pnpm test
pnpm build
```

Expected: all tests and the production build pass; no public project route exists yet.

- [ ] **Step 7: Commit the presentation primitives**

```bash
git add docs/.vitepress/theme/data/projectCatalog.data.ts docs/.vitepress/theme/data/projectCatalog.ts docs/.vitepress/theme/components/ProjectOverview.vue docs/.vitepress/theme/components/ProjectMeta.vue docs/.vitepress/theme/components/ProjectCallChain.vue docs/.vitepress/theme/components/ProjectSourceLinks.vue docs/.vitepress/theme/index.ts docs/.vitepress/theme/style.css tests/project-pages.spec.ts
git commit -m "feat: add project dissection primitives"
```

### Task 4: Write the MCP and Aider core dissections

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
  expect(text).toContain(`<ProjectMeta project-id="${projectId}" />`)
  expect(text).toContain(`<ProjectCallChain project-id="${projectId}" />`)
  expect(text).toContain(`<ProjectSourceLinks project-id="${projectId}" />`)
  for (const heading of requiredProjectHeadings) expect(text, `${path}: ${heading}`).toContain(`## ${heading}`)
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
    const aider = readFileSync('docs/projects/aider.md', 'utf8')
    expect(aider).toContain('RepoMap 不是“读完全部仓库”')
    expect(aider).toContain('生成补丁不等于任务完成')
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

它把第 4 章的“工具契约”落到真实 schema、session 和 transport。读完应能指出协议层、SDK 层与业务层分别负责什么，而不是把 MCP 叫作万能插件市场。

## 版本与边界

<ProjectMeta project-id="project-mcp-python-sdk" />

本页只解释固定版本中的 `tools/call` 主链。Resources、Prompts、OAuth 扩展和 draft 能力只标出边界，不展开成第二条主线。

## 原创建筑图

<ProjectCallChain project-id="project-mcp-python-sdk" />

图中每一层都可以替换实现，但消息结构、会话生命周期和业务授权不能互相冒充。

## 唯一纵向调用链

从 `CallToolRequest` 开始，沿注册、查找、协议分发、会话和 stdio 返回结果。阅读时先找“谁决定调用哪个函数”，再找“谁只负责搬运消息”。

## 关键源码入口

<ProjectSourceLinks project-id="project-mcp-python-sdk" />

源码链接全部固定到 commit；不要把 `main` 上的新扩展反推到本页版本。

## 一次请求的数据流

客户端发送带工具名和参数的 `tools/call`。ServerSession 接收协议消息，low-level Server 选择 handler，ToolManager 根据注册表解析工具，Python 函数返回内容或错误，再沿同一会话封装成协议结果。业务系统必须在工具内部或执行层重新校验调用主体、资源范围与副作用。

## 阅读练习

1. 在 schema 中找到 `CallToolRequest` 与结果类型。
2. 从 `basic_tool.py` 的注册点追到 ToolManager。
3. 标出 stdio 只负责传输、不能决定业务权限的证据。

## 失败边界

如果工具名存在但调用者无权操作目标资源，协议解析成功也必须拒绝业务动作。不要用“请求符合 MCP schema”替代身份、授权、幂等和真实回执。

## 生产边界

SDK 不自动提供租户隔离、凭证托管、数据可信度、工具审批或结果正确性。高风险工具仍需白名单、预算、审计、超时后的状态查询和人工接管。

## 高频面试点

- [IQ-04-A：工具契约至少包含什么](/chapters/04-tools-mcp#iq-04-a)
- [IQ-04-B：MCP 解决与不解决什么](/chapters/04-tools-mcp#iq-04-b)
- [IQ-04-C：怎样避免消息工具误发全员](/chapters/04-tools-mcp#iq-04-c)

## 升级复核

新版本出现时依次比较 schema、版本协商、tool result、session 生命周期和 transport；最后检查 Python SDK 对该规范版本的支持矩阵。只在差异影响本页主链时修订正文。

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

本页固定在 v0.86.0，只追踪一个 edit-block 路径。其他模型适配、语音、网页 UI 和排行榜不进入主链。

## 原创建筑图

<ProjectCallChain project-id="project-aider" />

RepoMap 是被预算约束的结构摘要，不是“读完全部仓库”；真正写盘发生在 edit 解析之后。

## 唯一纵向调用链

从 `main` 的仓库预检进入 `Coder.run`，再跟踪 repo map、模型响应、edit-block 解析、`apply_updates` 和 Git 记录。每一步都问：输入来自哪里，失败是否停止，证据保存在哪里。

## 关键源码入口

<ProjectSourceLinks project-id="project-aider" />

## 一次请求的数据流

用户请求先与明确加入的文件和 RepoMap 组合。Coder 生成消息并请求模型，edit format 把文本限制成结构化修改，应用层检查文件是否可编辑并落盘，随后 lint、命令或 Git diff 提供反馈。下一轮应消费这些环境事实，而不是只相信模型的完成声明。

## 阅读练习

1. 找出仓库根目录与脏文件在进入 Coder 前如何处理。
2. 比较 RepoMap 与聊天文件的来源和预算。
3. 从 `get_edits` 追到 `apply_updates`，记录三个可能停止修改的条件。

## 失败边界

当模型输出不能解析为 edit block，正确结果是保留原文件并反馈格式错误；不能用模糊字符串替换“尽量改一下”。当测试命令失败，提交存在也不能被报告为任务成功。

## 生产边界

Aider 不替团队决定需求是否正确，也不自动解决权限、秘密、依赖供应链或跨服务业务验证。真实仓库必须保护用户未提交改动，并限制命令和可编辑路径。

## 高频面试点

- [IQ-13-A：改代码前核对什么](/chapters/13-coding-agent#iq-13-a)
- [IQ-13-B：为什么先看测试失败](/chapters/13-coding-agent#iq-13-b)
- [IQ-13-C：怎样验收 Coding Agent](/chapters/13-coding-agent#iq-13-c)

## 升级复核

重点比较 CLI 入口、Coder 生命周期、RepoMap 选择、默认 edit format、文件安全检查和 Git 行为。模型列表或榜单变化只进入更新记录，不自动改写稳定工程结论。

## 来源与归因

调用链图为本书原创重绘，依据固定 commit 的 Aider 源码。页面不复用项目 Logo、网站截图或排行榜图；短源码概念按 Apache-2.0 边界归因。
```

- [ ] **Step 5: Run focused and full gates**

Run:

```bash
pnpm vitest run tests/project-pages.spec.ts -t 'MCP and Aider'
pnpm test
pnpm build
```

Expected: both pages pass the 13-section contract; build succeeds without adding navigation or course items yet.

- [ ] **Step 6: Commit the first two dissections**

```bash
git add docs/projects/mcp-python-sdk.md docs/projects/aider.md tests/project-pages.spec.ts
git commit -m "docs: dissect MCP and Aider"
```

### Task 5: Write the OpenHands and benchmark core dissections

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
  })

  it('does not present local fixtures or cross-benchmark scores as official results', () => {
    const text = readFileSync('docs/projects/agent-benchmarks.md', 'utf8')
    expect(text).toContain('不能直接横比')
    expect(text).toContain('不是官方 benchmark 成绩')
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

Canvas v1.24.0 依赖 `@openhands/typescript-client@1.49.6`，与本页固定的 software-agent-sdk v1.49.6 对齐。页面只解释一次 conversation 到 workspace event 的路径。

## 原创建筑图

<ProjectCallChain project-id="project-openhands" />

图中最重要的边界是：Canvas 选择并连接 backend，Agent Server 承接会话，SDK 决定动作，Workspace 限制动作发生在哪里。

## 唯一纵向调用链

从 Canvas conversation service 开始，经过 adapter 和 Agent Server router/service，进入 SDK Conversation 与 Agent，最后由 Tool/Workspace 产生事件回流界面。不要把 UI 中的 backend selector 当作沙箱。

## 关键源码入口

<ProjectSourceLinks project-id="project-openhands" />

## 一次请求的数据流

用户消息由 Canvas 发送到选定 Agent Server。服务创建或恢复 conversation，SDK agent 基于已有事件产生动作，工具在 workspace 边界执行，观察与状态事件再通过服务和客户端回到 Canvas。权限、秘密和文件范围必须在服务与 workspace 层实际限制。

## 阅读练习

1. 找出 Canvas 如何选择 Agent Server，而不是直接调用 Python agent。
2. 从 conversation router 追到 SDK Conversation。
3. 画出宿主机直跑、Docker 和远端 workspace 的信任边界差异。

## 失败边界

如果 Agent Server 连接中断，Canvas 的“发送成功”不能冒充 workspace 动作完成。恢复必须基于 conversation/event 状态；直接重放高风险动作前要检查外部副作用。

## 生产边界

直接在宿主机启动 Agent Server 会拥有主机文件权限。Docker 或远端环境也不是自动安全，需要目录挂载、网络、秘密、工具和审批的最小权限策略。

## 高频面试点

- [IQ-09-B：沙箱、guardrail 与最小权限](/chapters/09-safety-recovery#iq-09-b)
- [IQ-10-A：从 Demo 到生产](/chapters/10-production#iq-10-a)
- [IQ-13-C：怎样验收 Coding Agent](/chapters/13-coding-agent#iq-13-c)

## 升级复核

先检查 Canvas README 的 repository boundaries、客户端依赖版本、Agent Server conversation API、SDK Conversation/Agent 和 Workspace 契约。仓库再次拆分或合并时，先改边界图再改调用链。

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

两条轨道分别闭合到自己的评分，不在图末尾合成一个“总分”。

## 唯一纵向调用链

本页使用一个“任务到评分”的比较链：左轨是 patch、容器、测试与 report，右轨是 task、双参与者 simulation、环境工具与 reward。比较的是证据结构，不是数值高低。

## 关键源码入口

<ProjectSourceLinks project-id="project-agent-benchmarks" />

## 一次请求的数据流

SWE-bench 将实例和预测 patch 放入隔离环境，运行目标测试并由 grading 生成解决状态。τ²-bench 让 agent 与 user simulator 围绕同一任务交互，环境执行工具并维护权威状态，evaluator 根据结果和轨迹给出 reward。

## 阅读练习

1. 找出 SWE-bench 的预测输入、容器执行和最终报告边界。
2. 找出 τ²-bench 中 user simulator 与 environment 的职责差异。
3. 列出三个会让两个分数不可比较的契约差异。

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
pnpm test
pnpm build
```

Expected: focused tests and the full build pass.

- [ ] **Step 6: Commit both pages**

```bash
git add docs/projects/openhands.md docs/projects/agent-benchmarks.md tests/project-pages.spec.ts
git commit -m "docs: dissect OpenHands and agent benchmarks"
```

### Task 6: Write the Dify and CrewAI core dissections

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
pnpm test
pnpm build
```

Expected: focused tests and the full build pass.

- [ ] **Step 6: Commit both pages**

```bash
git add docs/projects/dify.md docs/projects/crewai.md tests/project-pages.spec.ts
git commit -m "docs: dissect Dify and CrewAI"
```

### Task 7: Publish the project overview and historical counterexample, then register all eight routes

**Files:**

- Create: `docs/projects/index.md`
- Create: `docs/projects/history-autogpt-flowise.md`
- Modify: `docs/.vitepress/theme/data/contentRegistry.ts`
- Modify: `tests/course-map.spec.ts`
- Modify: `tests/project-pages.spec.ts`

- [ ] **Step 1: Write failing route, overview, and historical-boundary tests**

```ts
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

- [ ] **Step 2: Run tests and verify RED**

Run: `pnpm vitest run tests/project-pages.spec.ts tests/course-map.spec.ts -t 'project routes|catalog overview'`

Expected: FAIL because the pages and registry records do not exist.

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

- [ ] **Step 6: Run route, page, and build tests**

Run:

```bash
pnpm vitest run tests/project-pages.spec.ts tests/course-map.spec.ts -t 'project routes|catalog overview'
pnpm test
pnpm build
```

Expected: content registry has 39 unique real routes; overview/history tests and build pass.

- [ ] **Step 7: Commit the public catalog shell**

```bash
git add docs/projects/index.md docs/projects/history-autogpt-flowise.md docs/.vitepress/theme/data/contentRegistry.ts tests/course-map.spec.ts tests/project-pages.spec.ts
git commit -m "feat: publish the project dissection catalog"
```

### Task 8: Integrate six core projects into course progress, the engineering path, and navigation

**Files:**

- Modify: `docs/.vitepress/theme/data/courseMap.ts`
- Modify: `docs/.vitepress/theme/data/readingPaths.ts`
- Modify: `docs/.vitepress/config.mts`
- Modify: `tests/course-map.spec.ts`
- Modify: `tests/project-pages.spec.ts`

- [ ] **Step 1: Write failing graph, path, and navigation tests**

Add exact assertions rather than only checking that strings appear:

```ts
const projectCourseIds = [
  'project-mcp-python-sdk', 'project-aider', 'project-openhands',
  'project-agent-benchmarks', 'project-dify', 'project-crewai',
  'case-delivery-agent',
]
const engineeringProjectTail = [
  'project-mcp-python-sdk', 'project-aider', 'project-openhands',
  'project-agent-benchmarks', 'project-dify', 'project-crewai',
  'case-delivery-agent',
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
    expect(engineering.steps).toHaveLength(17)
    expect(engineering.steps.slice(-7).map((step) => step.itemId)).toEqual(engineeringProjectTail)
    expect(readingPathDefinitions.find((path) => path.id === 'beginner')?.steps).toHaveLength(8)
    expect(readingPathDefinitions.find((path) => path.id === 'interview')?.steps).toHaveLength(11)
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
  })
})
```

Update the earlier graph tests from 20 to 26 and update the exact `expectedCourseItems` array with the six records below. Do not loosen equality assertions into `arrayContaining`.

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

- [ ] **Step 6: Run graph, path, navigation, and build gates**

Run:

```bash
pnpm vitest run tests/course-map.spec.ts -t 'project curriculum integration|course graph|course navigation integration'
pnpm test
pnpm build
```

Expected: 26 published items, a seven-item project stage, 17 engineering steps, exact nav groups, and a green build.

- [ ] **Step 7: Commit the course integration**

```bash
git add docs/.vitepress/theme/data/courseMap.ts docs/.vitepress/theme/data/readingPaths.ts docs/.vitepress/config.mts tests/course-map.spec.ts tests/project-pages.spec.ts
git commit -m "feat: add project dissections to the curriculum"
```

### Task 9: Add the project asset provenance gate

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

describe('project asset provenance', () => {
  it('accepts the intentionally empty phase-two registry', () => {
    expect(validateProvenanceFile('assets/provenance.yml', process.cwd())).toEqual([])
  })

  it('rejects an unregistered project asset', () => {
    const root = mkdtempSync(join(tmpdir(), 'project-assets-'))
    try {
      mkdirSync(join(root, 'docs/public/project-assets'), { recursive: true })
      mkdirSync(join(root, 'assets'), { recursive: true })
      writeFileSync(join(root, 'docs/public/project-assets/copied.svg'), '<svg/>')
      writeFileSync(join(root, 'assets/provenance.yml'), 'schema_version: 1\nassets: []\n')
      expect(validateProvenanceFile(join(root, 'assets/provenance.yml'), root))
        .toContain('Unregistered project asset: docs/public/project-assets/copied.svg')
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('rejects third-party assets without a fixed commit URL and complete attribution', () => {
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
    source_url: https://github.com/example/repo/blob/main/image.svg
    source_repo: example/repo
    source_ref: main
    source_path: image.svg
    license: MIT
    copyright_holder: Example
    modified: false
    used_by: [project-aider]
    alt: Architecture
    verified_at: '2026-09-26'
`)
      expect(validateProvenanceFile(join(root, 'assets/provenance.yml'), root)).toEqual(expect.arrayContaining([
        'Third-party asset must use a 40-character source_ref: docs/public/project-assets/copied.svg',
        'Third-party asset URL must be pinned to source_ref: docs/public/project-assets/copied.svg',
      ]))
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

const assetRoot = 'docs/public/project-assets'
const shaPattern = /^[0-9a-f]{40}$/u
const datePattern = /^\d{4}-\d{2}-\d{2}$/u
const requiredFields = [
  'local_file', 'origin', 'source_url', 'source_repo', 'source_ref', 'source_path',
  'license', 'copyright_holder', 'modified', 'used_by', 'alt', 'verified_at',
]

function files(root) {
  if (!existsSync(root)) return []
  return readdirSync(root).flatMap((entry) => {
    const path = join(root, entry)
    return statSync(path).isDirectory() ? files(path) : [path]
  })
}

export function validateProvenanceFile(path, root = process.cwd()) {
  if (!existsSync(path)) return ['Missing assets/provenance.yml']
  let data
  try { data = parse(readFileSync(path, 'utf8')) } catch { return ['Asset provenance YAML cannot be parsed'] }
  const errors = []
  const assets = Array.isArray(data?.assets) ? data.assets : []
  if (data?.schema_version !== 1) errors.push('Asset provenance schema_version must be 1')
  const actual = files(resolve(root, assetRoot)).map((file) => relative(root, file).split(sep).join('/'))
  const counts = new Map()

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
      if (!String(asset.source_url ?? '').includes(`/blob/${asset.source_ref}/`)) {
        errors.push(`Third-party asset URL must be pinned to source_ref: ${asset.local_file}`)
      }
      for (const field of ['source_repo', 'source_path', 'license', 'copyright_holder', 'alt']) {
        if (typeof asset[field] !== 'string' || asset[field].trim() === '') errors.push(`Third-party asset ${asset.local_file} requires ${field}`)
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
pnpm validate
pnpm test
pnpm build
```

Expected: empty provenance is accepted, both malicious fixtures fail as asserted, and all production gates pass.

- [ ] **Step 6: Commit the provenance gate**

```bash
git add assets/provenance.yml scripts/validate-provenance.mjs scripts/validate-content.mjs tests/project-catalog.spec.ts tests/project-pages.spec.ts
git commit -m "feat: enforce project asset provenance"
```

### Task 10: Add project freshness discovery without automatic content edits

**Files:**

- Create: `scripts/check-projects.mjs`
- Modify: `tests/source-freshness.spec.ts`
- Modify: `package.json`
- Modify: `.github/workflows/source-freshness.yml`

- [ ] **Step 1: Write failing project freshness tests**

Append tests with injected fetch responses; never call GitHub in unit tests:

```ts
import {
  buildProjectFreshnessReport,
  checkProjectSubject,
  runProjectCheck,
} from '../scripts/check-projects.mjs'

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
  entrypoints: ['aider/main.py'],
}

describe('project freshness checker', () => {
  it('accepts matching canonical metadata, ref, commit, and entrypoints', async () => {
    const result = await checkProjectSubject(projectSubject, {
      retryAttempts: 1,
      fetchImpl: async (url: string) => {
        if (url.endsWith('/commits/v0.86.0')) return { status: 200, url, json: async () => ({ sha: 'a'.repeat(40) }) }
        if (url.includes('/contents/aider/main.py')) return { status: 200, url, json: async () => ({ path: 'aider/main.py' }) }
        if (url.includes('/contents/LICENSE.txt')) return { status: 200, url, json: async () => ({ path: 'LICENSE.txt' }) }
        if (url.endsWith('/releases/latest')) return { status: 200, url, json: async () => ({ tag_name: 'v0.86.0' }) }
        return { status: 200, url, json: async () => ({ full_name: 'Aider-AI/aider', archived: false, pushed_at: '2026-09-26T00:00:00Z' }) }
      },
    })
    expect(result.findings).toEqual([])
  })

  it('reports deterministic pin, path, canonical, archive, and release changes', async () => {
    const result = await checkProjectSubject(projectSubject, {
      retryAttempts: 1,
      fetchImpl: async (url: string) => {
        if (url.endsWith('/commits/v0.86.0')) return { status: 200, url, json: async () => ({ sha: 'b'.repeat(40) }) }
        if (url.includes('/contents/')) return { status: 404, url, json: async () => ({}) }
        if (url.endsWith('/releases/latest')) return { status: 200, url, json: async () => ({ tag_name: 'v0.87.0' }) }
        return { status: 200, url, json: async () => ({ full_name: 'NewOwner/aider', archived: true, pushed_at: '2026-09-27T00:00:00Z' }) }
      },
    })
    expect(result.findings).toEqual(expect.arrayContaining([
      'canonical_repo_changed', 'repository_status_changed', 'pin_ref_mismatch',
      'entrypoint_missing', 'license_source_missing', 'project_update_available', 'repository_updated',
    ]))
  })

  it('keeps HTTP, parse, and request failures explicit and non-healthy', async () => {
    const transient = await checkProjectSubject(projectSubject, {
      retryAttempts: 2,
      retryDelayMs: 0,
      fetchImpl: async () => ({ status: 503, url: '', json: async () => ({}) }),
    })
    expect(transient.findings).toContain('project_transient_error')
    const network = await checkProjectSubject(projectSubject, {
      retryAttempts: 1,
      fetchImpl: async () => { throw new Error('ECONNRESET') },
    })
    expect(network.findings).toContain('project_network_error')
  })

  it('sends the token only to api.github.com and fails closed on invalid schema', async () => {
    const seen = new Map<string, string | undefined>()
    await checkProjectSubject(projectSubject, {
      githubToken: 'read-token',
      retryAttempts: 1,
      fetchImpl: async (url: string, init?: { headers?: Record<string, string> }) => {
        seen.set(url, init?.headers?.authorization)
        return { status: 200, url, json: async () => url.endsWith('/commits/v0.86.0')
          ? ({ sha: 'a'.repeat(40) })
          : url.includes('/contents/LICENSE.txt') ? ({ path: 'LICENSE.txt' })
            : url.includes('/contents/') ? ({ path: 'aider/main.py' })
            : url.endsWith('/releases/latest') ? ({ tag_name: 'v0.86.0' })
              : ({ full_name: 'Aider-AI/aider', archived: false, pushed_at: '2026-09-26T00:00:00Z' }) }
      },
    })
    expect([...seen.entries()].every(([url, auth]) => url.startsWith('https://api.github.com/') && auth === 'Bearer read-token')).toBe(true)

    const outputRoot = mkdtempSync(join(tmpdir(), 'project-freshness-'))
    try {
      const report = await runProjectCheck({
        projectPath: join(outputRoot, 'missing-project-index.yml'),
        outputJson: join(outputRoot, 'project-freshness.json'),
        outputMarkdown: join(outputRoot, 'project-freshness.md'),
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
      { id: 'ok', findings: [] },
      { id: 'changed', findings: ['project_update_available'] },
    ], '2026-09-26T00:00:00.000Z').summary).toEqual({ total: 2, healthy: 1, needs_review: 1 })
  })
})
```

- [ ] **Step 2: Run project freshness tests and verify RED**

Run: `pnpm vitest run tests/source-freshness.spec.ts -t 'project freshness checker'`

Expected: FAIL because `scripts/check-projects.mjs` does not exist.

- [ ] **Step 3: Implement the bounded GitHub checker**

Create `scripts/check-projects.mjs` with these public contracts:

```js
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parse } from 'yaml'
import { validateProjectCatalogFile } from './project-catalog.mjs'
import { reviewDateInTimeZone } from './review-date.mjs'

const retryable = new Set([408, 429, 500, 502, 503, 504])

async function requestJson(url, { fetchImpl, githubToken, retryAttempts, retryDelayMs }) {
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
      catch { return { status: response.status, data: null, failure: 'parse' } }
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
  const metadata = await requestJson(api, options)
  if (metadata.failure) recordFailure(findings, metadata)
  else {
    if (metadata.data.full_name !== subject.canonical_repo) findings.push('canonical_repo_changed')
    if (Boolean(metadata.data.archived) !== subject.archived) findings.push('repository_status_changed')
    if (metadata.data.pushed_at && reviewDateInTimeZone(new Date(metadata.data.pushed_at)) > subject.verified_at) findings.push('repository_updated')
  }

  const ref = await requestJson(`${api}/commits/${encodeURIComponent(subject.pinned_ref)}`, options)
  if (ref.failure) recordFailure(findings, ref)
  else if (ref.data.sha !== subject.pinned_commit) findings.push('pin_ref_mismatch')

  for (const path of subject.entrypoints) {
    const encodedPath = path.split('/').map(encodeURIComponent).join('/')
    const entry = await requestJson(`${api}/contents/${encodedPath}?ref=${subject.pinned_commit}`, options)
    if (entry.failure === 'http' && entry.status === 404) findings.push('entrypoint_missing')
    else if (entry.failure) recordFailure(findings, entry)
  }

  for (const path of subject.license_source_paths) {
    const encodedPath = path.split('/').map(encodeURIComponent).join('/')
    const license = await requestJson(`${api}/contents/${encodedPath}?ref=${subject.pinned_commit}`, options)
    if (license.failure === 'http' && license.status === 404) findings.push('license_source_missing')
    else if (license.failure) recordFailure(findings, license)
  }

  if (subject.pin_kind !== 'commit') {
    const latestUrl = subject.pin_kind === 'tag'
      ? `${api}/tags?per_page=1`
      : `${api}/releases/latest`
    const latest = await requestJson(latestUrl, options)
    if (latest.failure === 'http' && latest.status === 404) {
      findings.push('project_release_missing')
    } else if (latest.failure) {
      recordFailure(findings, latest)
    } else {
      const latestRef = subject.pin_kind === 'tag' ? latest.data[0]?.name : latest.data.tag_name
      if (!latestRef) findings.push('project_release_missing')
      else if (latestRef !== subject.pinned_ref) findings.push('project_update_available')
    }
  }
  if (subject.review_by < reviewDateInTimeZone(now)) findings.push('project_review_due')
  return { id: subject.id, findings: [...new Set(findings)] }
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
    report = buildProjectFreshnessReport([{ id: 'project-catalog', findings: ['project_schema_invalid'], schema_errors: schemaErrors }], now.toISOString())
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
pnpm test
pnpm validate
GITHUB_TOKEN="$(gh auth token)" pnpm projects:check
```

Expected: unit tests pass; real report has 13 results; update findings are review prompts, and no schema, canonical, pin-ref, or entrypoint failures appear.

- [ ] **Step 6: Commit project freshness automation**

```bash
git add scripts/check-projects.mjs tests/source-freshness.spec.ts package.json .github/workflows/source-freshness.yml
git commit -m "feat: monitor pinned project sources"
```

### Task 11: Replace the project ban with an exact publication allowlist

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

it('keeps every project page within the reading-only template', () => {
  const coreIds = projectRouteRecords.slice(1, 7).map(([id]) => id)
  for (const [id, route] of projectRouteRecords) {
    const file = `docs${route.endsWith('/') ? `${route}index` : route}.md`
    const text = readFileSync(file, 'utf8')
    expect(text, file).not.toMatch(/npm install|pip install|docker run|API_KEY/u)
    expect(text, file).not.toMatch(/!\[[^\]]*\]\(https?:\/\//u)
    if (coreIds.includes(id)) {
      for (const heading of requiredProjectHeadings) expect(text, `${file}: ${heading}`).toContain(`## ${heading}`)
      expect(text).toContain(`<ProjectMeta project-id="${id}" />`)
      expect(text).toContain(`<ProjectCallChain project-id="${id}" />`)
      expect(text).toContain(`<ProjectSourceLinks project-id="${id}" />`)
    }
  }
  const questionIds = new Set(interviewQuestions.map((question) => question.id))
  for (const page of projectCatalog.pages) {
    for (const id of page.interview_question_ids) expect(questionIds.has(id), `${page.page_item_id}:${id}`).toBe(true)
  }
})
```

- [ ] **Step 2: Run dist tests and verify RED**

Run: `pnpm vitest run tests/content.spec.ts tests/project-pages.spec.ts -t 'project publication boundary|project page contract'`

Expected: FAIL because the current validator rejects every `/projects` output and still expects 20 course links.

- [ ] **Step 3: Define exact route and output allowlists**

In `scripts/check-dist.mjs`, extend `publishedCourseRoutes` with the six core project routes before the existing case route:

```js
'/projects/mcp-python-sdk',
'/projects/aider',
'/projects/openhands',
'/projects/agent-benchmarks',
'/projects/dify',
'/projects/crewai',
```

Add:

```js
const publishedProjectFiles = new Set([
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
```

Replace the current blanket project/lab rejection with:

```js
const forbiddenOutputs = relativeFiles.filter((file) =>
  /^(?:labs|capstone)(?:\.html|[\\/])/u.test(file)
  || (/^projects(?:\.html|[\\/])/u.test(file) && !publishedProjectFiles.has(file)),
)
if (forbiddenOutputs.length > 0) {
  errors.push(`构建产物包含未批准项目、实验或综合实战页面：${forbiddenOutputs.join(', ')}`)
}
for (const file of publishedProjectFiles) {
  if (!relativeFiles.includes(file)) errors.push(`构建产物缺少项目页面：${file}`)
}
```

Update the course markup check from 20 to 26 in all three places: expected link count, unique count, and error text. Remove `/projects/` from `forbiddenCourseMarkers`; keep `/labs/`, `/capstone/`, `标记已读`, and `加入书签` forbidden in the course map.

- [ ] **Step 4: Add static project-page checks**

For each file in `dissectionProjectFiles`, run these exact checks:

```js
const coreProjectHeadings = [
  '30 秒结论', '为什么选', '版本与边界', '原创建筑图', '唯一纵向调用链',
  '关键源码入口', '一次请求的数据流', '阅读练习', '失败边界', '生产边界',
  '高频面试点', '升级复核', '来源与归因',
]
for (const file of dissectionProjectFiles) {
  const projectHtml = readFileSync(join(distPath, file), 'utf8')
  if (!projectHtml.includes('固定版本')) errors.push(`项目页缺少固定版本：${file}`)
  if (!projectHtml.includes('关键源码入口')) errors.push(`项目页缺少源码入口：${file}`)
  if (/blob\/(?:main|master)\//u.test(projectHtml)) errors.push(`项目页包含移动分支源码链接：${file}`)
  if (/<img\b[^>]*src=["']https?:\/\//iu.test(projectHtml)) errors.push(`项目页包含外链图片：${file}`)
  if (coreProjectFiles.has(file)) {
    for (const heading of coreProjectHeadings) {
      if (!projectHtml.includes(heading)) errors.push(`核心项目页缺少章节 ${heading}：${file}`)
    }
  }
}
```

Apply the full 13-heading check only to `coreProjectFiles`. The overview and historical page use their own contracts from Task 7; `projects/index.html` must not be forced to contain a source list.

- [ ] **Step 5: Run test, validation, and production build gates**

Run:

```bash
pnpm vitest run tests/content.spec.ts tests/project-pages.spec.ts -t 'project publication boundary|project page contract'
pnpm test
pnpm validate
pnpm build
```

Expected: complete fixture and real dist pass; missing or extra page fixtures fail with the exact assertions; course SSR contains 26 unique targets.

- [ ] **Step 6: Commit the publication contract**

```bash
git add scripts/check-dist.mjs tests/content.spec.ts tests/project-pages.spec.ts
git commit -m "test: enforce project publication boundaries"
```

### Task 12: Document the project-reading layer and run final release acceptance

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
pnpm vitest run tests/project-pages.spec.ts -t 'project documentation handoff'
pnpm test
pnpm validate
pnpm build
GITHUB_TOKEN="$(gh auth token)" pnpm sources:check
GITHUB_TOKEN="$(gh auth token)" pnpm projects:check
git diff origin/main...HEAD --check
git status --short
```

Expected:

- all tests pass;
- content, provenance, project schema, build, and dist gates pass;
- source report contains the existing source inventory;
- project report contains 13 subjects with no schema, canonical, pin-ref, or entrypoint failure;
- range diff check prints nothing;
- only the intended README/test changes remain before commit.

- [ ] **Step 5: Commit the README**

```bash
git add README.md tests/project-pages.spec.ts
git commit -m "docs: describe the project reading layer"
```

- [ ] **Step 6: Start the built preview and verify route status**

Run `pnpm preview -- --port 4175` in a persistent terminal. Verify all eight project routes, both clean and trailing-slash forms, plus `/course/`, `/paths/`, the 14 chapters, four frontier pages, interview pages, glossary, Radar, and delivery case.

Use this exact HTTP matrix:

```bash
for route in \
  projects/ projects/mcp-python-sdk projects/aider projects/openhands \
  projects/agent-benchmarks projects/dify projects/crewai \
  projects/history-autogpt-flowise; do
  curl -fsS -o /dev/null "http://127.0.0.1:4175/agent-engineering-for-beginners/${route}"
  curl -fsS -o /dev/null "http://127.0.0.1:4175/agent-engineering-for-beginners/${route%/}/"
done
```

Expected: every approved route returns 200. Separately assert `/labs/`, `/capstone/`, and `/projects/unreviewed` return 404.

- [ ] **Step 7: Run browser acceptance with named sessions**

Use `agent-browser --session project-catalog-acceptance` and complete all checks:

1. At 1440×1000 light, `/projects/` shows six core links, one historical link, two watch-only external subjects, no Lab action, and no page-level overflow.
2. At 390×844 dark, open `/projects/openhands`, `/projects/agent-benchmarks`, and `/projects/history-autogpt-flowise`; verify `scrollWidth === innerWidth`, source paths wrap or scroll only inside their container, and focus uses a visible outline.
3. Snapshot each complex page without `-i`; verify repository status, catalog tier, fixed ref/SHA, license scope, ordered call chain, “怎么看”, “不要误解”, failure boundary, and interview links are present in the accessibility tree.
4. In a separate `project-catalog-nojs` session, run `agent-browser --session project-catalog-nojs network route "**/*.js" --abort` before opening a project page. Verify the same metadata, call chain, source links, and prose remain in server-rendered HTML.
5. Confirm `.project-overview` and project pages contain no write controls, network-driven data loaders, login prompts, or model execution buttons.
6. On each core page, click one fixed source link and confirm the destination URL contains the exact 40-character pinned commit, then return and re-snapshot before using another ref.
7. Confirm console and page error lists are empty.

Save screenshots:

```text
/tmp/projects-index-1440-light.png
/tmp/project-openhands-390-dark.png
/tmp/project-benchmarks-390-dark.png
```

- [ ] **Step 8: Verify print output**

Generate PDFs for `/projects/openhands` and `/projects/agent-benchmarks` while license details are closed on screen:

```text
/tmp/project-openhands.pdf
/tmp/project-benchmarks.pdf
```

Use `pdftotext` when available; otherwise use the already installed `pypdf`. Assert that each PDF contains the full primary chain, all source paths, the complete fixed SHA for every subject, and no disclosure summary such as “许可证边界”.

- [ ] **Step 9: Verify public and copyright boundaries**

Run:

```bash
find docs/.vitepress/dist -type f | rg '/(?:superpowers|labs|capstone)/'
find docs/public/project-assets -type f 2>/dev/null
rg -n "!\\[[^]]*\\]\\(https?://|<img[^>]+src=['\"]https?://" docs/projects
git diff origin/main...HEAD --check
git status --short --branch
```

Expected: no process/Lab/capstone output, no unregistered project asset, no remote image embedding, no range whitespace error, and a clean worktree.

- [ ] **Step 10: Push the feature branch and request final review; do not merge**

```bash
git push -u origin feat/open-source-project-dissections
```

Send the final branch HEAD, commit list, test counts, real project freshness summary, preview route matrix, accessibility evidence, PDF evidence, and screenshots to the user and reviewer. Wait for explicit review approval before merging `main` or deploying Pages.

---

## Final acceptance checklist

- [ ] Eight exact project routes exist; no additional project, Lab, or capstone route is published.
- [ ] Six core pages follow all 13 sections and link only to pinned commits.
- [ ] The overview maps all 13 subjects; watch-only subjects appear nowhere else.
- [ ] AutoGPT is `active + historical`; Hermes/OpenClaw are `active + watch-only`; Flowise is `eol + archived:true + historical`.
- [ ] MCP contribution scopes coexist without path-conflict errors; Dify, AutoGPT, and Flowise path scopes resolve by specificity.
- [ ] Forty-nine source entrypoints exist at their pinned commits.
- [ ] Course denominator is 26; project stage has seven items; engineering path has 17 steps; localStorage keys and old routes are unchanged.
- [ ] All diagrams are original; direct assets, if any, have exact provenance records.
- [ ] Source automation reports changes but never edits or publishes content.
- [ ] 1440px, 390px, light, dark, keyboard, screen-reader tree, no-JS, and print checks pass.
- [ ] `pnpm test`, `pnpm validate`, `pnpm build`, both freshness checks, and `git diff origin/main...HEAD --check` pass.
- [ ] Third-stage Python Lab and fourth-stage capstone remain absent.

## Delivery handoff

After the plan passes review, execute it from a fresh implementation worktree based on `main@815d761`. Use a fresh implementation agent for each task, then run both a specification review and a code-quality review before moving to the next task. Do not merge or deploy until the final acceptance task and reviewer approval are complete.










