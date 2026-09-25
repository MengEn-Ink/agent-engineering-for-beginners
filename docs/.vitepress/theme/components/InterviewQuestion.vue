<script setup lang="ts">
import { computed } from 'vue'
import { interviewQuestions } from '../data/interviewQuestions'

const props = defineProps<{ id: string }>()
const question = computed(() => interviewQuestions.find((item) => item.id === props.id))
</script>

<template>
  <section
    v-if="question"
    :id="question.id"
    class="interview-question"
    :aria-label="`面试题：${question.question}`"
  >
    <details>
      <summary>
        <span class="interview-kicker">面试官会怎么问</span>
        <strong>{{ question.question }}</strong>
        <span class="interview-meta">{{ question.role }} · {{ question.difficulty }}</span>
      </summary>
      <div class="interview-answer">
        <h4>30 秒回答</h4>
        <p>{{ question.shortAnswer }}</p>
        <h4>面试官追问</h4>
        <ul><li v-for="item in question.followUps" :key="item">{{ item }}</li></ul>
        <h4>高分要点</h4>
        <ul><li v-for="item in question.strongSignals" :key="item">{{ item }}</li></ul>
        <h4>常见失分点</h4>
        <p>{{ question.pitfall }}</p>
      </div>
    </details>
  </section>
</template>
