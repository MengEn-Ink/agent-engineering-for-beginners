<template>
  <figure class="learning-diagram graph-flow" aria-label="任务从预检分成并行检查，在人工批准后汇合并支持失败恢复的状态图">
    <figcaption><b>Graph 把分支和等待摆到明面上</b><span>每条边都有条件，每个节点都有证据。</span></figcaption>
    <ol class="visual-flow-list">
      <li><span>01</span><b>预检</b><small>环境、身份、预算</small></li>
      <li><span>02A</span><b>并行检查 A</b><small>契约与数据</small></li>
      <li><span>02B</span><b>并行检查 B</b><small>界面与旅程</small></li>
      <li><span>03</span><b>等待批准</b><small>持久状态，可超时</small></li>
      <li><span>04</span><b>汇合 / 恢复</b><small>只认完整证据</small></li>
    </ol>
    <p class="diagram-caution"><b>不要误解：</b>画成 Graph 不会自动让节点可靠。</p>
  </figure>
</template>
