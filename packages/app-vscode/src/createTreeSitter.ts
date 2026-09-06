import type { TreeSitter } from "@cursorless/lib-common";
import type { ParseTreeApi } from "@cursorless/lib-vscode-common";

export function createTreeSitter(parseTreeApi: ParseTreeApi): TreeSitter {
  return {
    loadLanguage: parseTreeApi.loadLanguage,
    createQuery: parseTreeApi.createQuery,
    getTree: (document) => parseTreeApi.getTreeForUri(document.uri),
  };
}
