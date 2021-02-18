import { flatten, maxBy, min } from "lodash";
import * as vscode from "vscode";
import { getDisplayLineMap } from "./getDisplayLineMap";
import { getTokenComparator as getTokenComparator } from "./getTokenComparator";
import { Token } from "./Token";

interface CharacterTokenInfo {
  characterIdx: number;
  tokenIdx: number;
}

const TOKEN_MATCHER = /[a-zA-Z_][a-zA-Z_0-9]+|\-?((\d+(\.\d*)?)|(\.\d+))|[^\s\w]/g;

const COLORS = [
  "default",
  "green",
  "red",
  "brown",
  "mauve",
  "blue",
  "gray",
  "teal",
];

export function activate(context: vscode.ExtensionContext) {
  const decorations = COLORS.map((color) => ({
    name: color,
    decoration: vscode.window.createTextEditorDecorationType({
      borderStyle: "solid",
      borderColor: new vscode.ThemeColor(`decorativeNavigation.${color}Border`),
      borderWidth: "1px",
      borderRadius: "1px",
      backgroundColor: new vscode.ThemeColor(
        `decorativeNavigation.${color}Background`
      ),
    }),
  }));
  const decorationMap = Object.fromEntries(
    decorations.map(({ name, decoration }) => [name, decoration])
  );

  function getTokens(
    editor: vscode.TextEditor,
    range: vscode.Range,
    displayLineMap: Map<number, number>
  ): Token[] {
    const text = editor.document.getText(range).toLowerCase();
    const rangeOffset = editor.document.offsetAt(range.start);

    return Array.from(text.matchAll(TOKEN_MATCHER), (match) => {
      const range = new vscode.Range(
        editor.document.positionAt(rangeOffset + match.index!),
        editor.document.positionAt(rangeOffset + match.index! + match[0].length)
      );
      return {
        text: match[0],
        range,
        displayLine: displayLineMap.get(range.start.line)!,
      };
    });
  }

  let disposable = vscode.commands.registerTextEditorCommand(
    "decorative-navigation.helloWorld",
    (editor: vscode.TextEditor) => {
      const displayLineMap = getDisplayLineMap(editor);

      const tokens = flatten(
        editor.visibleRanges.map((range) =>
          getTokens(editor, range, displayLineMap)
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
        decorations.map((decoration) => [decoration.name, []])
      );

      tokens.forEach((token, tokenIdx) => {
        const tokenCharacters = [...token.text].map(
          (character, characterIdx) => ({
            character,
            characterIdx,
            decorationIndex:
              character in characterDecorationIndices
                ? characterDecorationIndices[character]
                : 0,
          })
        );

        const minDecorationIndex = min(
          tokenCharacters.map(({ decorationIndex }) => decorationIndex)
        )!;

        if (minDecorationIndex >= decorations.length) {
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

        decorationRanges[decorations[currentDecorationIndex].name].push(
          new vscode.Range(
            token.range.start.translate(undefined, bestCharacter.characterIdx),
            token.range.start.translate(
              undefined,
              bestCharacter.characterIdx + 1
            )
          )
        );

        characterDecorationIndices[bestCharacter.character] =
          currentDecorationIndex + 1;
      });

      Object.entries(decorationRanges).forEach(([name, ranges]) => {
        editor.setDecorations(decorationMap[name], ranges);
      });
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
