<template>
  <figure class="learning-diagram coding-loop" aria-label="Coding Agent 从仓库核对、复现、失败测试、最小修改、回归到差异审查的工程循环">
    <figcaption><b>代码生成只是中间一步</b><span>交付从正确现场开始，以验证证据结束。</span></figcaption>
    <ol class="visual-flow-list">
      <li><span>01</span><b>核对现场</b><small>仓库、分支、规则、改动</small></li>
      <li><span>02</span><b>复现根因</b><small>得到稳定失败</small></li>
      <li><span>03</span><b>测试先红</b><small>定义正确行为</small></li>
      <li><span>04</span><b>最小修改</b><small>只改根因范围</small></li>
      <li><span>05</span><b>回归与审查</b><small>测试、构建、diff、风险</small></li>
    </ol>
    <p class="diagram-caution"><b>不要误解：</b>测试没报错，不代表需求已经完成。</p>
  </figure>
</template>
