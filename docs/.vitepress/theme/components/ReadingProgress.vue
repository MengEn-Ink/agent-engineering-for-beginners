<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, withBase } from 'vitepress'
import { findNextReadingStep, readingPathById, readingPaths } from '../data/readingPaths'
import {
  announceLearningState,
  emptyLearningState,
  learningStateEvent,
  loadLearningState,
  normalizeLearningPath,
  saveLearningState,
  type LearningState,
} from '../data/learningState'

const route = useRoute()
const state = ref<LearningState>(emptyLearningState())
const storageAvailable = ref(true)
const currentPath = computed(() => normalizeLearningPath(route.path))
const activePath = computed(() => readingPathById[state.value.selectedPath])
const tracked = computed(() =>
  readingPaths.some((path) => path.steps.some((step) => step.path === currentPath.value)),
)
const completedCount = computed(() =>
  activePath.value.steps.filter((step) => state.value.completed.includes(step.path)).length,
)
const nextStep = computed(() =>
  findNextReadingStep(activePath.value, currentPath.value, state.value.completed),
)

function refresh() {
  state.value = loadLearningState()
}

function commit(next: LearningState) {
  state.value = next
  const saved = saveLearningState(next)
  storageAvailable.value = saved
  if (saved) announceLearningState()
}

function toggle(key: 'completed' | 'bookmarks') {
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
        :aria-pressed="state.completed.includes(currentPath)"
        @click="toggle('completed')"
      >
        {{ state.completed.includes(currentPath) ? '撤销已读' : '标记已读' }}
      </button>
      <button
        type="button"
        class="reading-action"
        :aria-pressed="state.bookmarks.includes(currentPath)"
        @click="toggle('bookmarks')"
      >
        {{ state.bookmarks.includes(currentPath) ? '取消书签' : '加入书签' }}
      </button>
      <a v-if="nextStep" class="reading-next" :href="withBase(nextStep.path)">
        下一站 · {{ nextStep.title }} →
      </a>
      <a v-else class="reading-next" :href="withBase('/paths/')">查看阅读路线 →</a>
    </div>
  </aside>
</template>

