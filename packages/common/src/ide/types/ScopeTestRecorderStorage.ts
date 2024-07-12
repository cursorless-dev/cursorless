export interface ScopeTestRecorderStorage {
  getTestedScopeFacets(languageId: string): Set<string>;
  saveScopeFacetTest(
    languageId: string,
    facet: string,
    content: string,
  ): Promise<void>;
}
