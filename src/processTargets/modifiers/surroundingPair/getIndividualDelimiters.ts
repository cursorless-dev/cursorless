import { SimpleSurroundingPairName } from "../../../typings/Types";
import { IndividualDelimiter } from "./types";
import { delimiterToText } from "./delimiterMaps";
import { concat, uniq } from "lodash";

export function getIndividualDelimiters(
  delimiters: SimpleSurroundingPairName[]
): IndividualDelimiter[] {
  return delimiters.flatMap((delimiter) => {
    const [leftDelimiter, rightDelimiter] = delimiterToText[delimiter];

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

function isString(arg: unknown): arg is string {
  return typeof arg === "string" || arg instanceof String;
}
