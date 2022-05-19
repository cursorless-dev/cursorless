import { Range, Selection, TextEditor } from "vscode";
import { parseRemovalRange } from "../../util/targetUtils";
import {
  Target,
  ScopeType,
  Position,
  RemovalRange,
  TargetParameters,
} from "../../typings/target.types";

export default class BaseTarget implements Target {
  editor: TextEditor;
  isReversed: boolean;
  scopeType?: ScopeType;
  position?: Position;
  delimiter?: string;
  contentRange: Range;
  interiorRange?: Range;
  boundary?: [Range, Range];
  removal?: RemovalRange;
  leadingDelimiter?: RemovalRange;
  trailingDelimiter?: RemovalRange;

  constructor(parameters: TargetParameters) {
    this.editor = parameters.editor;
    this.isReversed = parameters.isReversed;
    this.scopeType = parameters.scopeType;
    this.position = parameters.position;
    this.delimiter = parameters.delimiter;
    this.contentRange = parameters.contentRange;
    this.interiorRange = parameters.interiorRange;
    this.boundary = parameters.boundary;
    this.removal = parameters.removal;
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

    const removalRange = (() => {
      const range = parseRemovalRange(this.removal);
      if (range != null) {
        return range.range;
      }
      return this.contentRange;
    })();
    const delimiterRange = (() => {
      const leadingDelimiter = parseRemovalRange(this.leadingDelimiter);
      const trailingDelimiter = parseRemovalRange(this.trailingDelimiter);
      if (trailingDelimiter != null) {
        return trailingDelimiter.range;
      }
      if (leadingDelimiter != null) {
        return leadingDelimiter.range;
      }
      return undefined;
    })();
    return delimiterRange != null
      ? removalRange.union(delimiterRange)
      : removalRange;
  }

  getRemovalHighlightRange(): Range | undefined {
    if (this.position === "before") {
      return this.getRemovalBeforeHighlightRange();
    }
    if (this.position === "after") {
      return this.getRemovalAfterHighlightRange();
    }

    const removalRange = (() => {
      const range = parseRemovalRange(this.removal);
      return range != null ? range.range : this.contentRange;
    })();
    const delimiterRange = (() => {
      const leadingDelimiter = parseRemovalRange(this.leadingDelimiter);
      const trailingDelimiter = parseRemovalRange(this.trailingDelimiter);
      if (trailingDelimiter != null) {
        return trailingDelimiter.highlight;
      }
      if (leadingDelimiter) {
        return leadingDelimiter.highlight;
      }
      return undefined;
    })();
    if (removalRange != null && delimiterRange != null) {
      return removalRange.union(delimiterRange);
    }
    if (removalRange != null) {
      return removalRange;
    }
    if (delimiterRange != null) {
      return delimiterRange;
    }
    return undefined;
  }
}
