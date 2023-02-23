import { fromVscodeRange } from "@cursorless/vscode-common";
import * as vscode from "vscode";
import type {
  TextDocumentChangeEvent,
  TextDocumentChangeReason,
  TextDocumentContentChangeEvent,
} from "@cursorless/common";
import { Event } from "@cursorless/common";
import type { Disposable } from "@cursorless/common";
import { VscodeTextDocumentImpl } from "./VscodeTextDocumentImpl";

export function vscodeOnDidChangeTextDocument(
  listener: (event: TextDocumentChangeEvent) => void,
): Disposable {
  return vscode.workspace.onDidChangeTextDocument((e) => {
    listener({
      document: new VscodeTextDocumentImpl(e.document),
      contentChanges: e.contentChanges.map(fromVscodeContentChange),
      reason: fromVscodeReason(e.reason),
    });
  });
}

function fromVscodeContentChange(
  change: vscode.TextDocumentContentChangeEvent,
): TextDocumentContentChangeEvent {
  return {
    range: fromVscodeRange(change.range),
    rangeOffset: change.rangeOffset,
    rangeLength: change.rangeLength,
    text: change.text,
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

/**
 * Transforms a VSCode event into an event that forwards the VSCode event
 * @param vscodeEvent The VSCode event to forward
 * @param transform A function that transforms the VSCode event info into the desired event info
 * @returns An event that forwards the given VSCode event
 */
export function forwardEvent<S, T>(
  vscodeEvent: vscode.Event<S>,
  transform: (e: S) => T,
): Event<T> {
  function event(
    listener: (e: T) => any,
    thisArgs?: any,
    disposables?: Disposable[],
  ): Disposable {
    return vscodeEvent((e: S) => listener(transform(e)), thisArgs, disposables);
  }

  return event;
}
