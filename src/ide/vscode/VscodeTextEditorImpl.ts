import type {
  Position,
  Range,
  Selection,
  TextDocument,
  TextEditor,
  TextEditorOptions,
} from "@cursorless/common";
import {
  fromVscodeRange,
  fromVscodeSelection,
  ParseTreeApi,
  toVscodePositionOrRange,
} from "@cursorless/vscode-common";
import { v4 as uuid } from "uuid";
import * as vscode from "vscode";
import { SyntaxNode } from "web-tree-sitter";
import { fromVscodeDocument } from "./vscodeIdeUtil";

export class VscodeTextEditorImpl implements TextEditor {
  readonly id: string;
  readonly document: TextDocument;

  constructor(
    protected parseTreeApi: ParseTreeApi,
    protected editor: vscode.TextEditor,
  ) {
    this.id = uuid();
    this.document = fromVscodeDocument(editor.document);
  }

  get vscodeEditor(): vscode.TextEditor {
    return this.editor;
  }

  get selections(): Selection[] {
    return this.editor.selections.map(fromVscodeSelection);
  }

  get visibleRanges(): Range[] {
    return this.editor.visibleRanges.map(fromVscodeRange);
  }

  get options(): TextEditorOptions {
    return this.editor.options;
  }

  get isActive(): boolean {
    return this.editor === vscode.window.activeTextEditor;
  }

  public getNodeAtLocation(positionOrRange: Position | Range): SyntaxNode {
    return this.parseTreeApi.getNodeAtLocation(
      new vscode.Location(
        this.document.uri,
        toVscodePositionOrRange(positionOrRange),
      ),
    );
  }

  public isEqual(other: TextEditor): boolean {
    return this.id === other.id;
  }
}
