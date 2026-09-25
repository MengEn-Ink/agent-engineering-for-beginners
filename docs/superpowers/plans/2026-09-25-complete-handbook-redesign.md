# Complete Agent Engineering Handbook Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the public book from a short 10-chapter guide into a 14-chapter, 65,000–82,000-character handbook and replace the visually noisy reading surface with an accessible low-distraction theme.

**Architecture:** Keep Markdown as the source of truth and use shared Vue components for chapter metadata, case continuity, practice blocks, checklists and explanatory diagrams. Extend the existing Vitest/content validator gate so chapter depth, source IDs, public boundaries, visual tokens and published routes fail before VitePress builds or GitHub Pages deploys.

**Tech Stack:** VitePress, Vue 3, TypeScript, CSS, Vitest, YAML, Node.js validation scripts, GitHub Actions / Pages

---

## File map

- `tests/content.spec.ts`: chapter count, character ranges, required/optional modules, visual tokens, sources and routes.
- `scripts/validate-content.mjs`: public-boundary, citation and published-file validation.
- `docs/.vitepress/config.mts`: four-part navigation and 14 chapter routes.
- `docs/.vitepress/theme/style.css`: quiet reading surface and constrained homepage branding.
- `docs/.vitepress/theme/components/ChapterLead.vue`: learning outcomes and reading time.
- `docs/.vitepress/theme/components/CaseThread.vue`: cross-chapter delivery case.
- `docs/.vitepress/theme/components/PracticeBlock.vue`: exercise and answer disclosure.
- `docs/.vitepress/theme/components/ChecklistBlock.vue`: reusable chapter checklist.
- `docs/.vitepress/theme/components/*Diagram.vue`: chapter-specific concept and flow visuals.
- `docs/chapters/01-*.md`–`10-*.md`: expanded foundations, assembly and production chapters.
- `docs/chapters/11-research-agent.md`–`14-computer-use.md`: new application chapters.
- `docs/appendix/application-matrix.md`: application selection matrix.
- `docs/appendix/chapter-template.md`: reusable chapter/design worksheet.
- `sources/source-index.yml`: first-party sources for the four application chapters.
- `docs/index.md`, `docs/preface.md`, `README.md`: updated promise, routes and scope.

### Task 1: Turn the approved scope into executable content contracts

**Files:**
- Modify: `tests/content.spec.ts`
- Modify: `scripts/validate-content.mjs`

- [ ] **Step 1: Write failing scope tests**

Add arrays for 10 expanded chapters and 4 application chapters. Count non-whitespace characters and require `4_700..6_000` for the first group, `4_500..5_500` for the second, and `65_000..82_000` in total. Require seven module markers and at least two optional module markers per chapter.

```ts
expect(characterCount(text)).toBeGreaterThanOrEqual(4_700)
expect(characterCount(text)).toBeLessThanOrEqual(6_000)
expect(total).toBeGreaterThanOrEqual(65_000)
expect(total).toBeLessThanOrEqual(82_000)
```

- [ ] **Step 2: Run and verify red**

Run: `pnpm vitest run tests/content.spec.ts -t 'complete handbook scope'`

Expected: FAIL because only 10 short chapters exist.

- [ ] **Step 3: Add validator helpers**

Implement `countChineseContent(text)`, `extractModuleMarkers(text)` and source-ID validation. Strip frontmatter and HTML comments before character counting so metadata cannot inflate the result.

- [ ] **Step 4: Run unit tests**

Run: `pnpm test`

Expected: existing tests pass; new scope tests remain red only for content.

- [ ] **Step 5: Commit**

```bash
git add tests/content.spec.ts scripts/validate-content.mjs
git commit -m "test: define complete handbook content contract"
```

### Task 2: Replace the noisy reading theme

**Files:**
- Modify: `docs/.vitepress/theme/style.css`
- Modify: `docs/.vitepress/theme/components/AgentLoop.vue`
- Modify: `docs/.vitepress/theme/components/SystemStack.vue`
- Modify: `docs/.vitepress/theme/components/DeliveryCase.vue`
- Modify: `tests/content.spec.ts`

- [ ] **Step 1: Write failing visual-token tests**

Require light/dark reading tokens, `color-scheme: dark`, body copy size, `680px..740px` readable width, `text-wrap`, heading `scroll-margin-top`, `focus-visible`, reduced motion and a homepage-only low-contrast grid. Reject `background-attachment: fixed` and global body grid images.

```ts
expect(style).toContain('--reading-bg: #fcfcfa')
expect(style).toContain('--reading-text: #202632')
expect(style).not.toContain('background-attachment: fixed')
expect(style).toContain('scroll-margin-top:')
```

- [ ] **Step 2: Run and verify red**

Run: `pnpm vitest run tests/content.spec.ts -t 'reading theme'`

Expected: FAIL on the current grid background and saturated tokens.

- [ ] **Step 3: Implement the quiet theme**

