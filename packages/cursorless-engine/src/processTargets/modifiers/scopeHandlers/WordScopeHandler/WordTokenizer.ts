import { matchText } from "@cursorless/common";
import { getMatcher } from "../../../../tokenizer";

const CAMEL_REGEX = /\p{Lu}?\p{Ll}+|\p{Lu}+(?!\p{Ll})|\p{N}+/gu;

/**
 * This class just encapsulates the word-splitting logic from
 * {@link WordScopeHandler}.  We could probably just inline it into that class,
 * but for now we need it here because we can't yet properly mock away vscode
 * for the unit tests in subtoken.test.ts.
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
