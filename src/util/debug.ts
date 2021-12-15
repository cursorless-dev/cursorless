import {
  Disposable,
  ExtensionContext,
  ExtensionMode,
  Location,
  TextEditorSelectionChangeEvent,
  window,
  workspace,
} from "vscode";
import { SyntaxNode, TreeCursor } from "web-tree-sitter";

const originalDebugLog = console.debug;
let _getNodeAtLocation: any;
let disposable: Disposable;

export function initDebug(context: ExtensionContext) {
  switch (context.extensionMode) {
    // Development mode. Always enable.
    case ExtensionMode.Development:
      enableDebugLog();
      break;
    // Test mode. Always disable.
    case ExtensionMode.Test:
      disableDebugLog();
      break;
    // Production mode. Enable based on user setting.
    case ExtensionMode.Production:
      evaluateSetting();
      workspace.onDidChangeConfiguration(evaluateSetting);
      break;
  }
}

export function debugSetNodeAtLocation(getNodeAtLocation: any) {
  _getNodeAtLocation = getNodeAtLocation;
}

function enableDebugLog() {
  console.debug = originalDebugLog;
  disposable = window.onDidChangeTextEditorSelection(logBranchTypes());
}

function disableDebugLog() {
  console.debug = () => {};
  if (disposable) {
    disposable.dispose();
  }
}

function evaluateSetting() {
  const debugEnabled = workspace
    .getConfiguration("cursorless")
    .get<boolean>("debug")!;
  if (debugEnabled) {
    enableDebugLog();
  } else {
    disableDebugLog();
  }
}

function logBranchTypes() {
  return (event: TextEditorSelectionChangeEvent) => {
    const location = new Location(
      window.activeTextEditor!.document.uri,
      event.selections[0]
    );

    let node: SyntaxNode;
    try {
      node = _getNodeAtLocation(location);
    } catch (error) {
      return;
    }

    const ancestors: SyntaxNode[] = [node];
    while (node.parent != null) {
      ancestors.unshift(node.parent);
      node = node.parent;
    }

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

const print = (cursor: TreeCursor, depth: number) => {
  const field = cursor.currentFieldName();
  const fieldText = field != null ? `${field}: ` : "";
  console.debug(">".repeat(depth + 1), `${fieldText}${cursor.nodeType}`);
};
