import * as vscode from "vscode";
import { ThatMark } from "../core/ThatMark";
import { Clipboard } from "../util/Clipboard";
import { hrtimeBigintToSeconds } from "../util/timeUtils";
import {
  RangePlainObject,
  rangeToPlainObject,
  SelectionPlainObject,
  selectionToPlainObject,
  SerializedMarks,
} from "./toPlainObject";

export type ExtraSnapshotField = keyof TestCaseSnapshot;
export type ExcludableSnapshotField = keyof TestCaseSnapshot;

export type TestCaseSnapshot = {
  documentContents: string;
  selections: SelectionPlainObject[];
  clipboard?: string;
  // TODO Visible ranges are not asserted during testing, see:
  // https://github.com/cursorless-dev/cursorless/issues/160
  visibleRanges?: RangePlainObject[];
  marks?: SerializedMarks;
  thatMark?: SelectionPlainObject[];
  sourceMark?: SelectionPlainObject[];
  timeOffsetSeconds?: number;

  /**
   * Extra information about the snapshot. Must be json serializable
   */
  metadata?: unknown;
};

interface ExtraContext {
  startTimestamp?: bigint;
}

export async function takeSnapshot(
  thatMark: ThatMark | undefined,
  sourceMark: ThatMark | undefined,
  excludeFields: ExcludableSnapshotField[] = [],
  extraFields: ExtraSnapshotField[] = [],
  marks?: SerializedMarks,
  extraContext?: ExtraContext,
  metadata?: unknown
) {
  const activeEditor = vscode.window.activeTextEditor!;

  const snapshot: TestCaseSnapshot = {
    documentContents: activeEditor.document.getText(),
    selections: activeEditor.selections.map(selectionToPlainObject),
  };

  if (marks != null) {
    snapshot.marks = marks;
  }

  if (metadata != null) {
    snapshot.metadata = metadata;
  }

  if (!excludeFields.includes("clipboard")) {
    snapshot.clipboard = await Clipboard.readText();
  }

  if (!excludeFields.includes("visibleRanges")) {
    snapshot.visibleRanges = activeEditor.visibleRanges.map(rangeToPlainObject);
  }

  if (
    thatMark != null &&
    thatMark.exists() &&
    !excludeFields.includes("thatMark")
  ) {
    snapshot.thatMark = thatMark
      .get()
      .map((mark) => selectionToPlainObject(mark.selection));
  }

  if (
    sourceMark != null &&
    sourceMark.exists() &&
    !excludeFields.includes("sourceMark")
  ) {
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
