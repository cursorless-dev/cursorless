import { SurroundingPairName } from "../../../typings/Types";
import { IndividualDelimiter } from "./types";
import { delimiterToText } from "./delimiterMaps";
import { getDefault } from "../../../util/map";

function getIndividualDelimiters(
  delimiters: SurroundingPairName[]
): IndividualDelimiter[] {
  return delimiters.flatMap((delimiter) => {
    const [leftDelimiter, rightDelimiter] = delimiterToText[delimiter];

    const leftDelimiters = isString(leftDelimiter)
      ? [leftDelimiter]
      : leftDelimiter;
    const rightDelimiters = isString(rightDelimiter)
      ? [rightDelimiter]
      : rightDelimiter;

    return [
      // NB: It's important that the left delimiters come first because if left
      // is equal to right we want to make sure that we first assume it's a left
      // delimiter so that we look to the right first
      ...leftDelimiters.map((leftDelimiter) => ({
        text: leftDelimiter,
        side: "left" as const,
        delimiter,
      })),
      ...rightDelimiters.map((rightDelimiter) => ({
        text: rightDelimiter,
        side: "right" as const,
        delimiter,
      })),
    ];
  });
}

export type DelimiterLookupMap = Map<string, IndividualDelimiter[]>;

export function getDelimiterLookupMap(
  delimiters: SurroundingPairName[]
): DelimiterLookupMap {
  let delimiterLookupMap: Map<string, IndividualDelimiter[]> = new Map();

  getIndividualDelimiters(delimiters).forEach((individualDelimiter) => {
    getDefault(delimiterLookupMap, individualDelimiter.text, () => []).push(
      individualDelimiter
    );
  });

  return delimiterLookupMap;
}

function isString(arg: unknown): arg is string {
  return typeof arg === "string" || arg instanceof String;
}
