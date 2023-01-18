import { maxByMultiple } from "@cursorless/common";
import { min } from "lodash";
import { HatStability } from "../../libs/common/ide/types/Configuration";
import { RankingContext } from "./getHatRankingContext";
import { HatRangeDescriptor, HatCandidate } from "./allocateHats";

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
 * @param tokenAvailableHats
 * @returns
 */
export function chooseTokenHat(
  { hatOldTokenRanks, graphemeTokenRanks }: RankingContext,
  hatStability: HatStability,
  tokenRank: number,
  oldTokenHat: HatRangeDescriptor,
  tokenAvailableHats: HatCandidate[],
) {
  const isHatForCurrentToken: HatMetric = (hat) =>
    hat.grapheme.text === oldTokenHat.grapheme &&
    hat.style === oldTokenHat.hatStyle
      ? 1
      : 0;

  const exactPenalty: HatMetric = ({ penalty }) => -penalty;

  // Then by how far away is the nearest token in the old map whose hat
  // we'd steal
  const getHatOldTokenScore: HatMetric = ({
    grapheme: { text: grapheme },
    style,
  }) => {
    const oldHatTokenScore = hatOldTokenRanks.get({
      grapheme,
      hatStyle: style,
    });

    return oldHatTokenScore == null
      ? Infinity
      : hatStability === HatStability.strict
      ? NaN
      : oldHatTokenScore;
  };

  // Then by how far away is the nearest token that contains the same
  // grapheme
  const minimumTokenScoreContainingGrapheme: HatMetric = ({
    grapheme: { text },
  }) => min(graphemeTokenRanks[text].filter((r) => r > tokenRank)) ?? Infinity;

  const chosenGrapheme = maxByMultiple(tokenAvailableHats, [
    getHatPenaltyEquivalenceClassFn(hatStability),
    isHatForCurrentToken,
    ...(hatStability === HatStability.higher
      ? [getHatOldTokenScore, exactPenalty]
      : [exactPenalty, getHatOldTokenScore]),
    minimumTokenScoreContainingGrapheme,
  ])!;

  return chosenGrapheme;
}

type HatMetric = (hat: HatCandidate) => number;

function getHatPenaltyEquivalenceClassFn(
  hatStability: HatStability,
): HatMetric {
  switch (hatStability) {
    case HatStability.low:
      return ({ penalty }) => -penalty;
    case HatStability.lowRounded:
      return ({ penalty }) => -Math.floor(penalty);
    case HatStability.medium:
      return ({ penalty }) => (penalty < 2 ? 1 : 0);
    case HatStability.high:
    case HatStability.higher:
    case HatStability.strict:
      return (_) => 0;
  }
}
