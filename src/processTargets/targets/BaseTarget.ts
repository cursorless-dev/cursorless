import { Range, Selection, TextEditor } from "vscode";
import {
  EditNewContext,
  Position,
  RemovalRange,
  Target,
} from "../../typings/target.types";
import { selectionFromRange } from "../../util/selectionUtils";
import { parseRemovalRange } from "../../util/targetUtils";

export function extractCommonParameters(parameters: CommonTargetParameters) {
  return {
    editor: parameters.editor,
    isReversed: parameters.isReversed,
    contentRange: parameters.contentRange,
    position: parameters.position,
    weakTarget: parameters.weakTarget,
  };
}

/** Parameters supported by all target classes */
export interface CommonTargetParameters {
  editor: TextEditor;
  isReversed: boolean;
  contentRange: Range;
  position?: Position;
  weakTarget?: Target;
}

export interface CloneWithParameters {
  position?: Position;
  weakTarget?: Target;
}

export interface BaseTargetParameters extends CommonTargetParameters {
  delimiter: string;
  removalRange?: Range;
  leadingDelimiter?: RemovalRange;
  trailingDelimiter?: RemovalRange;
  isLine?: boolean;
}

interface BaseTargetState {
  readonly editor: TextEditor;
  readonly isReversed: boolean;
  readonly contentRange: Range;
  readonly weakTarget?: Target;
  readonly delimiter: string;
  readonly removalRange?: Range;
  readonly leadingDelimiter?: RemovalRange;
  readonly trailingDelimiter?: RemovalRange;
  readonly position?: Position;
}

export default abstract class BaseTarget implements Target {
  protected readonly state: BaseTargetState;

  constructor(parameters: BaseTargetParameters) {
    this.state = {
      editor: parameters.editor,
      isReversed: parameters.isReversed,
      contentRange: parameters.contentRange,
      position: parameters.position,
      delimiter: parameters.delimiter,
      removalRange: parameters.removalRange,
      leadingDelimiter: parameters.leadingDelimiter,
      trailingDelimiter: parameters.trailingDelimiter,
      weakTarget: parameters.weakTarget,
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
    return this.state.weakTarget != null
      ? this.state.weakTarget.thatTarget
      : this;
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
    return selectionFromRange(this.isReversed, this.contentRange);
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

  getEditNewContext(isBefore: boolean): EditNewContext {
    if (this.delimiter === "\n" && !isBefore) {
      return { type: "command", command: "editor.action.insertLineAfter" };
    }
    return {
      type: "delimiter",
      delimiter: this.delimiter ?? "",
    };
  }

  withPosition(position: Position): Target {
    return this.cloneWith({ position });
  }

  withWeakTarget(weakTarget: Target): Target {
    return this.cloneWith({ weakTarget });
  }

  abstract cloneWith(parameters: CloneWithParameters): Target;
}
