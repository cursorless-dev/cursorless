import { flatten, maxBy, min } from "lodash";
import * as vscode from "vscode";

interface Token {
  text: string;
  range: vscode.Range;
}

interface CharacterTokenInfo {
  characterIdx: number;
  tokenIdx: number;
}

const TOKEN_MATCHER = /\w+/g;

const COLORS = [
  "default",
  "green",
  "red",
  "gray",
  "brown",
  "teal",
  "taupe",
  "blue",
];

export function activate(context: vscode.ExtensionContext) {
  const decorations = COLORS.map((color) => ({
    name: color,
    decoration: vscode.window.createTextEditorDecorationType({
      borderStyle: "solid",
      borderColor: new vscode.ThemeColor(`decorativeNavigation.${color}`),
      borderWidth: "1px 0px 0px 0px",
    }),
  }));
  const decorationMap = Object.fromEntries(
    decorations.map(({ name, decoration }) => [name, decoration])
  );

  function getTokens(editor: vscode.TextEditor, range: vscode.Range): Token[] {
    const text = editor.document.getText(range).toLowerCase();
    const rangeOffset = editor.document.offsetAt(range.start);

    return Array.from(text.matchAll(TOKEN_MATCHER), (match) => ({
      text: match[0],
      range: new vscode.Range(
        editor.document.positionAt(rangeOffset + match.index!),
        editor.document.positionAt(rangeOffset + match.index! + match[0].length)
      ),
    }));
  }

  let disposable = vscode.commands.registerTextEditorCommand(
    "decorative-navigation.helloWorld",
    (editor: vscode.TextEditor) => {
      const tokens = flatten(
        editor.visibleRanges.map((range) => getTokens(editor, range))
      );

      tokens.sort((token1, token2) => {
        const token1LineDiff = Math.abs(
          token1.range.start.line - editor.selection.start.line
        );

        const token2LineDiff = Math.abs(
          token2.range.start.line - editor.selection.start.line
        );

        if (token1LineDiff < token2LineDiff) {
          return -1;
        }

        if (token1LineDiff > token2LineDiff) {
          return 1;
        }

        const token1CharacterDiff = Math.abs(
          token1.range.start.character - editor.selection.start.character
        );

        const token2CharacterDiff = Math.abs(
          token2.range.start.character - editor.selection.start.character
        );

        return token1CharacterDiff - token2CharacterDiff;
      });

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
          })
        );

        const minDecorationIndex = min(
          tokenCharacters.map(({ character }) =>
            character in characterDecorationIndices
              ? characterDecorationIndices[character]
              : 0
          )
        );

        const bestCharacter = maxBy(
          tokenCharacters.filter(({ character }) => {
            const decorationIndex =
              character in characterDecorationIndices
                ? characterDecorationIndices[character]
                : 0;

            return decorationIndex === minDecorationIndex;
          }),
          ({ character }) =>
            min(
              [...characterTokens[character].values()]
                .map(({ tokenIdx }) => tokenIdx)
                .filter((laterTokenIdx) => laterTokenIdx > tokenIdx)
            ) ?? Infinity
        )!;

        const currentDecorationIndex =
          bestCharacter.character in characterDecorationIndices
            ? characterDecorationIndices[bestCharacter.character]
            : 0;

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
