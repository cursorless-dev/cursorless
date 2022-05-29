import { Range, Selection, TextEditor } from "vscode";
import {
  EditNewContext,
  Position,
  Target,
  TargetType,
} from "../../typings/target.types";
import { EditWithRangeUpdater } from "../../typings/Types";
import { selectionFromRange } from "../../util/selectionUtils";
import { createContinuousRange } from "../targetUtil/createContinuousRange";
import { getTokenDelimiters } from "../targetUtil/getTokenDelimiters";
import { createContinuousRangeWeakTarget } from "./WeakTarget";

/** Parameters supported by all target classes */
export interface CommonTargetParameters {
  readonly editor: TextEditor;
  readonly isReversed: boolean;
  readonly contentRange: Range;
  readonly thatTarget?: Target;
}

export interface CloneWithParameters {
  readonly thatTarget?: Target;
  readonly contentRange?: Range;
}

export default abstract class BaseTarget implements Target {
  protected readonly state: CommonTargetParameters;

  constructor(parameters: CommonTargetParameters) {
    this.state = {
      editor: parameters.editor,
      isReversed: parameters.isReversed,
      contentRange: parameters.contentRange,
      thatTarget: parameters.thatTarget,
    };
  }

  abstract get type(): TargetType;
  abstract get delimiter(): string | undefined;
  get editor() {
    return this.state.editor;
  }
  get isReversed() {
    return this.state.isReversed;
  }
  protected get contentRemovalRange() {
    return this.contentRange;
  }
  get position(): Position | undefined {
    return undefined;
  }
  get isLine() {
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
    return this.state.contentRange;
  }

  is(type: TargetType): boolean {
    return this.type === type;
  }

  getLeadingDelimiterRange(force?: boolean) {
    const { includeDelimitersInRemoval, leadingDelimiterRange } =
      getTokenDelimiters(this.state.editor, this.state.contentRange);
    return includeDelimitersInRemoval || force
      ? leadingDelimiterRange
      : undefined;
  }

  getTrailingDelimiterRange(force?: boolean) {
    const { includeDelimitersInRemoval, trailingDelimiterRange } =
      getTokenDelimiters(this.state.editor, this.state.contentRange);
    return includeDelimitersInRemoval || force
      ? trailingDelimiterRange
      : undefined;
  }

  constructChangeEdit(text: string): EditWithRangeUpdater {
    return {
      range: this.contentRange,
      text,
      updateRange: (range) => range,
    };
  }

  constructRemovalEdit(): EditWithRangeUpdater {
    return {
      range: this.getRemovalRange(),
      text: "",
      updateRange: (range) => range,
    };
  }

  getEditNewContext(isBefore: boolean): EditNewContext {
    const delimiter = this.delimiter ?? "";
    if (delimiter === "\n" && !isBefore) {
      return { type: "command", command: "editor.action.insertLineAfter" };
    }
    return {
      type: "delimiter",
      delimiter,
    };
  }

  getRemovalRange(): Range {
    const delimiterRange =
      this.getTrailingDelimiterRange() ?? this.getLeadingDelimiterRange();
    return delimiterRange != null
      ? this.contentRemovalRange.union(delimiterRange)
      : this.contentRemovalRange;
  }

  getRemovalHighlightRange(): Range | undefined {
    return this.getRemovalRange();
  }

  withThatTarget(thatTarget: Target): Target {
    return this.cloneWith({ thatTarget });
  }

  withContentRange(contentRange: Range): Target {
    return this.cloneWith({ contentRange });
  }

  getInteriorStrict(): Target[] {
    throw Error("No available interior");
  }
  getBoundaryStrict(): Target[] {
    throw Error("No available boundaries");
  }

  readonly cloneWith = (parameters: CloneWithParameters) => {
    const constructor = Object.getPrototypeOf(this).constructor;

    return new constructor({
      ...this.getCloneParameters(),
      ...parameters,
    });
  };

  protected abstract getCloneParameters(): object;

  createContinuousRangeTarget(
    isReversed: boolean,
    endTarget: Target,
    includeStart: boolean,
    includeEnd: boolean
  ): Target {
    if (this.isSameType(endTarget)) {
      const constructor = Object.getPrototypeOf(this).constructor;

      return new constructor({
        ...this.getCloneParameters(),
        isReversed,
        contentRange: createContinuousRange(
          this,
          endTarget,
          includeStart,
          includeEnd
        ),
      });
    }

    return createContinuousRangeWeakTarget(
      isReversed,
      this,
      endTarget,
      includeStart,
      includeEnd
    );
  }

  protected isSameType(target: Target) {
    return this.type === target.type;
  }
}
