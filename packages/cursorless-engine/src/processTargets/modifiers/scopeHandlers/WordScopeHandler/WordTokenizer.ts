import { getMatcher } from "../../../../tokenizer";
import { matchText } from "../../../../util/regex";

const CAMEL_REGEX = /\p{Lu}?\p{Ll}+|\p{Lu}+(?!\p{Ll})|\p{N}+/gu;

/**
 * This class encapsulates word-splitting logic.
 * It is used by the {@link WordScopeHandler} and the hat allocator.
 */
export class WordTokenizer {
  private wordRegex: RegExp;

  constructor(languageId: string) {
    this.wordRegex = getMatcher(languageId).wordMatcher;
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
