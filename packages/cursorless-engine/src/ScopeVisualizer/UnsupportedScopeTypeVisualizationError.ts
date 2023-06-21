
export class UnsupportedScopeTypeVisualizationError extends Error {
  constructor(languageId: string) {
    super(
      `Scope type not supported for ${languageId}, or only defined using legacy API which doesn't support visualization.  See https://www.cursorless.org/docs/contributing/adding-a-new-language/ for more about how to upgrade your language.`
    );
    this.name = "UnsupportedScopeTypeVisualizationError";
  }
}
