/**
 * Vendored from cursorless chooseTokenHat.ts, PINNED at SHA
 * 42452eba521bb9cccbb3e04a2cd9e9afcf6cbffe.
 *
 * NOT importable from @cursorless/lib-engine: current upstream chooseTokenHat
 * has DIVERGED from this pin (two feature commits — #2602 "Make hat forcing
 * more aggressive" added a `forcedTokenHat` parameter, #1723 "avoid allocating
 * hats to the first letter of a token" added an `avoidFirstLetter` metric that
 * needs `HatCandidate.isFirstLetter`, computed from a WordTokenizer(ide,
 * languageId) this offline renderer cannot construct). Adopting the current
 * version would change which grapheme gets hatted and break the renderer's
 * byte-for-byte fidelity to the recorded prose-overlay bundle. This copy stays
 * pinned on purpose.
 *
 * maxByFirstDiffering IS imported from @cursorless/lib-engine (it is
 * byte-identical to the pin and generic, so no clone is needed).
 * Remaining edits are IMPORT REWRITES ONLY:
 *   - "@cursorless/common" -> "../common" barrel
 *   - HatCandidate: "./allocateHats" -> "../common/types"
 *   - maxByFirstDiffering: "./maxByFirstDiffering" -> "@cursorless/lib-engine"
 */

import { HatStability, TokenHat } from "../common";
import { HatCandidate } from "../common/types";
import { RankingContext } from "./getHatRankingContext";
import {
  hatOldTokenRank,
  isOldTokenHat,
  minimumTokenRankContainingGrapheme,
  negativePenalty,
  penaltyEquivalenceClass,
} from "./HatMetrics";
import { maxByFirstDiffering } from "@cursorless/lib-engine";

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
 * See [hat assignment](/docs/user/hatAssignment) for more info.
 *
 * FIXME: Could be improved by ignoring subsequent tokens that also contain
 * another character that can be used with lower color. To compute that, look at
 * all the other characters in the given subsequent token, look at their current
 * color, and add the number of times it appears in between the current token
 * and the given subsequent token.
 *
 * Here is an example where the existing algorithm falls down: "ab ax b".  It
 * will put a hat on `b` for token `ab` because `b` appears two tokens away
 * whereas `a` appears in the next token.  However, if it had chosen `a`, then
 * it could use `x` for `ax`, leaving `b` free for the final `b` token.
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
 * @returns The chosen hat, or `undefined` if {@link candidates} was empty
 */
export function chooseTokenHat(
  { hatOldTokenRanks, graphemeTokenRanks }: RankingContext,
  hatStability: HatStability,
  tokenRank: number,
  oldTokenHat: TokenHat | undefined,
  candidates: HatCandidate[],
): HatCandidate | undefined {
  // We narrow down the candidates by a series of criteria until there is only
  // one left
  return maxByFirstDiffering(candidates, [
    // 1. Discard any hats that are sufficiently worse than the best hat that we
    //    wouldn't use them even if they were our old hat
    penaltyEquivalenceClass(hatStability),

    // 2. Use our old hat if it's still in the running
    isOldTokenHat(oldTokenHat),

    // 3. Use a free hat if possible; if not, steal the hat of the token with
    //    lowest rank
    hatOldTokenRank(hatOldTokenRanks),

    // 4. Narrow to the hats with the lowest penalty
    negativePenalty,

    // 5. Prefer hats that sit on a grapheme that doesn't appear in any highly
    //    ranked token
    minimumTokenRankContainingGrapheme(tokenRank, graphemeTokenRanks),
  ])!;
}
