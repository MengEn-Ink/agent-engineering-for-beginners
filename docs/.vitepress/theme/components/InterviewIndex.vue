<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { interviewQuestions } from '../data/interviewQuestions'

const groups = computed(() => {
  const grouped = new Map<string, typeof interviewQuestions>()
  for (const question of interviewQuestions) {
    const items = grouped.get(question.topic) ?? []
    items.push(question)
    grouped.set(question.topic, items)
  }
  return Array.from(grouped.entries())
})

const hrefFor = (question: (typeof interviewQuestions)[number]) =>
  withBase(`${question.path}#${question.id}`)
</script>

<template>
  <div class="interview-index">
    <section v-for="[topic, questions] in groups" :key="topic" :aria-label="`${topic}面试题`">
      <h2>{{ topic }}</h2>
      <ol>
        <li v-for="question in questions" :key="question.id">
          <a :href="hrefFor(question)">
            <span>{{ question.id.toUpperCase() }}</span>
            <strong>{{ question.question }}</strong>
            <small>{{ question.role }} · {{ question.difficulty }}</small>
          </a>
        </li>
      </ol>
    </section>
  </div>
</template>
