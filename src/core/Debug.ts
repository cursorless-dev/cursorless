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

export const log = {
  debug: originalDebugLog,
};

export default class Debug {
  private disposableConfiguration?: Disposable;
  private disposableSelection?: Disposable;

  constructor(private graph: Graph) {
    this.graph.extensionContext.subscriptions.push(this);

    this.evaluateSetting = this.evaluateSetting.bind(this);
    this.logBranchTypes = this.logBranchTypes.bind(this);

    switch (this.graph.extensionContext.extensionMode) {
      // Development mode. Always enable.
      case ExtensionMode.Development:
        this.enableDebugLog();
        break;
      // Test mode. Always disable.
      case ExtensionMode.Test:
        this.disableDebugLog();
        break;
      // Production mode. Enable based on user setting.
      case ExtensionMode.Production:
        this.evaluateSetting();
        this.disposableConfiguration = workspace.onDidChangeConfiguration(
          this.evaluateSetting
        );
        break;
    }
  }

  init() {}

  dispose() {
    if (this.disposableConfiguration) {
      this.disposableConfiguration.dispose();
    }
    if (this.disposableSelection) {
      this.disposableSelection.dispose();
    }
  }

  private enableDebugLog() {
    log.debug = originalDebugLog;
    this.disposableSelection = window.onDidChangeTextEditorSelection(
      this.logBranchTypes
    );
  }

  private disableDebugLog() {
    log.debug = disabledDebugLog;
    if (this.disposableSelection) {
      this.disposableSelection.dispose();
    }
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

  private logBranchTypes(event: TextEditorSelectionChangeEvent) {
    const location = new Location(
      window.activeTextEditor!.document.uri,
      event.selections[0]
    );

    let node: SyntaxNode;
    try {
      node = this.graph.getNodeAtLocation(location);
    } catch (error) {
      return;
    }

    const ancestors: SyntaxNode[] = [node];
    while (node.parent != null) {
      ancestors.unshift(node.parent);
      node = node.parent;
    }

    const cursor = node.tree.walk();
    this.printCursorLocationInfo(cursor, 0);

    for (let i = 1; i < ancestors.length; ++i) {
      cursor.gotoFirstChild();
      while (cursor.currentNode().id !== ancestors[i].id) {
        if (!cursor.gotoNextSibling()) {
          return;
        }
      }
      this.printCursorLocationInfo(cursor, i);
    }

    const leafText = ancestors[ancestors.length - 1].text
      .replace(/\s+/g, " ")
      .substring(0, 100);
    log.debug(">".repeat(ancestors.length), `"${leafText}"`);
  }

  private printCursorLocationInfo(cursor: TreeCursor, depth: number) {
    const field = cursor.currentFieldName();
    const fieldText = field != null ? `${field}: ` : "";
    log.debug(">".repeat(depth + 1), `${fieldText}${cursor.nodeType}`);
  }
}
