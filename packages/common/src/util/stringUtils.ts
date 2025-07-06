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

/**
 * Capitalizes string
 *
 * @param input A string
 * @returns The same string, but with the first character capitalized
 */
export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts a string to a URL-friendly hash ID.
 *
 * This function takes an input string, converts it to lowercase, replaces spaces
 * with hyphens, and removes any characters that are not lowercase letters,
 * digits, or hyphens. The result is a string that can be used as a
 * URL-friendly hash ID.
 *
 * @param text The input string to be converted
 * @returns A URL-friendly hash ID
 */
export function uriEncodeHashId(text: string): string {
  return camelCaseToAllDown(text)
    .replaceAll(" ", "-")
    .replace(/[^a-z0-9-]/g, "");
}
