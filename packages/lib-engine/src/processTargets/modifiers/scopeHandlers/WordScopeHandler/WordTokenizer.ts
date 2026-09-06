import type { IDE } from "@cursorless/lib-common";
import { matchText } from "@cursorless/lib-common";
import { getMatcher } from "../../../../tokenizer";

const CAMEL_REGEX = /\p{Lu}?\p{Ll}+|\p{Lu}+(?!\p{Ll})|\p{N}+/gu;

/**
 * This class encapsulates word-splitting logic.
 * It is used by the {@link WordScopeHandler} and the hat allocator.
 */
export class WordTokenizer {
  private wordRegex: RegExp;

  constructor(ide: IDE, languageId: string) {
    this.wordRegex = getMatcher(ide, languageId).wordMatcher;
  }

  public splitIdentifier(text: string) {
    // First try to split on non letter characters
    const wordMatches = matchText(text, this.wordRegex);

    // Secondly try split on camel case
    if (wordMatches.length === 1) {
      return matchText(text, CAMEL_REGEX);
    }

    return wordMatches;
  }
}
