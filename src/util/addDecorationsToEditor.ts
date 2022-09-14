import { concat, flatten, maxBy, min } from "lodash";
import * as vscode from "vscode";
import { HatStyleName } from "../core/constants";
import { getTokenMatcher } from "../core/tokenizer";
import Decorations from "../core/Decorations";
import { IndividualHatMap } from "../core/IndividualHatMap";
import { TokenGraphemeSplitter } from "../core/TokenGraphemeSplitter";
import { Token } from "../typings/Types";
import { getDisplayLineMap } from "./getDisplayLineMap";
import { getTokenComparator } from "./getTokenComparator";
import { getTokensInRange } from "./getTokensInRange";

export function addDecorationsToEditors(
  hatTokenMap: IndividualHatMap,
  decorations: Decorations,
  tokenGraphemeSplitter: TokenGraphemeSplitter
) {
  hatTokenMap.clear();

  let editors: readonly vscode.TextEditor[];

  if (vscode.window.activeTextEditor == null) {
    editors = vscode.window.visibleTextEditors;
  } else {
    editors = [
      vscode.window.activeTextEditor,
      ...vscode.window.visibleTextEditors.filter(
        (editor) => editor !== vscode.window.activeTextEditor
      ),
    ];
  }

  const tokens = concat(
    [],
    ...editors.map((editor) => {
      const displayLineMap = getDisplayLineMap(editor);
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
                regex: getTokenMatcher(languageId),
              },
              end: { type: "regex", regex: getTokenMatcher(languageId) },
            },
          }))
        )
      );

      tokens.sort(
        getTokenComparator(
          displayLineMap.get(editor.selection.active.line)!,
          editor.selection.active.character
        )
      );

      return tokens;
    })
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

  const decorationRanges: Map<
    vscode.TextEditor,
    {
      [decorationName in HatStyleName]?: vscode.Range[];
    }
  > = new Map(
    editors.map((editor) => [
      editor,
      Object.fromEntries(
        decorations.decorations.map((decoration) => [decoration.name, []])
      ),
    ])
  );

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
  tokens.forEach((token, tokenIdx) => {
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
      tokenGraphemes.map(({ decorationIndex }) => decorationIndex)
    )!;

    if (minDecorationIndex >= decorations.decorations.length) {
      return;
    }

    const bestGrapheme = maxBy(
      tokenGraphemes.filter(
        ({ decorationIndex }) => decorationIndex === minDecorationIndex
      ),
      ({ text }) =>
        min(
          graphemeTokenIndices[text].filter(
            (laterTokenIdx) => laterTokenIdx > tokenIdx
          )
        ) ?? Infinity
    )!;

    const currentDecorationIndex = bestGrapheme.decorationIndex;

    const hatStyleName = decorations.decorations[currentDecorationIndex].name;

    decorationRanges
      .get(token.editor)!
      [hatStyleName]!.push(
        new vscode.Range(
          token.range.start.translate(undefined, bestGrapheme.tokenStartOffset),
          token.range.start.translate(undefined, bestGrapheme.tokenEndOffset)
        )
      );

    hatTokenMap.addToken(hatStyleName, bestGrapheme.text, token);

    graphemeDecorationIndices[bestGrapheme.text] = currentDecorationIndex + 1;
  });

  decorationRanges.forEach((ranges, editor) => {
    decorations.hatStyleNames.forEach((hatStyleName) => {
      editor.setDecorations(
        decorations.decorationMap[hatStyleName]!,
        ranges[hatStyleName]!
      );
    });
  });
}
