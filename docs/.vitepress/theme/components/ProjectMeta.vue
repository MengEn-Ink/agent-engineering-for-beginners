<script setup lang="ts">
import { computed } from 'vue'
import { getProjectPage, getProjectSubject, projectSourceUrl } from '../data/projectCatalog'

const props = defineProps<{ projectId: string }>()
const page = computed(() => getProjectPage(props.projectId))
const subjects = computed(() => page.value.subjects.map(getProjectSubject))
const tierLabel = computed(() => page.value.catalog_tier === 'core' ? '核心拆解' : '历史反例')
const statusLabels: Record<string, string> = { active: '活跃', archived: '已归档', eol: '已停止维护' }
const statusLabel = (status: string) => statusLabels[status] ?? status
</script>

<template>
  <aside class="project-meta" aria-label="项目版本与许可边界">
    <p><strong>教学层级：</strong>{{ tierLabel }}</p>
    <ul role="list">
      <li v-for="subject in subjects" :key="subject.id" role="listitem">
        <a :href="subject.canonical_url">{{ subject.canonical_repo }}</a>
        <span><strong>固定版本：</strong>{{ subject.pinned_ref }} · <code>{{ subject.pinned_commit }}</code></span>
        <span><strong>仓库状态：</strong>{{ statusLabel(subject.repository_status) }}<template v-if="subject.archived"> · GitHub 已归档</template></span>
        <span><strong>核验：</strong>{{ subject.verified_at }}，下次 {{ subject.review_by }}</span>
        <a :href="subject.watch_url">检查上游更新</a>
        <details>
          <summary>许可证边界</summary>
          <p>{{ subject.license_summary }}</p>
          <ul role="list">
            <li
              v-for="scope in subject.license_scopes"
              :key="`${scope.expression}-${scope.path_or_glob ?? scope.selector}`"
              role="listitem"
            >
              <code>{{ scope.basis }}</code> · <code>{{ scope.expression }}</code> ·
              <code>{{ scope.path_or_glob ?? scope.selector }}</code> · {{ scope.scope }} — {{ scope.note }}
            </li>
          </ul>
          <p>
            许可证原文：
            <a
              v-for="source in subject.license_sources"
              :key="source.path"
              :href="projectSourceUrl(subject.id, source.path)"
            ><code>{{ source.path }}</code></a>
          </p>
        </details>
        <div class="project-license-print" aria-hidden="true">
          <p><strong>许可证摘要：</strong>{{ subject.license_summary }}</p>
          <ul>
            <li
              v-for="scope in subject.license_scopes"
              :key="`print-${scope.expression}-${scope.path_or_glob ?? scope.selector}`"
            >
              {{ scope.basis }} · {{ scope.expression }} · {{ scope.path_or_glob ?? scope.selector }} · {{ scope.scope }} — {{ scope.note }}
            </li>
          </ul>
          <p
            v-for="source in subject.license_sources"
            :key="`print-license-${source.path}`"
            class="project-license-print-url"
          >
            许可证原文：{{ projectSourceUrl(subject.id, source.path) }}
          </p>
        </div>
      </li>
    </ul>
  </aside>
</template>
