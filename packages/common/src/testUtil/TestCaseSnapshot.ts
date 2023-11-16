import {
  RangePlainObject,
  SelectionPlainObject,
  SerializedMarks,
  TargetPlainObject,
} from "../util/toPlainObject";

export type TestCaseSnapshot = {
  documentContents: string;
  selections: SelectionPlainObject[];
  clipboard?: string;
  // FIXME Visible ranges are not asserted during testing, see:
  // https://github.com/cursorless-dev/cursorless/issues/160
  visibleRanges?: RangePlainObject[];
  marks?: SerializedMarks;
  thatMark?: TargetPlainObject[];
  sourceMark?: TargetPlainObject[];
  instanceReferenceMark?: TargetPlainObject[];
  timeOffsetSeconds?: number;

  /**
   * Extra information about the snapshot. Must be json serializable
   */
  metadata?: unknown;
};

export type ExtraSnapshotField = keyof TestCaseSnapshot;
export type ExcludableSnapshotField = keyof TestCaseSnapshot;

export interface ExtraContext {
  startTimestamp?: bigint;
}
