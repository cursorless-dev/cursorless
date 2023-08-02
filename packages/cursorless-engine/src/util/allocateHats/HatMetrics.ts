import { CompositeKeyMap, HatStability, TokenHat } from "@cursorless/common";
import { min } from "lodash";
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
 * @returns A metric that penalizes graphemes that are the first letter of a word within a token
 */
export const avoidFirstLetter: HatMetric = ({ isFirstLetter }) =>
  isFirstLetter ? -1 : 0;

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

/**
 * @param tokenRank The rank of the current token, so that we don't consider
 * higher ranked tokens (which already have been assigned hats)
 * @param graphemeTokenRanks A map from graphemes to an ordered list of the
 * ranks of tokens containing the grapheme
 * @returns A metric which returns the minimum token rank among lower ranked
 * tokens that contain the hat's grapheme (or Infinity if the grapheme doesn't
 * appear in any lower ranked tokens)
 */
export function minimumTokenRankContainingGrapheme(
  tokenRank: number,
  graphemeTokenRanks: { [key: string]: number[] },
): HatMetric {
  return ({ grapheme: { text } }) =>
    min(graphemeTokenRanks[text].filter((r) => r > tokenRank)) ?? Infinity;
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
