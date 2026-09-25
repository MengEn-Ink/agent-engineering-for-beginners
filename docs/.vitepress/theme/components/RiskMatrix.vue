<template>
  <figure
    class="learning-diagram risk-matrix"
    aria-label="按动作影响和可逆性决定自动执行、事后抽检、执行前批准或禁止的风险矩阵"
  >
    <figcaption><b>动作风险矩阵</b><span>权限来自可承受损失，不来自模型自信。</span></figcaption>
    <table>
      <thead><tr><th>影响 / 可逆性</th><th>容易撤销</th><th>难以撤销</th></tr></thead>
      <tbody>
        <tr><th>低影响</th><td>自动执行 + 记录</td><td>执行后抽检</td></tr>
        <tr><th>高影响</th><td>执行前批准</td><td>专用环境或禁止</td></tr>
      </tbody>
    </table>
  </figure>
</template>
