/**
 * TODO: This is just an ugly mock since that tokenizer doesn't have access to the graph/ide
 * Remove this once https://github.com/cursorless-dev/cursorless/issues/785 is implemented
 */

import * as vscode from "vscode";

const defaultGetWordSeparators = (languageId: string) => {
  // FIXME: The reason this code will auto-reload on settings change is that we don't use fine-grained settings listener in `Decorations`:
  // https://github.com/cursorless-dev/cursorless/blob/c914d477c9624c498a47c964088b34e484eac494/src/core/Decorations.ts#L58
  return vscode.workspace
    .getConfiguration("cursorless", { languageId })
    .get<string[]>("wordSeparators", ["_"]);
};

let getWordSeparators = defaultGetWordSeparators;

export const tokenizerConfiguration = {
  getWordSeparators: (languageId: string) => {
    return getWordSeparators(languageId);
  },
  // For testing purposes, we override the word separator in a few languages to
  // make sure that overriding the word separator works.  Note that in
  // production, we tokenize all languages the same way by default.
  mockWordSeparators: () => {
    getWordSeparators = (languageId: string) => {
      switch (languageId) {
        case "css":
        case "scss":
        case "shellscript":
          return ["-", "_"];
      }
      return ["_"];
    };
  },
};
