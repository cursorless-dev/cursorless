/**
 * TODO: This is just an ugly mock since that tokenizer doesn't have access to the graph/ide
 * Remove this once https://github.com/cursorless-dev/cursorless/issues/785 is implemented
 */

import * as vscode from "vscode";

const defaultGetWordSeparators = (languageId: string) => {
  return vscode.workspace
    .getConfiguration("cursorless", { languageId })
    .get<string[]>("wordSeparators", ["_"]);
};

let getWordSeparators = defaultGetWordSeparators;

export const tokenizerConfiguration = {
  getWordSeparators: (languageId: string) => {
    return getWordSeparators(languageId);
  },
  overrideWordSeparators: () => {
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
