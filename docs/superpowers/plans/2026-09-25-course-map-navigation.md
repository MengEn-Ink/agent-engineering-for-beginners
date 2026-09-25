# Course Map and Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a canonical course map at `/course/`, consolidate public route metadata, and project the existing browser-local reading progress onto a six-stage curriculum without changing any existing public URL or implementing later project/lab phases.

**Architecture:** A shared `contentRegistry` owns stable IDs, routes, titles, and content kinds. `courseMap`, reading paths, chapter freshness, interview links, and VitePress navigation reference registry IDs instead of duplicating route/title literals. The course page renders the full published curriculum during SSR and reads only the existing progress key after hydration; it never writes learning state.

**Tech Stack:** VitePress 1.6, Vue 3, TypeScript, Vitest, browser `localStorage`, existing CSS theme tokens

---

## Scope and file map

**Create:**

- `docs/.vitepress/theme/data/contentRegistry.ts` — canonical ID, route, title, and kind for every page used by course/navigation/path metadata.
- `docs/.vitepress/theme/data/courseMap.ts` — six stages, the approved 20 course items, prerequisites, outcomes, progress projection, and graph validation.
- `docs/.vitepress/theme/components/CourseMap.vue` — SSR-readable course rail and read-only local progress overlay.
- `docs/course/index.md` — public `/course/` entry and scope explanation.
- `tests/course-map.spec.ts` — registry, graph, route normalization, state, and course progress tests.

**Modify:**

- `docs/.vitepress/theme/data/readingPaths.ts` — store `itemId + why`, derive runtime path/title from the registry.
- `docs/.vitepress/theme/data/chapterMeta.ts` — key freshness records by item ID instead of duplicated paths.
- `docs/.vitepress/theme/data/interviewQuestions.ts` — derive chapter routes from registry IDs.
- `docs/.vitepress/theme/data/learningState.ts` — add strict route normalization and a progress-only tri-state reader.
- `docs/.vitepress/theme/components/ChapterFreshness.vue` — accept an item ID.
- `docs/.vitepress/theme/components/ReadingPaths.vue` — consume registry-derived steps without changing behavior.
- `docs/.vitepress/theme/components/ReadingProgress.vue` — treat every published CourseItem as trackable while keeping writes on content pages.
- `docs/.vitepress/theme/index.ts` — register `CourseMap`.
- `docs/.vitepress/theme/style.css` — add restrained course-rail, progress, mobile, dark, focus, and print rules.
- `docs/.vitepress/config.mts` — derive navigation targets from registry and group the top navigation.
- `docs/chapters/*.md` — replace the 14 `ChapterFreshness path` props with stable item IDs.
- `docs/frontier/*.md` — replace the 4 `ChapterFreshness path` props with stable item IDs.
- `README.md` — link the course map and document the no-backend progress model.
- `tests/content.spec.ts` — preserve existing route, component, static HTML, and release assertions.

**Explicitly untouched:** `docs/chapters/*` prose, `docs/frontier/*` prose, `docs/projects/`, `docs/labs/`, Python code, images, `assets/provenance.yml`, and the 42 interview question bodies.

## Canonical registry inventory

`contentRegistry.ts` must contain these 31 route records and no duplicate normalized route:

| ID | Route | Kind |
| --- | --- | --- |
| `course` | `/course/` | `course` |
| `paths` | `/paths/` | `paths` |
| `preface` | `/preface` | `chapter` |
| `chapter-01-ai-native` | `/chapters/01-ai-native` | `chapter` |
| `chapter-02-workflow-agent` | `/chapters/02-workflow-agent` | `chapter` |
| `chapter-03-react` | `/chapters/03-react` | `chapter` |
| `chapter-04-tools-mcp` | `/chapters/04-tools-mcp` | `chapter` |
| `chapter-05-state-memory` | `/chapters/05-state-memory` | `chapter` |
| `chapter-06-loop-graph` | `/chapters/06-loop-graph` | `chapter` |
| `chapter-07-multi-agent` | `/chapters/07-multi-agent` | `chapter` |
| `chapter-08-evaluation` | `/chapters/08-evaluation` | `chapter` |
| `chapter-09-safety-recovery` | `/chapters/09-safety-recovery` | `chapter` |
| `chapter-10-production` | `/chapters/10-production` | `chapter` |
| `chapter-11-research-agent` | `/chapters/11-research-agent` | `chapter` |
| `chapter-12-service-operations-agent` | `/chapters/12-service-operations-agent` | `chapter` |
| `chapter-13-coding-agent` | `/chapters/13-coding-agent` | `chapter` |
| `chapter-14-computer-use` | `/chapters/14-computer-use` | `chapter` |
| `frontier-context-engineering` | `/frontier/context-engineering` | `frontier` |
| `frontier-interoperability-identity` | `/frontier/interoperability-identity` | `frontier` |
| `frontier-durable-execution` | `/frontier/durable-execution` | `frontier` |
| `frontier-agent-security-evaluation` | `/frontier/agent-security-evaluation` | `frontier` |
| `case-delivery-agent` | `/case-study/delivery-agent` | `case-study` |
| `radar` | `/radar/` | `radar` |
| `radar-2026-09` | `/radar/2026-09` | `radar` |
| `appendix-glossary` | `/appendix/glossary` | `appendix` |
| `appendix-review-checklist` | `/appendix/review-checklist` | `appendix` |
| `appendix-reading` | `/appendix/reading` | `appendix` |
| `appendix-application-matrix` | `/appendix/application-matrix` | `appendix` |
| `appendix-chapter-template` | `/appendix/chapter-template` | `appendix` |
| `appendix-interview` | `/appendix/interview` | `appendix` |
| `appendix-interview-training` | `/appendix/interview-training` | `appendix` |

The canonical `title` values must match the current sidebar labels for chapter/frontier/case pages. `course`, `paths`, Radar, and appendix records use their existing short navigation labels. Do not create project or lab records in this phase.

### Task 1: Introduce the canonical content registry

**Files:**

- Create: `docs/.vitepress/theme/data/contentRegistry.ts`
- Create: `tests/course-map.spec.ts`

- [ ] **Step 1: Write the failing registry tests**

Create `tests/course-map.spec.ts` with the exact inventory contract and route-to-file check:

```ts
import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { contentItems, getContentItem } from '../docs/.vitepress/theme/data/contentRegistry'

const expectedIds = [
  'course', 'paths', 'preface',
  'chapter-01-ai-native', 'chapter-02-workflow-agent', 'chapter-03-react',
  'chapter-04-tools-mcp', 'chapter-05-state-memory', 'chapter-06-loop-graph',
  'chapter-07-multi-agent', 'chapter-08-evaluation', 'chapter-09-safety-recovery',
  'chapter-10-production', 'chapter-11-research-agent',
  'chapter-12-service-operations-agent', 'chapter-13-coding-agent',
  'chapter-14-computer-use', 'frontier-context-engineering',
  'frontier-interoperability-identity', 'frontier-durable-execution',
  'frontier-agent-security-evaluation', 'case-delivery-agent', 'radar',
  'radar-2026-09', 'appendix-glossary', 'appendix-review-checklist',
  'appendix-reading', 'appendix-application-matrix', 'appendix-chapter-template',
  'appendix-interview', 'appendix-interview-training',
]

function markdownPath(route: string) {
  const path = route.endsWith('/') ? `${route}index` : route
  return `docs${path}.md`
}

describe('content registry', () => {
  it('owns every routed learning page exactly once', () => {
    expect(contentItems.map((item) => item.id)).toEqual(expectedIds)
    expect(new Set(contentItems.map((item) => item.id)).size).toBe(contentItems.length)
    expect(new Set(contentItems.map((item) => item.route)).size).toBe(contentItems.length)
  })

  it('points every registry route at a real page', () => {
    for (const item of contentItems.filter((item) => item.id !== 'course')) {
      expect(existsSync(markdownPath(item.route)), item.id).toBe(true)
    }
  })

  it('fails loudly for an unknown ID', () => {
    expect(() => getContentItem('missing')).toThrow('Unknown content item: missing')
  })
})
```

- [ ] **Step 2: Run the registry tests and verify RED**

Run:

```bash
pnpm vitest run tests/course-map.spec.ts -t 'content registry'
```

Expected: FAIL because `contentRegistry.ts` does not exist.

- [ ] **Step 3: Implement the registry and lookup helpers**

Create the file with these public contracts and all 31 rows from the inventory above:

