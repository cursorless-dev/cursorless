import {
  Disposable,
  ExtensionMode,
  Location,
  TextEditorSelectionChangeEvent,
  window,
  workspace,
} from "vscode";
import { SyntaxNode, TreeCursor } from "web-tree-sitter";
import { Graph } from "../typings/Types";

const originalDebugLog = console.debug;
const disabledDebugLog = () => {};

console.debug = disabledDebugLog;

export default class Debug {
  getNodeAtLocation?: any;
  disposable?: Disposable;

  constructor(private graph: Graph) {
    this.graph.extensionContext.subscriptions.push(this);

    switch (this.graph.extensionContext.extensionMode) {
      // Development mode. Always enable.
      case ExtensionMode.Development:
        this.enableDebugLog();
        break;
      // r mode. Always disable.
      case ExtensionMode.Test:
        this.disableDebugLog();
        break;
      // Production mode. Enable based on user setting.
      case ExtensionMode.Production:
        this.evaluateSetting();
        workspace.onDidChangeConfiguration(this.evaluateSetting);
        break;
    }
  }

  init(getNodeAtLocation: any) {
    this.getNodeAtLocation = getNodeAtLocation;
  }

  dispose() {
    if (this.disposable) {
      this.disposable.dispose();
    }
  }

  private enableDebugLog() {
    console.debug = originalDebugLog;
    this.disposable = window.onDidChangeTextEditorSelection(
      this.logBranchTypes()
    );
  }

  private disableDebugLog() {
    console.debug = disabledDebugLog;
    this.dispose();
  }

  private evaluateSetting() {
    const debugEnabled = workspace
      .getConfiguration("cursorless")
      .get<boolean>("debug")!;
    if (debugEnabled) {
      this.enableDebugLog();
    } else {
      this.disableDebugLog();
    }
  }

  private logBranchTypes() {
    return (event: TextEditorSelectionChangeEvent) => {
      const location = new Location(
        window.activeTextEditor!.document.uri,
        event.selections[0]
      );

      let node: SyntaxNode;
      try {
        node = this.getNodeAtLocation(location);
      } catch (error) {
        return;
      }

      const ancestors: SyntaxNode[] = [node];
      while (node.parent != null) {
        ancestors.unshift(node.parent);
        node = node.parent;
      }

      const cursor = node.tree.walk();
      this.print(cursor, 0);

      for (let i = 1; i < ancestors.length; ++i) {
        cursor.gotoFirstChild();
        while (cursor.currentNode().id !== ancestors[i].id) {
          if (!cursor.gotoNextSibling()) {
            return;
          }
        }
        this.print(cursor, i);
      }

      const leafText = ancestors[ancestors.length - 1].text
        .replace(/\s+/g, " ")
        .substring(0, 100);
      console.debug(">".repeat(ancestors.length), `"${leafText}"`);
    };
  }

  private print(cursor: TreeCursor, depth: number) {
    const field = cursor.currentFieldName();
    const fieldText = field != null ? `${field}: ` : "";
    console.debug(">".repeat(depth + 1), `${fieldText}${cursor.nodeType}`);
  }
}
