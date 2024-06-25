import {
  CompositeKeyMap,
  DefaultMap,
  HatStability,
  HatStyleMap,
  HatStyleName,
  Range,
  TextEditor,
  Token,
  TokenHat,
} from "@cursorless/common";
import { WordTokenizer } from "../../processTargets/modifiers/scopeHandlers/WordScopeHandler/WordTokenizer";
import { Grapheme, TokenGraphemeSplitter } from "../../tokenGraphemeSplitter";
import { chooseTokenHat } from "./chooseTokenHat";
import { getHatRankingContext } from "./getHatRankingContext";
import { getRankedTokens } from "./getRankedTokens";

export interface HatCandidate {
  grapheme: Grapheme;
  style: HatStyleName;
  penalty: number;
  isFirstLetter: boolean;
}

/**
 * Allocates hats to all the visible tokens.  Proceeds by ranking tokens
 * according to desirability (how far they are from the cursor), then assigning
 * a hat to each one in turn, deciding whether to keep old hat, steal a hat from
 * another token, or use a freely available hat.
 *
 * See [hat assignment](/docs/user/hatAssignment) for more info.
 *
 * @param tokenGraphemeSplitter Splits tokens into graphemes
 * @param enabledHatStyles A list of all enabled hat styles
 * @param oldTokenHats The previous allocation, so that we can try to maintain
 * hat stability
 * @param hatStability The user setting indicating how to trade off quality vs
 * stability
 * @param activeTextEditor Currently active text editor
 * @param visibleTextEditors All visible text editors
 * @returns A hat assignment, which is a list where each entry contains a token
 * and the hat that it will wear
 */
export function allocateHats(
  tokenGraphemeSplitter: TokenGraphemeSplitter,
  enabledHatStyles: HatStyleMap,
  oldTokenHats: readonly TokenHat[],
  hatStability: HatStability,
  activeTextEditor: TextEditor | undefined,
  visibleTextEditors: readonly TextEditor[],
): TokenHat[] {
  /**
   * Maps from tokens to their assigned hat in previous allocation
   */
  const tokenOldHatMap = getTokenOldHatMap(oldTokenHats);

  /**
   * A list of tokens in all visible document, ranked by how likely they are to
   * be used.
   */
  const rankedTokens = getRankedTokens(activeTextEditor, visibleTextEditors);

  /**
   * Lookup tables with information about which graphemes / hats appear in which
   * tokens
   */
  const context = getHatRankingContext(
    rankedTokens,
    tokenOldHatMap,
    tokenGraphemeSplitter,
  );

  /* All initially enabled hat styles. */
  const enabledHatStyleNames = Object.keys(enabledHatStyles);

  /**
   * A map from graphemes to the remaining hat styles that have not yet been
   * used for that grapheme.  As we assign hats to tokens, we remove them from
   * these arrays so that they don't get used again in this pass.
   * We use an array rather than a map to make iteration cheaper;
   * we only remove elements once, but we iterate many times,
   * and this is a hot path.
   */
  const graphemeRemainingHatCandidates = new DefaultMap<string, HatStyleName[]>(
    () => [...enabledHatStyleNames],
  );

  // Iterate through tokens in order of decreasing rank, assigning each one a
  // hat
  return rankedTokens
    .map<TokenHat | undefined>(({ token, rank: tokenRank }) => {
      /**
       * All hats for the graphemes in this token that weren't taken by a
       * higher ranked token
       */
      const tokenRemainingHatCandidates = getTokenRemainingHatCandidates(
        tokenGraphemeSplitter,
        token,
        graphemeRemainingHatCandidates,
        enabledHatStyles,
      );

      const chosenHat = chooseTokenHat(
        context,
        hatStability,
        tokenRank,
        tokenOldHatMap.get(token),
        tokenRemainingHatCandidates,
      );

      // If there are no hats left for the graphemes in this token, the token
      // will get no hat
      if (chosenHat == null) {
        return undefined;
      }

      // Remove the hat we chose from consideration for lower ranked tokens
      graphemeRemainingHatCandidates.set(
        chosenHat.grapheme.text,
        graphemeRemainingHatCandidates
          .get(chosenHat.grapheme.text)
          .filter((style) => style !== chosenHat.style),
      );
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
  graphemeRemainingHatCandidates: DefaultMap<string, HatStyleName[]>,
  enabledHatStyles: HatStyleMap,
): HatCandidate[] {
  // Use iteration here instead of functional constructs,
  // because this is a hot path and we want to avoid allocating arrays
  // and calling tiny functions lots of times.
  const words = new WordTokenizer(
    token.editor.document.languageId,
  ).splitIdentifier(token.text);
  const firstLetters = new Set<number>(words.map((word) => word.index));
  const candidates: HatCandidate[] = [];
  const graphemes = tokenGraphemeSplitter.getTokenGraphemes(token.text);
  for (const grapheme of graphemes) {
    for (const style of graphemeRemainingHatCandidates.get(grapheme.text)) {
      // Allocating and pushing all of these objects is
      // the single most expensive thing in hat allocation.
      // Please pay attention to performance when modifying this code.
      candidates.push({
        grapheme,
        style,
        penalty: enabledHatStyles[style].penalty,
        isFirstLetter: firstLetters.has(grapheme.tokenStartOffset),
      });
    }
  }
  return candidates;
}

/**
 * @param token The token that received the hat
 * @param chosenHat The hat we chose for the token
 * @returns An object indicating the hat assigned to the token, along with the
 * range of the grapheme upon which it sits
 */
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
