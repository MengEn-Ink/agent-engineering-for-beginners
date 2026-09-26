<script setup lang="ts">
import { computed } from 'vue'
import { getProjectChain, getProjectPage, getProjectSubject } from '../data/projectCatalog'
import type { ProjectChainStep, ProjectSubject } from '../data/projectCatalogTypes'

type ProjectChainViewStep = ProjectChainStep & { subject: ProjectSubject }

const props = defineProps<{ projectId: string }>()
const page = computed(() => getProjectPage(props.projectId))
const chain = computed(() => getProjectChain(page.value.primary_chain_id!))
const tracks = computed(() => {
  const grouped = new Map<string, ProjectChainViewStep[]>()
  for (const step of chain.value.steps) {
    const key = step.track ?? 'main'
    grouped.set(key, [...(grouped.get(key) ?? []), {
      ...step,
      subject: getProjectSubject(step.subject_id),
    }])
  }
  return [...grouped].map(([id, steps]) => ({ id, label: id === 'main' ? '主链' : id, steps }))
})
const architectureLabel = computed(() => tracks.value
  .map((track) => `${track.label}：${track.steps.map((step) => step.label).join('，然后')}`)
  .join('；'))
</script>

<template>
  <section class="project-chain-section" :aria-labelledby="`${projectId}-chain-title`">
    <h3 :id="`${projectId}-chain-title`">{{ chain.label }}</h3>
    <figure
      class="project-architecture"
      role="img"
      :aria-label="`本书原创架构关系图：${chain.label}。${architectureLabel}。`"
    >
      <figcaption>本书归纳 · 原创建筑关系图</figcaption>
      <div class="project-architecture-tracks" aria-hidden="true">
        <div v-for="track in tracks" :key="`visual-${track.id}`" class="project-architecture-track">
          <strong v-if="track.id !== 'main'">{{ track.label }}</strong>
          <div class="project-architecture-nodes">
            <span v-for="step in track.steps" :key="`visual-${step.id}`">{{ step.label }}</span>
          </div>
        </div>
      </div>
    </figure>
    <p class="project-chain-reading"><strong>怎么看：</strong>{{ chain.reading_hint }}</p>
    <section v-for="track in tracks" :key="`text-${track.id}`" class="project-chain-track-group">
      <h4 v-if="track.id !== 'main'">{{ track.label }}</h4>
      <ol class="project-call-chain" role="list" :aria-label="`${track.label}源码调用链文本版`">
        <li v-for="step in track.steps" :key="step.id" role="listitem">
          <strong>{{ step.label }}</strong>
          <span><b>源码事实：</b><code>{{ step.source_path }} · {{ step.symbol }}</code></span>
          <small class="project-chain-provenance">
            版本证据：{{ step.subject.canonical_repo }} · {{ step.subject.pinned_ref }} ·
            <code>{{ step.subject.pinned_commit }}</code>
          </small>
          <span><b>本书归纳：</b>{{ step.responsibility }}</span>
        </li>
      </ol>
    </section>
    <p class="project-chain-warning"><strong>不要误解：</strong>{{ chain.misconception }}</p>
  </section>
</template>
