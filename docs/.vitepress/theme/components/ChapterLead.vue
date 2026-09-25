<script setup lang="ts">
defineProps<{
  questions: string[]
  outcomes: string[]
  minutes: string
}>()
</script>

<template>
  <section class="chapter-lead" aria-label="本章导航">
    <div class="chapter-lead-meta">
      <span>本章导航</span>
      <span>预计 {{ minutes }} 分钟</span>
    </div>
    <div class="chapter-lead-grid">
      <div>
        <h2>读完能回答</h2>
        <ul>
          <li v-for="question in questions" :key="question">{{ question }}</li>
        </ul>
      </div>
      <div>
        <h2>最终会带走</h2>
        <ul>
          <li v-for="outcome in outcomes" :key="outcome">{{ outcome }}</li>
        </ul>
      </div>
    </div>
  </section>
</template>
