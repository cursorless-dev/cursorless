import { flatten, maxBy, min } from "lodash";
import * as vscode from "vscode";
import { getDisplayLineMap } from "./getDisplayLineMap";
import { getTokenComparator as getTokenComparator } from "./getTokenComparator";
import { getTokensInRange } from "./getTokensInRange";
import { Token } from "./Types";
import Decorations from "./Decorations";
import { COLORS, SymbolColor } from "./constants";
import NavigationMap from "./NavigationMap";

interface CharacterTokenInfo {
  characterIdx: number;
  tokenIdx: number;
}

export function addDecorationsToEditor(
  editor: vscode.TextEditor,
  decorations: Decorations
) {
  const displayLineMap = getDisplayLineMap(editor);

  const tokens = flatten(
    editor.visibleRanges.map((range) =>
      getTokensInRange(editor, range, displayLineMap)
    )
  );

  tokens.sort(
    getTokenComparator(
      displayLineMap.get(editor.selection.start.line)!,
      editor.selection.start.character
    )
  );

  console.log(JSON.stringify(tokens.map((token) => token.text)));

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

  const decorationRanges: {
    [decorationName in SymbolColor]?: vscode.Range[];
  } = Object.fromEntries(
    decorations.decorations.map((decoration) => [decoration.name, []])
  );

  const navigationMap = new NavigationMap();

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

    const colorName = decorations.decorations[currentDecorationIndex].name;

    decorationRanges[colorName]!.push(
      new vscode.Range(
        token.range.start.translate(undefined, bestCharacter.characterIdx),
        token.range.start.translate(undefined, bestCharacter.characterIdx + 1)
      )
    );

    navigationMap.addToken(colorName, bestCharacter.character, token);

    characterDecorationIndices[bestCharacter.character] =
      currentDecorationIndex + 1;
  });

  COLORS.forEach((color) => {
    editor.setDecorations(
      decorations.decorationMap[color]!,
      decorationRanges[color]!
    );
  });

  return navigationMap;
}
