import { Range, Selection, TextEditor } from "vscode";
import {
  EditNewContext as EditNewContext,
  Position,
  RemovalRange,
  Target,
} from "../../typings/target.types";
import { parseRemovalRange } from "../../util/targetUtils";

export function extractCommonParameters(parameters: CommonTargetParameters) {
  return {
    editor: parameters.editor,
    isReversed: parameters.isReversed,
    contentRange: parameters.contentRange,
    position: parameters.position,
  };
}

/** Parameters supported by all target classes */
export interface CommonTargetParameters {
  editor: TextEditor;
  isReversed: boolean;
  contentRange: Range;
  position?: Position;
}

export interface BaseTargetParameters extends CommonTargetParameters {
  delimiter: string;
  removalRange?: Range;
  leadingDelimiter?: RemovalRange;
  trailingDelimiter?: RemovalRange;
  isLine?: boolean;
}

interface BaseTargetState {
  /** The text editor used for all ranges */
  readonly editor: TextEditor;

  /** If true active is before anchor */
  readonly isReversed: boolean;

  /** The range of the content */
  readonly contentRange: Range;

  /** If this selection has a delimiter. For example, new line for a line or paragraph and comma for a list or argument */
  readonly delimiter: string;

  /** The range to remove the content */
  readonly removalRange?: Range;

  /** The range of the delimiter before the content selection */
  readonly leadingDelimiter?: RemovalRange;

  /** The range of the delimiter after the content selection */
  readonly trailingDelimiter?: RemovalRange;

  /** The current position */
  position?: Position;
}

export default abstract class BaseTarget {
  protected readonly state: BaseTargetState;

  constructor(parameters: BaseTargetParameters) {
    this.state = {
      editor: parameters.editor,
      isReversed: parameters.isReversed,
      contentRange: parameters.contentRange,
      delimiter: parameters.delimiter,
      removalRange: parameters.removalRange,
      leadingDelimiter: parameters.leadingDelimiter,
      trailingDelimiter: parameters.trailingDelimiter,
      position: parameters.position,
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

  get removalRange() {
    return this.state.removalRange;
  }

  /** If true this target should be treated as a line */
  get isLine() {
    return false;
  }

  /** If true this target should be treated as a paragraph */
  get isParagraph() {
    return false;
  }

  /** If true this target is of weak type and should use inference/upgrade when needed. See {@link WeakTarget} for more info  */
  get isWeak() {
    return false;
  }

  getInteriorStrict(): Target[] {
    throw Error("No available interior");
  }

  getBoundaryStrict(): Target[] {
    throw Error("No available boundaries");
  }

  get contentRange(): Range {
    switch (this.position) {
      case undefined:
        return this.state.contentRange;
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
    }
  }

  get contentText(): string {
    return this.editor.document.getText(this.contentRange);
  }

  get contentSelection(): Selection {
    const { start, end } = this.contentRange;
    return this.isReversed
      ? new Selection(end, start)
      : new Selection(start, end);
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

  get leadingDelimiter() {
    switch (this.position) {
      case undefined:
      case "before":
        return this.state.leadingDelimiter;
      default:
        return undefined;
    }
  }

  get trailingDelimiter() {
    switch (this.position) {
      case undefined:
      case "after":
        return this.state.trailingDelimiter;
      default:
        return undefined;
    }
  }

  /** Possibly add delimiter for positions before/after */
  maybeAddDelimiter(text: string): string {
    if (this.delimiter != null) {
      if (this.position === "before") {
        return text + this.delimiter;
      }
      if (this.position === "after") {
        return this.delimiter + text;
      }
    }
    return text;
  }

  protected getRemovalContentRange(): Range {
    const removalRange = this.removalRange ?? this.contentRange;
    const delimiter =
      parseRemovalRange(this.trailingDelimiter) ??
      parseRemovalRange(this.leadingDelimiter);
    return delimiter != null
      ? removalRange.union(delimiter.range)
      : removalRange;
  }

  protected getRemovalContentHighlightRange() {
    const removalRange = this.removalRange ?? this.contentRange;
    const delimiter =
      parseRemovalRange(this.trailingDelimiter) ??
      parseRemovalRange(this.leadingDelimiter);
    return delimiter != null
      ? removalRange.union(delimiter.highlight)
      : removalRange;
  }

  protected getRemovalBeforeRange(): Range {
    return this.leadingDelimiter != null
      ? this.leadingDelimiter.range
      : this.contentRange;
  }

  protected getRemovalAfterRange(): Range {
    return this.trailingDelimiter != null
      ? this.trailingDelimiter.range
      : this.contentRange;
  }

  protected getRemovalBeforeHighlightRange(): Range | undefined {
    return this.leadingDelimiter != null
      ? this.leadingDelimiter.highlight ?? this.leadingDelimiter.range
      : undefined;
  }

  protected getRemovalAfterHighlightRange(): Range | undefined {
    return this.trailingDelimiter != null
      ? this.trailingDelimiter.highlight ?? this.trailingDelimiter.range
      : undefined;
  }

  getRemovalRange(): Range {
    switch (this.position) {
      case "before":
        return this.getRemovalBeforeRange();
      case "after":
        return this.getRemovalAfterRange();
      default:
        return this.getRemovalContentRange();
    }
  }

  getRemovalHighlightRange(): Range | undefined {
    switch (this.position) {
      case "before":
        return this.getRemovalBeforeHighlightRange();
      case "after":
        return this.getRemovalAfterHighlightRange();
      default:
        return this.getRemovalContentHighlightRange();
    }
  }

  getEditNewContext(_isBefore: boolean): EditNewContext {
    return {
      delimiter: this.delimiter ?? "",
    };
  }

  abstract clone(): Target;

  withPosition(position: Position): Target {
    const target = this.clone();
    target.state.position = position;
    return target;
  }
}
