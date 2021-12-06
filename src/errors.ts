export class UnsupportedLanguageError extends Error {
  constructor(languageId: string) {
    super(
      `Language '${languageId}' is not implemented yet; See https://github.com/pokey/cursorless-vscode/blob/main/docs/contributing/adding-a-new-language.md`
    );
    this.name = "UnsupportedLanguageError";
  }
}
