import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { parse } from 'yaml'
import {
  parseProjectCatalog,
  validateProjectCatalog,
  validateProjectCatalogIntegration,
} from '../scripts/project-catalog.mjs'
import { validateBook } from '../scripts/validate-content.mjs'

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
  'mcp-spec': ['schema/2026-07-28/schema.json', 'docs/docs/2026-07-28/learn/architecture.mdx'],
  'mcp-python-sdk': ['examples/snippets/servers/basic_tool.py', 'src/mcp/server/mcpserver/server.py', 'src/mcp/server/mcpserver/tools/tool_manager.py', 'src/mcp/server/lowlevel/server.py', 'src/mcp/server/session.py', 'src/mcp/server/stdio.py'],
  aider: ['aider/main.py', 'aider/coders/base_coder.py', 'aider/repomap.py', 'aider/coders/editblock_coder.py', 'aider/repo.py', 'aider/run_cmd.py'],
  'openhands-canvas': ['src/api/conversation-service/agent-server-conversation-service.api.ts', 'src/api/agent-server-adapter.ts'],
  'openhands-sdk': ['openhands-agent-server/openhands/agent_server/conversation_router.py', 'openhands-agent-server/openhands/agent_server/conversation_service.py', 'openhands-sdk/openhands/sdk/conversation/conversation.py', 'openhands-sdk/openhands/sdk/agent/agent.py', 'openhands-sdk/openhands/sdk/tool/tool.py', 'openhands-sdk/openhands/sdk/workspace/workspace.py'],
  'swe-bench': ['swebench/harness/run_evaluation.py', 'swebench/harness/docker_utils.py', 'swebench/harness/grading.py', 'swebench/harness/reporting.py'],
  'tau2-bench': ['src/tau2/run.py', 'src/tau2/runner/simulation.py', 'src/tau2/environment/environment.py', 'src/tau2/evaluator/evaluator.py'],
  dify: ['api/controllers/service_api/app/workflow.py', 'api/core/app/apps/workflow/app_generator.py', 'api/core/app/apps/workflow/app_runner.py', 'api/core/workflow/workflow_entry.py', 'api/core/workflow/node_factory.py', 'api/core/workflow/nodes/agent_v2/agent_node.py', 'api/core/app/apps/common/workflow_response_converter.py'],
  crewai: ['lib/crewai/src/crewai/crew.py', 'lib/crewai/src/crewai/process.py', 'lib/crewai/src/crewai/execution.py', 'lib/crewai/src/crewai/task.py', 'lib/crewai/src/crewai/agent/core.py', 'lib/crewai/src/crewai/agents/crew_agent_executor.py', 'lib/crewai/src/crewai/agents/step_executor.py', 'lib/crewai/src/crewai/tools/tool_usage.py'],
  autogpt: ['classic/original_autogpt/autogpt/app/main.py', 'classic/original_autogpt/autogpt/agents/agent.py'],
  flowise: ['packages/server/src/controllers/predictions/index.ts', 'packages/server/src/services/predictions/index.ts'],
  'hermes-agent': [],
  openclaw: [],
}
const expectedChains = {
  'mcp-tool-call': ['schema:mcp-spec:schema/2026-07-28/schema.json:CallToolRequest', 'decorator:mcp-python-sdk:examples/snippets/servers/basic_tool.py:mcp.tool', 'registry:mcp-python-sdk:src/mcp/server/mcpserver/tools/tool_manager.py:ToolManager', 'handler:mcp-python-sdk:src/mcp/server/lowlevel/server.py:Server', 'session:mcp-python-sdk:src/mcp/server/session.py:ServerSession', 'transport:mcp-python-sdk:src/mcp/server/stdio.py:stdio_server'],
  'aider-repo-to-verified-edit': ['cli:aider:aider/main.py:main', 'coder:aider:aider/coders/base_coder.py:Coder.run', 'map:aider:aider/repomap.py:RepoMap.get_repo_map', 'edit:aider:aider/coders/editblock_coder.py:EditBlockCoder', 'apply:aider:aider/coders/base_coder.py:Coder.apply_updates', 'git:aider:aider/repo.py:GitRepo.commit'],
  'openhands-canvas-to-workspace-event': ['canvas:openhands-canvas:src/api/conversation-service/agent-server-conversation-service.api.ts:AgentServerConversationService', 'router:openhands-sdk:openhands-agent-server/openhands/agent_server/conversation_router.py:start_conversation', 'service:openhands-sdk:openhands-agent-server/openhands/agent_server/conversation_service.py:ConversationService', 'conversation:openhands-sdk:openhands-sdk/openhands/sdk/conversation/conversation.py:Conversation', 'agent:openhands-sdk:openhands-sdk/openhands/sdk/agent/agent.py:Agent.step', 'tool:openhands-sdk:openhands-sdk/openhands/sdk/tool/tool.py:ToolDefinition.__call__', 'workspace:openhands-sdk:openhands-sdk/openhands/sdk/workspace/workspace.py:Workspace', 'event-return:openhands-canvas:src/api/agent-server-adapter.ts:toAppConversation'],
  'benchmark-task-to-score': ['swe-input:swe-bench:swebench/harness/run_evaluation.py:main', 'swe-env:swe-bench:swebench/harness/docker_utils.py:exec_run_with_timeout', 'swe-grade:swe-bench:swebench/harness/grading.py:get_eval_report', 'swe-report:swe-bench:swebench/harness/reporting.py:make_run_report', 'tau-input:tau2-bench:src/tau2/run.py:run_task', 'tau-sim:tau2-bench:src/tau2/runner/simulation.py:run_simulation', 'tau-env:tau2-bench:src/tau2/environment/environment.py:Environment', 'tau-score:tau2-bench:src/tau2/evaluator/evaluator.py:evaluate_simulation'],
  'dify-request-to-graph-events': ['controller:dify:api/controllers/service_api/app/workflow.py:WorkflowRunApi.post', 'generator:dify:api/core/app/apps/workflow/app_generator.py:WorkflowAppGenerator', 'runner:dify:api/core/app/apps/workflow/app_runner.py:WorkflowAppRunner', 'entry:dify:api/core/workflow/workflow_entry.py:WorkflowEntry', 'factory:dify:api/core/workflow/node_factory.py:DifyNodeFactory', 'agent-node:dify:api/core/workflow/nodes/agent_v2/agent_node.py:DifyAgentNode', 'response:dify:api/core/app/apps/common/workflow_response_converter.py:WorkflowResponseConverter'],
  'crewai-kickoff-to-task-output': ['kickoff:crewai:lib/crewai/src/crewai/crew.py:Crew.kickoff', 'process:crewai:lib/crewai/src/crewai/process.py:Process', 'execution:crewai:lib/crewai/src/crewai/execution.py:begin_execution', 'task:crewai:lib/crewai/src/crewai/task.py:Task.execute_sync', 'agent:crewai:lib/crewai/src/crewai/agent/core.py:Agent.execute_task', 'executor:crewai:lib/crewai/src/crewai/agents/crew_agent_executor.py:CrewAgentExecutor.invoke', 'step:crewai:lib/crewai/src/crewai/agents/step_executor.py:StepExecutor.execute', 'tool:crewai:lib/crewai/src/crewai/tools/tool_usage.py:ToolUsage.use', 'output:crewai:lib/crewai/src/crewai/task.py:Task._export_output'],
  'autogpt-flowise-evolution': ['autogpt-entry:autogpt:classic/original_autogpt/autogpt/app/main.py:run_auto_gpt', 'autogpt-agent:autogpt:classic/original_autogpt/autogpt/agents/agent.py:Agent.execute', 'flowise-entry:flowise:packages/server/src/controllers/predictions/index.ts:createPrediction', 'flowise-service:flowise:packages/server/src/services/predictions/index.ts:buildChatflow'],
}
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
  'mcp-spec': '8949a26072c096d3ff8b18884e3f00e334c9d38df4abe3e4eaae6d7fc7cf77e5',
  'mcp-python-sdk': 'cf61f48b4ed2a218432b343d8da7b5b60633b777fbe00cfbceba7546e24dbc14',
  aider: '7042a9e68f0fa80ade181c5db0071aab22aa2b875b6acecbed990b3829350c37',
  'openhands-canvas': 'a276ba6d4ae6dcbe9bf28fd1f63727d143d8c5e293ffc49ed8f7baf49b946ddc',
  'openhands-sdk': '238f8bc6be41b1216fc43af67e455cc5309d470603b657a8c08535e657425cb5',
  'swe-bench': 'e356c00937817246deae70028e1d8068a2e9426e33f5d77e5b44e485adb3efaa',
  'tau2-bench': 'cefff5beff7a90ca1ef02dd77c683f0474cdd2c0b591f5ed18d709e00536775d',
  dify: '6881c250b6f94d1ff50aa54d77a493cacb672796350e9c8281b2cc639563d683',
  crewai: 'c08cfcd2380dbb33b118271457a61aa9b716325f29e25613cc1ddb94a6bd7b56',
  autogpt: '33d5cf4286bca6be740451dc94daf9c77d633318e95f38760b980c5699d66bf4',
  flowise: '4c2438da4a88f32b9f6089b64b35bbb383bf60d6b8a9258a5af1e2f5a3b360f5',
  'hermes-agent': 'b1e7efda63633c8af2b155954e2a0145428c19795399837ac745f3681e0a66c4',
  openclaw: '9eb64f3e66b9ca1449a291d1abcdd39493e1ab262467c7b86dceae6792bded62',
}
const expectedChainDigests = {
  'mcp-tool-call': '433de30bddcbbe3117584050bbca33bcf6c99d239e1cda8d61f3d8ee5c596c95',
  'aider-repo-to-verified-edit': 'c6c6b43eaf5eed9b5ba3fafbb9a70d56c91eedc3378dd645574ec8b0b825c14a',
  'openhands-canvas-to-workspace-event': '6ee7c2a9660f5f8a0d8457ebf2707ebaea0f6367f9ac8eabffa69f825580c79d',
  'benchmark-task-to-score': 'b7227cce3a43907b38fde1fbbde5548e0d148d6de88ddd9d3ecf5042b1876f49',
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
    const sourceEntries = catalog.subjects.flatMap((subject: { entrypoints: Array<{ path: string; symbols: string[]; responsibility: string }> }) => subject.entrypoints)
    expect(sourceEntries).toHaveLength(49)
    expect(sourceEntries.every((entry: { path: string; symbols: string[]; responsibility: string }) =>
      [entry.path, entry.responsibility].every((value) => value.trim().length > 0)
        && entry.symbols.length > 0
        && entry.symbols.every((symbol) => symbol.trim().length > 0),
    )).toBe(true)
    expect(Object.fromEntries(catalog.chains.map((chain: { id: string; steps: Array<{ id: string; subject_id: string; source_path: string; symbol: string }> }) => [
      chain.id,
      chain.steps.map((step) => `${step.id}:${step.subject_id}:${step.source_path}:${step.symbol}`),
    ]))).toEqual(expectedChains)
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
