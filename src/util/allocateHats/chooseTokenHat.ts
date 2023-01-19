import { RankingContext } from "./getHatRankingContext";
import { TokenHat, HatCandidate } from "./allocateHats";
import { maxByMultiple } from "./maxByMultiple";
import { HatMetrics, HatMetric } from "./HatMetrics";
import { HatComparisonPolicy, HatStability } from "@cursorless/common";

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
  const metrics = new HatMetrics(
    hatOldTokenRanks,
    graphemeTokenRanks,
    tokenRank,
  );

  return maxByMultiple(candidates, [
    getHatPolicyEquivalenceFn(hatStability.keepingPolicy),
    (hat) =>
      hat.grapheme.text === oldTokenHat?.grapheme &&
      hat.style === oldTokenHat?.hatStyle
        ? 1
        : 0,

    getHatPolicyEquivalenceFn(hatStability.stealingPolicy),
    metrics.getHatOldTokenRank,

    metrics.getNegativePenalty,
    metrics.minimumTokenRankContainingGrapheme,
  ])!;
}

function getHatPolicyEquivalenceFn(
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