The `course` record is allowed to be unresolved only inside this first unpublished registry commit; Task 5 creates its page before any navigation references it, and the final route test removes this exception.

```ts
export type ContentKind =
  | 'course'
  | 'paths'
  | 'chapter'
  | 'frontier'
  | 'case-study'
  | 'radar'
  | 'appendix'
  | 'project'
  | 'lab'
  | 'capstone'

export interface ContentItem {
  id: string
  route: string
  title: string
  navTitle?: string
  kind: ContentKind
}

export const contentItems: ContentItem[] = [
  { id: 'course', route: '/course/', title: 'Agent 工程完整课程地图', navTitle: '课程地图', kind: 'course' },
  { id: 'paths', route: '/paths/', title: '三条阅读路径', navTitle: '阅读路径', kind: 'paths' },
  { id: 'preface', route: '/preface', title: '序章 · 会聊天，不等于会做事', navTitle: '开始阅读', kind: 'chapter' },
  { id: 'chapter-01-ai-native', route: '/chapters/01-ai-native', title: '01 · AI Native 到底 Native 在哪', kind: 'chapter' },
  { id: 'chapter-02-workflow-agent', route: '/chapters/02-workflow-agent', title: '02 · Prompt、Workflow、Agent', kind: 'chapter' },
  { id: 'chapter-03-react', route: '/chapters/03-react', title: '03 · ReAct：想、做、看、再决定', kind: 'chapter' },
  { id: 'chapter-04-tools-mcp', route: '/chapters/04-tools-mcp', title: '04 · 工具与 MCP', kind: 'chapter' },
  { id: 'chapter-05-state-memory', route: '/chapters/05-state-memory', title: '05 · 状态与记忆', kind: 'chapter' },
  { id: 'chapter-06-loop-graph', route: '/chapters/06-loop-graph', title: '06 · 从 Loop 到 Graph', kind: 'chapter' },
  { id: 'chapter-07-multi-agent', route: '/chapters/07-multi-agent', title: '07 · 多 Agent 协作', kind: 'chapter' },
  { id: 'chapter-08-evaluation', route: '/chapters/08-evaluation', title: '08 · 验证与可观测性', kind: 'chapter' },
  { id: 'chapter-09-safety-recovery', route: '/chapters/09-safety-recovery', title: '09 · 失败、恢复与安全边界', kind: 'chapter' },
  { id: 'chapter-10-production', route: '/chapters/10-production', title: '10 · 从 Demo 到生产', kind: 'chapter' },
  { id: 'chapter-11-research-agent', route: '/chapters/11-research-agent', title: '11 · 研究型 Agent', kind: 'chapter' },
  { id: 'chapter-12-service-operations-agent', route: '/chapters/12-service-operations-agent', title: '12 · 客服与运营 Agent', kind: 'chapter' },
  { id: 'chapter-13-coding-agent', route: '/chapters/13-coding-agent', title: '13 · Coding Agent', kind: 'chapter' },
  { id: 'chapter-14-computer-use', route: '/chapters/14-computer-use', title: '14 · Computer Use', kind: 'chapter' },
  { id: 'frontier-context-engineering', route: '/frontier/context-engineering', title: 'Context Engineering', kind: 'frontier' },
  { id: 'frontier-interoperability-identity', route: '/frontier/interoperability-identity', title: 'Agent 互操作与身份', kind: 'frontier' },
  { id: 'frontier-durable-execution', route: '/frontier/durable-execution', title: '长时运行与恢复', kind: 'frontier' },
  { id: 'frontier-agent-security-evaluation', route: '/frontier/agent-security-evaluation', title: 'Agent 安全评测', kind: 'frontier' },
  { id: 'case-delivery-agent', route: '/case-study/delivery-agent', title: '交付型 Agent 的质量门', navTitle: '交付型案例', kind: 'case-study' },
  { id: 'radar', route: '/radar/', title: '前沿雷达', kind: 'radar' },
  { id: 'radar-2026-09', route: '/radar/2026-09', title: '2026 年 9 月更新', kind: 'radar' },
  { id: 'appendix-glossary', route: '/appendix/glossary', title: '术语表', kind: 'appendix' },
  { id: 'appendix-review-checklist', route: '/appendix/review-checklist', title: '方案评审清单', kind: 'appendix' },
  { id: 'appendix-reading', route: '/appendix/reading', title: '延伸阅读', kind: 'appendix' },
  { id: 'appendix-application-matrix', route: '/appendix/application-matrix', title: '应用选型矩阵', kind: 'appendix' },
  { id: 'appendix-chapter-template', route: '/appendix/chapter-template', title: '章节与方案模板', kind: 'appendix' },
  { id: 'appendix-interview', route: '/appendix/interview', title: '42 道面试题', kind: 'appendix' },
  { id: 'appendix-interview-training', route: '/appendix/interview-training', title: '面试训练模式', kind: 'appendix' },
]

export const contentById = Object.fromEntries(
  contentItems.map((item) => [item.id, item]),
) as Record<string, ContentItem>

export function getContentItem(id: string): ContentItem {
  const item = contentById[id]
  if (!item) throw new Error(`Unknown content item: ${id}`)
  return item
}

export function navigationItem(id: string, variant: 'title' | 'nav' = 'title') {
  const item = getContentItem(id)
  return { text: variant === 'nav' ? (item.navTitle ?? item.title) : item.title, link: item.route }
}
```

Add a registry test proving `navigationItem('preface', 'nav').text === '开始阅读'` while `navigationItem('preface').text` remains the canonical long title. This is the only permitted context-specific label mechanism; callers may not pass arbitrary title strings.

- [ ] **Step 4: Run registry tests and verify GREEN**

Run: `pnpm vitest run tests/course-map.spec.ts -t 'content registry'`
Expected: 3 tests pass.

- [ ] **Step 5: Commit the registry**

```bash
git add docs/.vitepress/theme/data/contentRegistry.ts tests/course-map.spec.ts
git commit -m "feat: add canonical content registry"
```

### Task 2: Model the six-stage course graph

**Files:**

- Create: `docs/.vitepress/theme/data/courseMap.ts`
- Modify: `tests/course-map.spec.ts`

- [ ] **Step 1: Add failing tests for the exact 20-item graph**

Append tests that assert the approved IDs, stage counts, prerequisites, completion denominator, and cycle detection:

```ts
import {
  courseItems,
  courseStages,
  currentCourseStage,
  projectCourseProgress,
  validateCourseMap,
} from '../docs/.vitepress/theme/data/courseMap'

const expectedCourseIds = [
  'preface', 'chapter-01-ai-native', 'chapter-02-workflow-agent', 'chapter-03-react',
  'chapter-04-tools-mcp', 'frontier-context-engineering', 'chapter-05-state-memory',
  'chapter-06-loop-graph', 'chapter-07-multi-agent',
  'frontier-interoperability-identity', 'chapter-08-evaluation',
  'chapter-09-safety-recovery', 'chapter-10-production', 'frontier-durable-execution',
  'frontier-agent-security-evaluation', 'chapter-11-research-agent',
  'chapter-12-service-operations-agent', 'chapter-13-coding-agent',
  'chapter-14-computer-use', 'case-delivery-agent',
]

describe('course graph', () => {
  it('contains the approved twenty items and excludes the relationship-only stage', () => {
    expect(courseItems.map((item) => item.itemId)).toEqual(expectedCourseIds)
    expect(courseStages.map((stage) => stage.id)).toEqual([
      'foundation', 'mechanisms', 'engineering', 'applications', 'projects', 'capstone',
    ])
    expect(courseStages.find((stage) => stage.id === 'capstone')).toMatchObject({
      availability: 'relationship-only', itemIds: [],
    })
    expect(projectCourseProgress([]).total).toBe(20)
  })

  it('has only known prerequisite IDs and no cycles', () => {
    expect(validateCourseMap(courseItems, courseStages)).toEqual([])
    expect(validateCourseMap([
      { itemId: 'preface', stageId: 'foundation', prerequisites: ['chapter-01-ai-native'], outcome: 'a', evidence: 'a' },
      { itemId: 'chapter-01-ai-native', stageId: 'foundation', prerequisites: ['preface'], outcome: 'b', evidence: 'b' },
    ], courseStages)).toContain('Prerequisite cycle: chapter-01-ai-native -> preface -> chapter-01-ai-native')
  })

  it('selects the first incomplete published stage and handles 20/20', () => {
    expect(currentCourseStage([])?.id).toBe('foundation')
    const allRoutes = expectedCourseIds.map((id) => getContentItem(id).route)
    expect(projectCourseProgress(allRoutes)).toMatchObject({ completed: 20, total: 20 })
    expect(currentCourseStage(allRoutes)).toBeNull()
  })
})
```

