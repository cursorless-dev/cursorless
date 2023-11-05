import {
  CompositeKeyMap,
  HatStyleName,
  Token,
  TokenHat,
} from "@cursorless/common";
import { TokenGraphemeSplitter } from "../../tokenGraphemeSplitter";
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
  tokenGraphemeSplitter: TokenGraphemeSplitter,
): RankingContext {
  const graphemeTokenRanks: {
    [key: string]: number[];
  } = {};

  const hatOldTokenRanks = new CompositeKeyMap<
    { grapheme: string; hatStyle: HatStyleName },
    number
  >(({ grapheme, hatStyle }) => [grapheme, hatStyle]);

  tokens.forEach(({ token, score }) => {
    const existingTokenHat = oldTokenHatMap.get(token);
    if (existingTokenHat != null) {
      hatOldTokenRanks.set(existingTokenHat, score);
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

        tokenRanksForGrapheme.push(score);
      });
  });

  return {
    hatOldTokenRanks,
    graphemeTokenRanks,
  };
}
