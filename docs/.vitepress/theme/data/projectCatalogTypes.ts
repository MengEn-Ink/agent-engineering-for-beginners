export interface LicenseScope {
  basis: 'path' | 'contribution'
  expression: string
  path_or_glob?: string
  selector?: string
  scope: string
  note: string
}

export interface ProjectSourceEntrypoint {
  path: string
  symbols: string[]
  responsibility: string
}

export interface ProjectSubject {
  id: string
  canonical_repo: string
  canonical_url: string
  pin_kind: 'release' | 'tag' | 'commit'
  pinned_ref: string
  pinned_commit: string
  verified_default_branch: string
  verified_default_head: string
  repository_status: 'active' | 'archived' | 'eol'
  archived: boolean
  catalog_tier: 'core' | 'historical' | 'watch-only'
  risk_tags?: string[]
  license_summary: string
  license_scopes: LicenseScope[]
  license_sources: Array<{ path: string; sha256: string }>
  watch_url: string
  entrypoints: ProjectSourceEntrypoint[]
  verified_at: string
  review_by: string
}

export interface ProjectPageRecord {
  page_item_id: string
  catalog_tier: 'core' | 'historical'
  subjects: string[]
  interview_question_ids: string[]
  counted_in_course: boolean
  primary_chain_id: string | null
}

export interface ProjectChainStep {
  id: string
  track?: string
  label: string
  subject_id: string
  source_path: string
  symbol: string
  responsibility: string
}

export interface ProjectChain {
  id: string
  page_item_id: string
  label: string
  reading_hint: string
  misconception: string
  steps: ProjectChainStep[]
}

export interface ProjectCatalog {
  schema_version: 1
  pages: ProjectPageRecord[]
  subjects: ProjectSubject[]
  chains: ProjectChain[]
}
