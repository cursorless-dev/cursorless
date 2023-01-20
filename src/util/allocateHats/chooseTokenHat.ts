import { HatStability } from "@cursorless/common";
import { HatCandidate, TokenHat } from "./allocateHats";
import { RankingContext } from "./getHatRankingContext";
import {
  hatOldTokenRank,
  isOldTokenHat,
  minimumTokenRankContainingGrapheme,
  negativePenalty,
  penaltyEquivalenceClass,
} from "./HatMetrics";
import { maxByMultiple } from "./maxByMultiple";

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
  { keepingPolicy, stealingPolicy }: HatStability,
  tokenRank: number,
  oldTokenHat: TokenHat | undefined,
  candidates: HatCandidate[],
) {
  return maxByMultiple(candidates, [
    // 1. Discard any hats that are sufficiently worse than the best hat that we
    //    wouldn't use them even if they were our old hat
    penaltyEquivalenceClass(keepingPolicy),

    // 2. Use our old hat if it's still in the running
    isOldTokenHat(oldTokenHat),

    // 3. Discard any hats that are sufficiently worse than the best hat that we
    //    wouldn't use them even if we have to steal a lower ranked hat
    penaltyEquivalenceClass(stealingPolicy),

    // 4. Use a free hat if possible; if not, steal the hat of the token with
    //    lowest rank
    hatOldTokenRank(hatOldTokenRanks),

    // 5. Narrow to the hats with the lowest penalty
    negativePenalty,

    // 6. Prefer hats that sit on a grapheme that doesn't appear in any highly
    //    ranked token
    minimumTokenRankContainingGrapheme(tokenRank, graphemeTokenRanks),
  ])!;
}
