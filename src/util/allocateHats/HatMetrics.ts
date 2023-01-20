import { min } from "lodash";
import { HatComparisonPolicy } from "../../libs/common/ide/types/HatStability";
import CompositeKeyMap from "../../libs/common/util/CompositeKeyMap";
import { HatCandidate, TokenHat } from "./allocateHats";

/**
 * A function that takes a hat candidate and returns a number representing its
 * quality; greater is always better
 */
export type HatMetric = (hat: HatCandidate) => number;

/**
 * @returns negative penalty of the given hat candidate
 */
export const negativePenalty: HatMetric = ({ penalty }) => -penalty;

/**
 * @returns Infinity if the hat candidate is not in use in the old allocation,
 * otherwise the rank of the token from the old map that we'd steal the hat
 * from
 */
export function hatOldTokenRank(
  hatOldTokenRanks: CompositeKeyMap<
    { grapheme: string; hatStyle: string },
    number
  >,
): HatMetric {
  return ({ grapheme: { text: grapheme }, style }) => {
    const hatOldTokenRank = hatOldTokenRanks.get({
      grapheme,
      hatStyle: style,
    });

    return hatOldTokenRank == null ? Infinity : hatOldTokenRank;
  };
}

/**
 * @returns the minimum token rank among tokens we haven't seen that contain the given grapheme
 */
export function minimumTokenRankContainingGrapheme(
  tokenRank: number,
  graphemeTokenRanks: { [key: string]: number[] },
): HatMetric {
  return ({ grapheme: { text } }) =>
    min(graphemeTokenRanks[text].filter((r) => r > tokenRank)) ?? Infinity;
}

export function isOldTokenHat(oldTokenHat: TokenHat | undefined): HatMetric {
  return (hat) =>
    hat.grapheme.text === oldTokenHat?.grapheme &&
    hat.style === oldTokenHat?.hatStyle
      ? 1
      : 0;
}

export function penaltyEquivalenceClass(
  hatComparisonPolicy: HatComparisonPolicy,
): HatMetric {
  switch (hatComparisonPolicy) {
    case HatComparisonPolicy.greedy:
      return ({ penalty }) => -penalty;
    case HatComparisonPolicy.floor:
      return ({ penalty }) => -Math.floor(penalty);
    case HatComparisonPolicy.round:
      return ({ penalty }) => -Math.round(penalty);
    case HatComparisonPolicy.threshold:
      return ({ penalty }) => -(penalty < 2 ? 0 : 1);
    case HatComparisonPolicy.stable:
      return (_) => 0;
  }
}
