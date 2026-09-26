import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parse } from 'yaml'
import {
  parseProjectCatalog,
  validateProjectCatalog,
  validateProjectCatalogIntegration,
} from '../scripts/project-catalog.mjs'
import { validateBook } from '../scripts/validate-content.mjs'
import { validateProvenanceFile } from '../scripts/validate-provenance.mjs'

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

const provenanceCatalog = {
  pages: [{ page_item_id: 'project-aider', subjects: ['aider'] }],
  subjects: [{
    id: 'aider',
    canonical_repo: 'Aider-AI/aider',
    pinned_commit: sha,
    license_scopes: [{ basis: 'path', expression: 'Apache-2.0', path_or_glob: '**' }],
  }],
}

function writeProvenanceFixture(root: string, yaml: string, file = 'copied.svg') {
  mkdirSync(join(root, 'docs/public/project-assets'), { recursive: true })
  mkdirSync(join(root, 'assets'), { recursive: true })
  writeFileSync(join(root, 'docs/public/project-assets', file), '<svg/>')
  writeFileSync(join(root, 'assets/provenance.yml'), yaml)
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
      writeProvenanceFixture(root, 'schema_version: 1\nassets: []\n')
      expect(validateProvenanceFile(join(root, 'assets/provenance.yml'), root, provenanceCatalog))
        .toContain('Unregistered project asset: docs/public/project-assets/copied.svg')
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('rejects forged host, repository, ref, source path, and license claims', () => {
    const root = mkdtempSync(join(tmpdir(), 'project-assets-'))
    try {
      writeProvenanceFixture(root, `
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

  it('checks page ownership and the most specific matching path license scope', () => {
    const root = mkdtempSync(join(tmpdir(), 'project-assets-'))
    const catalogWithNestedLicense = structuredClone(provenanceCatalog)
    catalogWithNestedLicense.subjects[0].license_scopes.push({
      basis: 'path', expression: 'MIT', path_or_glob: 'docs/**',
    })
    try {
      writeProvenanceFixture(root, `
schema_version: 1
assets:
  - local_file: docs/public/project-assets/copied.svg
    origin: third-party
    subject_id: aider
    source_url: https://github.com/Aider-AI/aider/blob/${sha}/docs/copied.svg
    source_repo: Aider-AI/aider
    source_ref: ${sha}
    source_path: docs/copied.svg
    license: Apache-2.0
    license_basis: path
    manual_license_review: false
    manual_reviewed_by: null
    manual_review_note: null
    copyright_holder: Aider contributors
    modified: false
    used_by: [project-other]
    alt: Architecture
    verified_at: '2026-09-26'
`)
      expect(validateProvenanceFile(
        join(root, 'assets/provenance.yml'),
        root,
        catalogWithNestedLicense,
      )).toEqual(expect.arrayContaining([
        'Third-party asset subject is not owned by page project-other: docs/public/project-assets/copied.svg',
        'Third-party asset license does not match the most specific path scope: docs/public/project-assets/copied.svg',
      ]))
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('requires explicit human evidence for contribution-based licenses', () => {
    const contributionCatalog = {
      pages: [{ page_item_id: 'project-mcp-python-sdk', subjects: ['mcp-spec'] }],
      subjects: [{
        id: 'mcp-spec',
        canonical_repo: 'modelcontextprotocol/modelcontextprotocol',
        pinned_commit: 'b'.repeat(40),
        license_scopes: [{
          basis: 'contribution', expression: 'Apache-2.0', selector: 'new-code',
          scope: 'new', note: 'history required',
        }],
      }],
    }
    const root = mkdtempSync(join(tmpdir(), 'project-assets-'))
    try {
      writeProvenanceFixture(root, `
schema_version: 1
assets:
  - local_file: docs/public/project-assets/copied.svg
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
      expect(validateProvenanceFile(join(root, 'assets/provenance.yml'), root, contributionCatalog))
        .toContain('Contribution-based asset requires recorded human review: docs/public/project-assets/copied.svg')
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })

  it('keeps original assets outside third-party source checks and rejects unknown origins', () => {
    const root = mkdtempSync(join(tmpdir(), 'project-assets-'))
    const original = `
schema_version: 1
assets:
  - local_file: docs/public/project-assets/original.svg
    origin: original
    subject_id: null
    source_url: null
    source_repo: null
    source_ref: null
    source_path: null
    license: null
    license_basis: null
    manual_license_review: false
    manual_reviewed_by: null
    manual_review_note: null
    copyright_holder: Agent Engineering for Beginners contributors
    modified: false
    used_by: [project-aider]
    alt: Original architecture diagram
    verified_at: '2026-09-26'
`
    try {
      writeProvenanceFixture(root, original, 'original.svg')
      expect(validateProvenanceFile(join(root, 'assets/provenance.yml'), root, provenanceCatalog)).toEqual([])

      writeFileSync(join(root, 'assets/provenance.yml'), original.replace('origin: original', 'origin: copied'))
      expect(validateProvenanceFile(join(root, 'assets/provenance.yml'), root, provenanceCatalog))
        .toContain('Asset docs/public/project-assets/original.svg has invalid origin')
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})

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
const expectedSubjectDigests = {
  'mcp-spec': '492729a2b1d5e3690d4d4eb8ffb8a6f9089a8d3e21b7a284d49b6c9100788801',
  'mcp-python-sdk': '21a74ad2294a17ef639fb92539bee85e299dd9cc71fea3e6db72d615da7db867',
  aider: '5e52014bcd913a55fbbaed8dcdf44cff28bcf19d6d6af5b33264c0bb1caec388',
  'openhands-canvas': '05fb380eafe106924eb9bb17f712d73b75c8b0c7e8d0cd10696cb830798c5ed4',
  'openhands-sdk': 'a4ea3a15cab7a116af2beaf8715d8586d6fd5b472b1054adad949dc8aa222133',
  'swe-bench': 'e356c00937817246deae70028e1d8068a2e9426e33f5d77e5b44e485adb3efaa',
  'tau2-bench': '9ce153cca427f514e1d8b1b727931efa4ab2f8767fac1019117219ef17bb99d9',
  dify: '8a8a754b9535e7028992c81d37216196c1c485f545a14e424d79fd7f7a99597f',
  crewai: 'c5fb7c7ffe10ec064e027756413c9ea678fc148cd3a2c2b91e4248cbec3546ef',
  autogpt: '33d5cf4286bca6be740451dc94daf9c77d633318e95f38760b980c5699d66bf4',
  flowise: '4c2438da4a88f32b9f6089b64b35bbb383bf60d6b8a9258a5af1e2f5a3b360f5',
  'hermes-agent': 'b1e7efda63633c8af2b155954e2a0145428c19795399837ac745f3681e0a66c4',
  openclaw: '9eb64f3e66b9ca1449a291d1abcdd39493e1ab262467c7b86dceae6792bded62',
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
    expect(digest(catalog)).toBe('4bcf91bbc4fdac68aee5f5d531a78025ee8218ebda7125c99839d36da4e49787')
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

  it('makes the book validator fail closed on missing project metadata', () => {
    expect(validateBook(process.cwd())).toEqual([])
    expect(validateBook(process.cwd(), { projectCatalogPath: 'sources/missing-project-index.yml' }))
      .toContain('Missing sources/project-index.yml')
    expect(validateBook(process.cwd(), { provenancePath: 'assets/missing-provenance.yml' }))
      .toContain('Missing assets/provenance.yml')
  })
})
