import * as vscode from "vscode";
import { SyntaxNode } from "web-tree-sitter";

export function logBranchTypes(getNodeAtLocation: any) {
  return (event: vscode.TextEditorSelectionChangeEvent) => {
    const getBranch = (branch: SyntaxNode[]): SyntaxNode[] => {
      if (branch[0].parent) {
        return getBranch([branch[0].parent, ...branch]);
      }
      return branch;
    };

    const location = new vscode.Location(
      vscode.window.activeTextEditor!.document.uri,
      event.selections[0]
    );
    const leaf: SyntaxNode = getNodeAtLocation(location);
    const branch = getBranch([leaf]);
    branch.forEach((node, i) => console.debug(">".repeat(i + 1), node.type));
    const leafText = leaf.text.replace(/\s+/g, " ").substring(0, 100);
    console.debug(">".repeat(branch.length), `"${leafText}"`);
  };
}
