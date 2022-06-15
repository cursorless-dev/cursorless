import { isEqual } from "lodash";
import { Range, Selection, TextEditor } from "vscode";
import { EditNewContext, Target } from "../../typings/target.types";
import { Position } from "../../typings/targetDescriptor.types";
import { EditWithRangeUpdater } from "../../typings/Types";
import { selectionFromRange } from "../../util/selectionUtils";
import { isSameType } from "../../util/typeUtils";
import { toPositionTarget } from "../modifiers/toPositionTarget";
import {
  createContinuousRange,
  createContinuousRangeWeakTarget,
} from "../targetUtil/createContinuousRange";

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
  isLine = false;
  isWeak = false;
  isRaw = false;
  isNotebookCell = false;

  constructor(parameters: CommonTargetParameters) {
    this.state = {
      editor: parameters.editor,
      isReversed: parameters.isReversed,
      contentRange: parameters.contentRange,
      thatTarget: parameters.thatTarget,
    };
  }

  get editor() {
    return this.state.editor;
  }
  get isReversed() {
    return this.state.isReversed;
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

  getEditNewContext(): EditNewContext {
    return {
      type: "edit",
    };
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
    if (isSameType(this, endTarget)) {
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

  isEqual(otherTarget: Target): boolean {
    return (
      otherTarget instanceof BaseTarget &&
      isEqual(this.getEqualityParameters(), otherTarget.getEqualityParameters())
    );
  }

  /**
   * @returns An object that can be used for determining equality between two
   * `BaseTarget`s
   */
  protected getEqualityParameters(): object {
    const { thatTarget, ...otherCloneParameters } =
      this.getCloneParameters() as { thatTarget?: Target };
    if (!(thatTarget instanceof BaseTarget)) {
      return { thatTarget, ...otherCloneParameters };
    }

    return {
      thatTarget: thatTarget ? thatTarget.getEqualityParameters() : undefined,
      ...otherCloneParameters,
    };
  }

  toPositionTarget(position: Position): Target {
    return toPositionTarget(this, position);
  }

  abstract get insertionDelimiter(): string;
  abstract getLeadingDelimiterTarget(): Target | undefined;
  abstract getTrailingDelimiterTarget(): Target | undefined;
  abstract getRemovalRange(): Range;
}
