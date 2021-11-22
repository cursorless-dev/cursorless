import { SurroundingPairName } from "../../../typings/Types";
import { IndividualDelimiter } from "./types";
import { delimiterToText } from "./delimiterMaps";

export function getIndividualDelimiters(
  delimiters: SurroundingPairName[]
): IndividualDelimiter[] {
  return delimiters
    .map((delimiter) => {
      const [leftDelimiter, rightDelimiter] = delimiterToText[delimiter];

      return leftDelimiter === rightDelimiter
        ? [
            {
              text: leftDelimiter,
              side: "unknown" as const,
              delimiter,
            },
          ]
        : [
            {
              text: leftDelimiter,
              side: "left" as const,
              delimiter,
            },
            {
              text: rightDelimiter,
              side: "right" as const,
              delimiter,
            },
          ];
    })
    .flat();
}
