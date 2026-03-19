import type { IDE } from "@cursorless/common";
import { matchText } from "@cursorless/common";
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

    return wordMatches.length > 1
      ? wordMatches
      : // Secondly try split on camel case
        matchText(text, CAMEL_REGEX);
  }
}
