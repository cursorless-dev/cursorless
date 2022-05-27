import { Range, Selection, Position as VS_Position } from "vscode";
import { EditNewContext, Position, Target } from "../../typings/target.types";
import { selectionFromRange } from "../../util/selectionUtils";
import {
  getLineLeadingDelimiterRange,
  getLineTrailingDelimiterRange,
} from "../targetUtil/getLineDelimiters";
import { maybeAddDelimiter } from "../targetUtil/maybeAddDelimiter";

interface ContinuousRangeTargetParameters {
  readonly startTarget: Target;
  readonly endTarget: Target;
  readonly isReversed: boolean;
  readonly excludeStart: boolean;
  readonly excludeEnd: boolean;
}

export default class ContinuousRangeTarget implements Target {
  private startTarget_: Target;
  private endTarget_: Target;
  private isReversed_: boolean;
  private excludeStart_: boolean;
  private excludeEnd_: boolean;

  constructor(parameters: ContinuousRangeTargetParameters) {
    this.startTarget_ = parameters.startTarget;
    this.endTarget_ = parameters.endTarget;
    this.isReversed_ = parameters.isReversed;
    this.excludeStart_ = parameters.excludeStart;
    this.excludeEnd_ = parameters.excludeEnd;
  }

  get editor() {
    return this.startTarget_.editor;
  }
  get isReversed() {
    return this.isReversed_;
  }
  get position() {
    return undefined;
  }
  get isLine() {
    return this.startTarget_.isLine && this.endTarget_.isLine;
  }
  get isParagraph() {
    return false;
  }
  get isWeak() {
    return false;
  }
  get thatTarget() {
    return this;
  }
  get contentText(): string {
    return this.editor.document.getText(this.contentRange);
  }
  get contentSelection(): Selection {
    return selectionFromRange(this.isReversed, this.contentRange);
  }

  get delimiter() {
    return (
      (this.startTarget_.delimiter === this.endTarget_.delimiter
        ? this.startTarget_.delimiter
        : null) ?? " "
    );
  }

  get leadingDelimiterRange() {
    const startTarget = this.startTarget_;
    if (startTarget.position === "start") {
      return undefined;
    }
    if (this.excludeStart_) {
      if (startTarget.isLine) {
        return getLineLeadingDelimiterRange(this.editor, this.contentRange);
      }
      return undefined;
    }
    return startTarget.leadingDelimiterRange;
  }

  get trailingDelimiterRange() {
    const endTarget = this.endTarget_;
    if (endTarget.position === "end") {
      return undefined;
    }
    if (this.excludeEnd_) {
      if (endTarget.isLine) {
        return getLineTrailingDelimiterRange(this.editor, this.contentRange);
      }
      return undefined;
    }
    return endTarget.trailingDelimiterRange;
  }

  get leadingDelimiterHighlightRange() {
    const leadingDelimiterRange = this.leadingDelimiterRange;
    if (leadingDelimiterRange == null) {
      return undefined;
    }
    const startTarget = this.startTarget_;
    if (startTarget.isLine && !this.excludeStart_) {
      return new Range(leadingDelimiterRange.end, this.contentRange.start);
    }
    return leadingDelimiterRange;
  }

  get trailingDelimiterHighlightRange() {
    const trailingDelimiterRange = this.trailingDelimiterRange;
    if (trailingDelimiterRange == null) {
      return undefined;
    }
    const endTarget = this.endTarget_;
    if (endTarget.isLine) {
      if (this.excludeEnd_) {
        return new Range(
          this.contentRange.end,
          endTarget.leadingDelimiterRange!.start
        );
      }
      return new Range(this.contentRange.end, trailingDelimiterRange.start);
    }
    return trailingDelimiterRange;
  }

  get contentRange() {
    return this.processRanges(
      this.startTarget_.contentRange,
      this.endTarget_.contentRange
    );
  }

  get contentRemovalRange() {
    return this.processRanges(
      this.startTarget_.contentRemovalRange,
      this.endTarget_.contentRemovalRange
    );
  }

  maybeAddDelimiter(text: string): string {
    return maybeAddDelimiter(text, this.delimiter, this.position);
  }

  getEditNewContext(_isBefore: boolean): EditNewContext {
    return {
      type: "delimiter",
      delimiter: this.delimiter,
    };
  }

  getRemovalRange(): Range {
    const delimiterRange =
      this.trailingDelimiterRange ?? this.leadingDelimiterRange;
    return delimiterRange != null
      ? this.contentRemovalRange.union(delimiterRange)
      : this.contentRemovalRange;
  }

  getRemovalHighlightRange(): Range | undefined {
    const delimiterRange =
      this.trailingDelimiterHighlightRange ??
      this.leadingDelimiterHighlightRange;
    return delimiterRange != null
      ? this.contentRemovalRange.union(delimiterRange)
      : this.contentRemovalRange;
  }

  getInteriorStrict(): Target[] {
    throw Error("No available interior");
  }
  getBoundaryStrict(): Target[] {
    throw Error("No available boundaries");
  }
  withPosition(_position: Position): Target {
    throw new Error("Method not implemented");
  }
  withThatTarget(_thatTarget: Target): Target {
    throw new Error("Method not implemented");
  }

  private processRanges(startRange: Range, endRange: Range) {
    const startTarget = this.startTarget_;
    const endTarget = this.endTarget_;
    const start = (() => {
      if (this.excludeStart_) {
        if (startTarget.isLine) {
          return new VS_Position(startRange.end.line + 1, 0);
        }
        return startRange.end;
      }
      return startRange.start;
    })();
    const end = (() => {
      if (this.excludeEnd_) {
        if (endTarget.isLine) {
          const { lineAt } = this.editor.document;
          return lineAt(endRange.start.line - 1).range.end;
        }
        return endRange.start;
      }
      return endRange.end;
    })();
    return new Range(start, end);
  }
}
