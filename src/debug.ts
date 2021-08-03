import * as vscode from "vscode";
import { SyntaxNode } from "web-tree-sitter";

export function logBranchTypes(getNodeAtLocation: any) {
  return (event: vscode.TextEditorSelectionChangeEvent) => {
    const location = new vscode.Location(
      vscode.window.activeTextEditor!.document.uri,
      event.selections[0]
    );

    let node: SyntaxNode = getNodeAtLocation(location);
    const ancestors: SyntaxNode[] = [node];
    while (node.parent != null) {
      ancestors.unshift(node.parent);
      node = node.parent;
    }

    ancestors.forEach((node, i) => console.debug(">".repeat(i + 1), node.type));
    const leafText = ancestors[ancestors.length - 1].text
      .replace(/\s+/g, " ")
      .substring(0, 100);
    console.debug(">".repeat(ancestors.length), `"${leafText}"`);
  };
}

const originalDebugLog = console.debug;
export function enableDebugLog(enable: boolean) {
  console.debug = enable ? originalDebugLog : () => {};
}
