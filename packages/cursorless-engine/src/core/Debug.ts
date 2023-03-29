import { Disposable, TextEditorSelectionChangeEvent } from "@cursorless/common";
import type { SyntaxNode, TreeCursor } from "web-tree-sitter";
import { ide } from "../singletons/ide.singleton";
import { TreeSitter } from "../typings/TreeSitter";

export class Debug {
  private disposableConfiguration?: Disposable;
  private disposableSelection?: Disposable;
  active: boolean;

  constructor(private treeSitter: TreeSitter) {
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
        this.disposableConfiguration =
          ide().configuration.onDidChangeConfiguration(this.evaluateSetting);
        break;
    }
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
    this.disposableSelection = ide().onDidChangeTextEditorSelection(
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
    const debugEnabled = ide().configuration.getOwnConfiguration("debug");
    if (debugEnabled) {
      this.enableDebugLog();
    } else {
      this.disableDebugLog();
    }
  }

  private logBranchTypes(event: TextEditorSelectionChangeEvent) {
    let node: SyntaxNode;
    try {
      node = this.treeSitter.getNodeAtLocation(
        ide().activeTextEditor!.document,
        event.selections[0],
      );
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
