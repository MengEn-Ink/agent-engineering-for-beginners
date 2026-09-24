# Agent Engineering Beginner Book Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish a complete Chinese beginner-friendly Agent engineering book as a VitePress site on GitHub Pages.

**Architecture:** Markdown chapters are the source of truth, VitePress provides navigation and static rendering, and a small custom theme adds the book identity and reusable explanatory diagrams. A source-index validator and content tests enforce citation, chapter-shape, public-boundary, link, and build requirements before GitHub Actions deploys the generated static site.

**Tech Stack:** VitePress, Vue 3, TypeScript, pnpm, Vitest, YAML, SVG/CSS, GitHub Actions, GitHub Pages

---

## File map

- `package.json`: scripts and dependency versions.
- `pnpm-lock.yaml`: reproducible dependency graph.
- `docs/.vitepress/config.mts`: site title, navigation, sidebar, search, base path and metadata.
- `docs/.vitepress/theme/index.ts`: registers the custom theme and diagram components.
- `docs/.vitepress/theme/style.css`: typography, colors, layouts, responsive rules and print behavior.
- `docs/.vitepress/theme/components/AgentLoop.vue`: observe-decide-act-verify loop diagram.
- `docs/.vitepress/theme/components/SystemStack.vue`: model, context, tools, state, control and verification stack.
- `docs/.vitepress/theme/components/DeliveryCase.vue`: generalized delivery-agent quality-gate case diagram.
- `docs/index.md`: landing page and five-minute overview.
- `docs/preface.md`: book promise, reader profile and reading routes.
- `docs/chapters/01-ai-native.md` through `docs/chapters/10-production.md`: ten book chapters.
- `docs/case-study/delivery-agent.md`: sanitized delivery-agent case study.
- `docs/appendix/glossary.md`: beginner glossary.
- `docs/appendix/review-checklist.md`: system review checklist.
- `docs/appendix/reading.md`: annotated reading list.
- `sources/source-index.yml`: auditable source records.
- `scripts/validate-content.mjs`: checks content shape, citations, forbidden internal markers and local links.
- `tests/content.spec.ts`: red/green content contract tests.
- `.github/workflows/deploy.yml`: build, artifact upload and Pages deployment.
- `README.md`: repository purpose, local commands, source policy and deployed URL.

### Task 1: Scaffold the tested VitePress project

**Files:**
- Create: `package.json`
- Create: `docs/.vitepress/config.mts`
- Create: `docs/index.md`
- Create: `tests/content.spec.ts`

- [ ] **Step 1: Write the failing smoke test**

```ts
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

describe('book scaffold', () => {
  it('declares the public title and all ten chapter routes', () => {
    const config = readFileSync('docs/.vitepress/config.mts', 'utf8')
    expect(config).toContain('别只会和 AI 聊天')
    for (let chapter = 1; chapter <= 10; chapter += 1) {
      expect(config).toContain(`/chapters/${String(chapter).padStart(2, '0')}-`)
    }
  })
})
```

- [ ] **Step 2: Run the test and confirm red**

Run: `pnpm vitest run tests/content.spec.ts`

Expected: FAIL because `package.json` and the VitePress config do not exist.

- [ ] **Step 3: Add the minimal project and navigation**

`package.json` must expose exactly these quality commands:

```json
{
  "scripts": {
    "dev": "vitepress dev docs",
    "build": "pnpm validate && vitepress build docs",
    "preview": "vitepress preview docs",
    "test": "vitest run",
    "validate": "node scripts/validate-content.mjs"
  }
}
```

Configure `base: '/agent-engineering-for-beginners/'`, local search, edit links, last-updated timestamps, the three-part sidebar, case study and appendices.

- [ ] **Step 4: Install and verify green**

Run: `pnpm install && pnpm test`

