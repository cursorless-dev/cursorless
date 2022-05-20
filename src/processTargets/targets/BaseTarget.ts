import { Range, Selection, TextEditor } from "vscode";
import { parseRemovalRange } from "../../util/targetUtils";
import {
  Target,
  ScopeType,
  Position,
  RemovalRange,
  TargetParameters,
  EditNewLineContext,
} from "../../typings/target.types";

export default class BaseTarget implements Target {
  editor: TextEditor;
  isReversed: boolean;
  contentRange: Range;
  delimiter: string;
  scopeType?: ScopeType;
  position?: Position;
  removalRange?: Range;
  interiorRange?: Range;
  boundary?: [Range, Range];
  leadingDelimiter?: RemovalRange;
  trailingDelimiter?: RemovalRange;
  isLine?: boolean;

  constructor(parameters: TargetParameters) {
    this.editor = parameters.editor;
    this.isReversed = parameters.isReversed;
    this.contentRange = parameters.contentRange;
    this.delimiter = parameters.delimiter ?? " ";
    this.scopeType = parameters.scopeType;
    this.position = parameters.position;
    this.removalRange = parameters.removalRange;
    this.interiorRange = parameters.interiorRange;
    this.boundary = parameters.boundary;
    this.leadingDelimiter = parameters.leadingDelimiter;
    this.trailingDelimiter = parameters.trailingDelimiter;
  }

  getContentText(): string {
    return this.editor.document.getText(this.contentRange);
  }

  getContentSelection(): Selection {
    return this.isReversed
      ? new Selection(this.contentRange.end, this.contentRange.start)
      : new Selection(this.contentRange.start, this.contentRange.end);
  }

  /** Possibly add delimiter for positions before/after */
  maybeAddDelimiter(text: string): string {
    if (this.position === "before") {
      return text + this.delimiter;
    }
    if (this.position === "after") {
      return this.delimiter + text;
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
    if (this.position === "before") {
      return this.getRemovalBeforeRange();
    }
    if (this.position === "after") {
      return this.getRemovalAfterRange();
    }
    return this.getRemovalContentRange();
  }

  getRemovalHighlightRange(): Range | undefined {
    if (this.position === "before") {
      return this.getRemovalBeforeHighlightRange();
    }
    if (this.position === "after") {
      return this.getRemovalAfterHighlightRange();
    }
    return this.getRemovalContentHighlightRange();
  }

  getEditNewLineContext(_isBefore: boolean): EditNewLineContext {
    return {
      delimiter: "\n",
    };
  }
}
