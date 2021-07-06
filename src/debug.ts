import * as vscode from "vscode";
import { SyntaxNode } from "web-tree-sitter";

export function logBranchTypes(getNodeAtLocation: any) {
  return (event: vscode.TextEditorSelectionChangeEvent) => {
    const location = new vscode.Location(
      vscode.window.activeTextEditor!.document.uri,
      event.selections[0]
    );

    const ancestors: SyntaxNode[] = [];
    let node: SyntaxNode = getNodeAtLocation(location);
    while (node.parent) {
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
