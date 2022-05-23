import { Range, Selection, TextEditor } from "vscode";
import {
  EditNewLineContext,
  Position,
  RemovalRange,
  ScopeType,
  Target,
} from "../../typings/target.types";
import { parseRemovalRange } from "../../util/targetUtils";

export interface BaseTargetParameters {
  editor: TextEditor;
  isReversed: boolean;
  scopeType?: ScopeType;
  delimiter: string;
  contentRange: Range;
  removalRange?: Range;
  interiorRange?: Range;
  boundary?: [Range, Range];
  leadingDelimiter?: RemovalRange;
  trailingDelimiter?: RemovalRange;
  isLine?: boolean;
}

export default abstract class BaseTarget implements Target {
  /** The text editor used for all ranges */
  readonly editor: TextEditor;

  /** If true active is before anchor */
  readonly isReversed: boolean;

  /** The range of the content */
  private readonly _contentRange: Range;

  /** If this selection has a delimiter. For example, new line for a line or paragraph and comma for a list or argument */
  private readonly _delimiter: string;

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
  readonly _leadingDelimiter?: RemovalRange;

  /** The range of the delimiter after the content selection */
  readonly _trailingDelimiter?: RemovalRange;

  /** If true this target should be treated as a line in regards to continuous range */
  readonly isLine: boolean;

  /** The current position */
  position?: Position;

  constructor(parameters: BaseTargetParameters) {
    this.editor = parameters.editor;
    this.isReversed = parameters.isReversed;
    this._contentRange = parameters.contentRange;
    this._delimiter = parameters.delimiter;
    this.scopeType = parameters.scopeType;
    this.removalRange = parameters.removalRange;
    this.interiorRange = parameters.interiorRange;
    this.boundary = parameters.boundary;
    this._leadingDelimiter = parameters.leadingDelimiter;
    this._trailingDelimiter = parameters.trailingDelimiter;
    this.isLine = parameters.isLine ?? false;
  }

  get contentRange(): Range {
    switch (this.position) {
      case undefined:
        return this._contentRange;
      case "start":
      case "before":
        return new Range(this._contentRange.start, this._contentRange.start);
      case "end":
      case "after":
        return new Range(this._contentRange.end, this._contentRange.end);
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
        return this._delimiter;
    }
  }

  get leadingDelimiter() {
    switch (this.position) {
      case undefined:
      case "before":
        return this._leadingDelimiter;
      default:
        return undefined;
    }
  }

  get trailingDelimiter() {
    switch (this.position) {
      case undefined:
      case "after":
        return this._trailingDelimiter;
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

  setPosition(position: Position): void {
    this.position = position;
  }
}
