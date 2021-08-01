import * as vscode from "vscode";
import { Clipboard } from "./Clipboard";
import {
  selectionToPlainObject,
  rangeToPlainObject,
  RangePlainObject,
  SelectionPlainObject,
} from "./toPlainObject";
import { ThatMark } from "./ThatMark";

export type TestCaseSnapshot = {
  documentContents: string;
  selections: SelectionPlainObject[];
  clipboard?: string;
  // TODO Visible ranges are not asserted during testing, see:
  // https://github.com/pokey/cursorless-vscode/issues/160
  visibleRanges?: RangePlainObject[];
  thatMark?: SelectionPlainObject[];
};

export async function takeSnapshot(
  thatMark?: ThatMark,
  excludeFields: string[] = []
) {
  const activeEditor = vscode.window.activeTextEditor!;

  const snapshot: TestCaseSnapshot = {
    documentContents: activeEditor.document.getText(),
    selections: activeEditor.selections.map(selectionToPlainObject),
  };

  if (!excludeFields.includes("clipboard")) {
    snapshot.clipboard = await Clipboard.readText();
  }

  if (!excludeFields.includes("visibleRanges")) {
    snapshot.visibleRanges = activeEditor.visibleRanges.map(rangeToPlainObject);
  }

  if (thatMark && !excludeFields.includes("thatMark")) {
    snapshot.thatMark = thatMark
      .get()
      .map((mark) => selectionToPlainObject(mark.selection));
  }

  return snapshot;
}
