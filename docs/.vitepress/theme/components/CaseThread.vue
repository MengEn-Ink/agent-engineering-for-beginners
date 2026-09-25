<script setup lang="ts">
defineProps<{
  chapter: string
  title: string
  problem: string
  evidence: string
}>()
</script>

<template>
  <aside class="case-thread" aria-labelledby="case-thread-title">
    <p class="case-thread-kicker">贯穿案例 · {{ chapter }}</p>
    <h3 id="case-thread-title">{{ title }}</h3>
    <dl>
      <div>
        <dt>本章问题</dt>
        <dd>{{ problem }}</dd>
      </div>
      <div>
        <dt>必须留下的证据</dt>
        <dd>{{ evidence }}</dd>
      </div>
    </dl>
  </aside>
</template>
