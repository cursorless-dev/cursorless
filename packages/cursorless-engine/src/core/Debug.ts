import { Disposable, TextEditorSelectionChangeEvent } from "@cursorless/common";
import type { SyntaxNode, TreeCursor } from "web-tree-sitter";
import { ide } from "../singletons/ide.singleton";
import { TreeSitter } from "../typings/TreeSitter";

/**
 * Debug logger
 */
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
      console.log(...args);
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
    this.printCursorLocationInfo(ancestors, cursor, 0);
  }

  private printCursorLocationInfo(
    nodes: SyntaxNode[],
    cursor: TreeCursor,
    index: number,
  ) {
    const field = cursor.currentFieldName();
    const fieldText = field != null ? `${field}: ` : "";
    const indent = " ".repeat(index);
    const nodeIsLast = index === nodes.length - 1;
    const { nodeIsNamed } = cursor;
    let text = `${indent}${fieldText}`;

    if (nodeIsNamed) {
      text += `(${cursor.nodeType}`;
      if (nodeIsLast) {
        text += ")";
      }
    } else {
      text += `"${cursor.nodeType}"`;
    }

    console.log(text);

    if (
      !nodeIsLast &&
      this.cursorGoToChildWithId(cursor, nodes[index + 1].id)
    ) {
      this.printCursorLocationInfo(nodes, cursor, index + 1);
    }

    if (nodeIsNamed && !nodeIsLast) {
      console.log(`${indent})`);
    }
  }

  private cursorGoToChildWithId(cursor: TreeCursor, id: number): boolean {
    cursor.gotoFirstChild();
    while (cursor.currentNode().id !== id) {
      if (!cursor.gotoNextSibling()) {
        return false;
      }
    }
    return true;
  }
}
