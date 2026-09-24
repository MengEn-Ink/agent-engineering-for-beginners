<script setup lang="ts">
const gates = [
  { label: '预检', note: '环境与权限', status: 'CHECK' },
  { label: '执行', note: '任务与工具', status: 'RUN' },
  { label: '取证', note: '轨迹与结果', status: 'PROVE' },
  { label: '归因', note: '失败分类', status: 'ROUTE' },
  { label: '放行', note: '只认完整证据', status: 'PASS' },
]
</script>

<template>
  <figure
    class="delivery-case diagram-shell"
    role="img"
    aria-label="交付型 Agent 从预检、执行、取证、归因到放行的质量门流程"
  >
    <figcaption>
      <span>CASE 01 / 交付型 AGENT</span>
      <strong>会跑不算交付，带着证据走完全程才算。</strong>
    </figcaption>
    <ol>
      <li v-for="gate in gates" :key="gate.label">
        <span class="gate-status">{{ gate.status }}</span>
        <strong>{{ gate.label }}</strong>
        <small>{{ gate.note }}</small>
      </li>
    </ol>
    <p><b>失败关闭：</b>未知、超时、缺证据、环境阻塞，都不能被粉饰成通过。</p>
  </figure>
</template>
