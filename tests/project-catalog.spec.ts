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
