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
    entrypoints: [{ path: 'aider/main.py', symbol: 'main', responsibility: 'Validate repository arguments.' }],
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

    for (const path of ['../LICENSE', '/LICENSE', './src/**', 'src//file.ts', String.raw`src\file.ts`]) {
      const nonCanonical = structuredClone(validCatalog)
      nonCanonical.subjects[0].license_scopes[0].path_or_glob = path
      expect(validateProjectCatalog(nonCanonical)).toContain(
        `Subject aider has unsupported path license scope: ${path}`,
      )
    }

    const emptyPath = structuredClone(validCatalog)
    emptyPath.subjects[0].license_scopes[0].path_or_glob = ''
    expect(validateProjectCatalog(emptyPath)).toContain(
      'Subject aider path license scope requires path_or_glob and forbids selector',
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
  })

  it('parses YAML without accepting an empty or malformed registry', () => {
    const empty = parseProjectCatalog('schema_version: 1\ndefaults:\n  verified_at: 2026-09-26\n  review_by: 2026-10-26\npages: []\nsubjects: []\nchains: []\n')
    expect(validateProjectCatalog(empty)).toEqual(expect.arrayContaining([
      'Project catalog requires pages',
      'Project catalog requires subjects',
      'Project catalog requires chains',
    ]))
    expect(() => parseProjectCatalog('{broken')).toThrow('Project catalog YAML cannot be parsed')

    expect(validateProjectCatalog(null)).toContain('Project catalog schema_version must be 1')

    const invalidMembers: { pages: unknown[]; subjects: unknown[]; chains: unknown[] } =
      structuredClone(validCatalog)
    invalidMembers.pages = [null]
    invalidMembers.subjects = [null]
    invalidMembers.chains = [null]
    expect(() => validateProjectCatalog(invalidMembers)).not.toThrow()
    expect(validateProjectCatalog(invalidMembers)).toEqual(expect.arrayContaining([
      'Project catalog page at index 0 must be an object',
      'Project catalog subject at index 0 must be an object',
      'Project catalog chain at index 0 must be an object',
    ]))

    const invalidNested = structuredClone(validCatalog) as {
      pages: Array<{ subjects: unknown }>
      subjects: Array<{ entrypoints: unknown; license_sources: unknown; license_scopes: unknown }>
      chains: Array<{ steps: unknown }>
    }
    invalidNested.pages[0].subjects = { aider: true }
    invalidNested.subjects[0].entrypoints = [null]
    invalidNested.subjects[0].license_sources = [null]
    invalidNested.subjects[0].license_scopes = [null]
    invalidNested.chains[0].steps = [null]
    expect(() => validateProjectCatalog(invalidNested)).not.toThrow()
    expect(validateProjectCatalog(invalidNested)).toEqual(expect.arrayContaining([
      'Page project-aider has invalid mapping fields',
      'Subject aider entrypoint at index 0 must be an object',
      'Subject aider license source at index 0 must be an object',
      'Subject aider license scope at index 0 must be an object',
      'Chain aider-chain step at index 0 must be an object',
    ]))

    expect(() => validateProjectCatalogIntegration(null, null as never)).not.toThrow()
    expect(validateProjectCatalogIntegration(null, null as never)).toEqual([
      'Project catalog integration requires pages',
      'Project catalog integration requires contentItems',
      'Project catalog integration requires interviewQuestions',
    ])
  })
})
