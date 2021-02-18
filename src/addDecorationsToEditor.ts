import { flatten, maxBy, min } from "lodash";
import * as vscode from "vscode";
import { getDisplayLineMap } from "./getDisplayLineMap";
import { getTokenComparator as getTokenComparator } from "./getTokenComparator";
import { getTokensInRange } from "./getTokensInRange";
import { Token } from "./Types";
import { CharacterTokenInfo } from "./extension";
import Decorations from "./Decorations";

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
    [decorationName: string]: vscode.Range[];
  } = Object.fromEntries(
    decorations.decorations.map((decoration) => [decoration.name, []])
  );

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

    decorationRanges[decorations.decorations[currentDecorationIndex].name].push(
      new vscode.Range(
        token.range.start.translate(undefined, bestCharacter.characterIdx),
        token.range.start.translate(undefined, bestCharacter.characterIdx + 1)
      )
    );

    characterDecorationIndices[bestCharacter.character] =
      currentDecorationIndex + 1;
  });

  Object.entries(decorationRanges).forEach(([name, ranges]) => {
    editor.setDecorations(decorations.decorationMap[name], ranges);
  });
}
