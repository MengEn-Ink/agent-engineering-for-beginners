<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { getContentItem } from '../data/contentRegistry'
import { courseItemById } from '../data/courseMap'
import { getProjectSubject, projectCatalog } from '../data/projectCatalog'

const corePages = computed(() => projectCatalog.pages.filter((page) =>
  page.catalog_tier === 'core' && page.page_item_id !== 'projects-index',
))
const historicalPages = computed(() => projectCatalog.pages.filter((page) => page.catalog_tier === 'historical'))
const watchSubjects = computed(() => projectCatalog.subjects.filter((subject) => subject.catalog_tier === 'watch-only'))
const courseItemFor = (itemId: string) => Object.hasOwn(courseItemById, itemId) ? courseItemById[itemId] : null
const prerequisiteText = (itemId: string) => courseItemFor(itemId)?.prerequisites
  .map((id) => getContentItem(id).title).join('、') ?? ''
const subjectStatus = (subjectId: string) => {
  const subject = getProjectSubject(subjectId)
  return `${subject.pinned_ref} · ${subject.repository_status}`
}
const safetyLinks = [
  getContentItem('frontier-agent-security-evaluation'),
  getContentItem('chapter-09-safety-recovery'),
  getContentItem('radar'),
]
</script>

<template>
  <nav class="project-overview" aria-label="开源项目拆解目录">
    <section aria-labelledby="project-core-title">
      <h2 id="project-core-title">核心源码拆解</h2>
      <ol role="list">
        <li v-for="page in corePages" :key="page.page_item_id" role="listitem">
          <a :href="withBase(getContentItem(page.page_item_id).route)">{{ getContentItem(page.page_item_id).title }}</a>
          <span>{{ page.subjects.map(subjectStatus).join('；') }}</span>
          <p v-if="courseItemFor(page.page_item_id)">{{ courseItemFor(page.page_item_id)?.outcome }}</p>
          <small v-if="prerequisiteText(page.page_item_id)">先修：{{ prerequisiteText(page.page_item_id) }}</small>
        </li>
      </ol>
    </section>
    <section aria-labelledby="project-history-title">
      <h2 id="project-history-title">历史反例</h2>
      <ul role="list">
        <li v-for="page in historicalPages" :key="page.page_item_id" role="listitem">
          <a :href="withBase(getContentItem(page.page_item_id).route)">{{ getContentItem(page.page_item_id).title }}</a>
        </li>
      </ul>
    </section>
    <section aria-labelledby="project-watch-title">
      <h2 id="project-watch-title">前沿高权限观察区</h2>
      <p>这些项目不是初学者默认安装步骤，也不计入课程完成度。</p>
      <ul role="list">
        <li v-for="subject in watchSubjects" :key="subject.id" role="listitem">
          <a :href="subject.canonical_url">{{ subject.canonical_repo }}</a> · {{ subject.pinned_ref }} · watch-only
          <span v-for="tag in subject.risk_tags" :key="tag" class="project-risk-tag">{{ tag }}</span>
        </li>
      </ul>
      <p class="project-safety-links">
        安全延伸：<a v-for="item in safetyLinks" :key="item.id" :href="withBase(item.route)">{{ item.title }}</a>
      </p>
    </section>
  </nav>
</template>
