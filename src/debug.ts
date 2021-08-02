import * as vscode from "vscode";
import { SyntaxNode, TreeCursor } from "web-tree-sitter";

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

    const print = (cursor: TreeCursor, depth: number) => {
      const field = cursor.currentFieldName();
      const fieldText = field != null ? `${field}: ` : "";
      console.debug(">".repeat(depth + 1), `${fieldText}${cursor.nodeType}`);
    };

    const cursor = node.tree.walk();
    print(cursor, 0);

    for (let i = 1; i < ancestors.length; ++i) {
      cursor.gotoFirstChild();
      while (cursor.currentNode().id !== ancestors[i].id) {
        if (!cursor.gotoNextSibling()) {
          return;
        }
      }
      print(cursor, i);
    }

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
