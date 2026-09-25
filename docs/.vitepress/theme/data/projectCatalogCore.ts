import type {
  ProjectCatalog,
  ProjectChain,
  ProjectPageRecord,
  ProjectSubject,
} from './projectCatalogTypes'

export function createProjectCatalogLookup(data: ProjectCatalog) {
  const pageById: Record<string, ProjectPageRecord> = Object.fromEntries(
    data.pages.map((page) => [page.page_item_id, page]),
  )
  const subjectById: Record<string, ProjectSubject> = Object.fromEntries(
    data.subjects.map((subject) => [subject.id, subject]),
  )
  const chainById: Record<string, ProjectChain> = Object.fromEntries(
    data.chains.map((chain) => [chain.id, chain]),
  )

  function own<T>(record: Record<string, T>, id: string, label: string): T {
    if (!Object.hasOwn(record, id)) throw new Error(`Unknown ${label}: ${id}`)
    return record[id]
  }

  const getProjectPage = (id: string) => own(pageById, id, 'project page')
  const getProjectSubject = (id: string) => own(subjectById, id, 'project subject')
  const getProjectChain = (id: string) => own(chainById, id, 'project chain')

  function projectSourceUrl(subjectId: string, sourcePath: string): string {
    const subject = getProjectSubject(subjectId)
    const allowedPaths = new Set([
      ...subject.entrypoints.map((entry) => entry.path),
      ...subject.license_sources.map((license) => license.path),
    ])
    if (!allowedPaths.has(sourcePath)) {
      throw new Error(`Undeclared project source: ${subjectId}/${sourcePath}`)
    }
    const encodedSourcePath = sourcePath.split('/').map(encodeURIComponent).join('/')
    return `${subject.canonical_url}/blob/${subject.pinned_commit}/${encodedSourcePath}`
  }

  return {
    projectCatalog: data,
    getProjectPage,
    getProjectSubject,
    getProjectChain,
    projectSourceUrl,
  }
}
