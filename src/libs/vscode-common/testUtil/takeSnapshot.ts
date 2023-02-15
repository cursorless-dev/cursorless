import type { TextEditor } from "@cursorless/common";
import { hrtimeBigintToSeconds } from "@cursorless/common";
import type { ThatMark } from "../../cursorless-engine/core/ThatMark";
import type { Clipboard } from "../../common/ide/types/Clipboard";
import type { IDE } from "../../common/ide/types/ide.types";
import {
  RangePlainObject,
  rangeToPlainObject,
  SelectionPlainObject,
  selectionToPlainObject,
  SerializedMarks,
  TargetPlainObject,
  targetToPlainObject,
} from "@cursorless/common";

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
  thatMark?: TargetPlainObject[];
  sourceMark?: TargetPlainObject[];
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
