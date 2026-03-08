import type {
  ExcludableSnapshotField,
  ExtraContext,
  ExtraSnapshotField,
  IDE,
  SerializedMarks,
  TestCaseSnapshot,
  TextEditor,
} from "@cursorless/common";
import {
  rangeToPlainObject,
  selectionToPlainObject,
  storedTargetKeys,
} from "@cursorless/common";
import type { StoredTargetMap } from "@cursorless/cursorless-engine";
import { hrtimeBigintToSeconds } from "./timeUtils";

export async function takeSnapshot(
  storedTargets: StoredTargetMap | undefined,
  excludeFields: ExcludableSnapshotField[] = [],
  extraFields: ExtraSnapshotField[] = [],
  editor: TextEditor,
  ide: IDE,
  marks?: SerializedMarks,
  extraContext?: ExtraContext,
  metadata?: unknown,
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
    snapshot.clipboard = await ide.clipboard.readText();
  }

  if (!excludeFields.includes("visibleRanges")) {
    snapshot.visibleRanges = editor.visibleRanges.map(rangeToPlainObject);
  }

  for (const storedTargetKey of storedTargetKeys) {
    const targets = storedTargets?.get(storedTargetKey);
    const key = `${storedTargetKey}Mark` as const;
    if (targets != null && !excludeFields.includes(key)) {
      snapshot[key] = targets.map((target) => target.toPlainObject());
    }
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
