import { escapeRegExp, uniq } from "lodash-es";
import type { IndividualDelimiter } from "./types";

/**
 * Given a list of all possible left / right delimiter instances, returns a regex
 * which matches any of the individual delimiters.
 *
 * @param individualDelimiters A list of all possible left / right delimiter instances
 * @returns A regex which matches any of the individual delimiters
 */
export function getDelimiterRegex(individualDelimiters: IndividualDelimiter[]) {
  // Create a regex which is a disjunction of all possible left / right
  // delimiter texts
  const individualDelimiterDisjunct = uniq(
    individualDelimiters.map(({ text }) => text),
  )
    .map(escapeRegExp)
    .join("|");

  // Then make sure that we don't allow preceding `\`
  return new RegExp(`(?<!\\\\)(${individualDelimiterDisjunct})`, "gu");
}
