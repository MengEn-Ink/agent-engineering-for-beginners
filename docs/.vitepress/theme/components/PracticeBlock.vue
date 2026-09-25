<script setup lang="ts">
defineProps<{
  title: string
  prompt: string
  hint: string
  answer: string
}>()
</script>

<template>
  <section class="practice-block" aria-labelledby="practice-title">
    <p class="practice-kicker">动手练习</p>
    <h3 id="practice-title">{{ title }}</h3>
    <p>{{ prompt }}</p>
    <details>
      <summary>先看提示</summary>
      <p>{{ hint }}</p>
    </details>
    <details>
      <summary>参考答案</summary>
      <p>{{ answer }}</p>
    </details>
  </section>
</template>
