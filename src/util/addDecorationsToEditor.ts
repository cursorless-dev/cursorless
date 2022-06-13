import { concat, flatten, maxBy, min } from "lodash";
import * as vscode from "vscode";
import { getDisplayLineMap } from "./getDisplayLineMap";
import { getTokenComparator as getTokenComparator } from "./getTokenComparator";
import { getTokensInRange } from "./getTokensInRange";
import { Token } from "../typings/Types";
import Decorations from "../core/Decorations";
import { HatStyleName } from "../core/constants";
import { TOKEN_MATCHER } from "../core/tokenizer";
import { IndividualHatMap } from "../core/IndividualHatMap";

interface CharacterTokenInfo {
  characterIdx: number;
  tokenIdx: number;
}

export function addDecorationsToEditors(
  hatTokenMap: IndividualHatMap,
  decorations: Decorations
) {
  hatTokenMap.clear();

  var editors: readonly vscode.TextEditor[];

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

  const characterTokens: {
    [key: string]: Map<Token, CharacterTokenInfo>;
  } = {};

  tokens.forEach((token, tokenIdx) => {
    [...token.text].forEach((character, characterIdx) => {
      var characterTokenMap: Map<Token, CharacterTokenInfo>;

      if (character in characterTokens) {
        characterTokenMap = characterTokens[character];
      } else {
        characterTokenMap = new Map();
        characterTokens[character] = characterTokenMap;
      }

      characterTokenMap.set(token, {
        characterIdx,
        tokenIdx,
      });
    });
  });

  const characterDecorationIndices: { [character: string]: number } = {};

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
    const tokenCharacters = [...token.text].map((character, characterIdx) => ({
      character,
      characterIdx,
      decorationIndex:
        character in characterDecorationIndices
          ? characterDecorationIndices[character]
          : 0,
    }));

    const minDecorationIndex = min(
      tokenCharacters.map(({ decorationIndex }) => decorationIndex)
    )!;

    if (minDecorationIndex >= decorations.decorations.length) {
      return;
    }

    const bestCharacter = maxBy(
      tokenCharacters.filter(
        ({ decorationIndex }) => decorationIndex === minDecorationIndex
      ),
      ({ character }) =>
        min(
          [...characterTokens[character].values()]
            .map(({ tokenIdx }) => tokenIdx)
            .filter((laterTokenIdx) => laterTokenIdx > tokenIdx)
        ) ?? Infinity
    )!;

    const currentDecorationIndex = bestCharacter.decorationIndex;

    const hatStyleName = decorations.decorations[currentDecorationIndex].name;

    decorationRanges
      .get(token.editor)!
      [hatStyleName]!.push(
        new vscode.Range(
          token.range.start.translate(undefined, bestCharacter.characterIdx),
          token.range.start.translate(undefined, bestCharacter.characterIdx + 1)
        )
      );

    hatTokenMap.addToken(hatStyleName, bestCharacter.character, token);

    characterDecorationIndices[bestCharacter.character] =
      currentDecorationIndex + 1;
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
