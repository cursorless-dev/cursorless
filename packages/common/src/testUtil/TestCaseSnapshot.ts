import { StoredTargetKey } from "../StoredTargetKey";
import {
  RangePlainObject,
  SelectionPlainObject,
  SerializedMarks,
  TargetPlainObject,
} from "../util/toPlainObject";

type MarkKeys = {
  [K in `${StoredTargetKey}Mark`]?: TargetPlainObject[];
};

export interface TestCaseSnapshot extends MarkKeys {
  documentContents: string;
  selections: SelectionPlainObject[];
  clipboard?: string;
  // FIXME Visible ranges are not asserted during testing, see:
  // https://github.com/cursorless-dev/cursorless/issues/160
  visibleRanges?: RangePlainObject[];
  marks?: SerializedMarks;
  timeOffsetSeconds?: number;

  /**
   * Extra information about the snapshot. Must be json serializable
   */
  metadata?: unknown;
}
export type ExtraSnapshotField = keyof TestCaseSnapshot;
export type ExcludableSnapshotField = keyof TestCaseSnapshot;

export interface ExtraContext {
  startTimestamp?: bigint;
}
