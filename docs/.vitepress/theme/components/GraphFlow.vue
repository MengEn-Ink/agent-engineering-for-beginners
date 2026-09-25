<template>
  <figure class="learning-diagram graph-flow" aria-label="预检同时启动并行检查 A 和 B，两条必需分支完成后汇合；失败保存检查点并回到失败节点前恢复">
    <figcaption><b>Graph 把分叉、汇合与恢复摆到明面上</b><span>02A 与 02B 同时执行，不是先后步骤。</span></figcaption>
    <div class="graph-flow-canvas">
      <section class="graph-node graph-start">
        <span>01</span><b>预检</b><small>环境、身份、预算</small>
      </section>
      <section class="parallel-stage" aria-label="并行阶段">
        <small class="branch-label">并行分叉</small>
        <div class="parallel-branches" role="group" aria-label="并行检查 A 和 B 同时执行">
          <section><span>02A</span><b>契约与数据</b><small>独立执行</small></section>
          <section><span>02B</span><b>界面与旅程</b><small>独立执行</small></section>
        </div>
        <small class="join-label">全部必需分支完成后汇合</small>
      </section>
      <section class="graph-node graph-join">
        <span>03</span><b>汇合 / 批准</b><small>只认完整证据</small>
      </section>
    </div>
    <aside class="flow-recovery" aria-label="失败恢复回边">
      <b>失败恢复</b><span>任一分支失败 → 保存检查点 → 按类别修复 → 回到失败节点前</span>
    </aside>
    <p class="diagram-caution"><b>不要误解：</b>画成 Graph 不会自动让节点可靠。</p>
  </figure>
</template>
