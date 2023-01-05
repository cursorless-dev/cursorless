import { Range, TextEditor } from "@cursorless/common";
import { concat, flatten, maxBy, min } from "lodash";
import { HatStyleName } from "../libs/common/ide/types/hatStyles.types";
import { TokenGraphemeSplitter } from "../libs/cursorless-engine/tokenGraphemeSplitter";
import { getMatcher } from "../libs/cursorless-engine/tokenizer";
import { Token } from "../typings/Types";
import { getDisplayLineMap } from "./getDisplayLineMap";
import { getTokenComparator } from "./getTokenComparator";
import { getTokensInRange } from "./getTokensInRange";

export interface HatRangeDescriptor {
  hatStyle: HatStyleName;
  grapheme: string;
  token: Token;
  hatRange: Range;
}

export function computeHatRanges(
  tokenGraphemeSplitter: TokenGraphemeSplitter,
  sortedHatStyleNames: HatStyleName[],
  activeTextEditor: TextEditor | undefined,
  visibleTextEditors: readonly TextEditor[],
): HatRangeDescriptor[] {
  let editors: readonly TextEditor[];

  if (activeTextEditor == null) {
    editors = visibleTextEditors;
  } else {
    editors = [
      activeTextEditor!,
      ...visibleTextEditors.filter((editor) => editor !== activeTextEditor),
    ];
  }

  const tokens = concat(
    [],
    ...editors.map((editor) => {
      /**
       * The reference position that will be used to judge how likely a given
       * token is to be used.  Tokens closer to this position will be considered
       * more likely to be used, and will get better hats.  We use the first
       * selection's {@link Selection.active active}.
       */
      const referencePosition = editor.selections[0].active;
      const displayLineMap = getDisplayLineMap(editor, [
        referencePosition.line,
      ]);
      const languageId = editor.document.languageId;
      const tokens: Token[] = flatten(
        editor.visibleRanges.map((range) =>
          getTokensInRange(editor, range).map((partialToken) => ({
            ...partialToken,
            displayLine: displayLineMap.get(partialToken.range.start.line)!,
            editor,
            expansionBehavior: {
              start: {
                type: "regex",
                regex: getMatcher(languageId).tokenMatcher,
              },
              end: {
                type: "regex",
                regex: getMatcher(languageId).tokenMatcher,
              },
            },
          })),
        ),
      );

      tokens.sort(
        getTokenComparator(
          displayLineMap.get(referencePosition.line)!,
          referencePosition.character,
        ),
      );

      return tokens;
    }),
  );

  /**
   * Maps each grapheme to a list of the indices of the tokens in which the given
   * grapheme appears.
   */
  const graphemeTokenIndices: {
    [key: string]: number[];
  } = {};

  tokens.forEach((token, tokenIdx) => {
    tokenGraphemeSplitter
      .getTokenGraphemes(token.text)
      .forEach(({ text: graphemeText }) => {
        let tokenIndicesForGrapheme: number[];

        if (graphemeText in graphemeTokenIndices) {
          tokenIndicesForGrapheme = graphemeTokenIndices[graphemeText];
        } else {
          tokenIndicesForGrapheme = [];
          graphemeTokenIndices[graphemeText] = tokenIndicesForGrapheme;
        }

        tokenIndicesForGrapheme.push(tokenIdx);
      });
  });

  const graphemeDecorationIndices: { [grapheme: string]: number } = {};

  // Picks the character with minimum color such that the next token that contains
  // that character is as far away as possible.
  // TODO: Could be improved by ignoring subsequent tokens that also contain
  // another character that can be used with lower color. To compute that, look
  // at all the other characters in the given subsequent token, look at their
  // current color, and add the number of times it appears in between the
  // current token and the given subsequent token.
  //
  // Here is an example where the existing algorithm false down:
  // "ab ax b"
  return tokens
    .map<HatRangeDescriptor | undefined>((token, tokenIdx) => {
      const tokenGraphemes = tokenGraphemeSplitter
        .getTokenGraphemes(token.text)
        .map((grapheme) => ({
          ...grapheme,
          decorationIndex:
            grapheme.text in graphemeDecorationIndices
              ? graphemeDecorationIndices[grapheme.text]
              : 0,
        }));

      const minDecorationIndex = min(
        tokenGraphemes.map(({ decorationIndex }) => decorationIndex),
      )!;

      if (minDecorationIndex >= sortedHatStyleNames.length) {
        return undefined;
      }

      const bestGrapheme = maxBy(
        tokenGraphemes.filter(
          ({ decorationIndex }) => decorationIndex === minDecorationIndex,
        ),
        ({ text }) =>
          min(
            graphemeTokenIndices[text].filter(
              (laterTokenIdx) => laterTokenIdx > tokenIdx,
            ),
          ) ?? Infinity,
      )!;

      const currentDecorationIndex = bestGrapheme.decorationIndex;

      const hatStyleName = sortedHatStyleNames[currentDecorationIndex];

      graphemeDecorationIndices[bestGrapheme.text] = currentDecorationIndex + 1;

      return {
        hatStyle: hatStyleName,
        grapheme: bestGrapheme.text,
        token,
        hatRange: new Range(
          token.range.start.translate(undefined, bestGrapheme.tokenStartOffset),
          token.range.start.translate(undefined, bestGrapheme.tokenEndOffset),
        ),
      };
    })
    .filter((value): value is HatRangeDescriptor => value != null);
}
