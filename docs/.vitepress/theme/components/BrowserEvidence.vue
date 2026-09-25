<template>
  <figure class="learning-diagram browser-evidence" aria-label="浏览器 Agent 观察页面、语义定位、风险确认、执行动作和验证业务状态的证据循环">
    <figcaption><b>每次页面变化都重新观察</b><span>坐标会过期，业务证据不会靠猜。</span></figcaption>
    <ol class="visual-flow-list" role="list">
      <li><span>01</span><b>观察</b><small>URL、标题、元素、遮挡</small></li>
      <li><span>02</span><b>定位</b><small>API → 语义 DOM → 视觉</small></li>
      <li><span>03</span><b>风险确认</b><small>对象、参数、影响</small></li>
      <li><span>04</span><b>单步动作</b><small>点击、输入、上传</small></li>
      <li><span>05</span><b>双重验证</b><small>页面状态 + 业务回执</small></li>
    </ol>
    <p class="diagram-caution"><b>不要误解：</b>鼠标事件成功，不等于业务提交成功。</p>
  </figure>
</template>
