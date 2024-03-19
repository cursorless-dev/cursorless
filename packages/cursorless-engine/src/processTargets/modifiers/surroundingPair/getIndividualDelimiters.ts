import { SimpleSurroundingPairName } from "@cursorless/common";
import { IndividualDelimiter } from "./types";
import { getSimpleDelimiterMap } from "./getDelimiterMaps";
import { concat, uniq } from "lodash";
import { isString } from "../../../util/type";

/**
 * Given a list of delimiters, returns a list where each element corresponds to
 * a single right or left delimiter.  Each item contains information such as a
 * reference to delimiter name, the text to expect, etc.
 *
 * @param delimiters The delimiter names
 * @returns A list of information about all possible left / right delimiter instances
 */
export function getIndividualDelimiters(
  languageId: string,
  delimiters: SimpleSurroundingPairName[],
): IndividualDelimiter[] {
  const delimiterToText = getSimpleDelimiterMap(languageId);
  return delimiters.flatMap((delimiter) => {
    const [leftDelimiter, rightDelimiter] = delimiterToText[delimiter];

    // Allow for the fact that a delimiter might have multiple ways to indicate
    // its opening / closing
    const leftDelimiters = isString(leftDelimiter)
      ? [leftDelimiter]
      : leftDelimiter;
    const rightDelimiters = isString(rightDelimiter)
      ? [rightDelimiter]
      : rightDelimiter;

    const allDelimiterTexts = uniq(concat(leftDelimiters, rightDelimiters));

    return allDelimiterTexts.map((text) => {
      const isLeft = leftDelimiters.includes(text);
      const isRight = rightDelimiters.includes(text);

      return {
        text,
        // If delimiter text is the same for left and right, we say it's side
        // is "unknown", so must be determined from context.
        side:
          isLeft && !isRight
            ? "left"
            : isRight && !isLeft
            ? "right"
            : "unknown",
        delimiter,
      };
    });
  });
}