- [ ] **Step 2: Run the graph tests and verify RED**

Run: `pnpm vitest run tests/course-map.spec.ts -t 'course graph'`
Expected: FAIL because `courseMap.ts` does not exist.

- [ ] **Step 3: Implement the exact stage and item contracts**

Use these stage records:

```ts
export const courseStages: CourseStage[] = [
  { id: 'foundation', order: 1, title: '基础认知', purpose: '分清控制权与 Agent 循环', availability: 'published', itemIds: ['preface', 'chapter-01-ai-native', 'chapter-02-workflow-agent', 'chapter-03-react'] },
  { id: 'mechanisms', order: 2, title: '核心机制', purpose: '组装工具、上下文、状态与协作', availability: 'published', itemIds: ['chapter-04-tools-mcp', 'frontier-context-engineering', 'chapter-05-state-memory', 'chapter-06-loop-graph', 'chapter-07-multi-agent', 'frontier-interoperability-identity'] },
  { id: 'engineering', order: 3, title: '生产工程', purpose: '建立评测、安全、恢复与上线能力', availability: 'published', itemIds: ['chapter-08-evaluation', 'chapter-09-safety-recovery', 'chapter-10-production', 'frontier-durable-execution', 'frontier-agent-security-evaluation'] },
  { id: 'applications', order: 4, title: '应用模式', purpose: '理解四类 Agent 的适用与失败边界', availability: 'published', itemIds: ['chapter-11-research-agent', 'chapter-12-service-operations-agent', 'chapter-13-coding-agent', 'chapter-14-computer-use'] },
  { id: 'projects', order: 5, title: '项目拆解', purpose: '从已发布案例观察工程质量门', availability: 'published', itemIds: ['case-delivery-agent'] },
  { id: 'capstone', order: 6, title: '综合实战', purpose: '在后续独立阶段组合 Python Lab 与交付型后端 Agent', availability: 'relationship-only', itemIds: [] },
]
```

Create the 20 `CourseItem` records with the exact `itemId / stageId / prerequisites` from section 5.3 of the approved design and these fixed display fields:

| itemId | outcome | evidence |
| --- | --- | --- |
| `preface` | 说清 Agent 工程课程解决什么问题，以及学习顺序为何这样安排 | 一张个人学习目标与已有基础清单 |
| `chapter-01-ai-native` | 区分 AI-Enhanced 与 AI-Native，并划分模型和确定性代码责任 | 一张 AI Native 改造画布 |
| `chapter-02-workflow-agent` | 为具体任务选择 Prompt、Workflow 或 Agent | 一份控制方式选择单 |
| `chapter-03-react` | 设计可观察、可停止、可恢复的 Agent 循环 | 一份行动、观察与停止契约 |
| `chapter-04-tools-mcp` | 写出窄能力、可授权、可验证的工具契约 | 一份工具契约 YAML 与风险清单 |
| `frontier-context-engineering` | 为一次决策选择、压缩、隔离和验证上下文 | 一张上下文预算与来源表 |
| `chapter-05-state-memory` | 分开任务状态、会话、长期偏好、知识和审计 | 一份记忆写入与删除协议 |
| `chapter-06-loop-graph` | 把分支、并行、汇合和恢复画成显式控制流 | 一张带失败回边的状态图 |
| `chapter-07-multi-agent` | 判断多 Agent 是否比单 Agent 基线更有价值 | 一份 handoff 契约与角色消融方案 |
| `frontier-interoperability-identity` | 区分 MCP 与 A2A，并画出身份、授权和委托链 | 一张跨 Agent 委托与审计链路图 |
| `chapter-08-evaluation` | 联合评估结果、轨迹、业务证据、成本和延迟 | 一组 10 条微型评测样本与评分表 |
| `chapter-09-safety-recovery` | 为高风险动作设计权限、幂等、补偿和人工接管 | 一张权限与恢复矩阵 |
| `chapter-10-production` | 设计版本、门禁、灰度、SLO、回滚与退役 | 一份二维上线矩阵与回滚清单 |
| `frontier-durable-execution` | 设计检查点、租约、重放和版本迁移 | 一份可恢复任务协议 |
| `frontier-agent-security-evaluation` | 用任务后果和自适应攻击衡量 Agent 劫持风险 | 一张安全评测集结构与指标表 |
| `chapter-11-research-agent` | 组织检索、证据、冲突与研究结论 | 一份带引用覆盖率的研究计划 |
| `chapter-12-service-operations-agent` | 设计客服运营中的政策、动作与升级边界 | 一张人工升级与业务回执流程 |
| `chapter-13-coding-agent` | 约束仓库理解、修改、测试和交付证据 | 一份 Coding Agent 任务与验证契约 |
| `chapter-14-computer-use` | 为界面操作设计观察、权限和最终证据 | 一张 Computer Use 风险与证据闭环 |
| `case-delivery-agent` | 把评测、安全和生产门禁组合到一个交付型案例 | 一份可复核的质量门评审记录 |

Do not paraphrase these values during implementation; tests should compare all 20 `outcome` and `evidence` strings against this table. Then implement:

```ts
export interface CourseProgress {
  completed: number
  total: number
  stages: Array<{ id: CourseStageId; completed: number; total: number }>
}

export const publishedCourseItems = courseItems.filter((item) =>
  courseStages.find((stage) => stage.id === item.stageId)?.availability === 'published',
)

export function projectCourseProgress(completedRoutes: string[]): CourseProgress
export function currentCourseStage(completedRoutes: string[]): CourseStage | null
export function validateCourseMap(items: CourseItem[], stages: CourseStage[]): string[]
```

`projectCourseProgress` must normalize and deduplicate routes, count only published stage items, and keep the denominator at 20. `validateCourseMap` must reject unknown content IDs, unknown prerequisite IDs, duplicate course IDs, stage/item mismatches, relationship-only items, and prerequisite cycles.

- [ ] **Step 4: Run graph tests and verify GREEN**

Run: `pnpm vitest run tests/course-map.spec.ts -t 'course graph'`
Expected: all course graph tests pass.

- [ ] **Step 5: Commit the graph**

```bash
git add docs/.vitepress/theme/data/courseMap.ts tests/course-map.spec.ts
git commit -m "feat: model the public course graph"
```

### Task 3: Add strict route normalization and progress-only state reads

**Files:**

- Modify: `docs/.vitepress/theme/data/learningState.ts:21-90`
- Modify: `tests/course-map.spec.ts`

- [ ] **Step 1: Write failing route normalization tests**

Add:

```ts
import {
  learningStorageKeys,
  normalizeCourseRoute,
  readCourseProgress,
} from '../docs/.vitepress/theme/data/learningState'

describe('course progress input', () => {
  const origin = 'https://mengen-ink.github.io'

  it('normalizes only same-origin handbook routes', () => {
    expect(normalizeCourseRoute('/agent-engineering-for-beginners/chapters/01-ai-native/?x=1#top', origin)).toBe('/chapters/01-ai-native')
    expect(normalizeCourseRoute('/agent-engineering-for-beginners/chapters/01-ai-native.html', origin)).toBe('/chapters/01-ai-native')
    expect(normalizeCourseRoute('/agent-engineering-for-beginners/paths/index.html', origin)).toBe('/paths')
    expect(normalizeCourseRoute('https://mengen-ink.github.io/agent-engineering-for-beginners/chapters/01-ai-native', origin)).toBe('/chapters/01-ai-native')
    expect(normalizeCourseRoute('https://evil.example/agent-engineering-for-beginners/chapters/01-ai-native', origin)).toBeNull()
    expect(normalizeCourseRoute('/agent-engineering-for-beginners/%E0%A4%A', origin)).toBeNull()

    const normalizedRegistryRoutes = contentItems.map((item) =>
      normalizeCourseRoute(item.route, origin),
    )
    expect(normalizedRegistryRoutes.every(Boolean)).toBe(true)
    expect(new Set(normalizedRegistryRoutes).size).toBe(contentItems.length)
  })

  it('reads only progress and distinguishes available, corrupt and blocked', () => {
    const values = new Map([[learningStorageKeys.progress, '["/chapters/01-ai-native"]'], [learningStorageKeys.bookmarks, '{broken']])
    const requested: string[] = []
    const storage = {
      getItem(key: string) { requested.push(key); return values.get(key) ?? null },
    }
    expect(readCourseProgress(storage)).toEqual({ status: 'available', completed: ['/chapters/01-ai-native'] })
    expect(requested).toEqual([learningStorageKeys.progress])

    values.set(learningStorageKeys.progress, '{broken')
    expect(readCourseProgress(storage)).toEqual({ status: 'corrupt', completed: null })

    expect(readCourseProgress({ getItem() { throw new Error('blocked') } })).toEqual({ status: 'blocked', completed: null })
    expect(values.get(learningStorageKeys.progress)).toBe('{broken')
  })
})
```

