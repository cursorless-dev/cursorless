/** Represents a custom tokenizer for a language */

export interface LanguageTokenizerComponents {
  fixedTokens: string[];

  /**
   * Each element of this list is a regex that can appear inside a token, and
   * will be considered part of a subword.  Note that there is no need to add a
   * `*` here, as the regex will be allowed to repeat.
   */
  identifierWordRegexes: string[];

  /**
   * These are allowable inside identifiers, and act to separate words in the
   * identifier. They are raw strings, and will be regex-escaped.
   */
  identifierWordDelimiters: string[];

  numbersRegex: string;
  repeatableSymbols: string[];
  singleSymbolsRegex: string;
}
