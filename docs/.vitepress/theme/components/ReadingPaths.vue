<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { withBase } from 'vitepress'
import { readingPathById, readingPaths, type ReadingPath } from '../data/readingPaths'
import {
  announceLearningState,
  clearLearningState,
  emptyLearningState,
  learningStateEvent,
  loadLearningState,
  saveLearningState,
  type LearningState,
} from '../data/learningState'

const state = ref<LearningState>(emptyLearningState())
const storageAvailable = ref(true)
const activePath = computed(() => readingPathById[state.value.selectedPath])
const completedCount = computed(() =>
  activePath.value.steps.filter((step) => state.value.completed.includes(step.path)).length,
)

function refresh() {
  state.value = loadLearningState()
}

function commit(next: LearningState) {
  state.value = next
  storageAvailable.value = saveLearningState(next)
  announceLearningState()
}

function selectPath(id: ReadingPath['id']) {
  commit({ ...state.value, selectedPath: id })
}

function toggleList(key: 'completed' | 'bookmarks', path: string) {
  const items = state.value[key]
  const next = items.includes(path) ? items.filter((item) => item !== path) : [...items, path]
  commit({ ...state.value, [key]: next })
}

function clearLocalRecords() {
  if (!window.confirm('清除当前浏览器中的阅读路径、进度和书签？此操作无法撤销。')) return
  storageAvailable.value = clearLearningState()
  state.value = emptyLearningState()
}

onMounted(() => {
  refresh()
  window.addEventListener(learningStateEvent, refresh)
})

onUnmounted(() => window.removeEventListener(learningStateEvent, refresh))
</script>

<template>
  <section class="reading-paths" aria-label="阅读路径与本地进度">
    <header class="reading-paths-intro">
      <span>LOCAL-FIRST STUDY MAP</span>
      <h2>选路线，不复制正文</h2>
      <p>选择只会改变推荐顺序。进度和书签仅存于当前浏览器，不会上传账号或服务器。</p>
    </header>

    <div class="path-picker" aria-label="选择阅读路径">
      <button
        v-for="path in readingPaths"
        :key="path.id"
        type="button"
        class="path-choice reading-action"
        :aria-pressed="state.selectedPath === path.id"
        @click="selectPath(path.id)"
      >
        <strong>{{ path.title }}</strong>
        <span>{{ path.pace }}</span>
        <small>{{ path.summary }}</small>
      </button>
    </div>

    <div class="path-summary" aria-live="polite">
      <div>
        <span>当前路线</span>
        <strong>{{ activePath.title }}</strong>
      </div>
      <p>{{ completedCount }} / {{ activePath.steps.length }} 站完成</p>
      <progress :value="completedCount" :max="activePath.steps.length">
        {{ completedCount }} / {{ activePath.steps.length }}
      </progress>
    </div>

    <ol class="path-step-list">
      <li
        v-for="(step, index) in activePath.steps"
        :key="step.path"
        class="path-step"
        :class="{ 'is-complete': state.completed.includes(step.path) }"
      >
        <span class="path-step-index">{{ String(index + 1).padStart(2, '0') }}</span>
        <div>
          <a :href="withBase(step.path)">{{ step.title }}</a>
          <p>{{ step.why }}</p>
        </div>
        <div class="path-step-actions">
          <button
            type="button"
            class="reading-action"
            :aria-pressed="state.completed.includes(step.path)"
            @click="toggleList('completed', step.path)"
          >
            {{ state.completed.includes(step.path) ? '撤销已读' : '标记已读' }}
          </button>
          <button
            type="button"
            class="reading-action"
            :aria-pressed="state.bookmarks.includes(step.path)"
            @click="toggleList('bookmarks', step.path)"
          >
            {{ state.bookmarks.includes(step.path) ? '取消书签' : '加入书签' }}
          </button>
        </div>
      </li>
    </ol>

    <p v-if="!storageAvailable" class="storage-warning" role="status">
      浏览器禁止了本地存储，本次操作只在当前页面有效。
    </p>
    <button type="button" class="reading-action clear-learning" @click="clearLocalRecords">
      清除本地记录
    </button>
  </section>
</template>