- [ ] **Step 2: Run state tests and verify RED**

Run: `pnpm vitest run tests/course-map.spec.ts -t 'course progress input'`
Expected: FAIL because cross-origin URLs are accepted and `readCourseProgress` is missing.

- [ ] **Step 3: Implement the strict, read-only API**

Keep the existing storage keys and `loadLearningState()` behavior for current consumers. Add:

```ts
export type CourseProgressRead =
  | { status: 'available'; completed: string[] }
  | { status: 'corrupt'; completed: null }
  | { status: 'blocked'; completed: null }

export interface ReadOnlyStorage {
  getItem(key: string): string | null
}

export function normalizeCourseRoute(
  raw: string,
  origin = typeof window === 'undefined' ? 'https://mengen-ink.github.io' : window.location.origin,
  base = '/agent-engineering-for-beginners',
): string | null

export function readCourseProgress(storage?: ReadOnlyStorage | null): CourseProgressRead
```

Implementation rules:

- Reject absolute URLs whose origin differs from `origin`.
- Remove query/hash, exact base prefix, valid percent encoding, repeated slashes, `/index(.html)`, `.html`, and non-root trailing slash in that order.
- Read only `learningStorageKeys.progress`; do not access path, bookmarks, or interview mastery.
- Missing progress is `available` with `[]`.
- Invalid JSON, non-array JSON, or any non-string member is `corrupt`.
- A `getItem` exception is `blocked`.
- Never call `setItem` or `removeItem` from this reader.

Use this concrete normalization and read structure:

```ts
export function normalizeCourseRoute(
  raw: string,
  origin = typeof window === 'undefined' ? 'https://mengen-ink.github.io' : window.location.origin,
  base = '/agent-engineering-for-beginners',
): string | null {
  try {
    const expectedOrigin = new URL(origin).origin
    const url = new URL(raw, `${expectedOrigin}/`)
    if (url.origin !== expectedOrigin) return null

    let path = decodeURIComponent(url.pathname).replace(/\/{2,}/gu, '/')
    const normalizedBase = `/${base.replace(/^\/+|\/+$/gu, '')}`
    if (path === normalizedBase) path = '/'
    else if (path.startsWith(`${normalizedBase}/`)) path = path.slice(normalizedBase.length)
    path = path.replace(/\/index(?:\.html)?\/?$/u, '/')
    path = path.replace(/\.html$/u, '')
    if (path !== '/') path = path.replace(/\/$/u, '')
    return path || '/'
  } catch {
    return null
  }
}

// Preserve the existing string-returning API until Tasks 4 and 6 migrate
// current consumers to registry IDs and nullable course normalization.
export function normalizeLearningPath(path: string): string {
  return normalizeCourseRoute(path) ?? path
}

export function readCourseProgress(
  storage: ReadOnlyStorage | null = browserStorage(),
): CourseProgressRead {
  if (!storage) return { status: 'blocked', completed: null }
  let raw: string | null
  try {
    raw = storage.getItem(learningStorageKeys.progress)
  } catch {
    return { status: 'blocked', completed: null }
  }
  if (raw === null) return { status: 'available', completed: [] }
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== 'string')) {
      return { status: 'corrupt', completed: null }
    }
    return { status: 'available', completed: parsed }
  } catch {
    return { status: 'corrupt', completed: null }
  }
}
```

Distinguish JSON parsing from storage access: wrap `getItem` and `JSON.parse` separately so malformed JSON returns `corrupt`, while `getItem` exceptions return `blocked`.

- [ ] **Step 4: Run state tests and verify GREEN**

Run: `pnpm vitest run tests/course-map.spec.ts -t 'course progress input'`
Expected: all normalization and state tests pass.

- [ ] **Step 5: Re-run existing local-state tests**

Run:

```bash
pnpm vitest run tests/content.spec.ts -t 'local reading paths and progress'
pnpm vitest run tests/interview-training.spec.ts
```

Expected: existing path, bookmark, storage failure, and mastery behavior remains green.

- [ ] **Step 6: Verify the intermediate commit still builds**

Run: `pnpm build`
Expected: build and dist validation pass because existing consumers still call the compatibility `normalizeLearningPath(): string` wrapper.

- [ ] **Step 7: Commit the reader**

```bash
git add docs/.vitepress/theme/data/learningState.ts tests/course-map.spec.ts
git commit -m "feat: add safe course progress projection"
```

### Task 4: Migrate data consumers to registry IDs

**Files:**

- Modify: `docs/.vitepress/theme/data/readingPaths.ts:1-86`
- Modify: `docs/.vitepress/theme/data/chapterMeta.ts:1-168`
- Modify: `docs/.vitepress/theme/data/interviewQuestions.ts:1-45`
- Modify: `docs/.vitepress/theme/components/ChapterFreshness.vue:1-57`
- Modify: `docs/chapters/*.md`
- Modify: `docs/frontier/*.md`
- Modify: `tests/course-map.spec.ts`
- Modify: `tests/content.spec.ts`

- [ ] **Step 1: Write failing single-source tests**

Add the first two tests below to `tests/course-map.spec.ts`. Add the final freshness-marker test to the existing chapter-freshness section in `tests/content.spec.ts`, where `expandedChapterFiles` and `applicationChapterFiles` already exist; define `frontierFiles` beside them.

```ts
describe('registry consumers', () => {
  it('stores path steps as item IDs and derives display fields', async () => {
    const module = await import('../docs/.vitepress/theme/data/readingPaths')
    for (const path of module.readingPathDefinitions) {
      for (const step of path.steps) {
        expect(step).toEqual({ itemId: expect.any(String), why: expect.any(String) })
        expect(getContentItem(step.itemId)).toBeDefined()
      }
    }
    for (const path of module.readingPaths) {
      for (const step of path.steps) {
        expect(step.path).toBe(getContentItem(step.itemId).route)
        expect(step.title).toBe(getContentItem(step.itemId).title)
      }
    }
  })

  it('keys chapter freshness and interview routes through content IDs', async () => {
    const { chapterMeta } = await import('../docs/.vitepress/theme/data/chapterMeta')
    expect(chapterMeta).toHaveLength(18)
    expect(chapterMeta.every((meta: { itemId?: string; path?: string }) => meta.itemId && !meta.path)).toBe(true)

    const interviewSource = readFileSync('docs/.vitepress/theme/data/interviewQuestions.ts', 'utf8')
    expect(interviewSource).not.toContain("'/chapters/")
    expect(interviewSource).toContain('getContentItem')
  })

  it('uses one item-id freshness marker per tracked page', () => {
    for (const file of [...expandedChapterFiles, ...applicationChapterFiles, ...frontierFiles]) {
      const text = readFileSync(file, 'utf8')
      expect(text.match(/<ChapterFreshness item-id="[^"]+" \/>/gu)).toHaveLength(1)
      expect(text).not.toContain('<ChapterFreshness path=')
    }
  })
})
```

Define `frontierFiles` in `tests/content.spec.ts` with the four existing frontier Markdown files.

- [ ] **Step 2: Run migration tests and verify RED**

Run:

```bash
pnpm vitest run tests/course-map.spec.ts -t 'registry consumers'
pnpm vitest run tests/content.spec.ts -t 'item-id freshness marker'
```

Expected: FAIL because paths and freshness still store route strings.

- [ ] **Step 3: Migrate reading paths without changing their public runtime shape**

Export raw `readingPathDefinitions` containing only `{ itemId, why }`. Export derived `readingPaths` that resolves every item through `getContentItem` and returns `{ itemId, path, title, why }`, so `ReadingPaths.vue`, `ReadingProgress.vue`, and `findNextReadingStep` continue to work.

Use this exact data shape and derivation:

```ts
import { getContentItem } from './contentRegistry'

export type ReadingPathId = 'beginner' | 'engineering' | 'interview'

export interface ReadingPathDefinition {
  id: ReadingPathId
  title: string
  summary: string
  pace: string
  steps: Array<{ itemId: string; why: string }>
}

export const readingPathDefinitions: ReadingPathDefinition[] = [
  {
    id: 'beginner',
    title: '小白入门',
    summary: '先建立 Agent 的完整心智模型，再进入状态、评测、安全和上线。',
    pace: '8 站 · 约 4–6 小时',
    steps: [
      { itemId: 'chapter-01-ai-native', why: '先理解系统为何要重新分工' },
      { itemId: 'chapter-02-workflow-agent', why: '学会选择最简单的自动化形态' },
      { itemId: 'chapter-03-react', why: '看懂 Agent 如何行动和观察' },
      { itemId: 'chapter-04-tools-mcp', why: '给能力加上契约和权限' },
      { itemId: 'chapter-05-state-memory', why: '别把所有历史都塞回窗口' },
      { itemId: 'chapter-08-evaluation', why: '从一次答对走向可重复验证' },
      { itemId: 'chapter-09-safety-recovery', why: '为失败和高风险动作留出口' },
      { itemId: 'chapter-10-production', why: '把版本、灰度和运营串起来' },
    ],
  },
  {
    id: 'engineering',
    title: '工程实战',
    summary: '围绕工具、状态、Graph、验证和应用边界，形成可以落地的系统设计。',
    pace: '10 站 · 建议边读边做',
    steps: [
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
    ],
  },
  {
    id: 'interview',
    title: '面试冲刺',
    summary: '先补术语，再按高频系统设计主题复习，最后进入 42 道题的训练。',
    pace: '11 站 · 适合分 3 次复习',
    steps: [
      { itemId: 'appendix-glossary', why: '先把容易混淆的概念说清' },
      { itemId: 'appendix-interview', why: '了解题型与自己的薄弱区' },
      { itemId: 'chapter-02-workflow-agent', why: '回答方案选择和成本取舍' },
      { itemId: 'chapter-04-tools-mcp', why: '回答协议、契约与权限边界' },
      { itemId: 'chapter-05-state-memory', why: '回答上下文和持久化分层' },
      { itemId: 'chapter-06-loop-graph', why: '回答控制流与恢复设计' },
      { itemId: 'chapter-07-multi-agent', why: '回答协作收益和额外成本' },
      { itemId: 'chapter-08-evaluation', why: '把可靠性指标说成可计算公式' },
      { itemId: 'chapter-09-safety-recovery', why: '处理注入、幂等和人工接管' },
      { itemId: 'chapter-10-production', why: '完成一轮系统设计串讲' },
      { itemId: 'appendix-interview-training', why: '用筛选、口答和自评完成闭环' },
    ],
  },
]

export interface ReadingStep {
  itemId: string
  path: string
  title: string
  why: string
}

export interface ReadingPath extends Omit<ReadingPathDefinition, 'steps'> {
  steps: ReadingStep[]
}

export const readingPaths: ReadingPath[] = readingPathDefinitions.map((path) => ({
  ...path,
  steps: path.steps.map((step) => {
    const item = getContentItem(step.itemId)
    return { ...step, path: item.route, title: item.title }
  }),
}))

export const readingPathById = Object.fromEntries(
  readingPaths.map((path) => [path.id, path]),
) as Record<ReadingPathId, ReadingPath>

export function findNextReadingStep(
  path: ReadingPath,
  currentPath: string,
  completed: string[],
): ReadingStep | undefined {
  const currentIndex = path.steps.findIndex((step) => step.path === currentPath)
  if (currentIndex >= 0) {
    return currentIndex < path.steps.length - 1 ? path.steps[currentIndex + 1] : undefined
  }
  return path.steps.find((step) => !completed.includes(step.path))
}
```

- [ ] **Step 4: Migrate chapter freshness and Markdown props**

Change `ChapterMeta.path` to `ChapterMeta.itemId`, export `chapterMetaByItemId`, and change the component prop to `itemId`. Mechanically update all 18 tags:

```md
<ChapterFreshness item-id="chapter-01-ai-native" />
<ChapterFreshness item-id="frontier-context-engineering" />
```

Use each file's exact ID from the approved 20-row table; do not touch surrounding prose.

Apply this complete file-to-ID mapping:

| Markdown file | itemId |
| --- | --- |
| `docs/chapters/01-ai-native.md` | `chapter-01-ai-native` |
| `docs/chapters/02-workflow-agent.md` | `chapter-02-workflow-agent` |
| `docs/chapters/03-react.md` | `chapter-03-react` |
| `docs/chapters/04-tools-mcp.md` | `chapter-04-tools-mcp` |
| `docs/chapters/05-state-memory.md` | `chapter-05-state-memory` |
| `docs/chapters/06-loop-graph.md` | `chapter-06-loop-graph` |
| `docs/chapters/07-multi-agent.md` | `chapter-07-multi-agent` |
| `docs/chapters/08-evaluation.md` | `chapter-08-evaluation` |
| `docs/chapters/09-safety-recovery.md` | `chapter-09-safety-recovery` |
| `docs/chapters/10-production.md` | `chapter-10-production` |
| `docs/chapters/11-research-agent.md` | `chapter-11-research-agent` |
| `docs/chapters/12-service-operations-agent.md` | `chapter-12-service-operations-agent` |
| `docs/chapters/13-coding-agent.md` | `chapter-13-coding-agent` |
| `docs/chapters/14-computer-use.md` | `chapter-14-computer-use` |
| `docs/frontier/context-engineering.md` | `frontier-context-engineering` |
| `docs/frontier/interoperability-identity.md` | `frontier-interoperability-identity` |
| `docs/frontier/durable-execution.md` | `frontier-durable-execution` |
| `docs/frontier/agent-security-evaluation.md` | `frontier-agent-security-evaluation` |

Use these exact type and lookup changes while leaving every version/source value unchanged:

```ts
export interface ChapterMeta {
  itemId: string
  lastVerified: string
  reviewBy: string
  versions: string[]
  sourceIds: string[]
  stability: ContentStability
}

export const chapterMetaByItemId = Object.fromEntries(
  chapterMeta.map((item) => [item.itemId, item]),
) as Record<string, ChapterMeta>
```

In `ChapterFreshness.vue`, use:

```ts
const props = defineProps<{ itemId: string }>()
const meta = computed(() => chapterMetaByItemId[props.itemId])
```

- [ ] **Step 5: Derive interview chapter paths**

Replace the hard-coded `chapterPaths` routes with an ID map and registry lookup:

```ts
const chapterItemIds: Record<number, string> = {
  1: 'chapter-01-ai-native',
  2: 'chapter-02-workflow-agent',
  3: 'chapter-03-react',
  4: 'chapter-04-tools-mcp',
  5: 'chapter-05-state-memory',
  6: 'chapter-06-loop-graph',
  7: 'chapter-07-multi-agent',
  8: 'chapter-08-evaluation',
  9: 'chapter-09-safety-recovery',
  10: 'chapter-10-production',
  11: 'chapter-11-research-agent',
  12: 'chapter-12-service-operations-agent',
  13: 'chapter-13-coding-agent',
  14: 'chapter-14-computer-use',
}

const path = getContentItem(chapterItemIds[chapter]).route
```

Keep all 42 IDs, questions, answers, roles, difficulty values, and chapter placement unchanged.

- [ ] **Step 6: Run migrated consumer tests and all existing content tests**

Run:

```bash
pnpm vitest run tests/course-map.spec.ts -t 'registry consumers'
pnpm vitest run tests/content.spec.ts
pnpm vitest run tests/interview-training.spec.ts
```

Expected: all tests pass; the existing 42-question counts and 18 freshness records remain unchanged.

- [ ] **Step 7: Verify the migrated consumers build**

Run: `pnpm build`
Expected: VitePress client and SSR bundles build, all 18 freshness blocks render, and dist validation passes.

- [ ] **Step 8: Commit the migration**

```bash
git add docs/.vitepress/theme/data docs/.vitepress/theme/components/ChapterFreshness.vue docs/chapters docs/frontier tests
git commit -m "refactor: derive learning routes from content registry"
```

### Task 5: Build the SSR-readable course map

**Files:**

- Create: `docs/.vitepress/theme/components/CourseMap.vue`
- Create: `docs/course/index.md`
- Modify: `docs/.vitepress/theme/index.ts:24-63`
- Modify: `tests/course-map.spec.ts`
- Modify: `tests/content.spec.ts`