Set the reading surface to `#FCFCFA/#202632`, dark surface to `#17191D/#ECEEF2`, width to `720px`, copy to `17.5px/1.9`, and H1 to at most `48px`. Remove paragraph entrance animation and heavy blockquote shadows. Limit homepage grid to `.book-hero::before` at very low opacity and constrain saturated decoration to small pseudo-elements and diagram state marks.

- [ ] **Step 4: Verify green**

Run: `pnpm test && pnpm build`

Expected: all theme tests and the existing build pass.

- [ ] **Step 5: Commit**

```bash
git add docs/.vitepress/theme tests/content.spec.ts
git commit -m "style: prioritize long-form reading comfort"
```

### Task 3: Add reusable chapter-learning components

**Files:**
- Create: `docs/.vitepress/theme/components/ChapterLead.vue`
- Create: `docs/.vitepress/theme/components/CaseThread.vue`
- Create: `docs/.vitepress/theme/components/PracticeBlock.vue`
- Create: `docs/.vitepress/theme/components/ChecklistBlock.vue`
- Create: `docs/.vitepress/theme/components/DecisionLadder.vue`
- Create: `docs/.vitepress/theme/components/MemoryLayers.vue`
- Create: `docs/.vitepress/theme/components/EvidencePyramid.vue`
- Create: `docs/.vitepress/theme/components/RiskMatrix.vue`
- Modify: `docs/.vitepress/theme/index.ts`
- Modify: `tests/content.spec.ts`

- [ ] **Step 1: Write failing accessibility tests**

Require every explanatory component to expose a semantic heading or `role="img"` with `aria-label`, every answer disclosure to use native `<details>`, and every interactive state to remain usable by keyboard.

- [ ] **Step 2: Run and verify red**

Run: `pnpm vitest run tests/content.spec.ts -t 'learning components'`

Expected: FAIL because the components are absent.

- [ ] **Step 3: Implement and register components**

Keep components content-driven with props, semantic lists/tables and no runtime network access. Use subdued diagram colors and no layout-shifting animation.

- [ ] **Step 4: Verify green and build**

