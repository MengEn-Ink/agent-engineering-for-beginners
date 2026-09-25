export function parseProjectCatalog(text: string): unknown
export function validateProjectCatalog(data: unknown): string[]
export function validateProjectCatalogIntegration(data: unknown, sources: { contentRegistryText: string; interviewQuestionsText: string }): string[]
export function validateProjectCatalogFile(path: string): string[]
export function loadProjectCatalog(path: string): unknown
