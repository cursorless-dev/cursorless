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
 * Selects a hat for a given token from amongst {@link candidates}, trading off
 * hat quality and hat stability
 *
 * **IMPORTANT**: This function assumes that all tokens with a lower rank than
 * the given token have already been assigned hats.
 *
 * We proceed as follows:
 *
 * 1. Decide whether to keep our own hat, if a higher ranked token hasn't
 *    already taken it
 * 2. Decide whether to steal a hat from a lower ranked token
 *
 * See [hat assignment](../../../docs/user/hatAssignment.md) for more info.
 *
 * TODO: Could be improved by ignoring subsequent tokens that also contain
 * another character that can be used with lower color. To compute that, look at
 * all the other characters in the given su  åbsequent token, look at their
 * current color, and add the number of times it appears in between the current
 * token and the given subsequent token.
 *
 * Here is an example where the existing algorithm falls down: "ab ax b"
 *
 * @param context Lookup tables with information about which graphemes / hats
 * other tokens have
 * @param hatStability The user settings that determine when to keep / steal
 * hats
 * @param tokenRank The rank of the token for whom we're picking a hat
 * @param oldTokenHat The hat that was on the token before (or `undefined` if it
 * didn't have one)
 * @param candidates The set of candidate hats under consideration (includes
 * both hat style and grapheme)
 * @returns
 */
export function chooseTokenHat(
  { hatOldTokenRanks, graphemeTokenRanks }: RankingContext,
  { keepingPolicy, stealingPolicy }: HatStability,
  tokenRank: number,
  oldTokenHat: TokenHat | undefined,
  candidates: HatCandidate[],
) {
  // We narrow down the candidates by a series of criteria until there is only
  // one left
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