Run: `pnpm test && pnpm build`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add docs/.vitepress/theme tests/content.spec.ts
git commit -m "feat: add handbook learning components"
```

### Task 4: Expand Part I — understanding agents

**Files:**
- Modify: `docs/chapters/01-ai-native.md`
- Modify: `docs/chapters/02-workflow-agent.md`
- Modify: `docs/chapters/03-react.md`

- [ ] **Step 1: Add missing-module expectations to the test table**

Require learning outcomes, design steps, delivery-case thread, reusable asset, practice answer and sources in chapters 1–3.

- [ ] **Step 2: Run and verify red**

Run: `pnpm vitest run tests/content.spec.ts -t 'part one depth'`

Expected: FAIL on length and missing modules.

- [ ] **Step 3: Expand the three chapters**

Add AI Native redesign levels and a product worksheet; a Prompt/Workflow/Agent decision ladder and migration case; a ReAct loop budget, observation contract, stop-policy template and failure lab. Keep each file in the approved range.

- [ ] **Step 4: Verify content and sources**

Run: `pnpm test && pnpm validate`

Expected: Part I passes; the full-book total remains red until later tasks.

- [ ] **Step 5: Commit**

```bash
git add docs/chapters/01-ai-native.md docs/chapters/02-workflow-agent.md docs/chapters/03-react.md
git commit -m "docs: expand agent engineering foundations"
```

### Task 5: Expand Part II — assembling agents

**Files:**
- Modify: `docs/chapters/04-tools-mcp.md`
- Modify: `docs/chapters/05-state-memory.md`
- Modify: `docs/chapters/06-loop-graph.md`
- Modify: `docs/chapters/07-multi-agent.md`

- [ ] **Step 1: Activate Part II depth tests**

Require tool contract template, memory lifecycle table, graph recovery worksheet and multi-agent handoff protocol.

- [ ] **Step 2: Run and verify red**

Run: `pnpm vitest run tests/content.spec.ts -t 'part two depth'`

Expected: FAIL on missing assets and chapter lengths.

- [ ] **Step 3: Expand chapters 4–7**

Add permission design, MCP trust boundaries, state ownership, memory writes, checkpoint recovery, graph versioning, role capability boundaries, conflict resolution and measurable coordination cost. Thread the generalized delivery case through every chapter.

- [ ] **Step 4: Verify green for Part II**

Run: `pnpm test && pnpm validate`

Expected: Part II passes.

- [ ] **Step 5: Commit**

```bash
git add docs/chapters/04-tools-mcp.md docs/chapters/05-state-memory.md docs/chapters/06-loop-graph.md docs/chapters/07-multi-agent.md
git commit -m "docs: expand agent system building blocks"
```

### Task 6: Expand Part III — production reliability

**Files:**
- Modify: `docs/chapters/08-evaluation.md`
- Modify: `docs/chapters/09-safety-recovery.md`
- Modify: `docs/chapters/10-production.md`
- Modify: `docs/case-study/delivery-agent.md`

- [ ] **Step 1: Activate Part III depth tests**

Require evaluation layers, failure taxonomy, risk matrix, shadow/warn/block rollout and incident-to-regression loop.

- [ ] **Step 2: Run and verify red**

Run: `pnpm vitest run tests/content.spec.ts -t 'part three depth'`

Expected: FAIL on missing modules and chapter lengths.

- [ ] **Step 3: Expand chapters and case**

Add offline/online evals, evidence quality, cost and tail latency, idempotency, compensation, sandbox limits, human takeover protocol, launch readiness, rollout, operations and post-incident learning. Expand the case page into a cross-reference index rather than repeating chapter prose.

- [ ] **Step 4: Verify green for Part III**

Run: `pnpm test && pnpm validate`

Expected: Part III passes.

- [ ] **Step 5: Commit**

```bash
git add docs/chapters/08-evaluation.md docs/chapters/09-safety-recovery.md docs/chapters/10-production.md docs/case-study/delivery-agent.md
git commit -m "docs: deepen production reliability guidance"
```

### Task 7: Add Part IV — application directions

**Files:**
- Create: `docs/chapters/11-research-agent.md`
- Create: `docs/chapters/12-service-operations-agent.md`
- Create: `docs/chapters/13-coding-agent.md`
- Create: `docs/chapters/14-computer-use.md`
- Modify: `sources/source-index.yml`
- Modify: `docs/.vitepress/config.mts`
- Modify: `tests/content.spec.ts`

- [ ] **Step 1: Write failing route, source and boundary tests**

Require four routes, four first-party source groups with at least two A-grade records per chapter, explicit “适合 / 不适合 / 最低权限 / 可接受损失 / 人工接管 / 最终证据” sections, and approved character ranges.

- [ ] **Step 2: Run and verify red**

Run: `pnpm vitest run tests/content.spec.ts -t 'application chapters'`

Expected: FAIL because the routes, sources and files are absent.

- [ ] **Step 3: Add first-party sources**

Use official search/citation and evaluation materials for research, official guardrail/tool-calling and enterprise cases for service/operations, official coding-agent and software security materials for coding, and official computer-use/browser security materials for computer use. Record access date and limits in YAML.

- [ ] **Step 4: Write the four application chapters**

Each chapter follows the seven required modules plus at least two optional modules, includes a distinct workflow diagram and ends with a practical design exercise.

- [ ] **Step 5: Verify and commit**

Run: `pnpm test && pnpm validate && pnpm build`

Expected: all chapter ranges and the whole-book total pass.

```bash
git add docs/chapters docs/.vitepress/config.mts sources/source-index.yml tests/content.spec.ts
git commit -m "docs: add four agent application chapters"
```

### Task 8: Finish navigation, appendices and homepage restraint

**Files:**
- Modify: `docs/index.md`
- Modify: `docs/preface.md`
- Create: `docs/appendix/application-matrix.md`
- Create: `docs/appendix/chapter-template.md`
- Modify: `README.md`
- Modify: `tests/content.spec.ts`

- [ ] **Step 1: Write failing navigation and visual-area tests**

Require all 14 routes and new appendices. Assert the homepage uses only tokenized muted accents, and add a browser assertion that saturated-color elements occupy under 10% of the first viewport.

- [ ] **Step 2: Run and verify red**

Run: `pnpm test`

Expected: FAIL on missing appendices and old homepage promise.

- [ ] **Step 3: Update reader entry points**

Present four parts, 14 chapters, reading routes and handbook size without adding decorative sections. Add the application matrix and reusable chapter/solution worksheet.

- [ ] **Step 4: Verify green**

Run: `pnpm test && pnpm build`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add README.md docs/index.md docs/preface.md docs/appendix tests/content.spec.ts
git commit -m "docs: complete handbook navigation and worksheets"
```

### Task 9: Audit, deploy and verify v2

**Files:**
- Modify only if a failing test demonstrates a defect.

- [ ] **Step 1: Run the complete local gate**

Run: `pnpm test && pnpm validate && pnpm build`

Expected: all tests pass, content validation passes and dist validation passes.

- [ ] **Step 2: Run browser review**

Use the base-aware preview command at port 4173. Verify 1440px and 390px, light/dark modes, line width, no global grid, no horizontal overflow, search for all four application topics, keyboard focus and all routes.

- [ ] **Step 3: Run public-boundary and source checks**

Confirm process docs remain 404, all source IDs resolve, application chapters have required A-grade coverage and no private identifiers are present.

- [ ] **Step 4: Cross-review with the judge**

Provide branch commit, character report, screenshots and test outputs. Resolve only evidence-backed findings and rerun the full gate.

- [ ] **Step 5: Merge and deploy**

Fast-forward `main`, push, wait for GitHub Pages workflow and verify the final public URL and Actions run both succeed.

## Plan self-review

- Spec coverage: all 14 chapters, 65,000–82,000 characters, seven required modules, optional modules, source boundaries, reading tokens, accessibility and deployment have explicit tasks.
- Placeholder scan: no deferred implementation markers remain.
- Type consistency: route names, component names, character ranges and source fields remain consistent across tasks.
- Scope: no backend, comments, login, PDF publishing, AI chat or unrelated framework migration.
