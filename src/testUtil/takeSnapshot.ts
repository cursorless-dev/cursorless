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
import { hrtimeBigintToSeconds } from "../util/timeUtils";

export type ExtraSnapshotField = keyof TestCaseSnapshot;
export type ExcludableSnapshotField = keyof TestCaseSnapshot;

export type TestCaseSnapshot = {
  documentContents: string;
  selections: SelectionPlainObject[];
  clipboard?: string;
  // TODO Visible ranges are not asserted during testing, see:
  // https://github.com/cursorless-dev/cursorless-vscode/issues/160
  visibleRanges?: RangePlainObject[];
  marks?: SerializedMarks;
  thatMark?: SelectionPlainObject[];
  sourceMark?: SelectionPlainObject[];
  timeOffsetSeconds?: number;
};

interface ExtraContext {
  startTimestamp?: bigint;
}

export async function takeSnapshot(
  thatMark: ThatMark,
  sourceMark: ThatMark,
  excludeFields: ExcludableSnapshotField[] = [],
  extraFields: ExtraSnapshotField[] = [],
  marks?: SerializedMarks,
  extraContext?: ExtraContext
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

  if (extraFields.includes("timeOffsetSeconds")) {
    const startTimestamp = extraContext?.startTimestamp;

    if (startTimestamp == null) {
      throw new Error(
        "No start timestamp provided but time offset was requested"
      );
    }

    const offsetNanoseconds = process.hrtime.bigint() - startTimestamp;
    snapshot.timeOffsetSeconds = hrtimeBigintToSeconds(offsetNanoseconds);
  }

  return snapshot;
}
