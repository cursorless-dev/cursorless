import { DOCS_URL } from "./constants";

export class UnsupportedLanguageError extends Error {
  constructor(languageId: string) {
    super(
      `Language '${languageId}' is not implemented yet; See ${DOCS_URL}/contributing/adding-a-new-language`,
    );
    this.name = "UnsupportedLanguageError";
  }
}

export class UnsupportedScopeError extends Error {
  constructor(scopeType: string) {
    super(
      `Scope '${scopeType}' is not implemented yet; See ${DOCS_URL}/contributing/adding-a-new-scope`,
    );
    this.name = "UnsupportedScopeError";
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
