<script setup lang="ts">
import { computed } from 'vue'
import { getProjectPage, getProjectSubject, projectSourceUrl } from '../data/projectCatalog'

const props = defineProps<{ projectId: string }>()
const rows = computed(() => getProjectPage(props.projectId).subjects.flatMap((subjectId) => {
  const subject = getProjectSubject(subjectId)
  return subject.entrypoints.map((entry) => ({
    subjectId,
    repo: subject.canonical_repo,
    path: entry.path,
    symbols: entry.symbols,
    responsibility: entry.responsibility,
    href: projectSourceUrl(subjectId, entry.path),
  }))
}))
</script>

<template>
  <ol class="project-source-links" role="list">
    <li v-for="row in rows" :key="`${row.subjectId}:${row.path}`" role="listitem">
      <a :href="row.href"><code>{{ row.path }}</code></a>
      <strong>{{ row.symbols.join(' · ') }}</strong>
      <span>{{ row.responsibility }}</span>
      <small>{{ row.repo }} · 固定 commit</small>
    </li>
  </ol>
</template>
