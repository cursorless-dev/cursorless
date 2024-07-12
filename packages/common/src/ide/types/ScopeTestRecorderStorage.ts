export interface ScopeTestRecorderStorage {
  /**
   * Get all facets that have been tested for a given language.
   * @param languageId The language id to get tested facets for.
   * @returns A set of all tested facets for the given language.
   */
  getTestedScopeFacets(languageId: string): Set<string>;

  /**
   * Save a scope facet test.
   * @param languageId The language id of the test.
   * @param facet The facet being tested.
   * @param content The content of the test.
   */
  saveScopeFacetTest(
    languageId: string,
    facet: string,
    content: string,
  ): Promise<void>;
}
