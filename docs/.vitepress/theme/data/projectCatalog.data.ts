import { fileURLToPath } from 'node:url'
import { defineLoader } from 'vitepress'
import { loadProjectCatalog } from '../../../../scripts/project-catalog.mjs'
import type { ProjectCatalog } from './projectCatalogTypes'

declare const data: ProjectCatalog
export { data }

export default defineLoader({
  watch: ['../../../../sources/project-index.yml'],
  load() {
    const catalogPath = fileURLToPath(new URL('../../../../sources/project-index.yml', import.meta.url))
    return loadProjectCatalog(catalogPath) as ProjectCatalog
  },
})
