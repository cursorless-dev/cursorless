import { getMatcher } from "../../../core/tokenizer";
import { matchText } from "../../../util/regex";

const CAMEL_REGEX = /\p{Lu}?\p{Ll}+|\p{Lu}+(?!\p{Ll})|\p{N}+/gu;

export default class WordTokenizer {
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