- [ ] **Step 1: Write failing component and page contract tests**

Add:

```ts
describe('course page', () => {
  it('renders the complete curriculum from one component', () => {
    expect(existsSync('docs/course/index.md')).toBe(true)
    expect(readFileSync('docs/course/index.md', 'utf8')).toContain('<CourseMap />')
    const source = readFileSync('docs/.vitepress/theme/components/CourseMap.vue', 'utf8')
    expect(source).toContain('courseStages')
    expect(source).toContain('readCourseProgress')
    expect(source).toContain('本地进度将在页面加载后显示')
    expect(source).toContain('relationship-only')
    expect(source).not.toMatch(/<button/u)
    expect(source).not.toContain('saveLearningState')
    expect(source).not.toContain('fetch(')
  })

  it('registers the component without adding unfinished routes', () => {
    const theme = readFileSync('docs/.vitepress/theme/index.ts', 'utf8')
    expect(theme).toContain("'CourseMap'")
    const config = readFileSync('docs/.vitepress/config.mts', 'utf8')
    expect(config).not.toContain('/projects/')
    expect(config).not.toContain('/labs/')
  })
})
```

- [ ] **Step 2: Run page tests and verify RED**

Run: `pnpm vitest run tests/course-map.spec.ts tests/content.spec.ts -t 'course page'`
Expected: FAIL because the page and component do not exist.

- [ ] **Step 3: Implement `CourseMap.vue` as a read-only projection**

The component must:

- render all six stages and every published item from `courseMap` during SSR;
- render stage 6 as explanatory text with no anchor, action, or progress contribution;
- render the first four items of a long stage directly and the remaining items inside native `<details>` / `<summary>` markup, so every link exists in static HTML without forcing a long mobile screen;
- initialize with the neutral progress sentence;
- on mount, call only `readCourseProgress`, then compute stage and total progress;
- listen for `learningStateEvent` and browser `storage` events for `learningStorageKeys.progress`;
- show separate messages for `corrupt` and `blocked`;
- retain all course links when JavaScript or storage is unavailable;
- use semantic headings, `<ol role="list">`, `<nav aria-label="课程阶段">`, and named `<progress>` elements;
- contain no button and perform no storage write.

Use this component structure; keep all derived state inside this component and call no mutation helper:

```vue
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { withBase } from 'vitepress'
import { contentById } from '../data/contentRegistry'
import { courseItemById, courseStages, projectCourseProgress } from '../data/courseMap'
import {
  learningStateEvent,
  learningStorageKeys,
  readCourseProgress,
  type CourseProgressRead,
} from '../data/learningState'

const state = ref<CourseProgressRead | null>(null)
const projection = computed(() =>
  state.value?.status === 'available'
    ? projectCourseProgress(state.value.completed)
    : null,
)
const currentStageId = computed(() =>
  projection.value?.stages.find((stage) => stage.completed < stage.total)?.id ?? null,
)
const progressByStage = computed(() => new Map(
  projection.value?.stages.map((stage) => [stage.id, stage]) ?? [],
))

function prerequisiteText(itemId: string) {
  return courseItemById[itemId].prerequisites
    .map((id) => contentById[id].title)
    .join('、')
}

function refresh() {
  state.value = readCourseProgress()
}

function handleStorage(event: StorageEvent) {
  if (event.key === learningStorageKeys.progress) refresh()
}

onMounted(() => {
  refresh()
  window.addEventListener(learningStateEvent, refresh)
  window.addEventListener('storage', handleStorage)
})

onUnmounted(() => {
  window.removeEventListener(learningStateEvent, refresh)
  window.removeEventListener('storage', handleStorage)
})
</script>

<template>
  <nav class="course-map" aria-label="课程阶段">
    <header class="course-progress">
      <p v-if="state === null">本地进度将在页面加载后显示</p>
      <p v-else-if="state.status === 'blocked'">本地进度不可用</p>
      <p v-else-if="state.status === 'corrupt'">本地进度数据损坏</p>
      <template v-else-if="projection">
        <strong>
          {{ projection.completed === projection.total
            ? `当前公开课程已完成 · ${projection.completed} / ${projection.total}`
            : `当前公开课程 · ${projection.completed} / ${projection.total}` }}
        </strong>
        <progress
          :value="projection.completed"
          :max="projection.total"
          aria-label="课程总进度"
        />
      </template>
    </header>

    <ol class="course-stage-list" role="list">
      <li
        v-for="stage in courseStages"
        :key="stage.id"
        class="course-stage"
        :class="{ 'is-current': currentStageId === stage.id }"
      >
        <header>
          <span>{{ String(stage.order).padStart(2, '0') }}</span>
          <h2>{{ stage.title }}</h2>
          <p>{{ stage.purpose }}</p>
          <template v-if="stage.availability === 'published' && progressByStage.get(stage.id)">
            <small>
              {{ progressByStage.get(stage.id)?.completed }} /
              {{ progressByStage.get(stage.id)?.total }} 项完成
            </small>
            <progress
              :value="progressByStage.get(stage.id)?.completed"
              :max="progressByStage.get(stage.id)?.total"
              :aria-label="`${stage.title}进度`"
            />
          </template>
        </header>
        <p v-if="stage.availability === 'relationship-only'" class="course-stage-boundary">
          本阶段将在独立设计、实现与验收完成后接入；当前不计入进度。
        </p>
        <template v-else>
          <ol class="course-item-list" role="list">
            <li v-for="itemId in stage.itemIds.slice(0, 4)" :key="itemId" class="course-item">
              <a :href="withBase(contentById[itemId].route)">{{ contentById[itemId].title }}</a>
              <p>{{ courseItemById[itemId].outcome }}</p>
              <small v-if="courseItemById[itemId].prerequisites.length">
                先修：{{ prerequisiteText(itemId) }}
              </small>
              <small>完成证据：{{ courseItemById[itemId].evidence }}</small>
            </li>
          </ol>
          <details v-if="stage.itemIds.length > 4" class="course-stage-more">
            <summary>展开其余 {{ stage.itemIds.length - 4 }} 项</summary>
            <ol role="list">
              <li v-for="itemId in stage.itemIds.slice(4)" :key="itemId" class="course-item">
                <a :href="withBase(contentById[itemId].route)">{{ contentById[itemId].title }}</a>
                <p>{{ courseItemById[itemId].outcome }}</p>
                <small v-if="courseItemById[itemId].prerequisites.length">
                  先修：{{ prerequisiteText(itemId) }}
                </small>
                <small>完成证据：{{ courseItemById[itemId].evidence }}</small>
              </li>
            </ol>
          </details>
        </template>
      </li>
    </ol>
  </nav>
</template>
```

- [ ] **Step 4: Create the page and register the component**

Create `docs/course/index.md` with this content boundary:

```md
---
title: Agent 工程完整课程地图
description: 从基础认知到项目实战的课程依赖、学习目标与完成证据。
---

# Agent 工程完整课程地图

这是一张学习地图，不是另一份重复正文。课程按依赖关系组织已经发布的章节、专题与案例；如果你只想获得一条适合当前目标的短路线，请前往 [三条阅读路径](/paths/)。

<CourseMap />
```

Import and register `CourseMap` in `docs/.vitepress/theme/index.ts`.

- [ ] **Step 5: Run page tests and production build**

Run:

```bash
pnpm vitest run tests/course-map.spec.ts tests/content.spec.ts -t 'course page'
pnpm build
```

Expected: page contract tests pass; VitePress renders `/course/`; dist validation passes.

- [ ] **Step 6: Assert no-JavaScript output**

After build, test `docs/.vitepress/dist/course/index.html` contains every published route and the neutral progress sentence, but does not contain `/projects/`, `/labs/`, “标记已读”, or “加入书签”. This final route assertion must include the `course` registry item and remove Task 1's temporary unpublished-record exception. Add these assertions to `tests/course-map.spec.ts`, rebuild, and verify GREEN.

- [ ] **Step 7: Commit the course page**

```bash
git add docs/course/index.md docs/.vitepress/theme/components/CourseMap.vue docs/.vitepress/theme/index.ts tests
git commit -m "feat: add the public course map"
```

### Task 6: Expand tracking and reorganize navigation from the registry

**Files:**

- Modify: `docs/.vitepress/theme/components/ReadingProgress.vue:1-95`
- Modify: `docs/.vitepress/config.mts:1-133`
- Modify: `tests/course-map.spec.ts`
- Modify: `tests/content.spec.ts`

