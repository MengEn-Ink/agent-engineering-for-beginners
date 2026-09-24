<script setup lang="ts">
const layers = [
  { name: '验证', note: '怎么知道做对了', tone: 'lime' },
  { name: '控制流', note: '下一步由谁决定', tone: 'paper' },
  { name: '状态', note: '任务走到哪里', tone: 'paper' },
  { name: '工具', note: '能对世界做什么', tone: 'coral' },
  { name: '上下文', note: '此刻知道什么', tone: 'paper' },
  { name: '模型', note: '理解与生成能力', tone: 'ink' },
]
</script>

<template>
  <figure
    class="system-stack diagram-shell"
    role="img"
    aria-label="Agent 工程系统由模型、上下文、工具、状态、控制流和验证六层组成"
  >
    <figcaption>
      <span>ANATOMY / 系统剖面</span>
      <strong>Agent 不是一个模型，而是一摞互相约束的工程层。</strong>
    </figcaption>
    <ol>
      <li v-for="(layer, index) in layers" :key="layer.name" :data-tone="layer.tone">
        <span>{{ String(layers.length - index).padStart(2, '0') }}</span>
        <strong>{{ layer.name }}</strong>
        <small>{{ layer.note }}</small>
      </li>
    </ol>
  </figure>
</template>