Expected: PASS with one smoke test.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml docs/.vitepress/config.mts docs/index.md tests/content.spec.ts
git commit -m "feat: scaffold agent engineering book"
```

### Task 2: Build the source registry and validation gate

**Files:**
- Create: `sources/source-index.yml`
- Create: `scripts/validate-content.mjs`
- Modify: `tests/content.spec.ts`

- [ ] **Step 1: Add failing validation tests**

Test that every source includes `id`, `title`, `publisher`, `url`, `grade`, `accessed`, `chapters`, and `note`; grades are only `A`, `B`, or `C`; no chapter cites a missing ID; and forbidden patterns such as internal hosts, tokens, local DeliveryAI paths, raw product IDs and credentials are absent from public content.

```ts
expect(source.grade).toMatch(/^[ABC]$/)
expect(source.accessed).toMatch(/^\d{4}-\d{2}-\d{2}$/)
expect(publicText).not.toMatch(/\/Users\/|E2E_.*SECRET|an_sso_session|p-[a-z0-9]{16,}/i)
```

- [ ] **Step 2: Run and confirm red**

Run: `pnpm test`

Expected: FAIL because the source index and validator are missing.

- [ ] **Step 3: Implement the registry and validator**

Seed A-grade entries for the MCP specification, Anthropic agent article, OpenAI Agents SDK docs, Google ADK evaluation docs, Microsoft AutoGen architecture, the official repositories in the project matrix and VitePress deployment docs. Add B-grade entries for Chip Huyen's agent article and the supplied WeChat album. The validator must print one concise line per failed rule and exit non-zero.

- [ ] **Step 4: Verify tests and the command**

Run: `pnpm test && pnpm validate`

Expected: PASS and `content validation passed`.

- [ ] **Step 5: Commit**

```bash
git add sources/source-index.yml scripts/validate-content.mjs tests/content.spec.ts
git commit -m "feat: add auditable source validation"
```

### Task 3: Implement the visual system and diagrams

**Files:**
- Create: `docs/.vitepress/theme/index.ts`
- Create: `docs/.vitepress/theme/style.css`
- Create: `docs/.vitepress/theme/components/AgentLoop.vue`
- Create: `docs/.vitepress/theme/components/SystemStack.vue`
- Create: `docs/.vitepress/theme/components/DeliveryCase.vue`
- Modify: `tests/content.spec.ts`

- [ ] **Step 1: Add failing component contract tests**

Assert that each component has a descriptive `role="img"`, an `aria-label`, visible text labels and no external image dependency. Assert that the stylesheet defines the palette variables `--book-paper`, `--book-ink`, `--book-lime`, and `--book-coral`, plus a `390px` responsive rule and reduced-motion handling.

- [ ] **Step 2: Run and confirm red**

Run: `pnpm test`

Expected: FAIL for missing theme files.

- [ ] **Step 3: Implement the components and theme**

Use semantic HTML, CSS grid and inline SVG only. Register the components globally. Keep diagrams readable without color by pairing every state with text and shape. Use a warm paper background, ink-blue text, lime success accents and coral risk accents; avoid glass cards, stock robot art and decorative gradients.

- [ ] **Step 4: Verify green**

Run: `pnpm test && pnpm build`

Expected: tests PASS and VitePress generates `docs/.vitepress/dist/index.html`.

- [ ] **Step 5: Commit**

```bash
git add docs/.vitepress/theme tests/content.spec.ts
git commit -m "feat: add accessible book theme and diagrams"
```

### Task 4: Write the first-act chapters

**Files:**
- Create: `docs/preface.md`
- Create: `docs/chapters/01-ai-native.md`
- Create: `docs/chapters/02-workflow-agent.md`
- Create: `docs/chapters/03-react.md`
- Modify: `tests/content.spec.ts`

- [ ] **Step 1: Add failing chapter-shape tests**

For every chapter require: one `## 先讲个故事`, one diagram component, `## 工程上到底发生了什么`, `## 别踩这些坑`, `## 三道小测`, and a `来源：` line containing registered source IDs.

- [ ] **Step 2: Run and confirm red**

Run: `pnpm test`

Expected: FAIL listing the missing first-act chapters.

- [ ] **Step 3: Write the chapters**

Write complete beginner prose covering AI Native, the Prompt/Workflow/Agent decision ladder and ReAct with explicit stop conditions. Include the approved misconceptions 1–4 and keep private chain-of-thought out of the examples; expose only action and observation summaries.

- [ ] **Step 4: Verify green**

Run: `pnpm test && pnpm validate`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add docs/preface.md docs/chapters/01-ai-native.md docs/chapters/02-workflow-agent.md docs/chapters/03-react.md tests/content.spec.ts
git commit -m "docs: write agent engineering foundations"
```

### Task 5: Write the systems chapters

**Files:**
- Create: `docs/chapters/04-tools-mcp.md`
- Create: `docs/chapters/05-state-memory.md`
- Create: `docs/chapters/06-loop-graph.md`
- Create: `docs/chapters/07-multi-agent.md`
- Modify: `tests/content.spec.ts`

- [ ] **Step 1: Extend the failing route and chapter-shape tests**

Add chapter 4–7 paths to the test table before creating files.

- [ ] **Step 2: Run and confirm red**

Run: `pnpm test`

Expected: FAIL listing chapters 4–7.

- [ ] **Step 3: Write the chapters**

Explain MCP as a protocol rather than a permission system; separate task state, conversation context, durable preference, knowledge and audit logs; explain graph control flow; and show the coordination costs of multi-agent systems. Include misconceptions 5–8.

- [ ] **Step 4: Verify green**

Run: `pnpm test && pnpm validate`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add docs/chapters/04-tools-mcp.md docs/chapters/05-state-memory.md docs/chapters/06-loop-graph.md docs/chapters/07-multi-agent.md tests/content.spec.ts
git commit -m "docs: explain agent tools state and orchestration"
```

