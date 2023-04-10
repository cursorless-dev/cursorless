import type {
  Range,
  RangeOffsets,
  TextDocumentChangeEvent,
  TextDocumentContentChangeEvent,
} from "@cursorless/common";

type SingleEdgeExpansionBehavior = SimpleExpansionBehavior | RegexExpansionBehavior;

interface SimpleExpansionBehavior {
  type: "open" | "closed";
}

interface RegexExpansionBehavior {
  type: "regex";
  regex: RegExp;
}

interface ExpansionBehavior {
  start: SingleEdgeExpansionBehavior;
  end: SingleEdgeExpansionBehavior;
}

export interface RangeInfo {
  range: Range;
  expansionBehavior: ExpansionBehavior;
}

export interface FullRangeInfo extends RangeInfo {
  offsets: RangeOffsets;
  text: string;
}

export interface ExtendedTextDocumentContentChangeEvent
  extends TextDocumentContentChangeEvent {
  /**
   * If this is true then we should not shift an empty selection to the right
   */
  isReplace?: boolean;
}

export interface ExtendedTextDocumentChangeEvent extends TextDocumentChangeEvent {
  readonly contentChanges: ReadonlyArray<ExtendedTextDocumentContentChangeEvent>;
}

export interface ChangeEventInfo {
  event: ExtendedTextDocumentContentChangeEvent;
  originalOffsets: RangeOffsets;
  finalOffsets: RangeOffsets;

  /**
   * Indicates the difference between the final token length and the original token length
   */
  displacement: number;
}

export interface SelectionInfo extends RangeInfo {
  isForward: boolean;
}

export interface FullSelectionInfo extends FullRangeInfo, SelectionInfo {}
