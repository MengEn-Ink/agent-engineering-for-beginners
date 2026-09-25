# Interview Questions and Visual Companion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 42 context-linked interview questions and 22 explanatory visual instances across the 14-chapter handbook without interrupting long-form reading.

**Architecture:** A typed question registry is the single source of truth for chapter cards and the appendix index. Reusable Vue components render native disclosure blocks and accessible diagrams; Markdown only places question IDs and diagram components at the relevant concepts. Vitest validates counts, role ratios, answer structure, links, diagram semantics and mobile behavior before deployment.

**Tech Stack:** VitePress, Vue 3, TypeScript, CSS, Vitest, GitHub Actions / Pages

---

### Task 1: Define and validate the interview question registry

**Files:**
- Create: `docs/.vitepress/theme/data/interviewQuestions.ts`
- Modify: `tests/content.spec.ts`

- [ ] **Step 1: Write failing registry tests**

Import the registry and require exactly 42 unique IDs, three questions per chapter, 29–30 engineering questions, 12–13 product questions, valid difficulty tags and 2–3 follow-ups per question.

```ts
expect(interviewQuestions).toHaveLength(42)
expect(new Set(interviewQuestions.map((item) => item.id)).size).toBe(42)
expect(interviewQuestions.filter((item) => item.role === '工程').length).toBe(30)
expect(item.followUps.length).toBeGreaterThanOrEqual(2)
expect(item.followUps.length).toBeLessThanOrEqual(3)
```

- [ ] **Step 2: Run and verify red**

Run: `pnpm vitest run tests/content.spec.ts -t 'interview registry'`

Expected: FAIL because the registry is absent.

- [ ] **Step 3: Write 42 questions**

Create three per chapter. Each record includes `id`, `chapter`, `path`, `topic`, `role`, `difficulty`, `question`, `shortAnswer`, `followUps`, `strongSignals`, and `pitfall`. Questions test explanation, trade-offs and failure handling rather than vendor trivia.

- [ ] **Step 4: Verify green and commit**

Run: `pnpm vitest run tests/content.spec.ts -t 'interview registry'`

```bash
git add docs/.vitepress/theme/data/interviewQuestions.ts tests/content.spec.ts
git commit -m "feat: add agent interview question registry"
```

### Task 2: Render questions in chapters and an index

**Files:**
- Create: `docs/.vitepress/theme/components/InterviewQuestion.vue`
- Create: `docs/.vitepress/theme/components/InterviewIndex.vue`
- Create: `docs/appendix/interview.md`
- Modify: `docs/.vitepress/theme/index.ts`
- Modify: `docs/.vitepress/theme/style.css`
- Modify: `docs/.vitepress/config.mts`
- Modify: `docs/chapters/01-*.md` through `docs/chapters/14-*.md`
- Modify: `tests/content.spec.ts`

- [ ] **Step 1: Write failing placement and accessibility tests**

Require each question ID to appear exactly once in its chapter, two before the final exercise and one near the end. Require native `<details>`, a specific anchor ID, role and difficulty labels, and the four answer sections. Require the index route and all 42 chapter links.

- [ ] **Step 2: Run and verify red**

Run: `pnpm vitest run tests/content.spec.ts -t 'interview placement'`

Expected: FAIL because components and placements are absent.

- [ ] **Step 3: Implement components and styling**

`InterviewQuestion` looks up one ID and renders a quiet disclosure block. `InterviewIndex` groups questions by topic with role/difficulty labels and links to `/<chapter-path>#<id>`. Use native details/summary, visible focus, no large saturated surfaces and no duplicated answer text.

- [ ] **Step 4: Insert three IDs per chapter**

Place one question after the core model, one after the main case/failure boundary, and one before or after the final practical exercise. Preserve chapter character limits.

- [ ] **Step 5: Verify and commit**

Run: `pnpm test && pnpm validate && pnpm build`

```bash
git add docs/.vitepress docs/appendix/interview.md docs/chapters tests/content.spec.ts
git commit -m "feat: weave interview questions through handbook"
```

### Task 3: Add eight explanatory diagram types

**Files:**
- Create: `docs/.vitepress/theme/components/NativeShift.vue`
- Create: `docs/.vitepress/theme/components/ToolBoundary.vue`
- Create: `docs/.vitepress/theme/components/GraphFlow.vue`
- Create: `docs/.vitepress/theme/components/MultiAgentHandoff.vue`
- Create: `docs/.vitepress/theme/components/ResearchPipeline.vue`
- Create: `docs/.vitepress/theme/components/ServiceEscalation.vue`
- Create: `docs/.vitepress/theme/components/CodingLoop.vue`
- Create: `docs/.vitepress/theme/components/BrowserEvidence.vue`
- Modify: `docs/.vitepress/theme/index.ts`
- Modify: `docs/.vitepress/theme/style.css`
- Modify: `docs/chapters/01-*.md` through `docs/chapters/14-*.md`
- Modify: `tests/content.spec.ts`

- [ ] **Step 1: Write failing diagram tests**

Require all eight components, 22 total explanatory instances, accessible conclusion text and chapter-specific placement. Reject `role="img"` on diagrams that contain native tables/lists intended for screen-reader navigation.

- [ ] **Step 2: Run and verify red**

Run: `pnpm vitest run tests/content.spec.ts -t 'visual explanations'`

Expected: FAIL because the new diagrams are absent and the instance count is below target.

- [ ] **Step 3: Implement diagrams**

Use semantic ordered lists, definition lists and tables. Each component includes a visible title, a concise conclusion, and a “不要误解” note. Colors never carry meaning alone.

- [ ] **Step 4: Add mobile behavior**

At 390px, convert flows to vertical order, wrap grouped architecture blocks and keep only wide comparison matrices in their own horizontal scroller. Do not shrink text below the reading size.

- [ ] **Step 5: Place exactly 22 instances and commit**

Run: `pnpm test && pnpm build`

```bash
git add docs/.vitepress/theme docs/chapters tests/content.spec.ts
git commit -m "feat: add accessible visual explanations"
```

### Task 4: Final quality, browser verification and deployment

**Files:**
- Modify only when a failing check identifies a defect.

- [ ] **Step 1: Run full automated gates**

Run: `pnpm test && pnpm validate && pnpm build`

Expected: all tests, public-boundary scan and dist validation pass.

- [ ] **Step 2: Run content-quality checks**

Confirm no duplicate long questions, every chapter has three unique IDs, answers use the same source-supported concepts as the chapter, and “high-frequency” is not attributed to private company banks or invented occurrence counts.

- [ ] **Step 3: Run browser checks**

At 1440px and 390px, verify question disclosure, anchor links, interview index, all eight diagram types, table/list semantics, no page overflow, light/dark contrast, focus and reduced motion.

- [ ] **Step 4: Cross-review and resolve findings**

Provide commit, question distribution, diagram map, screenshots and gate output to the judge. Fix only evidence-backed issues and rerun the complete gate.

- [ ] **Step 5: Merge and deploy**

Fast-forward `main`, push, wait for Pages Actions, then verify public HTTP 200, search, interview anchors, dark mode, mobile layout and process-document 404.

## Plan self-review

- Spec coverage: 42 questions, role ratio, answer structure, index, 22 visuals, semantics, mobile behavior and deployment are each mapped to tasks.
- Placeholder scan: no deferred implementation markers remain.
- Type consistency: question fields, IDs, routes and diagram names match across registry, components and tests.
- Scope: no interview scoring backend, account system, private question bank or decorative image generation.
