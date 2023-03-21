import {
  Clipboard,
  ExcludableSnapshotField,
  ExtraContext,
  ExtraSnapshotField,
  hrtimeBigintToSeconds,
  IDE,
  rangeToPlainObject,
  selectionToPlainObject,
  SerializedMarks,
  TestCaseSnapshot,
  TextEditor,
} from "@cursorless/common";
import type { ThatMark } from "../core/ThatMark";
import { targetToPlainObject } from "./targetToPlainObject";

export async function takeSnapshot(
  thatMark: ThatMark | undefined,
  sourceMark: ThatMark | undefined,
  excludeFields: ExcludableSnapshotField[] = [],
  extraFields: ExtraSnapshotField[] = [],
  editor: TextEditor,
  ide: IDE,
  marks?: SerializedMarks,
  extraContext?: ExtraContext,
  metadata?: unknown,
  clipboard?: Clipboard,
) {
  const snapshot: TestCaseSnapshot = {
    documentContents: editor.document.getText(),
    selections: editor.selections.map(selectionToPlainObject),
  };

  if (marks != null) {
    snapshot.marks = marks;
  }

  if (metadata != null) {
    snapshot.metadata = metadata;
  }

  if (!excludeFields.includes("clipboard")) {
    snapshot.clipboard = await (clipboard ?? ide.clipboard).readText();
  }

  if (!excludeFields.includes("visibleRanges")) {
    snapshot.visibleRanges = editor.visibleRanges.map(rangeToPlainObject);
  }

  if (
    thatMark != null &&
    thatMark.exists() &&
    !excludeFields.includes("thatMark")
  ) {
    snapshot.thatMark = thatMark.get().map(targetToPlainObject);
  }

  if (
    sourceMark != null &&
    sourceMark.exists() &&
    !excludeFields.includes("sourceMark")
  ) {
    snapshot.sourceMark = sourceMark.get().map(targetToPlainObject);
  }

  if (extraFields.includes("timeOffsetSeconds")) {
    const startTimestamp = extraContext?.startTimestamp;

    if (startTimestamp == null) {
      throw new Error(
        "No start timestamp provided but time offset was requested",
      );
    }

    const offsetNanoseconds = process.hrtime.bigint() - startTimestamp;
    snapshot.timeOffsetSeconds = hrtimeBigintToSeconds(offsetNanoseconds);
  }

  return snapshot;
}