### Task 6: Write the production chapters and sanitized case study

**Files:**
- Create: `docs/chapters/08-evaluation.md`
- Create: `docs/chapters/09-safety-recovery.md`
- Create: `docs/chapters/10-production.md`
- Create: `docs/case-study/delivery-agent.md`
- Modify: `tests/content.spec.ts`

- [ ] **Step 1: Add failing production and privacy tests**

Require the three production chapter files, the generalized case-study title, a failure-classification table, an evidence gate, a recovery path and a public-boundary note. Assert that the literal private repository name and internal identifiers do not occur in published Markdown.

- [ ] **Step 2: Run and confirm red**

Run: `pnpm test`

Expected: FAIL for the missing files.

- [ ] **Step 3: Write the chapters and case**

Cover task success, trajectories, evidence, regressions, cost and latency; then idempotency, timeout, compensation, sandbox, least privilege and human takeover. The case study should use a fictional delivery-agent system to demonstrate layer separation, unique run IDs, fail-closed evidence, failure categories, recovery and promotion from shadow to blocking gates. Include misconceptions 9–12.

- [ ] **Step 4: Verify green**

Run: `pnpm test && pnpm validate`

Expected: PASS with no forbidden public-boundary markers.

- [ ] **Step 5: Commit**

```bash
git add docs/chapters/08-evaluation.md docs/chapters/09-safety-recovery.md docs/chapters/10-production.md docs/case-study/delivery-agent.md tests/content.spec.ts
git commit -m "docs: add production guidance and delivery case"
```

### Task 7: Finish reader aids and repository documentation

**Files:**
- Create: `docs/appendix/glossary.md`
- Create: `docs/appendix/review-checklist.md`
- Create: `docs/appendix/reading.md`
- Create: `README.md`
- Modify: `docs/index.md`
- Modify: `tests/content.spec.ts`

- [ ] **Step 1: Add failing reader-aid tests**

Require glossary entries for Agent, Workflow, Tool, MCP, RAG, Memory, Graph and Eval; require the review checklist sections `适用性`, `可靠性`, `安全`, `成本`, and `运营`; require the reading page to render all source grades.

- [ ] **Step 2: Run and confirm red**

Run: `pnpm test`

Expected: FAIL for missing appendices.

- [ ] **Step 3: Implement the aids and landing page**

Write the five-minute overview, three reading routes, annotated glossary, printable review checklist, and source-aware reading guide. README must include the public URL, local commands, source policy and DeliveryAI sanitization rule.

- [ ] **Step 4: Verify green**

Run: `pnpm test && pnpm validate && pnpm build`

Expected: all checks PASS.

- [ ] **Step 5: Commit**

```bash
git add README.md docs/index.md docs/appendix tests/content.spec.ts
git commit -m "docs: complete book navigation and reader aids"
```

### Task 8: Add Pages deployment and perform release verification

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `README.md`

- [ ] **Step 1: Add a failing workflow contract test**

Assert that the workflow triggers on `main`, grants only `contents: read`, `pages: write`, and `id-token: write`, runs `pnpm install --frozen-lockfile`, `pnpm test`, `pnpm build`, uploads `docs/.vitepress/dist`, and deploys with `actions/deploy-pages`.

- [ ] **Step 2: Run and confirm red**

Run: `pnpm test`

Expected: FAIL because the workflow is absent.

- [ ] **Step 3: Implement the least-privilege workflow**

Use Node 22, pnpm cache, official Pages actions, a single deployment concurrency group and no repository secrets.

- [ ] **Step 4: Run the complete local gate**

Run: `pnpm test && pnpm validate && pnpm build`

Expected: PASS and a static artifact under `docs/.vitepress/dist`.

- [ ] **Step 5: Perform browser checks**

Run a local preview and use a named browser session to verify the home page, all sidebar routes, desktop viewport, 390px viewport, theme toggle, search and keyboard navigation. Capture screenshots for local review but do not commit them.

- [ ] **Step 6: Commit, push and enable Pages**

```bash
git add .github/workflows/deploy.yml README.md
git commit -m "ci: deploy book to GitHub Pages"
git push origin feat/book-site
```

Merge the reviewed branch to `main`, set Pages build type to `workflow`, wait for the deployment run, then verify:

```bash
curl -I https://mengen-ink.github.io/agent-engineering-for-beginners/
```

Expected: HTTP 200.

## Plan self-review

- Spec coverage: content structure, DeliveryAI sanitization, source audit, visual system, accessibility, tests and Pages deployment all map to tasks.
- Placeholder scan: no deferred implementation markers remain.
- Type consistency: source fields, palette variables, route prefixes and script names are consistent across tasks.
- Scope: one static book site; no backend, account system, comments, analytics, CMS, PDF typesetting or multilingual work.
