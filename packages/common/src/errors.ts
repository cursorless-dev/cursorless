export class UnsupportedLanguageError extends Error {
  constructor(languageId: string) {
    super(
      `Language '${languageId}' is not implemented yet; See https://www.cursorless.org/docs/contributing/adding-a-new-language/`,
    );
    this.name = "UnsupportedLanguageError";
  }
}

export class UnsupportedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsupportedError";
  }
}

export class OutdatedExtensionError extends Error {
  constructor() {
    super(
      "Cursorless Talon version is ahead of Cursorless VSCode extension version. Please update Cursorless VSCode.",
    );
  }
}

/**
 * Throw this error if you have attempted to match based on a language scope but have not
 * returned a match.
 */
export class NoContainingScopeError extends Error {
  /**
   *
   * @param scopeType The scopeType for the failed match to show to the user
   */
  constructor(scopeType: string) {
    super(`Couldn't find containing ${scopeType}.`);
    this.name = "NoContainingScopeError";
  }
}
