import { DefaultMap, Range, TextEditor } from "@cursorless/common";
import { clone } from "lodash";
import { HatStability } from "../../libs/common/ide/types/Configuration";
import { HatStyleMap } from "../../libs/common/ide/types/Hats";
import { HatStyleName } from "../../libs/common/ide/types/hatStyles.types";
import CompositeKeyMap from "../../libs/common/util/CompositeKeyMap";
import {
  Grapheme,
  TokenGraphemeSplitter,
} from "../../libs/cursorless-engine/tokenGraphemeSplitter";
import { Token } from "../../typings/Types";
import { chooseTokenHat } from "./chooseTokenHat";
import { getHatRankingContext } from "./getHatRankingContext";
import { getRankedTokens } from "./getRankedTokens";

export interface TokenHat {
  hatStyle: HatStyleName;
  grapheme: string;
  token: Token;
  hatRange: Range;
}

export interface HatCandidate {
  grapheme: Grapheme;
  style: HatStyleName;
  penalty: number;
}

export function allocateHats(
  tokenGraphemeSplitter: TokenGraphemeSplitter,
  enabledHatStyles: HatStyleMap,
  oldTokenHats: readonly TokenHat[],
  hatStability: HatStability,
  activeTextEditor: TextEditor | undefined,
  visibleTextEditors: readonly TextEditor[],
): TokenHat[] {
  const tokenOldHatMap = getTokenOldHatMap(oldTokenHats);
  const tokens = getRankedTokens(activeTextEditor, visibleTextEditors);
  const context = getHatRankingContext(
    tokens,
    tokenOldHatMap,
    tokenGraphemeSplitter,
  );

  /**
   * A map from graphemes to the remaining hat styles that have not yet been
   * used for that grapheme
   */
  const graphemeRemainingHatCandidates = new DefaultMap<string, HatStyleMap>(
    () => clone(enabledHatStyles),
  );

  return tokens
    .map<TokenHat | undefined>(({ token, rank: tokenRank }) => {
      const tokenRemainingHatCandidates = getTokenRemainingHatCandidates(
        tokenGraphemeSplitter,
        token,
        graphemeRemainingHatCandidates,
      );

      const chosenHat = chooseTokenHat(
        context,
        hatStability,
        tokenRank,
        tokenOldHatMap.get(token),
        tokenRemainingHatCandidates,
      );

      if (chosenHat == null) {
        return undefined;
      }

      delete graphemeRemainingHatCandidates.get(chosenHat.grapheme.text)[
        chosenHat.style
      ];

      return constructHatRangeDescriptor(token, chosenHat);
    })
    .filter((value): value is TokenHat => value != null);
}

/**
 *
 * @param oldTokenHats The list of the hats currently shown onscreen
 * @returns A mapping from tokens to their preexisting hat
 */
function getTokenOldHatMap(oldTokenHats: readonly TokenHat[]) {
  const tokenOldHatMap = new CompositeKeyMap<Token, TokenHat>(
    ({ editor, offsets }) => [editor.id, offsets.start, offsets.end],
  );

  oldTokenHats.forEach((descriptor) =>
    tokenOldHatMap.set(descriptor.token, descriptor),
  );
  return tokenOldHatMap;
}

function getTokenRemainingHatCandidates(
  tokenGraphemeSplitter: TokenGraphemeSplitter,
  token: Token,
  availableGraphemeStyles: DefaultMap<string, HatStyleMap>,
): HatCandidate[] {
  return tokenGraphemeSplitter
    .getTokenGraphemes(token.text)
    .flatMap((grapheme) =>
      Object.entries(availableGraphemeStyles.get(grapheme.text)).map(
        ([style, { penalty }]) => ({
          grapheme,
          style,
          penalty,
        }),
      ),
    );
}

function constructHatRangeDescriptor(
  token: Token,
  chosenHat: HatCandidate,
): TokenHat {
  return {
    hatStyle: chosenHat.style,
    grapheme: chosenHat.grapheme.text,
    token,
    hatRange: new Range(
      token.range.start.translate(
        undefined,
        chosenHat.grapheme.tokenStartOffset,
      ),
      token.range.start.translate(undefined, chosenHat.grapheme.tokenEndOffset),
    ),
  };
}
