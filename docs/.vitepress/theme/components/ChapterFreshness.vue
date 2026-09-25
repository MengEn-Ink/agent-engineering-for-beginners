<script setup lang="ts">
import { computed } from 'vue'
import { chapterMetaByPath, isReviewOverdue, type ContentStability } from '../data/chapterMeta'

const props = defineProps<{ path: string }>()
const meta = computed(() => chapterMetaByPath[props.path])
const overdue = computed(() => Boolean(meta.value && isReviewOverdue(meta.value.reviewBy)))

const stabilityLabels: Record<ContentStability, string> = {
  evergreen: '常青',
  evolving: '持续演进',
  frontier: '前沿观察',
}

</script>

<template>
  <aside
    v-if="meta"
    class="chapter-freshness"
    :class="`is-${meta.stability}`"
    aria-label="内容新鲜度"
  >
    <div class="freshness-heading">
      <span class="freshness-stability">{{ stabilityLabels[meta.stability] }}</span>
      <strong :class="{ 'is-overdue': overdue }" aria-live="polite">
        {{ overdue ? '需要复核' : '已核验' }}
      </strong>
    </div>
    <dl>
      <div>
        <dt>最后核验</dt>
        <dd><time :datetime="meta.lastVerified">{{ meta.lastVerified }}</time></dd>
      </div>
      <div>
        <dt>下次复核</dt>
        <dd><time :datetime="meta.reviewBy">{{ meta.reviewBy }}</time></dd>
      </div>
    </dl>
    <div class="freshness-versions">
      <span>版本关注</span>
      <ul role="list">
        <li v-for="version in meta.versions" :key="version">{{ version }}</li>
      </ul>
    </div>
  </aside>
</template>

