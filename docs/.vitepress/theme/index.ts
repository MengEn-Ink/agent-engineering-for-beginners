import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import AgentLoop from './components/AgentLoop.vue'
import DeliveryCase from './components/DeliveryCase.vue'
import SystemStack from './components/SystemStack.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('AgentLoop', AgentLoop)
    app.component('DeliveryCase', DeliveryCase)
    app.component('SystemStack', SystemStack)
  },
} satisfies Theme
