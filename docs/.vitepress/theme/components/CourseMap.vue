<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { withBase } from 'vitepress'
import { contentById } from '../data/contentRegistry'
import { courseItemById, courseStages, projectCourseProgress } from '../data/courseMap'
import {
  learningStateEvent,
  learningStorageKeys,
  readCourseProgress,
  type CourseProgressRead,
} from '../data/learningState'

const state = ref<CourseProgressRead | null>(null)
const projection = computed(() =>
  state.value?.status === 'available'
    ? projectCourseProgress(state.value.completed)
    : null,
)
const currentStageId = computed(() =>
  projection.value?.stages.find((stage) => stage.completed < stage.total)?.id ?? null,
)
const progressByStage = computed(() => new Map(
  projection.value?.stages.map((stage) => [stage.id, stage]) ?? [],
))

function prerequisiteText(itemId: string) {
  return courseItemById[itemId].prerequisites
    .map((id) => contentById[id].title)
    .join('、')
}

function refresh() {
  state.value = readCourseProgress()
}

function handleStorage(event: StorageEvent) {
  if (event.key === learningStorageKeys.progress) refresh()
}

onMounted(() => {
  refresh()
  window.addEventListener(learningStateEvent, refresh)
  window.addEventListener('storage', handleStorage)
})

onUnmounted(() => {
  window.removeEventListener(learningStateEvent, refresh)
  window.removeEventListener('storage', handleStorage)
})
</script>

<template>
  <nav class="course-map" aria-label="课程阶段">
    <header class="course-progress">
      <p v-if="state === null">本地进度将在页面加载后显示</p>
      <p v-else-if="state.status === 'blocked'">本地进度不可用</p>
      <p v-else-if="state.status === 'corrupt'">本地进度数据损坏</p>
      <template v-else-if="projection">
        <strong>
          {{ projection.completed === projection.total
            ? `当前公开课程已完成 · ${projection.completed} / ${projection.total}`
            : `当前公开课程 · ${projection.completed} / ${projection.total}` }}
        </strong>
        <progress
          :value="projection.completed"
          :max="projection.total"
          aria-label="课程总进度"
        />
      </template>
    </header>

    <ol class="course-stage-list" role="list">
      <li
        v-for="stage in courseStages"
        :key="stage.id"
        class="course-stage"
        :class="{ 'is-current': currentStageId === stage.id }"
      >
        <header>
          <span>{{ String(stage.order).padStart(2, '0') }}</span>
          <h2>{{ stage.title }}</h2>
          <p>{{ stage.purpose }}</p>
          <template v-if="stage.availability === 'published' && progressByStage.get(stage.id)">
            <small>
              {{ progressByStage.get(stage.id)?.completed }} /
              {{ progressByStage.get(stage.id)?.total }} 项完成
            </small>
            <progress
              :value="progressByStage.get(stage.id)?.completed"
              :max="progressByStage.get(stage.id)?.total"
              :aria-label="`${stage.title}进度`"
            />
          </template>
        </header>

        <p v-if="stage.availability === 'relationship-only'" class="course-stage-boundary">
          本阶段将在独立设计、实现与验收完成后接入；当前不计入进度。
        </p>
        <template v-else>
          <ol class="course-item-list" role="list">
            <li v-for="itemId in stage.itemIds.slice(0, 4)" :key="itemId" class="course-item">
              <a :href="withBase(contentById[itemId].route)">{{ contentById[itemId].title }}</a>
              <p>{{ courseItemById[itemId].outcome }}</p>
              <small v-if="courseItemById[itemId].prerequisites.length">
                先修：{{ prerequisiteText(itemId) }}
              </small>
              <small>完成证据：{{ courseItemById[itemId].evidence }}</small>
            </li>
          </ol>

          <details v-if="stage.itemIds.length > 4" class="course-stage-more">
            <summary>展开其余 {{ stage.itemIds.length - 4 }} 项</summary>
            <ol role="list">
              <li v-for="itemId in stage.itemIds.slice(4)" :key="itemId" class="course-item">
                <a :href="withBase(contentById[itemId].route)">{{ contentById[itemId].title }}</a>
                <p>{{ courseItemById[itemId].outcome }}</p>
                <small v-if="courseItemById[itemId].prerequisites.length">
                  先修：{{ prerequisiteText(itemId) }}
                </small>
                <small>完成证据：{{ courseItemById[itemId].evidence }}</small>
              </li>
            </ol>
          </details>
        </template>
      </li>
    </ol>
  </nav>
</template>
