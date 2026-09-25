<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, withBase } from 'vitepress'
import { publishedCourseItems } from '../data/courseMap'
import { getContentItem } from '../data/contentRegistry'
import { findNextReadingStep, readingPathById, readingPaths } from '../data/readingPaths'
import {
  announceLearningState,
  emptyLearningState,
  learningStateEvent,
  loadLearningState,
  normalizeCourseRoute,
  saveLearningState,
  type LearningState,
} from '../data/learningState'

const route = useRoute()
const state = ref<LearningState>(emptyLearningState())
const storageAvailable = ref(true)
const currentPath = computed(() => normalizeCourseRoute(route.path))
const trackedRoutes = new Set(
  [
    ...publishedCourseItems.map((item) => getContentItem(item.itemId).route),
    ...readingPaths.flatMap((path) => path.steps.map((step) => step.path)),
  ]
    .map((path) => normalizeCourseRoute(path))
    .filter((path): path is string => path !== null),
)
const activePath = computed(() => readingPathById[state.value.selectedPath])
const tracked = computed(() => currentPath.value !== null && trackedRoutes.has(currentPath.value))
const completedCount = computed(() =>
  activePath.value.steps.filter((step) => state.value.completed.includes(step.path)).length,
)
const nextStep = computed(() => currentPath.value === null
  || !activePath.value.steps.some((step) => step.path === currentPath.value)
  ? undefined
  : findNextReadingStep(activePath.value, currentPath.value, state.value.completed))

function refresh() {
  state.value = loadLearningState()
}

function commit(next: LearningState) {
  state.value = next
  const saved = saveLearningState(next)
  storageAvailable.value = saved
  if (saved) announceLearningState()
}

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

onMounted(() => {
  refresh()
  window.addEventListener(learningStateEvent, refresh)
})

onUnmounted(() => window.removeEventListener(learningStateEvent, refresh))
</script>

<template>
  <aside v-if="tracked" class="reading-progress" aria-label="本地阅读进度">
    <div class="reading-progress-copy">
      <span>本地阅读 · {{ activePath.title }}</span>
      <strong>{{ completedCount }} / {{ activePath.steps.length }} 站完成</strong>
      <progress
        :value="completedCount"
        :max="activePath.steps.length"
        aria-label="阅读进度"
      >
        {{ completedCount }} / {{ activePath.steps.length }}
      </progress>
      <small>{{ storageAvailable ? '仅存于当前浏览器' : '本地存储不可用，本页操作不会保留' }}</small>
    </div>
    <div class="reading-progress-actions">
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
      <a v-if="nextStep" class="reading-next" :href="withBase(nextStep.path)">
        下一站 · {{ nextStep.title }} →
      </a>
      <a v-else class="reading-next" :href="withBase('/paths/')">查看阅读路线 →</a>
    </div>
  </aside>
</template>