- [ ] **Step 1: Write failing tracking and navigation tests**

Add tests that require:

```ts
describe('course navigation integration', () => {
  it('tracks every published course item, not only selected path steps', () => {
    const progress = readFileSync('docs/.vitepress/theme/components/ReadingProgress.vue', 'utf8')
    expect(progress).toContain('publishedCourseItems')
    expect(progress).not.toContain('readingPaths.some')
  })

  it('derives grouped navigation from registry items', () => {
    const config = readFileSync('docs/.vitepress/config.mts', 'utf8')
    expect(config).toContain("from './theme/data/contentRegistry'")
    expect(config).toContain("text: '课程'")
    expect(config).toContain("text: '实战'")
    expect(config).toContain("text: '前沿'")
    expect(config).toContain("text: '复习'")
    expect(config).toContain("text: '课程入口'")
    expect(config).not.toMatch(/link:\s*'\/chapters\//u)
  })
})
```

- [ ] **Step 2: Run integration tests and verify RED**

Run: `pnpm vitest run tests/course-map.spec.ts -t 'course navigation integration'`
Expected: FAIL because tracking and config still use path arrays.

- [ ] **Step 3: Expand `ReadingProgress` tracking without changing its write contract**

Import `publishedCourseItems` and determine `tracked` from their registry-derived normalized routes. Continue to write the current normalized route into the existing progress/bookmark arrays. Keep selected reading path and next-step logic unchanged; a course item outside the selected path gets mark/bookmark actions but its fallback link is `/paths/`, not an invented next step.

Replace the current route/tracking block with this nullable-safe form:

```ts
import { publishedCourseItems } from '../data/courseMap'
import { getContentItem } from '../data/contentRegistry'
import { normalizeCourseRoute } from '../data/learningState'

const currentPath = computed(() => normalizeCourseRoute(route.path))
const trackedRoutes = new Set(
  publishedCourseItems
    .map((item) => normalizeCourseRoute(getContentItem(item.itemId).route))
    .filter((path): path is string => path !== null),
)
const tracked = computed(() => currentPath.value !== null && trackedRoutes.has(currentPath.value))
const nextStep = computed(() => currentPath.value === null
  ? undefined
  : findNextReadingStep(activePath.value, currentPath.value, state.value.completed))

function hasCurrent(key: 'completed' | 'bookmarks') {
  return currentPath.value !== null && state.value[key].includes(currentPath.value)
}

function toggle(key: 'completed' | 'bookmarks') {
  if (currentPath.value === null) return
  const items = state.value[key]
  const next = items.includes(currentPath.value)
    ? items.filter((item) => item !== currentPath.value)
    : [...items, currentPath.value]
  commit({ ...state.value, [key]: next })
}
```

Replace all four template membership expressions as well:

```vue
<button
  type="button"
  class="reading-action"
  :aria-pressed="hasCurrent('completed')"
  @click="toggle('completed')"
>
  {{ hasCurrent('completed') ? '撤销已读' : '标记已读' }}
</button>
<button
  type="button"
  class="reading-action"
  :aria-pressed="hasCurrent('bookmarks')"
  @click="toggle('bookmarks')"
>
  {{ hasCurrent('bookmarks') ? '取消书签' : '加入书签' }}
</button>
```

Remove the old `readingPaths.some(...)` tracking expression and every `state.*.includes(currentPath)` template expression. Do not add course-page write controls.

- [ ] **Step 4: Replace literal nav targets with registry lookups**

In `config.mts`, import `getContentItem` or `navigationItem`, build the four top-level dropdowns, and build sidebar chapter/frontier/resource entries by item ID. The intended top-level shape is:

```ts
nav: [
  { text: '课程', items: [navigationItem('course', 'nav'), navigationItem('preface', 'nav'), navigationItem('paths', 'nav')] },
  { text: '实战', items: [navigationItem('case-delivery-agent', 'nav')] },
  { text: '前沿', items: [navigationItem('radar'), navigationItem('frontier-context-engineering'), navigationItem('frontier-interoperability-identity'), navigationItem('frontier-durable-execution'), navigationItem('frontier-agent-security-evaluation')] },
  { text: '复习', items: [navigationItem('appendix-interview-training'), navigationItem('appendix-interview'), navigationItem('appendix-glossary')] },
]
```

Build every sidebar item with `navigationItem(id)` so it uses the canonical full title. Top-level compact entries use `navigationItem(id, 'nav')`; tests must assert `preface` renders “开始阅读” in the top menu and the full “序章 · 会聊天，不等于会做事” in the sidebar.

Use these exact ID lists for the sidebar:

```ts
const navItems = (ids: string[]) => ids.map((id) => navigationItem(id))

const sidebar = [
  { text: '课程入口', items: navItems(['course', 'paths']) },
  { text: '第一篇 · 认识 Agent', collapsed: false, items: navItems([
    'preface', 'chapter-01-ai-native', 'chapter-02-workflow-agent', 'chapter-03-react',
  ]) },
  { text: '第二篇 · 组装 Agent', collapsed: false, items: navItems([
    'chapter-04-tools-mcp', 'chapter-05-state-memory', 'chapter-06-loop-graph',
    'chapter-07-multi-agent',
  ]) },
  { text: '第三篇 · 敢于上线', collapsed: false, items: navItems([
    'chapter-08-evaluation', 'chapter-09-safety-recovery', 'chapter-10-production',
  ]) },
  { text: '第四篇 · 应用方向', collapsed: false, items: navItems([
    'chapter-11-research-agent', 'chapter-12-service-operations-agent',
    'chapter-13-coding-agent', 'chapter-14-computer-use',
  ]) },
  { text: '案例研究', items: navItems(['case-delivery-agent']) },
  { text: '活教材 · 前沿层', items: navItems([
    'radar', 'radar-2026-09', 'frontier-context-engineering',
    'frontier-interoperability-identity', 'frontier-durable-execution',
    'frontier-agent-security-evaluation',
  ]) },
  { text: '随手查', items: navItems([
    'appendix-glossary', 'appendix-review-checklist', 'appendix-reading',
    'appendix-application-matrix', 'appendix-chapter-template',
    'appendix-interview', 'appendix-interview-training',
  ]) },
]
```

Add the sidebar group `{ text: '课程入口', items: [navigationItem('course'), navigationItem('paths')] }` before the four chapter groups. Keep all current sidebar destinations present exactly once and preserve GitHub social navigation.

- [ ] **Step 5: Run tracking, navigation, and legacy route tests**

Run:

```bash
pnpm vitest run tests/course-map.spec.ts -t 'course navigation integration'
pnpm vitest run tests/content.spec.ts -t 'public navigation|application chapters|release configuration'
```

Expected: new integration tests and all legacy route checks pass.

- [ ] **Step 6: Verify the reorganized navigation builds**

Run: `pnpm build`
Expected: VitePress renders the registry-derived top nav/sidebar and dist validation passes with no missing route.

- [ ] **Step 7: Commit navigation integration**

```bash
git add docs/.vitepress/config.mts docs/.vitepress/theme/components/ReadingProgress.vue tests
git commit -m "refactor: route navigation through the course registry"
```

### Task 7: Style the course rail and document the entry point

**Files:**

- Modify: `docs/.vitepress/theme/style.css`
- Modify: `README.md`
- Modify: `tests/course-map.spec.ts`

- [ ] **Step 1: Write failing semantic and responsive style tests**

Require the component and CSS to include:

```ts
it('keeps the course rail semantic and responsive', () => {
  const component = readFileSync('docs/.vitepress/theme/components/CourseMap.vue', 'utf8')
  const style = readFileSync('docs/.vitepress/theme/style.css', 'utf8')
  expect(component).toContain('aria-label="课程阶段"')
  expect(component).toContain('role="list"')
  expect(component).toContain('aria-label="课程总进度"')
  expect(style).toContain('.course-map')
  expect(style).toContain('.course-stage')
  expect(style).toContain('.course-item')
  expect(style).toContain('@media (max-width: 700px)')
  expect(style).toContain('min-height: 44px')
  expect(style).toContain('.course-stage-more:not([open]) > *:not(summary)')
  expect(style).toContain('.course-stage-more > summary')
  expect(style).not.toContain('background-attachment: fixed')
})
```

- [ ] **Step 2: Run style tests and verify RED**

Run: `pnpm vitest run tests/course-map.spec.ts -t 'semantic and responsive'`
Expected: FAIL because course-specific styles are absent.

