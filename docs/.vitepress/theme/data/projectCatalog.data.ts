import { resolve } from 'node:path'
import { defineLoader } from 'vitepress'
import { loadProjectCatalog } from '../../../../scripts/project-catalog.mjs'
import type { ProjectCatalog } from './projectCatalogTypes'

declare const data: ProjectCatalog
export { data }

export default defineLoader({
  watch: ['../../../../sources/project-index.yml'],
  load() {
    return loadProjectCatalog(resolve(process.cwd(), 'sources/project-index.yml')) as ProjectCatalog
  },
})
