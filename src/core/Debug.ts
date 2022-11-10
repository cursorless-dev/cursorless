import {
  Disposable,
  Location,
  TextEditorSelectionChangeEvent,
  window,
  workspace,
} from "vscode";
import { SyntaxNode, TreeCursor } from "web-tree-sitter";
import ide from "../libs/cursorless-engine/singletons/ide.singleton";
import { Graph } from "../typings/Types";
import { getActiveTextEditor } from "../ide/vscode/activeTextEditor";

export default class Debug {
  private disposableConfiguration?: Disposable;
  private disposableSelection?: Disposable;
  active: boolean;

  constructor(private graph: Graph) {
    ide().disposeOnExit(this);

    this.evaluateSetting = this.evaluateSetting.bind(this);
    this.logBranchTypes = this.logBranchTypes.bind(this);
    this.active = true;

    switch (ide().runMode) {
      // Development mode. Always enable.
      case "development":
        this.enableDebugLog();
        break;
      // Test mode. Always disable.
      case "test":
        this.disableDebugLog();
        break;
      // Production mode. Enable based on user setting.
      case "production":
        this.evaluateSetting();
        this.disposableConfiguration = workspace.onDidChangeConfiguration(
          this.evaluateSetting,
        );
        break;
    }
  }

  init() {
    // do nothing
  }

  log(...args: any[]) {
    if (this.active) {
      console.debug(...args);
    }
  }

  dispose() {
    if (this.disposableConfiguration) {
      this.disposableConfiguration.dispose();
    }
    if (this.disposableSelection) {
      this.disposableSelection.dispose();
    }
  }

  private enableDebugLog() {
    this.active = true;
    this.disposableSelection = window.onDidChangeTextEditorSelection(
      this.logBranchTypes,
    );
  }

  private disableDebugLog() {
    this.active = false;
    if (this.disposableSelection) {
      this.disposableSelection.dispose();
      this.disposableSelection = undefined;
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
      getActiveTextEditor()!.document.uri,
      event.selections[0],
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
    console.debug(">".repeat(ancestors.length), `"${leafText}"`);
  }

  private printCursorLocationInfo(cursor: TreeCursor, depth: number) {
    const field = cursor.currentFieldName();
    const fieldText = field != null ? `${field}: ` : "";
    console.debug(">".repeat(depth + 1), `${fieldText}${cursor.nodeType}`);
  }
}
