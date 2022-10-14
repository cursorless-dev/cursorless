import { LanguageTokenizerOverrides } from "./tokenizer.types";

/**
 * Supports identifiers with dashes in them, unlike `IDENTIFIERS_REGEX` which treats them as separate tokens.
 *
 * Useful for languages like CSS, SCSS, shell, etc.
 */
export const languageWithDashedIdentifiers: LanguageTokenizerOverrides = {
  identifierWordDelimiters: ["-", "_"],
};
