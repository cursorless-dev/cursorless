import { concat, flatten, maxBy, min } from "lodash";
import * as vscode from "vscode";
import { HatStyleName } from "../core/constants";
import Decorations from "../core/Decorations";
import { IndividualHatMap } from "../core/IndividualHatMap";
import { TOKEN_MATCHER } from "../core/tokenizer";
import { Token, TokenHatSplittingMode } from "../typings/Types";
import { getDisplayLineMap } from "./getDisplayLineMap";
import { getTokenComparator } from "./getTokenComparator";
import { getTokensInRange } from "./getTokensInRange";
import { matchAll } from "./regex";

export function addDecorationsToEditors(
  hatTokenMap: IndividualHatMap,
  decorations: Decorations,
  tokenHatSplittingMode: TokenHatSplittingMode
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

      const tokens: Token[] = flatten(
        editor.visibleRanges.map((range) =>
          getTokensInRange(editor, range).map((partialToken) => ({
            ...partialToken,
            displayLine: displayLineMap.get(partialToken.range.start.line)!,
            editor,
            expansionBehavior: {
              start: { type: "regex", regex: TOKEN_MATCHER },
              end: { type: "regex", regex: TOKEN_MATCHER },
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
   * Maps each lexeme to a list of the indices of the tokens in which the given
   * lexeme appears.
   */
  const lexemeTokenIndices: {
    [key: string]: number[];
  } = {};

  tokens.forEach((token, tokenIdx) => {
    getTokenLexemes(token.text, tokenHatSplittingMode).forEach(
      ({ text: lexemeText }) => {
        let tokenIndicesForLexeme: number[];

        if (lexemeText in lexemeTokenIndices) {
          tokenIndicesForLexeme = lexemeTokenIndices[lexemeText];
        } else {
          tokenIndicesForLexeme = [];
          lexemeTokenIndices[lexemeText] = tokenIndicesForLexeme;
        }

        tokenIndicesForLexeme.push(tokenIdx);
      }
    );
  });

  const lexemeDecorationIndices: { [lexeme: string]: number } = {};

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
    const tokenLexemes = getTokenLexemes(token.text, tokenHatSplittingMode).map(
      (lexeme) => ({
        ...lexeme,
        decorationIndex:
          lexeme.text in lexemeDecorationIndices
            ? lexemeDecorationIndices[lexeme.text]
            : 0,
      })
    );

    const minDecorationIndex = min(
      tokenLexemes.map(({ decorationIndex }) => decorationIndex)
    )!;

    if (minDecorationIndex >= decorations.decorations.length) {
      return;
    }

    const bestLexeme = maxBy(
      tokenLexemes.filter(
        ({ decorationIndex }) => decorationIndex === minDecorationIndex
      ),
      ({ text }) =>
        min(
          lexemeTokenIndices[text].filter(
            (laterTokenIdx) => laterTokenIdx > tokenIdx
          )
        ) ?? Infinity
    )!;

    const currentDecorationIndex = bestLexeme.decorationIndex;

    const hatStyleName = decorations.decorations[currentDecorationIndex].name;

    decorationRanges
      .get(token.editor)!
      [hatStyleName]!.push(
        new vscode.Range(
          token.range.start.translate(undefined, bestLexeme.tokenStartOffset),
          token.range.start.translate(undefined, bestLexeme.tokenEndOffset)
        )
      );

    hatTokenMap.addToken(hatStyleName, bestLexeme.text, token);

    lexemeDecorationIndices[bestLexeme.text] = currentDecorationIndex + 1;
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

export interface Lexeme {
  /** The normalised text of the lexeme. */
  text: string;

  /** The start offset of the lexeme within its containing token */
  tokenStartOffset: number;

  /** The end offset of the lexeme within its containing token */
  tokenEndOffset: number;
}

export function getTokenLexemes(
  text: string,
  tokenHatSplittingMode: TokenHatSplittingMode
): Lexeme[] {
  const { preserveCase, removeAccents } = tokenHatSplittingMode;

  if (removeAccents) {
    return matchAll<Lexeme>(text, /\p{L}\p{M}*|\P{L}/gu, (match) => {
      const matchTextNoAccents = match[0]
        .normalize("NFD")
        .replace(/\p{M}/gu, "");

      return {
        text: preserveCase
          ? matchTextNoAccents
          : matchTextNoAccents.toLowerCase(),
        tokenStartOffset: match.index!,
        tokenEndOffset: match.index! + match[0].length,
      };
    });
  } else {
    const normalisedText = preserveCase ? text : text.toLowerCase();

    return [...normalisedText].map((character, idx) => ({
      text: character,
      tokenStartOffset: idx,
      tokenEndOffset: idx + 1,
    }));
  }
}
