<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { chapterMetaByPath, type ContentStability } from '../data/chapterMeta'

const props = defineProps<{ path: string }>()
const meta = computed(() => chapterMetaByPath[props.path])
const overdue = ref(false)

const stabilityLabels: Record<ContentStability, string> = {
  evergreen: '常青',
  evolving: '持续演进',
  frontier: '前沿观察',
}

onMounted(() => {
  const today = new Date().toISOString().slice(0, 10)
  overdue.value = Boolean(meta.value && meta.value.reviewBy < today)
})
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

