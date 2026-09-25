<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { withBase } from 'vitepress'
import { interviewQuestions } from '../data/interviewQuestions'
import {
  buildTrainingQuery,
  chooseRandomQuestion,
  clearInterviewMastery,
  defaultInterviewFilters,
  filterInterviewQuestions,
  interviewTopics,
  loadInterviewMastery,
  parseTrainingQuery,
  saveInterviewMastery,
  type InterviewFilters,
  type InterviewMastery,
} from '../data/interviewTraining'

const filters = ref<InterviewFilters>({ ...defaultInterviewFilters })
const currentId = ref<string | null>(null)
const answerVisible = ref(false)
const mastery = ref<Record<string, InterviewMastery>>({})
const storageAvailable = ref(true)
const ready = ref(false)

const filteredQuestions = computed(() => filterInterviewQuestions(interviewQuestions, filters.value))
const currentQuestion = computed(() =>
  filteredQuestions.value.find((question) => question.id === currentId.value)
  ?? filteredQuestions.value[0],
)
const masteryCounts = computed(() => ({
  unknown: interviewQuestions.filter((question) => (mastery.value[question.id] ?? 'unknown') === 'unknown').length,
  fuzzy: interviewQuestions.filter((question) => mastery.value[question.id] === 'fuzzy').length,
  mastered: interviewQuestions.filter((question) => mastery.value[question.id] === 'mastered').length,
}))

function syncQuery() {
  if (!ready.value) return
  const query = buildTrainingQuery(filters.value)
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`
  window.history.replaceState(window.history.state, '', nextUrl)
}

function resetCurrent() {
  if (!filteredQuestions.value.some((question) => question.id === currentId.value)) {
    currentId.value = filteredQuestions.value[0]?.id ?? null
  }
  answerVisible.value = false
}

function drawQuestion() {
  currentId.value = chooseRandomQuestion(filteredQuestions.value, currentId.value)?.id ?? null
  answerVisible.value = false
}

function assess(level: InterviewMastery) {
  if (!currentQuestion.value) return
  const next = { ...mastery.value, [currentQuestion.value.id]: level }
  mastery.value = next
  storageAvailable.value = saveInterviewMastery(next)
}

function resetMastery() {
  if (!window.confirm('清除当前浏览器中 42 道题的掌握度记录？此操作无法撤销。')) return
  storageAvailable.value = clearInterviewMastery()
  mastery.value = {}
}

watch(filters, () => {
  resetCurrent()
  syncQuery()
}, { deep: true })

onMounted(() => {
  filters.value = parseTrainingQuery(window.location.search)
  mastery.value = loadInterviewMastery()
  currentId.value = filteredQuestions.value[0]?.id ?? null
  ready.value = true
})
</script>

<template>
  <section class="interview-trainer" aria-label="面试训练模式">
    <header class="trainer-header">
      <div>
        <span>42 QUESTIONS · LOCAL PRACTICE</span>
        <h2>先口答，再看答案</h2>
      </div>
      <p>筛选条件写入当前网址，掌握度仅存于当前浏览器，不上传账号或服务器。</p>
    </header>

    <form class="trainer-filters" @submit.prevent>
      <label>
        <span>岗位</span>
        <select v-model="filters.role">
          <option>全部</option>
          <option>工程</option>
          <option>产品</option>
        </select>
      </label>
      <label>
        <span>难度</span>
        <select v-model="filters.difficulty">
          <option>全部</option>
          <option>基础</option>
          <option>进阶</option>
          <option>系统设计</option>
        </select>
      </label>
      <label>
        <span>主题</span>
        <select v-model="filters.topic">
          <option>全部</option>
          <option v-for="topic in interviewTopics" :key="topic">{{ topic }}</option>
        </select>
      </label>
      <button
        type="button"
        class="trainer-action trainer-draw"
        :disabled="filteredQuestions.length === 0"
        @click="drawQuestion"
      >
        随机抽题
      </button>
    </form>

    <div class="trainer-stats" aria-live="polite">
      <span>当前题池 {{ filteredQuestions.length }} 题</span>
      <span>不会 {{ masteryCounts.unknown }}</span>
      <span>模糊 {{ masteryCounts.fuzzy }}</span>
      <span>掌握 {{ masteryCounts.mastered }}</span>
    </div>

    <article v-if="currentQuestion" class="trainer-question" aria-live="polite">
      <div class="trainer-question-meta">
        <span>{{ currentQuestion.id.toUpperCase() }}</span>
        <span>{{ currentQuestion.topic }}</span>
        <span>{{ currentQuestion.role }} · {{ currentQuestion.difficulty }}</span>
      </div>
      <h3>{{ currentQuestion.question }}</h3>
      <p class="trainer-prompt">给自己 30 秒：先说结论，再说取舍、风险和验证方法。</p>

      <button
        type="button"
        class="trainer-action trainer-reveal"
        :aria-expanded="answerVisible"
        @click="answerVisible = !answerVisible"
      >
        {{ answerVisible ? '收起参考答案' : '展开参考答案' }}
      </button>

      <div v-if="answerVisible" class="trainer-answer">
        <h4>30 秒回答骨架</h4>
        <p>{{ currentQuestion.shortAnswer }}</p>
        <h4>面试官可能追问</h4>
        <ul>
          <li v-for="item in currentQuestion.followUps" :key="item">{{ item }}</li>
        </ul>
        <h4>高分信号</h4>
        <ul>
          <li v-for="item in currentQuestion.strongSignals" :key="item">{{ item }}</li>
        </ul>
        <h4>常见失分点</h4>
        <p>{{ currentQuestion.pitfall }}</p>
        <a :href="withBase(`${currentQuestion.path}#${currentQuestion.id}`)">回到章节语境复习 →</a>
      </div>

      <fieldset class="trainer-mastery">
        <legend>这道题现在掌握得怎样？</legend>
        <button
          v-for="option in [
            { value: 'unknown', label: '不会' },
            { value: 'fuzzy', label: '模糊' },
            { value: 'mastered', label: '掌握' },
          ] as const"
          :key="option.value"
          type="button"
          class="trainer-action"
          :aria-pressed="(mastery[currentQuestion.id] ?? 'unknown') === option.value"
          @click="assess(option.value)"
        >
          {{ option.label }}
        </button>
      </fieldset>
    </article>

    <p v-else class="trainer-empty" role="status">当前筛选没有题目，请放宽一个条件。</p>
    <p v-if="!storageAvailable" class="storage-warning" role="status">
      浏览器禁止了本地存储，掌握度只在本页暂存。
    </p>
    <button type="button" class="trainer-action trainer-reset" @click="resetMastery">
      清除掌握度记录
    </button>
  </section>
</template>

