<template>
  <figure class="learning-diagram tool-boundary" aria-label="模型通过工具契约、权限门和批准点连接外部系统的边界图">
    <figcaption><b>能力经过三道门</b><span>模型提出动作，执行层决定它能否发生。</span></figcaption>
    <ol class="visual-flow-list" role="list">
      <li><span>01</span><b>模型建议</b><small>选择工具与参数</small></li>
      <li><span>02</span><b>契约校验</b><small>schema、前置条件</small></li>
      <li><span>03</span><b>权限 / 批准</b><small>范围、风险、人类确认</small></li>
      <li><span>04</span><b>外部动作</b><small>真实系统产生副作用</small></li>
      <li><span>05</span><b>业务回执</b><small>状态、对象、证据</small></li>
    </ol>
    <p class="diagram-caution"><b>不要误解：</b>工具接通，不代表权限已经正确。</p>
  </figure>
</template>
