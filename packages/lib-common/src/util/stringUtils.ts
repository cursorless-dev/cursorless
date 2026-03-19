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
    .replace(/(?<=[a-z0-9])([A-Z])/g, " $1")
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

/**
 * Converts a string to an integer, throwing an error if the string is not a valid integer.
 *
 * This function trims the input string and checks if it can be parsed as an integer.
 * If the trimmed string is not empty and can be parsed as an integer, the integer value is returned.
 * Otherwise, `undefined` is returned indicating that the input is not a valid integer.
 *
 * @param input The string to be converted to an integer
 * @returns The integer value represented by the input string, or `undefined` if the input is not a valid integer
 */
export function stringToInteger(input: string): number | undefined {
  const trimmedValue = input.trim();
  if (trimmedValue.length === 0) {
    return undefined;
  }
  const value = Number(trimmedValue);
  if (Number.isInteger(value)) {
    return value;
  }
  return undefined;
}
