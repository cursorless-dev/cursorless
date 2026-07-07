/**
 * Vendored from cursorless packages/cursorless-engine/src/util/allocateHats/getHatRankingContext.ts
 * at SHA 42452eba521bb9cccbb3e04a2cd9e9afcf6cbffe.
 * Edits are IMPORT REWRITES ONLY (applied by scripts/vendor.sh):
 *   - "@cursorless/common" -> "../common" barrel
 *   - TokenGraphemeSplitter (concrete class) -> GraphemeSplitter (structural
 *     interface in ../common/types with the same getTokenGraphemes surface)
 *   - RankedToken: "./getRankedTokens" -> "../common/types"
 */

import {
  CompositeKeyMap,
  HatStyleName,
  Token,
  TokenHat,
} from "../common";
import { GraphemeSplitter } from "../common/types";
import { RankedToken } from "../common/types";

export interface RankingContext {
  /**
   * Maps from a hat candidate (grapheme+style combination) to the score of the
   * token that used the given hat in the previous hat allocation.
   */
  hatOldTokenRanks: CompositeKeyMap<
    {
      grapheme: string;
      hatStyle: HatStyleName;
    },
    number
  >;

  /**
   * Maps from a grapheme to the list of ranks of the tokens in which the
   * given grapheme appears.
   */
  graphemeTokenRanks: {
    [key: string]: number[];
  };
}

export function getHatRankingContext(
  tokens: RankedToken[],
  oldTokenHatMap: CompositeKeyMap<Token, TokenHat>,
  tokenGraphemeSplitter: GraphemeSplitter,
): RankingContext {
  const graphemeTokenRanks: {
    [key: string]: number[];
  } = {};

  const hatOldTokenRanks = new CompositeKeyMap<
    { grapheme: string; hatStyle: HatStyleName },
    number
  >(({ grapheme, hatStyle }) => [grapheme, hatStyle]);

  tokens.forEach(({ token, rank }) => {
    const existingTokenHat = oldTokenHatMap.get(token);
    if (existingTokenHat != null) {
      hatOldTokenRanks.set(existingTokenHat, rank);
    }
    tokenGraphemeSplitter
      .getTokenGraphemes(token.text)
      .forEach(({ text: graphemeText }) => {
        let tokenRanksForGrapheme: number[];

        if (graphemeText in graphemeTokenRanks) {
          tokenRanksForGrapheme = graphemeTokenRanks[graphemeText];
        } else {
          tokenRanksForGrapheme = [];
          graphemeTokenRanks[graphemeText] = tokenRanksForGrapheme;
        }

        tokenRanksForGrapheme.push(rank);
      });
  });

  return {
    hatOldTokenRanks,
    graphemeTokenRanks,
  };
}
