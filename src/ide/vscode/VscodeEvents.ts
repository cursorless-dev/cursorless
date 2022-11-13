import * as vscode from "vscode";
import type {
  TextDocumentChangeEvent,
  TextDocumentChangeReason,
  TextDocumentContentChangeEvent,
} from "../../libs/common/ide/types/Events";
import type { Disposable } from "../../libs/common/ide/types/ide.types";
import { fromVscodeDocument, fromVscodeRange } from "./VscodeUtil";

export function vscodeOnDidChangeTextDocument(
  listener: (event: TextDocumentChangeEvent) => void,
): Disposable {
  return vscode.workspace.onDidChangeTextDocument((e) => {
    listener({
      document: fromVscodeDocument(e.document),
      contentChanges: e.contentChanges.map(fromVscodeContentChange),
      reason: fromVscodeReason(e.reason),
    });
  });
}

function fromVscodeContentChange(
  change: vscode.TextDocumentContentChangeEvent,
): TextDocumentContentChangeEvent {
  return {
    ...change,
    range: fromVscodeRange(change.range),
  };
}

function fromVscodeReason(
  reason?: vscode.TextDocumentChangeReason,
): TextDocumentChangeReason | undefined {
  switch (reason) {
    case vscode.TextDocumentChangeReason.Redo:
      return "redo";
    case vscode.TextDocumentChangeReason.Undo:
      return "undo";
    default:
      return undefined;
  }
}