- [ ] **Step 3: Add restrained course styles**

Use existing `--reading-*` tokens. Desktop uses a vertical rail with numbered stages, thin rules, compact completion text, and no card-grid shadow. At `max-width: 700px`, use one column, preserve all text, keep links at least 44px tall, and use native `<details>` for stages longer than four items. Add focus-visible, print, dark mode, and reduced-motion rules without new saturated backgrounds or continuous animation.

Append this complete course-specific block to `style.css`:

```css
.course-map {
  margin: 2.5rem 0;
  color: var(--reading-text);
}

.course-progress {
  display: grid;
  gap: 0.55rem;
  margin-bottom: 2rem;
  padding: 1rem 0;
  border-block: 1px solid var(--reading-rule);
}

.course-progress p,
.course-progress strong {
  margin: 0;
}

.course-progress progress,
.course-stage progress {
  width: 100%;
  height: 0.42rem;
  accent-color: var(--reading-success);
}

.course-stage-list,
.course-item-list,
.course-stage-more ol {
  margin: 0;
  padding: 0;
  list-style: none;
}

.course-stage-list {
  border-top: 1px solid var(--reading-rule);
}

.course-stage {
  display: grid;
  grid-template-columns: minmax(11rem, 0.42fr) 1fr;
  gap: 1.25rem 2rem;
  padding: 2rem 0;
  border-bottom: 1px solid var(--reading-rule);
}

.course-stage.is-current {
  box-shadow: inset 4px 0 0 var(--reading-link);
  padding-left: 1rem;
}

.course-stage > header {
  display: grid;
  gap: 0.45rem;
  align-content: start;
}

.course-stage > header > span,
.course-stage > header > small,
.course-item small {
  color: var(--reading-text-soft);
  font-family: var(--vp-font-family-mono);
  font-size: 0.72rem;
}

.course-stage h2 {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 1.55rem;
}

.course-stage header p,
.course-item p,
.course-stage-boundary {
  margin: 0;
  color: var(--reading-text-soft);
  font-size: 0.9rem;
  line-height: 1.65;
}

.course-item-list,
.course-stage-more ol {
  display: grid;
  gap: 0.75rem;
}

.course-item {
  display: grid;
  gap: 0.3rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--reading-rule);
}

.course-item a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: var(--reading-text);
  font-weight: 800;
}

.course-item a:hover,
.course-item a:focus-visible {
  color: var(--reading-link);
}

.course-stage-more {
  grid-column: 2;
}

.course-stage-more summary {
  min-height: 44px;
  cursor: pointer;
  color: var(--reading-link);
  font-weight: 750;
}

.course-stage-more summary:focus-visible,
.course-item a:focus-visible {
  border-radius: 2px;
  outline: 3px solid var(--reading-link);
  outline-offset: 3px;
}

.course-stage-boundary {
  padding: 1rem;
  border: 1px dashed var(--reading-rule);
  background: var(--reading-bg-soft);
}

@media (max-width: 700px) {
  .course-stage {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .course-stage-more {
    grid-column: 1;
  }
}

@media print {
  .course-stage-more > summary,
  .course-progress progress,
  .course-stage progress {
    display: none;
  }

  .course-stage-more:not([open]) > *:not(summary) {
    display: block !important;
  }

  .course-stage,
  .course-item {
    break-inside: avoid;
  }
}
```

- [ ] **Step 4: Update README**

Add the public `/course/` link and state clearly:

- course map = complete curriculum;
- paths = goal-oriented subset;
- progress remains local-only and optional;
- project pages and Python labs are separate future deliverables, not present in this phase.

- [ ] **Step 5: Run style tests and full unit suite**

Run:

```bash
pnpm vitest run tests/course-map.spec.ts
pnpm test
pnpm validate
```

Expected: course tests and all existing tests pass; content validation reports `content validation passed`.

- [ ] **Step 6: Commit presentation and docs**

```bash
git add docs/.vitepress/theme/style.css README.md tests/course-map.spec.ts
git commit -m "feat: present the course map accessibly"
```

### Task 8: Final build, static audit, and browser acceptance

**Files:**

- Modify only if a failing acceptance check reveals an in-scope defect in files listed above.

- [ ] **Step 1: Run the complete automated gate**

```bash
pnpm test
pnpm validate
pnpm build
GITHUB_TOKEN="$(gh auth token)" pnpm sources:check
git diff --check
```

Expected: all tests pass, validation/build/dist pass, the source report has no definite failures, and no whitespace errors exist.

- [ ] **Step 2: Verify static HTML and all route forms**

Start the built preview on an unused port:

```bash
pnpm preview -- --port 4174
```

Verify `/course`, `/course/`, `/paths`, `/paths/`, representative chapter/frontier routes with and without trailing slashes, and all old navigation targets return HTTP 200. Inspect `docs/.vitepress/dist/course/index.html` directly and confirm it contains the 20 published item links, stage 6 relationship text, and the neutral progress sentence with no project/lab dead links.

- [ ] **Step 3: Verify desktop, mobile, keyboard, and local-state behavior**

Use a named browser session:

```bash
agent-browser --session course-map set viewport 1440 1000
agent-browser --session course-map open http://127.0.0.1:4174/agent-engineering-for-beginners/course/
agent-browser --session course-map snapshot -i
agent-browser --session course-map set viewport 390 844
agent-browser --session course-map set media dark
agent-browser --session course-map open http://127.0.0.1:4174/agent-engineering-for-beginners/course/
agent-browser --session course-map snapshot -i
```

Expected:

- `document.documentElement.scrollWidth === window.innerWidth` at both widths;
- all six stages are discoverable in reading order; expand each native stage disclosure before checking all 20 published links;
- keyboard focus follows stage order and is visibly outlined;
- native list/heading/progress names appear in the accessibility snapshot;
- no-JavaScript/static output remains useful;
- blocked storage shows unavailable, corrupt progress shows damaged, and corrupt bookmarks/mastery alone do not affect course progress;
- marking a chapter on its content page or `/paths/` updates `/course/` after navigation/refresh;
- no mark, bookmark, clear, login, cloud sync, project, or lab action appears on `/course/`.

- [ ] **Step 4: Verify closed disclosures print all course items**

Leave every stage `<details>` closed, then generate a print PDF and extract its text:

```bash
agent-browser --session course-map open http://127.0.0.1:4174/agent-engineering-for-beginners/course/
agent-browser --session course-map pdf /tmp/course-map.pdf
pdftotext /tmp/course-map.pdf /tmp/course-map.txt
rg -n "交付型 Agent 的质量门|Agent 互操作与身份|Agent 安全评测" /tmp/course-map.txt
```

Expected: all three titles are present even though they occur after the fourth item in their stage or near the end of the curriculum; no “展开其余” summary text is printed. If `pdftotext` is unavailable, use the browser print media emulation and assert every `.course-stage-more > ol` has computed `display` other than `none` while every `.course-stage-more > summary` has `display: none`.

- [ ] **Step 5: Verify compatibility and public boundary**

Check the existing homepage, all 14 chapters, four frontier topics, Radar, paths, interview index/trainer, glossary, and delivery case. Confirm process documents remain excluded from dist and no external image was added.

- [ ] **Step 6: Commit only evidence-driven corrections if needed**

If acceptance revealed an in-scope defect, add its failing regression test first, make the smallest correction, rerun Steps 1–4, then commit:

```bash
git add docs/.vitepress docs/course README.md tests
git commit -m "fix: close course map acceptance gaps"
```

If no correction was needed, do not create an empty commit.

## Plan self-review

- Every requirement in `docs/superpowers/specs/2026-09-25-course-map-navigation-design.md` maps to a task and an executable check.
- The plan keeps `/course/` read-only and preserves all four existing localStorage keys and values.
- Cross-origin absolute URLs, base/query/hash/HTML/index/trailing-slash normalization, unknown legacy routes, and progress-only reads have explicit tests.
- Corrupt progress is distinct from blocked storage; corrupt bookmarks or interview mastery cannot poison course progress.
- The 20-item denominator, first-incomplete current stage, 20/20 completion, and relationship-only exclusion are deterministic.
- Route/title literals move to one registry before course, path, freshness, interview, and navigation consumers migrate.
- No task creates project content, Python labs, images, extra interview questions, backend services, accounts, or copied chapter prose.
- Commits are small and independently verifiable; implementation does not begin until this plan is reviewed and the execution approach is chosen.
