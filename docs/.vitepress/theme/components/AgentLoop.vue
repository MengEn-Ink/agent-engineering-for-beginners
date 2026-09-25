<script setup lang="ts">
const stages = [
  { index: '01', label: '观察', detail: '读取环境事实' },
  { index: '02', label: '决定', detail: '选择下一动作' },
  { index: '03', label: '行动', detail: '调用一个工具' },
  { index: '04', label: '验证', detail: '检查是否更近' },
]
</script>

<template>
  <figure
    class="agent-loop diagram-shell"
    role="img"
    aria-label="Agent 在观察、决定、行动和验证之间循环，并由完成、失败或预算耗尽等条件停止"
  >
    <figcaption>
      <span>AGENT LOOP / 反馈回路</span>
      <strong>不是一直想，是每一步都向环境要答案。</strong>
    </figcaption>
    <ol role="list">
      <li v-for="stage in stages" :key="stage.index">
        <span class="diagram-index">{{ stage.index }}</span>
        <strong>{{ stage.label }}</strong>
        <small>{{ stage.detail }}</small>
      </li>
    </ol>
    <div class="stop-rule">
      <span>STOP</span>
      完成 · 明确失败 · 需要人类 · 超出预算
    </div>
  </figure>
</template>
