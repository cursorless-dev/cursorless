import { DefaultMap, minByAll, Range, TextEditor } from "@cursorless/common";
import { clone, flatten, maxBy, min } from "lodash";
import { HatStyleMap } from "../libs/common/ide/types/Hats";
import { HatStyleName } from "../libs/common/ide/types/hatStyles.types";
import CompositeKeyMap from "../libs/common/util/CompositeKeyMap";
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
  const oldTokenHatMap = new CompositeKeyMap<Token, HatRangeDescriptor>(
    ({ editor, offsets }) => [editor.id, offsets.start, offsets.end],
  );

  oldHatRangeDescriptors.forEach((descriptor) =>
    oldTokenHatMap.set(descriptor.token, descriptor),
  );

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
  const availableGraphemeStyles = new DefaultMap<string, HatStyleMap>(() =>
    clone(enabledHatStyles),
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
      const tokenAvailableHats = tokenGraphemeSplitter
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

      if (tokenAvailableHats.length === 0) {
        return undefined;
      }

      const minimumPenaltyHats = minByAll(
        tokenAvailableHats,
        ({ penalty }) => penalty,
      );

      const existingTokenHat = oldTokenHatMap.get(token);

      const chosenGrapheme =
        (existingTokenHat != null
          ? minimumPenaltyHats.find(
              (hat) =>
                hat.grapheme.text === existingTokenHat.grapheme &&
                hat.style === existingTokenHat.hatStyle,
            )
          : null) ??
        maxBy(
          minimumPenaltyHats,
          ({ grapheme: { text } }) =>
            min(
              graphemeTokenIndices[text].filter(
                (laterTokenIdx) => laterTokenIdx > tokenIdx,
              ),
            ) ?? Infinity,
        )!;

      // Otherwise, pick the grapheme that is used in the token furthest away
      // TODO: Should we take into account whether the grapheme that we pick
      // steals a hat from another grapheme in oldHatRangeDescriptors?

      delete availableGraphemeStyles.get(chosenGrapheme.grapheme.text)[
        chosenGrapheme.style
      ];

      return {
        hatStyle: chosenGrapheme.style,
        grapheme: chosenGrapheme.grapheme.text,
        token,
        hatRange: new Range(
          token.range.start.translate(
            undefined,
            chosenGrapheme.grapheme.tokenStartOffset,
          ),
          token.range.start.translate(
            undefined,
            chosenGrapheme.grapheme.tokenEndOffset,
          ),
        ),
      };
    })
    .filter((value): value is HatRangeDescriptor => value != null);
}
