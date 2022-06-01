/**
 * Add custom identifierRegex to ensure that kebab case identifiers, properties
 * and class-names are tokenized as a single token.
 */
export default {
  identifiersRegex: "[\\p{L}_|\\-0-9]+",
};
