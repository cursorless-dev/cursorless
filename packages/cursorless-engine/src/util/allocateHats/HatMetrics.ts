import {
  CompositeKeyMap,
  DefaultMap,
  HatStability,
  TokenHat,
} from "@cursorless/common";
import { HatCandidate } from "./allocateHats";

/**
 * A function that takes a hat candidate and returns a number representing its
 * quality; greater is always better
 */
export type HatMetric = (hat: HatCandidate) => number;

/**
 * @returns A metric that just returns the negative penalty of the given hat
 * candidate
 */
export const negativePenalty: HatMetric = ({ penalty }) => -penalty;

/**
 * @param hatOldTokenRanks A map from a hat candidate (grapheme+style combination) to the score of the
 * token that used the given hat in the previous hat allocation.
 * @returns A metric that returns Infinity if the hat candidate is not in use in
 * the old allocation, otherwise the rank of the token from the old allocation
 * that we'd steal the hat from
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

    return hatOldTokenRank == null ? Infinity : -hatOldTokenRank;
  };
}

export function leastPopularGrapheme(
  graphemePopularity: DefaultMap<string, number>,
): HatMetric {
  return ({ grapheme: { text } }) => -graphemePopularity.get(text);
}

/**
 * @param oldTokenHat The old hat for the token to which we're assigning a hat
 * @returns A metric which returns 1 if the hat candidate is the one the token
 * currently has, 0 otherwise
 */
export function isOldTokenHat(oldTokenHat: TokenHat | undefined): HatMetric {
  return (hat) =>
    hat.grapheme.text === oldTokenHat?.grapheme &&
    hat.style === oldTokenHat?.hatStyle
      ? 1
      : 0;
}

/**
 * Given a {@link HatStability}, returns its equivalence class function.
 *
 * @param HatStability The user setting for which we need to return
 * equivalence class
 * @returns A hat metric that will collapse hats that are not different enough
 * to justify keeping / stealing
 */
export function penaltyEquivalenceClass(hatStability: HatStability): HatMetric {
  switch (hatStability) {
    case HatStability.greedy:
      return ({ penalty }) => -penalty;
    case HatStability.balanced:
      return ({ penalty }) => -(penalty < 2 ? 0 : 1);
    case HatStability.stable:
      return (_) => 0;
  }
}
