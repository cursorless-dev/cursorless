import { Delimiter } from "../../../typings/Types";
import { IndividualDelimiter } from "./types";
import { delimiterToText } from "./delimiterMaps";

export function getIndividualDelimiters(
  delimitersToCheck: Delimiter[]): IndividualDelimiter[] {
  return delimitersToCheck
    .map((delimiter) => {
      const [leftDelimiter, rightDelimiter] = delimiterToText[delimiter];

      if (leftDelimiter === rightDelimiter) {
        const delimiterResult: Partial<IndividualDelimiter> = {
          text: leftDelimiter,
          direction: "bidirectional",
          delimiter,
        };
        delimiterResult.opposite = delimiterResult as IndividualDelimiter;
        return [delimiterResult as IndividualDelimiter];
      } else {
        const leftDelimiterResult: Partial<IndividualDelimiter> = {
          text: leftDelimiter,
          direction: "right",
          delimiter,
        };
        const rightDelimiterResult: Partial<IndividualDelimiter> = {
          text: rightDelimiter,
          direction: "left",
          delimiter,
        };
        rightDelimiterResult.opposite =
          leftDelimiterResult as IndividualDelimiter;
        leftDelimiterResult.opposite =
          rightDelimiterResult as IndividualDelimiter;
        return [
          leftDelimiterResult as IndividualDelimiter,
          rightDelimiterResult as IndividualDelimiter,
        ];
      }
    })
    .flat();
}
