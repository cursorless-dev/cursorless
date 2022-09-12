import { LanguageTokenizerOverrides } from "./tokenizer.types";

/**
 * Add custom identifierRegex to ensure that kebab case identifiers, properties
 * and class-names are tokenized as a single token.
 */
export const css: LanguageTokenizerOverrides = {
  identifiersRegex: "[\\p{L}\\p{M}_\\-0-9]+",
};
