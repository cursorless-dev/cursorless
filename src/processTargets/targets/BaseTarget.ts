import { Range, Selection, TextEditor } from "vscode";
import { EditNewContext, Position, Target } from "../../typings/target.types";
import { selectionFromRange } from "../../util/selectionUtils";
import { getTokenDelimiters } from "../targetUtil/getTokenDelimiters";
import { maybeAddDelimiter } from "../targetUtil/maybeAddDelimiter";

export function extractCommonParameters(parameters: CommonTargetParameters) {
  return {
    editor: parameters.editor,
    isReversed: parameters.isReversed,
    contentRange: parameters.contentRange,
    position: parameters.position,
    thatTarget: parameters.thatTarget,
  };
}

/** Parameters supported by all target classes */
export interface CommonTargetParameters {
  readonly editor: TextEditor;
  readonly isReversed: boolean;
  readonly contentRange: Range;
  readonly position?: Position;
  readonly thatTarget?: Target;
}

export interface CloneWithParameters {
  readonly position?: Position;
  readonly thatTarget?: Target;
}

export interface BaseTargetParameters extends CommonTargetParameters {
  readonly delimiter: string;
}

export default abstract class BaseTarget implements Target {
  protected readonly state: BaseTargetParameters;

  constructor(parameters: BaseTargetParameters) {
    this.state = {
      editor: parameters.editor,
      isReversed: parameters.isReversed,
      contentRange: parameters.contentRange,
      position: parameters.position,
      delimiter: parameters.delimiter,
      thatTarget: parameters.thatTarget,
    };
  }

  get position() {
    return this.state.position;
  }
  get editor() {
    return this.state.editor;
  }
  get isReversed() {
    return this.state.isReversed;
  }
  get contentRemovalRange() {
    return this.contentRange;
  }
  get isLine() {
    return false;
  }
  get isParagraph() {
    return false;
  }
  get isWeak() {
    return false;
  }

  get thatTarget(): Target {
    return this.state.thatTarget != null
      ? this.state.thatTarget.thatTarget
      : this;
  }

  get contentText(): string {
    return this.editor.document.getText(this.contentRange);
  }

  get contentSelection(): Selection {
    return selectionFromRange(this.isReversed, this.contentRange);
  }

  get contentRange(): Range {
    switch (this.position) {
      case "start":
      case "before":
        return new Range(
          this.state.contentRange.start,
          this.state.contentRange.start
        );
      case "end":
      case "after":
        return new Range(
          this.state.contentRange.end,
          this.state.contentRange.end
        );
      default:
        return this.state.contentRange;
    }
  }

  get delimiter(): string | undefined {
    switch (this.position) {
      // This it NOT a raw target. Joining with this should be done on empty delimiter.
      case "start":
      case "end":
        return "";
      default:
        return this.state.delimiter;
    }
  }

  get leadingDelimiterRange() {
    const { includeDelimitersInRemoval, leadingDelimiterRange } =
      getTokenDelimiters(this.state.editor, this.state.contentRange);
    return includeDelimitersInRemoval || this.position != null
      ? leadingDelimiterRange
      : undefined;
  }

  get trailingDelimiterRange() {
    const { includeDelimitersInRemoval, trailingDelimiterRange } =
      getTokenDelimiters(this.state.editor, this.state.contentRange);
    return includeDelimitersInRemoval || this.position != null
      ? trailingDelimiterRange
      : undefined;
  }

  maybeAddDelimiter(text: string): string {
    return maybeAddDelimiter(text, this.delimiter, this.position);
  }

  getEditNewContext(isBefore: boolean): EditNewContext {
    if (this.delimiter === "\n" && !isBefore) {
      return { type: "command", command: "editor.action.insertLineAfter" };
    }
    return {
      type: "delimiter",
      delimiter: this.delimiter ?? "",
    };
  }

  getRemovalRange(): Range {
    switch (this.position) {
      case "before":
        return this.leadingDelimiterRange ?? this.contentRange;
      case "after":
        return this.trailingDelimiterRange ?? this.contentRange;
      case "start":
      case "end":
        return this.contentRange;
      default:
        const delimiterRange =
          this.trailingDelimiterRange ?? this.leadingDelimiterRange;
        return delimiterRange != null
          ? this.contentRemovalRange.union(delimiterRange)
          : this.contentRemovalRange;
    }
  }

  getRemovalHighlightRange(): Range | undefined {
    return this.getRemovalRange();
  }

  withPosition(position: Position): Target {
    return this.cloneWith({ position });
  }

  withThatTarget(thatTarget: Target): Target {
    return this.cloneWith({ thatTarget });
  }

  getInteriorStrict(): Target[] {
    throw Error("No available interior");
  }
  getBoundaryStrict(): Target[] {
    throw Error("No available boundaries");
  }

  abstract cloneWith(parameters: CloneWithParameters): Target;
}
