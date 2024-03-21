import {
  CompositeKeyMap,
  HatStyleName,
  Token,
  TokenHat,
} from "@cursorless/common";
import { RankedToken } from "./getRankedTokens";

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
}

export function getHatRankingContext(
  tokens: RankedToken[],
  oldTokenHatMap: CompositeKeyMap<Token, TokenHat>,
): RankingContext {
  const hatOldTokenRanks = new CompositeKeyMap<
    { grapheme: string; hatStyle: HatStyleName },
    number
  >(({ grapheme, hatStyle }) => [grapheme, hatStyle]);

  tokens.forEach(({ token }, index) => {
    const existingTokenHat = oldTokenHatMap.get(token);
    if (existingTokenHat != null) {
      hatOldTokenRanks.set(existingTokenHat, -index);
    }
  });

  return {
    hatOldTokenRanks,
  };
}
