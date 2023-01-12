import { Range, TextEditor } from "@cursorless/common";
import { flatten, maxBy, min, sortBy } from "lodash";
import { HatStyleMap } from "../libs/common/ide/types/Hats";
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
  enabledHatStyles: HatStyleMap,
  oldHatRangeDescriptors: HatRangeDescriptor[],
  activeTextEditor: TextEditor | undefined,
  visibleTextEditors: readonly TextEditor[],
): HatRangeDescriptor[] {
  const sortedHatStyleNames: HatStyleName[] =
    getSortedHatStyleNames(enabledHatStyles);

  let editors: readonly TextEditor[];

  if (activeTextEditor == null) {
    editors = visibleTextEditors;
  } else {
    editors = [
      activeTextEditor!,
      ...visibleTextEditors.filter((editor) => editor !== activeTextEditor),
    ];
  }

  const tokens = editors.flatMap((editor) => {
    /**
     * The reference position that will be used to judge how likely a given
     * token is to be used.  Tokens closer to this position will be considered
     * more likely to be used, and will get better hats.  We use the first
     * selection's {@link Selection.active active}.
     */
    const referencePosition = editor.selections[0].active;
    const displayLineMap = getDisplayLineMap(editor, [referencePosition.line]);
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
  });

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

  // TODO: Keep track of which grapheme / style combinations have been used
  // Would behave like a Python defaultdict
  const usedGraphemeStyles = new DefaultDict<string, Set<HatStyleName>>(
    () => new Set<HatStyleName>(),
  );

  // Picks the character with minimum color such that the next token that contains
  // that character is as far away as possible.
  // TODO: Could be improved by ignoring subsequent tokens that also contain
  // another character that can be used with lower color. To compute that, look
  // at all the other characters in the given subsequent token, look at their
  // current color, and add the number of times it appears in between the
  // current token and the given subsequent token.
  //
  // Here is an example where the existing algorithm falls down:
  // "ab ax b"
  return tokens
    .map<HatRangeDescriptor | undefined>((token, tokenIdx) => {
      const availableGraphemeHats = tokenGraphemeSplitter
        .getTokenGraphemes(token.text)
        .map((grapheme) => {
          const usedStyles: Set<HatStyleName> = usedGraphemeStyles.get(
            grapheme.text,
          );

          return {
            grapheme,
            availableStyles: sortedHatStyleNames
              .filter((value) => !usedStyles.has(value))
              .map((style) => ({
                style,
                penalty: enabledHatStyles[style].penalty,
              })),
          };
        });

      const minStylePenalty = min(
        availableGraphemeHats.flatMap(({ availableStyles }) =>
          availableStyles.map(({ penalty }) => penalty),
        ),
      );

      if (minStylePenalty == null) {
        return undefined;
      }

      const equalPenaltyHats = availableGraphemeHats
        .flatMap(({ grapheme, availableStyles }) =>
          availableStyles.map((style) => ({ style, grapheme })),
        )
        .filter(({ style: { penalty } }) => penalty === minStylePenalty);

      // TODO: If one of equalPenaltyHats is the hat used for this token in
      // oldHatRangeDescriptors, use that one.

      // Otherwise, pick the grapheme that is used in the token furthest away
      // TODO: Should we take into account whether the grapheme that we pick
      // steals a hat from another grapheme in oldHatRangeDescriptors?
      const bestGrapheme = maxBy(
        equalPenaltyHats,
        ({ text }) =>
          min(
            graphemeTokenIndices[text].filter(
              (laterTokenIdx) => laterTokenIdx > tokenIdx,
            ),
          ) ?? Infinity,
      )!;

      usedGraphemeStyles
        .get(bestGrapheme.grapheme.text)
        .add(bestGrapheme.style.style);

      return {
        hatStyle: bestGrapheme.style.style,
        grapheme: bestGrapheme.grapheme.text,
        token,
        hatRange: new Range(
          token.range.start.translate(
            undefined,
            bestGrapheme.grapheme.tokenStartOffset,
          ),
          token.range.start.translate(
            undefined,
            bestGrapheme.grapheme.tokenEndOffset,
          ),
        ),
      };
    })
    .filter((value): value is HatRangeDescriptor => value != null);
}

function getSortedHatStyleNames(enabledHatStyles: HatStyleMap) {
  return sortBy(
    Object.entries(enabledHatStyles),
    ([_, { penalty }]) => penalty,
  ).map(([hatStyleName, _]) => hatStyleName as HatStyleName);
}
