<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'

type OfflineStatus = 'idle' | 'checking' | 'downloading' | 'ready' | 'unsupported' | 'error'

interface OfflineManifest {
  fileCount: number
  totalBytes: number
  version: string
}

const status = ref<OfflineStatus>('idle')
const manifest = ref<OfflineManifest | null>(null)
const errorMessage = ref('')

const buttonLabel = computed(() => {
  if (status.value === 'checking') return '正在检查缓存…'
  if (status.value === 'downloading') return '正在缓存整本书…'
  if (status.value === 'ready') return '更新离线缓存'
  if (status.value === 'error') return '重试离线缓存'
  return '一键缓存整本书'
})

const detail = computed(() => {
  if (status.value === 'unsupported') return '当前浏览器不支持离线缓存'
  if (status.value === 'error') return errorMessage.value || '缓存失败，请检查网络后重试'
  if (!manifest.value) return '首次联网缓存后，断网也能继续阅读'
  const size = (manifest.value.totalBytes / 1024 / 1024).toFixed(1)
  return status.value === 'ready'
    ? `已缓存 ${manifest.value.fileCount} 个文件（约 ${size} MB）`
    : `将缓存 ${manifest.value.fileCount} 个文件（约 ${size} MB）`
})

function waitForActivation(worker: ServiceWorker | null) {
  if (!worker || worker.state === 'activated') return Promise.resolve()
  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error('缓存等待超时')), 120_000)
    worker.addEventListener('statechange', () => {
      if (worker.state === 'activated') {
        window.clearTimeout(timeout)
        resolve()
      }
      if (worker.state === 'redundant') {
        window.clearTimeout(timeout)
        reject(new Error('离线缓存安装失败'))
      }
    })
  })
}

async function loadManifest() {
  const response = await fetch(withBase('/offline-manifest.json'), { cache: 'no-store' })
  if (!response.ok) throw new Error(`无法读取离线清单（HTTP ${response.status}）`)
  manifest.value = await response.json() as OfflineManifest
}

async function cacheBook() {
  if (!('serviceWorker' in navigator)) {
    status.value = 'unsupported'
    return
  }
  status.value = 'checking'
  errorMessage.value = ''
  try {
    await loadManifest()
    status.value = 'downloading'
    const registration = await navigator.serviceWorker.register(withBase('/sw.js'), {
      scope: withBase('/'),
      updateViaCache: 'none',
    })
    await registration.update()
    await waitForActivation(registration.installing ?? registration.waiting ?? registration.active)
    status.value = 'ready'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '未知错误'
    status.value = 'error'
  }
}

onMounted(async () => {
  if (!('serviceWorker' in navigator)) {
    status.value = 'unsupported'
    return
  }
  try {
    const registration = await navigator.serviceWorker.getRegistration(withBase('/'))
    if (registration?.active) {
      await loadManifest()
      status.value = 'ready'
    }
  } catch {
    status.value = 'idle'
  }
})
</script>

<template>
  <aside class="offline-download" aria-labelledby="offline-download-title">
    <div class="offline-download-copy">
      <span>离线书架</span>
      <strong id="offline-download-title">把当前版本留在浏览器里</strong>
      <small :class="{ 'offline-download-error': status === 'error' }" aria-live="polite">
        {{ detail }}
      </small>
    </div>
    <button
      type="button"
      class="reading-action offline-download-action"
      :disabled="status === 'checking' || status === 'downloading' || status === 'unsupported'"
      @click="cacheBook"
    >
      {{ buttonLabel }}
    </button>
  </aside>
</template>
