<script setup lang="ts">
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import { contentById } from '../data/contentRegistry'
import { courseItemById, courseItems, courseStages } from '../data/courseMap'

const activeId = ref('chapter-09-safety-recovery')

const downstreamById = computed(() => {
  const downstream = new Map<string, string[]>()
  for (const item of courseItems) {
    for (const prerequisite of item.prerequisites) {
      const targets = downstream.get(prerequisite) ?? []
      targets.push(item.itemId)
      downstream.set(prerequisite, targets)
    }
  }
  return downstream
})

const activeItem = computed(() => courseItemById[activeId.value])
const activeContent = computed(() => contentById[activeId.value])
const upstreamIds = computed(() => activeItem.value?.prerequisites ?? [])
const downstreamIds = computed(() => downstreamById.value.get(activeId.value) ?? [])

function shortTitle(itemId: string) {
  return contentById[itemId].title
    .replace(/^序章 · /, '')
    .replace(/^\d{2} · /, '')
    .replace(/源码拆解$/, '')
}

function nodeType(itemId: string) {
  const kind = contentById[itemId].kind
  if (kind === 'frontier') return '专题'
  if (kind === 'project') return '项目'
  if (kind === 'case-study') return '案例'
  return '主干'
}
</script>

<template>
  <figure class="knowledge-graph diagram-shell" aria-labelledby="knowledge-graph-title">
    <figcaption>
      <span>KNOWLEDGE GRAPH / 全书总图</span>
      <strong id="knowledge-graph-title">从控制方式到交付证据，六层搭起一个完整 Agent 系统。</strong>
      <p>选择任一节点，查看它依赖什么、又为哪些能力提供基础。节点可直接进入对应章节、专题或项目。</p>
    </figcaption>

    <div class="knowledge-graph-legend" aria-label="节点类型图例">
      <span data-kind="chapter">主干章节</span>
      <span data-kind="frontier">前沿专题</span>
      <span data-kind="project">源码项目</span>
      <span data-kind="case-study">交付案例</span>
    </div>

    <ol class="knowledge-layer-list" role="list">
      <li
        v-for="stage in courseStages"
        :key="stage.id"
        class="knowledge-layer"
        :data-stage="stage.id"
      >
        <header>
          <span>L{{ stage.order }}</span>
          <div>
            <strong>{{ stage.title }}</strong>
            <small>{{ stage.purpose }}</small>
          </div>
        </header>

        <div v-if="stage.itemIds.length" class="knowledge-node-list">
          <article
            v-for="itemId in stage.itemIds"
            :key="itemId"
            class="knowledge-node"
            :class="{ 'is-active': activeId === itemId }"
            :data-kind="contentById[itemId].kind"
          >
            <button
              type="button"
              :aria-pressed="activeId === itemId"
              :aria-label="`查看 ${contentById[itemId].title} 的知识关系`"
              @click="activeId = itemId"
            >
              <small>{{ nodeType(itemId) }}</small>
              <strong>{{ shortTitle(itemId) }}</strong>
            </button>
            <a :href="withBase(contentById[itemId].route)" :aria-label="`进入 ${contentById[itemId].title}`">进入 ↗</a>
          </article>
        </div>

        <div v-else class="knowledge-layer-future">
          <strong>综合设计与可运行 Lab</strong>
          <span>把前五层组合成一份可评审、可运行、可恢复的最终交付。</span>
        </div>
      </li>
    </ol>

    <aside v-if="activeItem && activeContent" class="knowledge-inspector" aria-live="polite">
      <header>
        <span>当前节点</span>
        <strong>{{ activeContent.title }}</strong>
        <a :href="withBase(activeContent.route)">开始阅读 →</a>
      </header>

      <div>
        <section>
          <h3>直接先修</h3>
          <ul v-if="upstreamIds.length">
            <li v-for="itemId in upstreamIds" :key="`up-${itemId}`">
              <button type="button" @click="activeId = itemId">← {{ shortTitle(itemId) }}</button>
            </li>
          </ul>
          <p v-else>这是知识图谱的起点。</p>
        </section>

        <section>
          <h3>直接去向</h3>
          <ul v-if="downstreamIds.length">
            <li v-for="itemId in downstreamIds" :key="`down-${itemId}`">
              <button type="button" @click="activeId = itemId">{{ shortTitle(itemId) }} →</button>
            </li>
          </ul>
          <p v-else>这是当前公开图谱的叶子节点。</p>
        </section>

        <section>
          <h3>学完产出</h3>
          <p>{{ activeItem.evidence }}</p>
        </section>
      </div>
    </aside>
  </figure>
</template>
