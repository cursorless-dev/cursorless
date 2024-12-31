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
    individualDelimiters.flatMap((delimiter) => {
      const text = escapeRegExp(delimiter.text);
      const result = [text];
      for (const prefix of delimiter.prefixes) {
        // If the prefix is only alpha character, we need to make sure that there is no preceding alpha characters.
        if (alphaRegex.test(prefix)) {
          result.push(`(?<!\\w)${prefix}${text}`);
        } else {
          result.push(`${escapeRegExp(prefix)}${text}`);
        }
      }
      return result;
    }),
  ).join("|");

  // Then make sure that we don't allow preceding `\`
  return new RegExp(`(?<!\\\\)(${individualDelimiterDisjunct})`, "gu");
}

const alphaRegex = /^\w+$/;
