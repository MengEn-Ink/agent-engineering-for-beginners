import { data } from './projectCatalog.data'
import { createProjectCatalogLookup } from './projectCatalogCore'

export const {
  projectCatalog,
  getProjectPage,
  getProjectSubject,
  getProjectChain,
  projectSourceUrl,
} = createProjectCatalogLookup(data)
