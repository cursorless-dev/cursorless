import { Range, Selection, TextEditor } from "vscode";
import {
  EditNewLineContext,
  Position,
  RemovalRange,
  ScopeType,
  Target,
} from "../../typings/target.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import { parseRemovalRange } from "../../util/targetUtils";
import WeakTarget from "./WeakTarget";

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
  scopeType?: ScopeType;
  delimiter: string;
  removalRange?: Range;
  interiorRange?: Range;
  boundary?: [Range, Range];
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

  /** Is this a scope type other raw selection? */
  readonly scopeType?: ScopeType;

  /** The range to remove the content */
  readonly removalRange?: Range;

  /**
   * Represents the interior range of this selection. For example, for a
   * surrounding pair this would exclude the opening and closing delimiter. For an if
   * statement this would be the statements in the body.
   */
  readonly interiorRange?: Range;

  /**
   * Represents the boundary ranges of this selection. For example, for a
   * surrounding pair this would be the opening and closing delimiter. For an if
   * statement this would be the line of the guard as well as the closing brace.
   */
  readonly boundary?: [Range, Range];

  /** The range of the delimiter before the content selection */
  readonly leadingDelimiter?: RemovalRange;

  /** The range of the delimiter after the content selection */
  readonly trailingDelimiter?: RemovalRange;

  /** The current position */
  position?: Position;
}

export default abstract class BaseTarget implements Target {
  protected readonly state: BaseTargetState;

  constructor(parameters: BaseTargetParameters) {
    this.state = {
      editor: parameters.editor,
      isReversed: parameters.isReversed,
      contentRange: parameters.contentRange,
      delimiter: parameters.delimiter,
      scopeType: parameters.scopeType,
      removalRange: parameters.removalRange,
      interiorRange: parameters.interiorRange,
      boundary: parameters.boundary,
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

  get scopeType() {
    return this.state.scopeType;
  }

  /** If true this target should be treated as a line in regards to continuous range */
  get isLine() {
    return false;
  }

  /** If true this target is of weak type and should use inference/upgrade when needed. See {@link WeakTarget} for more info  */
  get isWeak() {
    return false;
  }

  getInterior(_context: ProcessedTargetsContext): Target[] {
    if (this.state.interiorRange == null || this.position != null) {
      throw Error("No available interior");
    }
    return [
      new WeakTarget({
        editor: this.editor,
        isReversed: this.isReversed,
        contentRange: this.state.interiorRange,
      }),
    ];
  }

  getBoundary(_context: ProcessedTargetsContext): Target[] {
    if (this.state.boundary == null || this.position != null) {
      throw Error("No available boundaries");
    }
    return this.state.boundary.map(
      (contentRange) =>
        new WeakTarget({
          editor: this.editor,
          isReversed: this.isReversed,
          contentRange,
        })
    );
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

  getEditNewLineContext(_isBefore: boolean): EditNewLineContext {
    return {
      delimiter: "\n",
    };
  }

  abstract clone(): Target;

  withPosition(position: Position): Target {
    const target = this.clone();
    target.state.position = position;
    return target;
  }
}
