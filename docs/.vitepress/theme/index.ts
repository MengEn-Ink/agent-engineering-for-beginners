import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import AgentLoop from './components/AgentLoop.vue'
import DeliveryCase from './components/DeliveryCase.vue'
import SystemStack from './components/SystemStack.vue'
import ChapterLead from './components/ChapterLead.vue'
import CaseThread from './components/CaseThread.vue'
import PracticeBlock from './components/PracticeBlock.vue'
import ChecklistBlock from './components/ChecklistBlock.vue'
import DecisionLadder from './components/DecisionLadder.vue'
import MemoryLayers from './components/MemoryLayers.vue'
import EvidencePyramid from './components/EvidencePyramid.vue'
import RiskMatrix from './components/RiskMatrix.vue'
import InterviewQuestion from './components/InterviewQuestion.vue'
import InterviewIndex from './components/InterviewIndex.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('AgentLoop', AgentLoop)
    app.component('DeliveryCase', DeliveryCase)
    app.component('SystemStack', SystemStack)
    app.component('ChapterLead', ChapterLead)
    app.component('CaseThread', CaseThread)
    app.component('PracticeBlock', PracticeBlock)
    app.component('ChecklistBlock', ChecklistBlock)
    app.component('DecisionLadder', DecisionLadder)
    app.component('MemoryLayers', MemoryLayers)
    app.component('EvidencePyramid', EvidencePyramid)
    app.component('RiskMatrix', RiskMatrix)
    app.component('InterviewQuestion', InterviewQuestion)
    app.component('InterviewIndex', InterviewIndex)
  },
} satisfies Theme
