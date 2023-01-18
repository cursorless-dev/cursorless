import { min } from "lodash";
import { HatStability } from "../../libs/common/ide/types/Configuration";
import { HatCandidate } from "./allocateHats";
import CompositeKeyMap from "../../libs/common/util/CompositeKeyMap";

/**
 * Various metrics by which we measure the quality of a hat candidate; greater
 * is always better
 */
export class HatMetrics {
  constructor(
    private hatOldTokenRanks: CompositeKeyMap<
      { grapheme: string; hatStyle: string },
      number
    >,
    private hatStability: HatStability,
    private graphemeTokenRanks: { [key: string]: number[] },
    private tokenRank: number,
  ) {}

  /**
   * @returns negative penalty of the given hat candidate
   */
  getNegativePenalty: HatMetric = ({ penalty }) => -penalty;

  /**
   * @returns Infinity if the hat candidate is not in use in the old allocation,
   * otherwise the rank of the token from the old map that we'd steal the hat
   * from, or NaN if {@link hatStability} is {@link HatStability.strict} (so
   * that it will never be chosen)
   */
  getHatOldTokenRank: HatMetric = ({ grapheme: { text: grapheme }, style }) => {
    const hatOldTokenRank = this.hatOldTokenRanks.get({
      grapheme,
      hatStyle: style,
    });

    return hatOldTokenRank == null
      ? Infinity
      : this.hatStability === HatStability.strict
      ? NaN
      : hatOldTokenRank;
  };

  /**
   * @returns the minimum token rank among tokens we haven't seen that contain the given grapheme
   */
  minimumTokenRankContainingGrapheme: HatMetric = ({ grapheme: { text } }) =>
    min(this.graphemeTokenRanks[text].filter((r) => r > this.tokenRank)) ??
    Infinity;
}

/**
 * A function that takes a hat candidate and returns a number representing its
 * quality; greater is always better
 */
export type HatMetric = (hat: HatCandidate) => number;
