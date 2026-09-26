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
}
const expectedChains = {
  'mcp-tool-call': ['schema:mcp-spec:schema/2026-07-28/schema.json:CallToolRequest', 'host-run:mcp-python-sdk:src/mcp/server/mcpserver/server.py:MCPServer.run', 'transport:mcp-python-sdk:src/mcp/server/stdio.py:stdio_server', 'server-run:mcp-python-sdk:src/mcp/server/lowlevel/server.py:Server.run', 'runner-loop:mcp-python-sdk:src/mcp/server/runner.py:serve_dual_era_loop', 'dispatcher-loop:mcp-python-sdk:src/mcp/shared/jsonrpc_dispatcher.py:JSONRPCDispatcher.run', 'dispatcher-request:mcp-python-sdk:src/mcp/shared/jsonrpc_dispatcher.py:JSONRPCDispatcher._dispatch_request', 'request:mcp-python-sdk:src/mcp/server/runner.py:ServerRunner._on_request', 'dispatch:mcp-python-sdk:src/mcp/server/lowlevel/server.py:get_request_handler', 'mcp-handler:mcp-python-sdk:src/mcp/server/mcpserver/server.py:MCPServer._handle_call_tool', 'mcp-call:mcp-python-sdk:src/mcp/server/mcpserver/server.py:MCPServer.call_tool', 'tool-lookup:mcp-python-sdk:src/mcp/server/mcpserver/tools/tool_manager.py:ToolManager.call_tool', 'tool-run:mcp-python-sdk:src/mcp/server/mcpserver/tools/base.py:Tool.run', 'tool-function:mcp-python-sdk:examples/snippets/servers/basic_tool.py:sum', 'serialize:mcp-python-sdk:src/mcp/server/runner.py:ServerRunner._serialize', 'dispatcher-response:mcp-python-sdk:src/mcp/shared/jsonrpc_dispatcher.py:JSONRPCDispatcher._write_result', 'stdout:mcp-python-sdk:src/mcp/server/stdio.py:stdio_server'],
  'aider-repo-to-verified-edit': ['cli:aider:aider/main.py:main', 'run:aider:aider/coders/base_coder.py:Coder.run', 'turn:aider:aider/coders/base_coder.py:Coder.run_one', 'context:aider:aider/coders/base_coder.py:Coder.send_message', 'repo-map:aider:aider/repomap.py:RepoMap.get_repo_map', 'send:aider:aider/coders/base_coder.py:Coder.send', 'completion:aider:aider/models.py:Model.send_completion', 'parse:aider:aider/coders/editblock_coder.py:EditBlockCoder.get_edits', 'apply-updates:aider:aider/coders/base_coder.py:Coder.apply_updates', 'dry-run:aider:aider/coders/editblock_coder.py:EditBlockCoder.apply_edits_dry_run', 'prepare:aider:aider/coders/base_coder.py:Coder.prepare_to_edit', 'apply:aider:aider/coders/editblock_coder.py:EditBlockCoder.apply_edits', 'write:aider:aider/io.py:InputOutput.write_text', 'auto-commit:aider:aider/coders/base_coder.py:Coder.auto_commit', 'commit:aider:aider/repo.py:GitRepo.commit', 'auto-lint:aider:aider/coders/base_coder.py:Coder.lint_edited', 'lint-commit:aider:aider/coders/base_coder.py:Coder.auto_commit', 'shell-confirm:aider:aider/io.py:InputOutput.confirm_ask', 'shell-run:aider:aider/coders/base_coder.py:Coder.handle_shell_commands', 'auto-test:aider:aider/commands.py:Commands.cmd_test', 'reflection:aider:aider/coders/base_coder.py:Coder.run_one'],
  'openhands-canvas-to-workspace-event': ['chat-submit:openhands-canvas:src/components/features/chat/chat-interface.tsx:handleSendMessage', 'hook-send:openhands-canvas:src/hooks/use-send-message.ts:useSendMessage().send', 'canvas-send:openhands-canvas:src/contexts/conversation-websocket-context.tsx:ConversationWebSocketProvider.sendMessage', 'socket-receive:openhands-sdk:openhands-agent-server/openhands/agent_server/sockets.py:events_socket', 'service-message:openhands-sdk:openhands-agent-server/openhands/agent_server/event_service.py:EventService.send_message', 'conversation-message:openhands-sdk:openhands-sdk/openhands/sdk/conversation/impl/local_conversation.py:LocalConversation.send_message', 'service-run:openhands-sdk:openhands-agent-server/openhands/agent_server/event_service.py:EventService.run', 'conversation-run:openhands-sdk:openhands-sdk/openhands/sdk/conversation/impl/local_conversation.py:LocalConversation.arun', 'agent-step:openhands-sdk:openhands-sdk/openhands/sdk/agent/agent.py:Agent.astep', 'dispatch-tool-calls:openhands-sdk:openhands-sdk/openhands/sdk/agent/response_dispatch.py:_ahandle_tool_calls', 'execute-actions:openhands-sdk:openhands-sdk/openhands/sdk/agent/agent.py:Agent._aexecute_actions', 'tool-call:openhands-sdk:openhands-sdk/openhands/sdk/tool/tool.py:ToolDefinition.__call__', 'persist-event:openhands-sdk:openhands-sdk/openhands/sdk/conversation/impl/local_conversation.py:LocalConversation.__init__', 'publish-event:openhands-sdk:openhands-agent-server/openhands/agent_server/event_service.py:EventService.start', 'socket-send:openhands-sdk:openhands-agent-server/openhands/agent_server/sockets.py:_WebSocketSubscriber.__call__', 'canvas-receive:openhands-canvas:src/contexts/conversation-websocket-context.tsx:ConversationWebSocketProvider.handleMainMessage'],
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
  'openhands-sdk': 'a4ea3a15cab7a116af2beaf8715d8586d6fd5b472b1054adad949dc8aa222133',
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
  'openhands-canvas-to-workspace-event': '168bff273714e7a5f797f51d6bff179ede412397be22f5c5742bbef8669a5a06',
  'benchmark-task-to-score': '4bc18b2acf77c5290f31cf416e89b1f34a3001b1f85a69c365425fcbf8ae5da2',
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
    expect(digest(catalog)).toBe('6be8be4c75bca1b0098b3527dc5173e2a89c4dc4d93360454c08d8e1fd1199ad')
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
