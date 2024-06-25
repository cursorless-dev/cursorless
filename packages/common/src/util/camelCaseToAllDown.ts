/**
 * Converts a camelCase string to a string with spaces between each word, and
 * all words in lowercase.
 *
 * Example: `camelCaseToAllDown("fooBarBaz")` returns `"foo bar baz"`.
 *
 * @param input A camelCase string
 * @returns The same string, but with spaces between each word, and all words
 * in lowercase
 */
export function camelCaseToAllDown(input: string): string {
  return input
    .replace(/([A-Z])/g, " $1")
    .split(" ")
    .map((word) => word.toLowerCase())
    .join(" ");
}
