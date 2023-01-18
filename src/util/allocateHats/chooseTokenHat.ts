import { HatStability } from "../../libs/common/ide/types/HatStability";
import { RankingContext } from "./getHatRankingContext";
import { TokenHat, HatCandidate } from "./allocateHats";
import { maxByMultiple } from "./maxByMultiple";
import { HatMetrics, HatMetric } from "./HatMetrics";

/**
 * IMPORTANT: This function assumes that all tokens with a lower rank than the given
 * token have already been assigned hats.
 *
 * Picks the character with minimum color such that the next token that contains
 * that character is as far away as possible.
 *
 * TODO: Could be improved by ignoring subsequent tokens that also contain
 * another character that can be used with lower color. To compute that, look at
 * all the other characters in the given su  åbsequent token, look at their
 * current color, and add the number of times it appears in between the current
 * token and the given subsequent token.
 *
 * Here is an example where the existing algorithm falls down: "ab ax b"
 * @param context
 * @param hatStability
 * @param tokenRank
 * @param oldTokenHat
 * @param candidates
 * @returns
 */
export function chooseTokenHat(
  { hatOldTokenRanks, graphemeTokenRanks }: RankingContext,
  hatStability: HatStability,
  tokenRank: number,
  oldTokenHat: TokenHat | undefined,
  candidates: HatCandidate[],
) {
  /**
   * The hat candidate that was previously used for this token, if any
   */
  const oldCandidate =
    oldTokenHat == null
      ? undefined
      : candidates.find(
          (hat) =>
            hat.grapheme.text === oldTokenHat.grapheme &&
            hat.style === oldTokenHat.hatStyle,
        );

  if (oldCandidate != null) {
    if (hatStability >= HatStability.high) {
      return oldCandidate;
    }

    const hatPenaltyEquivalenceClassFn =
      getHatPenaltyEquivalenceClassFn(hatStability);

    if (
      hatPenaltyEquivalenceClassFn(oldCandidate) <=
      Math.min(...candidates.map(hatPenaltyEquivalenceClassFn))
    ) {
      // If stability is less than high, then we only want to reuse the old hat
      // if its penalty is in the same equivalence class as the minimum penalty
      return oldCandidate;
    }
  }

  const metrics = new HatMetrics(
    hatOldTokenRanks,
    hatStability,
    graphemeTokenRanks,
    tokenRank,
  );

  return maxByMultiple(candidates, [
    ...getHatTheftMetrics(hatStability, metrics),
    metrics.minimumTokenRankContainingGrapheme,
  ])!;
}

function getHatTheftMetrics(
  hatStability: HatStability,
  metrics: HatMetrics,
): HatMetric[] {
  switch (hatStability) {
    case HatStability.low:
    case HatStability.lowRounded:
    case HatStability.lowThresholded:
    case HatStability.high:
      return [metrics.getNegativePenalty, metrics.getHatOldTokenRank];

    case HatStability.highThresholded:
      return [
        ({ penalty }) => (penalty < 2 ? 1 : 0),
        metrics.getHatOldTokenRank,
        metrics.getNegativePenalty,
      ];

    case HatStability.higher:
    case HatStability.strict:
      return [metrics.getHatOldTokenRank, metrics.getNegativePenalty];
  }
}

function getHatPenaltyEquivalenceClassFn(
  hatStability: HatStability,
): HatMetric {
  switch (hatStability) {
    case HatStability.low:
      return ({ penalty }) => penalty;
    case HatStability.lowRounded:
      return ({ penalty }) => Math.floor(penalty);
    case HatStability.lowThresholded:
      return ({ penalty }) => (penalty < 2 ? 0 : 1);
    case HatStability.high:
    case HatStability.highThresholded:
    case HatStability.higher:
    case HatStability.strict:
      throw new Error("No penalty equivalence class for high stability");
  }
}
