import type { TreeSitter } from "@cursorless/common";
import type { ParseTreeApi } from "@cursorless/vscode-common";

export function createTreeSitter(parseTreeApi: ParseTreeApi): TreeSitter {
  return {
    loadLanguage: parseTreeApi.loadLanguage,
    createQuery: parseTreeApi.createQuery,
    getTree: (document) => parseTreeApi.getTreeForUri(document.uri),
  };
}
