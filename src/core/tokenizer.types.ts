/** Represents a custom tokenizer for a language */

export interface LanguageTokenizerComponents {
  fixedTokens: string[];
  identifiersRegex: string;
  numbersRegex: string;
  repeatableSymbols: string[];
  singleSymbolsRegex: string;
}

export type LanguageTokenizerOverrides = Partial<LanguageTokenizerComponents>;
