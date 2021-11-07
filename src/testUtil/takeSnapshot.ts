import * as vscode from "vscode";
import { Clipboard } from "../util/Clipboard";
import {
  selectionToPlainObject,
  rangeToPlainObject,
  RangePlainObject,
  SelectionPlainObject,
  SerializedMarks,
} from "./toPlainObject";
import { ThatMark } from "../core/ThatMark";

export type TestCaseSnapshot = {
  documentContents: string;
  selections: SelectionPlainObject[];
  clipboard?: string;
  // TODO Visible ranges are not asserted during testing, see:
  // https://github.com/pokey/cursorless-vscode/issues/160
  visibleRanges?: RangePlainObject[];
  marks?: SerializedMarks;
  thatMark?: SelectionPlainObject[];
  sourceMark?: SelectionPlainObject[];
};

export async function takeSnapshot(
  thatMark: ThatMark,
  sourceMark: ThatMark,
  excludeFields: string[] = [],
  marks?: SerializedMarks
) {
  const activeEditor = vscode.window.activeTextEditor!;

  const snapshot: TestCaseSnapshot = {
    documentContents: activeEditor.document.getText(),
    selections: activeEditor.selections.map(selectionToPlainObject),
  };

  if (marks != null) {
    snapshot.marks = marks;
  }

  if (!excludeFields.includes("clipboard")) {
    snapshot.clipboard = await Clipboard.readText();
  }

  if (!excludeFields.includes("visibleRanges")) {
    snapshot.visibleRanges = activeEditor.visibleRanges.map(rangeToPlainObject);
  }

  if (thatMark.exists() && !excludeFields.includes("thatMark")) {
    snapshot.thatMark = thatMark
      .get()
      .map((mark) => selectionToPlainObject(mark.selection));
  }

  if (sourceMark.exists() && !excludeFields.includes("sourceMark")) {
    snapshot.sourceMark = sourceMark
      .get()
      .map((mark) => selectionToPlainObject(mark.selection));
  }

  return snapshot;
}
