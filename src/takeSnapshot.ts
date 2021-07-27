import * as vscode from "vscode";
import { Clipboard } from "./Clipboard";
import {
  serializeSelection,
  serializeRange,
  SerializedRange,
  SerializedSelection,
} from "./serializers";
import { ThatMark } from "./ThatMark";

export type TestCaseSnapshot = {
  document: string;
  selections: SerializedSelection[];
  clipboard?: string;
  visibleRanges?: SerializedRange[];
  thatMark?: SerializedSelection[];
};

export async function takeSnapshot(
  thatMark?: ThatMark,
  excludeFields: string[] = []
) {
  const activeEditor = vscode.window.activeTextEditor!;

  const snapshot: TestCaseSnapshot = {
    document: activeEditor.document.getText(),
    selections: activeEditor.selections.map(serializeSelection),
  };

  if (!excludeFields.includes("clipboard")) {
    snapshot.clipboard = await Clipboard.readText();
  }

  if (!excludeFields.includes("visibleRanges")) {
    snapshot.visibleRanges = activeEditor.visibleRanges.map(serializeRange);
  }

  if (thatMark && !excludeFields.includes("thatMark")) {
    snapshot.thatMark = thatMark
      .get()
      .map((mark) => serializeSelection(mark.selection));
  }

  return snapshot;
}
